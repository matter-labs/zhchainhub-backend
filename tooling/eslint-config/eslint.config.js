import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import eslintConfigPrettier from "eslint-config-prettier";
import prettierPlugin from "eslint-plugin-prettier";

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
    // js files
    {
        plugins: {
            "@typescript-eslint": tsPlugin,
            prettier: prettierPlugin,
        },
        languageOptions: {
            parser: tsParser,
        },
        ignores: ["dist/**", "node_modules/**", "eslint.config.js"], // Add patterns to ignore dist and node_modules
        rules: {
            ...tsPlugin.configs["eslint-recommended"].rules,
            ...tsPlugin.configs["recommended"].rules,
            ...prettierPlugin.configs.recommended.rules,
            ...eslintConfigPrettier.rules,
        },
    },
];
