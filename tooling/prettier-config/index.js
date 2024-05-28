/** @typedef {import("prettier").Config} PrettierConfig */
/** @typedef {import("@ianvs/prettier-plugin-sort-imports").PluginConfig} SortImportsConfig */

/** @type { PrettierConfig | SortImportsConfig | TailwindConfig } */
const config = {
    arrowParens: "always",
    printWidth: 100,
    singleQuote: false,
    semi: true,
    trailingComma: "all",
    tabWidth: 4,
    plugins: ["@ianvs/prettier-plugin-sort-imports"],
    importOrder: [
        "<TYPES>",
        "<THIRD_PARTY_MODULES>",
        "",
        "<TYPES>^@zkChainHub",
        "^@zkChainHub/(.*)$",
        "",
        "<TYPES>^[.|..|~]",
        "^~/",
        "^[../]",
        "^[./]",
    ],
    importOrderParserPlugins: ["typescript", "decorators-legacy"],
    importOrderTypeScriptVersion: "4.4.0",
};

export default config;
