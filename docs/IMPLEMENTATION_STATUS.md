# Implementation status

Updated: 27 September 2026

## Roadmap workspace tools and admin catalogue

Follow the master prompt's what-if (goal what-if route), document matrix and export requirements. Reuse supported procedure questions and the existing browser-local workflow engine. No authentication, Supabase, uploads or ingestion changes; no new dependencies or personal names.

1. Expand the roadmap canvas to the available window, compact the toolbar/progress and make overview/details collapsible. Keep the phone checklist and small-screen dialog.
2. Add non-destructive what-if comparisons for all six supported procedures. Compare steps, documents, agencies and complexity; leave unknown fees/times explicit. Apply only on user action, preserving unaffected completions, notes and readiness while reopening affected dependencies.
3. Reuse the document checklist in a full readiness matrix and expose per-step readiness, reuse and official references. Prepared state is independent from step completion and does not upload files.
4. Add a full printable report with progress, steps, prerequisites, readiness and sources; use browser Print / Save as PDF. Exclude notes unless selected.
5. Test compiler alternatives, preview immutability, applying/reopening, persistence, responsive canvas/panels and actual browser PDF output. Run lint, typecheck, tests and production build before marking complete.

Implemented: all six procedures have working what-if, document-readiness and printable report routes. Overview and step details open by default on desktop, have wider responsive panels and collapse independently. The graph uses available space, wraps card content and renders its minimap. Phone and tablet details remain accessible through a dialog. Scenario previews do not write to storage; explicit application preserves unaffected progress, notes and prepared documents.

The local admin catalogue now covers all six procedures, eight source references and 42 default steps. Claims can be inspected by procedure, procedure cards link to each tool, and Run graph checks evaluates all 34 supported intake combinations for graph validity, source references and completable required tasks. These diagnostics do not verify government rules. Existing food-sample review decisions and audit history remain local and preserve citizen progress.

Validation: lint, strict typecheck, 65 unit tests and the Webpack production build pass. Browser coverage checks preview/discard immutability, scenario application and progress preservation, document persistence, print controls and actual PDF output, all tool routes across six procedures and five viewport widths, and dark-mode hydration. React Flow card checks cover overflow, overlap and minimap rendering at three widths in both themes and three UI languages. Admin checks cover all seven sections across five widths and review decisions without progress loss. The existing local smoke suite also passes.

Delivery remains local on `feat/local-roadmap-tools` for review. Authentication, shared backend, uploads, ingestion, dependencies and API contracts are unchanged. The master prompt's wider production scope remains integration work for teammates.

## Service workflows and demo hub

Scope: complete the existing six service cards as browser-local sample workflows, following the PS's procedure/dependency visualizer and the master prompt's service-detail, deterministic demo and execution requirements. Preserve the team's existing design and food workflow. Authentication, shared backend and remote database remain untouched. Push to `main` only after the user's requested verification passes.

- Service detail content is centered in a bounded column, including the procedure overview and step list.
- `/services` leads to informational procedure pages, rather than duplicating the demo chooser. All six “View procedure details” links have a corresponding `/services/[slug]` page with scope, jurisdiction, procedure steps, preparation checklist, eligibility/fee notes and official sources.
- `/demo` opens a scenario chooser. It supports the original Mumbai food business plus Mumbai birth-certificate copies, India Udyam MSME registration, Maharashtra driving-licence renewal, property transaction document registration and co-operative society formation.
- Each new service has its own intake questions and conditional titles or branches. Jurisdiction is explicitly confirmed before compilation. Unknown goals are not silently converted into another procedure.
- Graph dependencies, available actions, progress, optional tasks, reopening, notes and reusable preparation checklists work through the shared workflow engine. The original eight food step IDs and nine edges are retained.
- Each service has isolated local state; building one replaces only that service's sample. Earlier food-only storage is automatically accepted without losing progress, locale or review decisions.
- The dashboard lists saved service roadmaps. Assistant execution answers use the open roadmap; non-food service questions use that service's deterministic context instead of the existing food-only AI endpoint.
- New procedures render without credentials or external AI. Existing optional food-intent integration retains its fallback. Official links accompany clearly labelled sample planning requirements.
- React Flow uses a matching initial server/client colour mode, then applies the selected theme after hydration.
- No dependency/package updates, shared backend changes, API-contract changes or new personal names/usernames are included.

