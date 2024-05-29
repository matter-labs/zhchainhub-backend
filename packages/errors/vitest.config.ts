import { defineConfig, mergeConfig } from "vitest/config";

import { baseConfig } from "@zkchainhub/test-config";

export default mergeConfig(
    baseConfig,
    defineConfig({
        test: {
            exclude: ["coverage/*"],
        },
    }),
);
