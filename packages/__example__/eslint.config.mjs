import parentConfig from "@zkChainHub/eslint-config";

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  ...parentConfig,
  {
    files: ["src/**/*.ts"],
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "_+" },
      ],
    },
  },
];