Validation: lint, strict typecheck, 46 unit tests, the Webpack production build and both browser suites pass. The service suite also passes against the production build. No unexpected browser console errors were observed. Automated unit coverage checks every combination of the new intake options, graph validity, blocked-step guards, required completion, reopening, source references, service isolation and migration of earlier saved state. Browser checks cover actual service-detail links/content, all six intakes, completion/notes/reload, context-aware assistant, dashboard entries, five viewport sizes, graph rendering and dark-theme hydration.

## Local reliability and responsive repair plan

Scope: repair existing user journeys using the master build prompt's P0 acceptance criteria. Preserve existing content and attribution. No new personal names, remote backend changes, deployment, commits or pushes.

1. Audit existing controls and responsive layouts.
2. Connect clarification answers to browser-local demo workflow state; make unsupported goals explicit.
3. Derive progress, ready/blocked steps, next actions and document checklist from dependencies; persist locally and support reopening.
4. Connect demo admin tabs, review decisions and audit history to local state; surface review updates in the citizen view.
5. Repair phone/tablet/desktop layouts, keyboard access, dark graph styling, language controls and assistant behavior.
6. Run lint, typecheck, unit tests, production build and browser smoke checks. Start a local preview for review.

Shared Supabase configuration, migrations, seed, policies and remote services are outside this repair scope. Local storage contains sample workflow preferences and checklist state only, never credentials or uploaded documents.

## Local repair results

- All eight original procedure steps and all nine dependency edges retained.
- Clarification answers now personalize the sample profile; an existing registration advances the demo route. Unsupported goals explicitly offer the sample instead of substituting it silently.
- Ready/blocked state, next actions and progress derive from dependencies. Optional steps do not inflate progress; reopening a prerequisite reopens completed descendants.
- Workflow progress, document checklist, notes, language, review decisions and demo audit entries persist in this browser, with in-memory fallback when storage is denied.
- Dashboard and assistant execution answers read current local workflow state.
- Every existing admin tab renders its corresponding sample workspace; review decisions appear on the citizen roadmap without discarding progress.
- Phone-first checklist, accessible step dialog, compact desktop graph, touch controls, mobile navigation and dark graph surfaces repaired.
- Voice button uses browser-supported speech recognition or gives a clear unavailable/error state.
- Auth forms show pending state. Local auth redirect handling no longer catches Next.js redirects as provider failures; auth callback checks exchange errors.
- No database/schema/policy changes, new dependency versions, API-contract changes, deployed changes, or newly added personal names/usernames.

Validation: lint, strict typecheck, 18 unit tests and Webpack production build pass. Browser smoke checks cover 11 existing pages at 320, 375, 768, 1024 and 1440 pixels, plus intake, persistence, language, all admin sections and assistant state. Additional browser checks verified keyboard/dialog focus, notes/document persistence, blocked-step guards, eight graph nodes/nine edges and unknown-goal handling. No application console errors were observed in the completed runs.

Environment limitation: the default Turbopack production build hits an EPERM worker-port error in this restricted local environment. `npm run build -- --webpack` passes. Build scripts and configuration remain unchanged.

The master prompt is a broader product specification, not a claim that all listed routes/features are implemented. Live Supabase authentication, backend persistence, ingestion, uploads, authoritative snapshots and production admin authorization remain the backend owner's integration work. The public admin route is explicitly a local sample console, not a privileged production workspace.

## Completed

- Next.js 16 App Router foundation with strict TypeScript and Tailwind CSS 4.
- Responsive public landing page, explainer, service explorer and legal/trust pages.
- Deterministic offline-safe intake, clarification and generation pipeline.
- Interactive React Flow dependency graph plus accessible list fallback.
- Step evidence panel, official outbound links, progress and reusable-document summary.
- Citizen dashboard and admin source-change review with audited-state demonstration.
- English, Hindi and Marathi landing-page architecture and in-workflow language control.
- Supabase SSR client/proxy, auth forms, callback, schema migration, storage rules and RLS.
- Server-only OpenRouter intent endpoint with Zod validation, timeout and deterministic fallback.
- Graph invariant/rule-engine unit tests and GitHub Actions quality workflow.
- Vercel-ready production build.

## External activation

- Create or select a dedicated Supabase project, apply the migration and seed, then set the public project URL/key.
- Add an OpenRouter key only if live intent extraction is wanted; the full judge demo does not need it.
- Configure a production app URL after Vercel deployment.

## Deliberate hackathon scope

- The rich Mumbai workflow is seeded demo data with explicit verification labels. It does not claim to be legal advice.
- Live crawling, uploads, PDF region highlighting, cron monitoring and transactional notifications are represented in the architecture but are not enabled without dedicated infrastructure and credentials.
