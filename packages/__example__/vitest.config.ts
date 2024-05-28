import { defineConfig, mergeConfig } from "vitest/config";

import { baseConfig } from "@zkChainHub/test-config";

export default mergeConfig(
    baseConfig,
    defineConfig({
        test: {
            exclude: ["coverage/*"],
        },
    }),
);
