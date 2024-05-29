import { defineConfig } from "vitest/config";

export const baseConfig = defineConfig({
    test: {
        coverage: {
            provider: "v8",
            reporter: ["text", "json", "html"],
        },
        watch: false,
    },
});
