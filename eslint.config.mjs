import globals from "globals";
import pluginJs from "@eslint/js";

export default [
  {
    files: [ "index.js", "lib/**/*.js" ],
    languageOptions: {
      sourceType: "commonjs",
      ecmaVersion: "latest",
      globals: {
        ...globals.node,
      },
    },
    rules: {
      "require-atomic-updates": "error",
      "no-invalid-this": "error",
      "no-useless-call": "error",
      "no-useless-return": "error",
      "no-var": "error",
      "prefer-const": "error",
      "complexity": [ "error", 10 ],
      "max-depth": [ "error", 5 ],
      "no-eval": "error",
      "indent": [ "error", 2 ],
      "linebreak-style": [ "error", "unix" ],
      "quotes": [ "error", "double", { "avoidEscape": true } ],
      "semi": [ "error", "never" ],
      "yoda": [ "error", "always" ],
      "space-before-blocks": [ "error", "always" ],
      "space-in-parens": [ "error", "always" ],
      "no-trailing-spaces": "error",
      "padded-blocks": [ "error", "never" ],
      "eqeqeq": "error",
      "keyword-spacing": [ "error", { "before": true, "after": true, "overrides": { 
        "if": { "after": false }, 
        "for": { "after": false }, 
        "while": { "after": false }, 
        "static": { "after": false } } } ],
    },
  },
  {
    files: [ "public/**/*.js" ],
    languageOptions: {
      sourceType: "module",
      ecmaVersion: "latest",
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      "require-atomic-updates": "error",
      "no-invalid-this": "error",
      "no-useless-call": "error",
      "no-useless-return": "error",
      "no-var": "error",
      "prefer-const": "error",
      "complexity": [ "error", 10 ],
      "max-depth": [ "error", 5 ],
      "no-eval": "error",
      "indent": [ "error", 2 ],
      "linebreak-style": [ "error", "unix" ],
      "quotes": [ "error", "double", { "avoidEscape": true } ],
      "semi": [ "error", "never" ],
      "yoda": [ "error", "always" ],
      "space-before-blocks": [ "error", "always" ],
      "space-in-parens": [ "error", "always" ],
      "no-trailing-spaces": "error",
      "padded-blocks": [ "error", "never" ],
      "eqeqeq": "error",
      "keyword-spacing": [ "error", { "before": true, "after": true, "overrides": { 
        "if": { "after": false }, 
        "for": { "after": false }, 
        "while": { "after": false }, 
        "static": { "after": false } } } ],
    },
  },
  {
    files: [ "tests/**/*.js", "jest.config.js" ],
    languageOptions: {
      sourceType: "commonjs",
      ecmaVersion: "latest",
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
    rules: {
      "require-atomic-updates": "error",
      "no-invalid-this": "error",
      "no-useless-call": "error",
      "no-useless-return": "error",
      "no-var": "error",
      "prefer-const": "error",
      "complexity": [ "error", 15 ], // Allow higher complexity for tests
      "max-depth": [ "error", 6 ], // Allow deeper nesting for tests
      "no-eval": "error",
      "indent": [ "error", 2 ],
      "linebreak-style": [ "error", "unix" ],
      "quotes": [ "error", "double", { "avoidEscape": true } ],
      "semi": [ "error", "never" ],
      "yoda": [ "error", "always" ],
      "space-before-blocks": [ "error", "always" ],
      "space-in-parens": [ "error", "always" ],
      "no-trailing-spaces": "error",
      "padded-blocks": [ "error", "never" ],
      "eqeqeq": "error",
      "keyword-spacing": [ "error", { "before": true, "after": true, "overrides": { 
        "if": { "after": false }, 
        "for": { "after": false }, 
        "while": { "after": false }, 
        "static": { "after": false } } } ],
      // Test-specific rule relaxations
      "no-unused-vars": [ "error", { "argsIgnorePattern": "^_" } ],
    },
  },
  pluginJs.configs.recommended,
]
