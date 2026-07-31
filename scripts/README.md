# scripts/

Repository-level tooling that isn't part of the deployed application (which
lives entirely under `website/`). Currently empty — reserved for scripts
such as:

- A documentation link checker (verify every relative link in `docs/`
  resolves to a real file, run in CI)
- A release-notes scaffolder (pre-fill `templates/release-notes.md` from
  commits since the last tag)
- A one-time doc-freshness auditor (flag `docs/` files whose last-reviewed
  date is more than 2 quarters old, per
  `docs/architecture/../standards/README.md`'s maintenance policy)

None of these exist yet — this README exists so the folder's purpose is
clear before the first script is added, not to claim tooling that isn't
there.
