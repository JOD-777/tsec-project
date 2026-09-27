# Decisions

- P0 depth is prioritised over dozens of shallow routes.
- The seed does not invent government fees, timelines or eligibility claims.
- A synthetic fee change is used only to demonstrate the admin diff mechanic and is labelled on-screen.
- Live Supabase activation is isolated from the offline-safe demo because no dedicated project was available without creating billable external state.
- The app ships an accessible ordered-list equivalent for the visual graph.

## Local repairs

- Preserve the existing design, seeded procedure IDs, graph dependencies and stack. Repair the existing P0 flows rather than adding the master prompt's entire route inventory.
- Use a separate browser-local sample store while the shared backend is owned by another team member. No Supabase credentials, migrations, seed, policies or remote services are changed.
- An official portal URL alone does not verify a procedural claim. Sample steps are visibly unverified until captured evidence and review are available; the original seeded data is retained.
- Unsupported civic goals show catalogue coverage and explicitly offer the Mumbai example. They are not silently given an unrelated food-business roadmap.
- Reopening a completed step reopens completed descendants to preserve dependency consistency. Optional completions are excluded from required-step progress.
- Keep package manifests and API request/response contracts unchanged to reduce merge conflicts. Playwright smoke testing is an optional standalone script, without a new locked dependency.
- The local admin console records synthetic decisions only in browser storage. It does not grant a production role or change canonical government information.
- Keep all work on a local repair branch and commit for review. Do not push or deploy.
