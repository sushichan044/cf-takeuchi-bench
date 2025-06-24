// @ts-check
import ts from "@virtual-live-lab/eslint-config/presets/ts";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig(
  globalIgnores(["worker-configuration.d.ts", "containers/**/*"]),
  // @ts-expect-error types mismatch!
  ...ts,
);
