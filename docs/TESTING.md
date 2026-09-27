# Testing

Run `npm run lint`, `npm run typecheck`, `npm test` and `npm run build`. Unit tests enforce graph referential integrity, acyclicity and deterministic rule evaluation. The CI workflow repeats all four gates on pushes and pull requests.

Local repair tests also cover prerequisite unlocking, reopening descendants, optional-step progress, preserved step IDs, document reuse, persisted-state validation, corrupted/restricted browser storage and mocked auth redirects. Auth tests never contact the shared backend.

## Browser smoke checks

Start the local app with `npm run dev`. The optional `e2e/local-smoke.mjs` checks existing pages at phone/tablet/desktop widths, then exercises intake, workflow persistence, languages, admin review and assistant state. It fails on horizontal page overflow, unexpected route status or browser console errors and saves screenshots in the temporary `civicflow-smoke` directory.

Playwright is not added to the team's dependency manifest. If needed, install it locally without changing the lockfile:

```bash
npm install --no-save --package-lock=false playwright
node e2e/local-smoke.mjs
```

The script uses installed Google Chrome by default. Set `PLAYWRIGHT_BROWSER_CHANNEL` for another installed Playwright channel, `PLAYWRIGHT_MODULE_PATH` to use an external Playwright package directory, or `CIVICFLOW_BASE_URL` to test a different local port. It creates a fresh browser context and uses sample data; no real login or database mutation is performed.

In restricted local environments where Turbopack reports worker-port EPERM, use `npm run build -- --webpack` for production-build verification. The team's standard build command remains unchanged.
