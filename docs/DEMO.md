# Judge demo

1. Open `/` and enter “I want to start a home food business in Mumbai.”
2. Complete the three clarification controls, confirm the sample jurisdiction and compile the roadmap.
3. Open the interactive graph; select “Determine FSSAI route.”
4. Show the evidence card, official link and verification label.
5. Switch to the accessible list and mark the step complete.
6. Switch language without losing workflow state.
7. Open `/admin`, inspect the synthetic source diff and approve it.
8. Return to the roadmap and close with the trust disclaimer.

The demo is deterministic and does not depend on Wi-Fi, Supabase or an LLM.

## Local review

- Start `npm run dev` and open `http://localhost:3000`.
- `/services` is the service directory. Each “View procedure details” link shows scope, jurisdiction, procedure steps, preparation checklist, fee/eligibility notes and official sources.
- `/demo` is the interactive sample chooser. It does not automatically open the food intake.
- `/app` previews the citizen dashboard without credentials.
- `/app/goals/home-food-business/roadmap` previews the sample roadmap; phones default to a checklist, with graph mode available.
- `/admin` is a clearly labelled browser-local review demonstration, not a production admin login.
- `/login` has a seeded-demo entry; real authentication requires the backend owner's configuration.

Change a premises/activity answer and compile a fresh sample. Complete a ready step, reload, and check the dashboard's updated next action. Complete both prerequisites to unlock the shared document step; reopen one to see dependent completion reset. The document checklist and notes are browser-local and do not upload files.

Switch the roadmap language without losing progress. Approve the synthetic change in the admin console, inspect its local audit entry, then return to see demo version v1.4 with progress preserved. Unsupported goals explain catalogue coverage instead of opening an unrelated roadmap.

## Other service workflows

All six existing service cards have working samples. Choose one from `/demo`, answer its questions, confirm the sample jurisdiction, then build and open its roadmap:

| Route ID | Scope | Example variation |
| --- | --- | --- |
| `home-food-business` | Mumbai food-business planning | Home/commercial premises; existing food registration |
| `birth-certificate` | Copy of a Mumbai BMC birth record | Online lookup or ward-office assistance |
| `small-business` | India Udyam MSME registration | New registration or review an existing registration |
| `driving-licence-renewal` | Maharashtra Sarathi renewal | Private/transport category; older expired licence |
| `property-registration` | Maharashtra transaction document registration | Sale/gift; prepared/unprepared document |
| `society-registration` | Maharashtra co-operative society formation | Housing/other co-operative; prepared/unprepared proposal |

Each roadmap is available at `/app/goals/<route-id>/roadmap`; service information is at `/services/<route-id>`. Progress, notes and preparation checklists are independent. Existing food-only saved state is preserved automatically. Building a fresh sample replaces only that service's state.

For a short demonstration, try the birth-certificate sample, choose “Unsure or cannot find the record,” and see the ward-office branch. Complete an available step, write a sample note and reload. Create a small-business sample next, then open `/app` to show both saved roadmaps alongside the original food sample. Assistant execution answers use the currently open roadmap.

Browser checks (with Playwright installed separately or locally):

```sh
PLAYWRIGHT_MODULE_PATH=/path/to/playwright node e2e/local-smoke.mjs
PLAYWRIGHT_MODULE_PATH=/path/to/playwright node e2e/service-workflows.mjs
```

The service checks include a failed optional intent API, all six workflows, isolated persistence, detail-page content, graph rendering, light/dark themes and layouts at 320, 375, 768, 1024 and 1440 pixels.
