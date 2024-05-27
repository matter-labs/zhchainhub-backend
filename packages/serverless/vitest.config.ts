import { baseConfig } from "@zkChainHub/test-config";
import { mergeConfig, defineConfig } from "vitest/config";

export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      exclude: ["coverage/*"],
    },
  }),
);
