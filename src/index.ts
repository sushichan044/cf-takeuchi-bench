import { getRandom } from "@cloudflare/containers";
import { sValidator } from "@hono/standard-validator";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { timeout } from "hono/timeout";
import * as v from "valibot";

import { takeuchi } from "./takeuchi";

type HonoConfig = {
  Bindings: CloudflareBindings;
};

const app = new Hono<HonoConfig>();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

const takeuchiRequestSchema = v.object({
  x: v.number(),
  y: v.number(),
  z: v.number(),
});

const takeuchiResponseSchema = v.variant("isError", [
  v.object({
    executionTimeMs: v.number(),
    isError: v.literal(true),
    message: v.string(),
  }),
  v.object({
    executionTimeMs: v.number(),
    isError: v.literal(false),
    result: v.number(),
  }),
]);

type TakeuchiResponse = v.InferOutput<typeof takeuchiResponseSchema>;

app.use("/takeuchi/*", async (c, next) => {
  const twoMinutesMs = 120 * 1000;

  // apply timeout only to POST requests, which triggers heavy calculation
  if (c.req.method != "POST") {
    return await next();
  }

  return await timeout(
    twoMinutesMs,
    new HTTPException(500, {
      res: Response.json({
        executionTimeMs: twoMinutesMs,
        isError: true,
        message: "Timeout",
      } satisfies TakeuchiResponse),
    }),
  )(c, next);
});

app.post(
  "/takeuchi/go",
  sValidator("json", takeuchiRequestSchema),
  async (c) => {
    const body = c.req.valid("json");
    const goExecutor = await getRandom(c.env.GO_EXECUTOR);

    const response = await goExecutor.fetch("http://localhost:8080", {
      body: JSON.stringify(body),
      method: "POST",
    });

    const parsed = await v.safeParseAsync(
      takeuchiResponseSchema,
      await response.json(),
    );
    if (!parsed.success) {
      return c.json(
        {
          executionTimeMs: -1,
          isError: true,
          message: "Invalid response from Go executor",
        } satisfies TakeuchiResponse,
        500,
      );
    }
    if (parsed.output.isError) {
      return c.json(
        {
          executionTimeMs: parsed.output.executionTimeMs,
          isError: true,
          message: parsed.output.message,
        } satisfies TakeuchiResponse,
        500,
      );
    }

    return c.json(parsed.output satisfies TakeuchiResponse);
  },
);

app.post(
  "/takeuchi/node",
  sValidator("json", takeuchiRequestSchema),
  async (c) => {
    const body = c.req.valid("json");
    const nodeExecutor = await getRandom(c.env.NODE_EXECUTOR);

    const response = await nodeExecutor.fetch("http://localhost:8080", {
      body: JSON.stringify(body),
      method: "POST",
    });

    const parsed = await v.safeParseAsync(
      takeuchiResponseSchema,
      await response.json(),
    );
    if (!parsed.success) {
      return c.json(
        {
          executionTimeMs: -1,
          isError: true,
          message: "Invalid response from Node executor",
        } satisfies TakeuchiResponse,
        500,
      );
    }
    if (parsed.output.isError) {
      return c.json(
        {
          executionTimeMs: parsed.output.executionTimeMs,
          isError: true,
          message: parsed.output.message,
        } satisfies TakeuchiResponse,
        500,
      );
    }

    return c.json(parsed.output satisfies TakeuchiResponse);
  },
);

app.post("/takeuchi/workerd", sValidator("json", takeuchiRequestSchema), (c) => {
  const body = c.req.valid("json");

  const start = performance.now();
  const result = takeuchi(body.x, body.y, body.z);
  const end = performance.now();
  const executionTimeMs = end - start;

  return c.json({
    executionTimeMs,
    isError: false,
    result,
  } satisfies TakeuchiResponse);
});

export { GoExecutor, NodeExecutor } from "./containers";

export default app;
