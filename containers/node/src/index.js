// @ts-check
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import * as v from "valibot";
import { HTTPException } from "hono/http-exception";
import { timeout } from "hono/timeout";
import { takeuchi } from "./takeuchi.js";
import { sValidator } from "@hono/standard-validator";

const app = new Hono();

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

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.post(
  "/",
  async (c, next) => {
    const twoMinutesMs = 120 * 1000;

    /**
     * @typedef {v.InferOutput<typeof takeuchiResponseSchema>} TakeuchiResponse
     * @type {TakeuchiResponse}
     */
    const errJson = {
      executionTimeMs: twoMinutesMs,
      isError: true,
      message: "Timeout",
    };

    return await timeout(
      twoMinutesMs,
      new HTTPException(500, {
        res: Response.json(errJson),
      }),
    )(c, next);
  },
  sValidator("json", takeuchiRequestSchema),
  (c) => {
    const body = c.req.valid("json");

    const start = performance.now();
    const result = takeuchi(body.x, body.y, body.z);
    const end = performance.now();
    const executionTimeMs = end - start;

    return c.json({
      executionTimeMs,
      isError: false,
      result,
    });
  },
);

serve(
  {
    fetch: app.fetch,
    port: 8080,
  },
  (info) => {
    console.error(`Listening on http://localhost:${info.port}`);
  },
);
