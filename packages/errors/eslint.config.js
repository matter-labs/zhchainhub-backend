import parentConfig from "@zkchainhub/eslint-config";

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
    ...parentConfig,
    {
        files: ["src/**/*.ts"],
        rules: {
            "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "_+" }],
        },
    },
];
