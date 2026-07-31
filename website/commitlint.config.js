/**
 * Enforces the "type: summary" convention documented in
 * docs/standards/commit-convention.md (feat/fix/docs/refactor/chore/test).
 */
module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [2, "always", ["feat", "fix", "docs", "refactor", "chore", "test"]],
  },
};
