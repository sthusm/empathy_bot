module.exports = {
  "env": {
    "browser": true,
    "node": true,
    "es2020": true,
  },
  "extends": "eslint:recommended",
  "parserOptions": {
    "ecmaVersion": 11,
    "sourceType": "module",
  },
  "rules": {
    "arrow-parens": "off",
    "arrow-body-style": "off",
    "comma-dangle": ["error", {
      "arrays": "always-multiline",
      "objects": "always-multiline",
      "imports": "always-multiline",
      "exports": "never",
      "functions": "never",
    }],
    "class-methods-use-this": "off",
    "dot-notation": "off",
    "operator-linebreak": "off",
    "no-console": "off",
    "no-new": "off",
    "no-underscore-dangle": "off",
    "no-unsafe-finally": "off",
    "no-param-reassign": ["error", { "props": false }],
    "no-plusplus": ["error", { "allowForLoopAfterthoughts": true }],
    "semi": [2, "never"],
    "func-names": "off",
  },
}
