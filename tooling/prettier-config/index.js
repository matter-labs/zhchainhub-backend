/** @typedef {import("prettier").Config} PrettierConfig */
/** @typedef {import("@ianvs/prettier-plugin-sort-imports").PluginConfig} SortImportsConfig */

/** @type { PrettierConfig | SortImportsConfig | TailwindConfig } */
module.exports = {
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
        "<TYPES>^@zkchainhub",
        "^@zkchainhub/(.*)$",
        "",
        "<TYPES>^[.|..|~]",
        "^~/",
        "^[../]",
        "^[./]",
    ],
    importOrderParserPlugins: ["typescript", "decorators-legacy"],
    importOrderTypeScriptVersion: "5.4.5",
};
