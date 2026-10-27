import { defineConfig } from "tsdown";

export default defineConfig({
  // Build options
  platform: "neutral",
  exports: true,
  // .d.ts generation options
  dts: true,
  tsconfig: "./tsconfig.build.json",
  // Lint options
  publint: true,
  attw: true,
});
