# Judge demo

1. Open `/` and enter “I want to start a home food business in Mumbai.”
2. Complete the three clarification controls and compile the roadmap.
3. Open the interactive graph; select “Determine FSSAI route.”
4. Show the evidence card, official link and verification label.
5. Switch to the accessible list and mark the step complete.
6. Switch language without losing workflow state.
7. Open `/admin`, inspect the synthetic source diff and approve it.
8. Return to the roadmap and close with the trust disclaimer.

The demo is deterministic and does not depend on Wi-Fi, Supabase or an LLM.

## Local review

- Start `npm run dev` and open `http://localhost:3000`.
- `/app` previews the citizen dashboard without credentials.
- `/app/goals/home-food-business/roadmap` previews the sample roadmap; phones default to a checklist, with graph mode available.
- `/admin` is a clearly labelled browser-local review demonstration, not a production admin login.
- `/login` has a seeded-demo entry; real authentication requires the backend owner's configuration.

Change a premises/activity answer and compile a fresh sample. Complete a ready step, reload, and check the dashboard's updated next action. Complete both prerequisites to unlock the shared document step; reopen one to see dependent completion reset. The document checklist and notes are browser-local and do not upload files.

Switch the roadmap language without losing progress. Approve the synthetic change in the admin console, inspect its local audit entry, then return to see demo version v1.4 with progress preserved. Unsupported goals explain catalogue coverage instead of opening an unrelated roadmap.
