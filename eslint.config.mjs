import globals from "globals";
import pluginJs from "@eslint/js";

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    files: ["**/*.{js,mjs,cjs,ts}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.jest,
        global: "readonly", // Добавлено определение global
        module: "readonly",
        require: "readonly",
        process: "readonly",
        __dirname: "readonly",
      },
    },
  },
  pluginJs.configs.recommended,
  {
    files: ["babel.config.js", "webpack.config.js"],
    rules: {
      "no-undef": "off",
      "import/no-extraneous-dependencies": "off",
    },
  },
];
