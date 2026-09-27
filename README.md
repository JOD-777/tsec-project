# CivicFlow AI

**Government procedures, compiled into a roadmap.**

CivicFlow AI is a PSWB02 hackathon product that converts a citizen’s natural-language goal into a jurisdiction-aware, source-verifiable dependency graph. It is a workflow and provenance system—not a generic government chatbot.

## What works

- Premium responsive landing page with English, Hindi and Marathi entry points
- Offline-safe clarification and roadmap-generation demo
- Interactive React Flow procedure graph with accessible list alternative
- Evidence drawer with authority, source freshness and official outbound links
- Progress tracking, next-best-action and reusable-document summary
- Admin source-change diff, approval/rejection and versioning demonstration
- Supabase SSR Auth integration, owner-scoped RLS and private storage policies
- Server-only OpenRouter structured intent extraction with Zod and fallback
- Dark/system themes, loading/error states and mobile layouts

## Architecture

```text
Citizen intent → Jurisdiction → Source registry → Verified claims
              → Dependency graph → Personal workflow → Change monitoring
```

Next.js 16 + React 19 + TypeScript + Tailwind CSS 4 run on Vercel. Supabase provides Auth, PostgreSQL/RLS and Storage. OpenRouter is optional; the judge workflow is deterministic and survives provider or network failure.

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`. No external credential is required for the complete seeded demo.

### Live Supabase

Create a dedicated project, then apply `supabase/migrations/20260927044508_civicflow_foundation.sql` and `supabase/seed.sql`. Set:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

The service/secret key is server-only and is not required by the browser. See [database documentation](docs/DATABASE.md) and [RLS documentation](docs/RLS.md).

### Live AI intent extraction

Set `OPENROUTER_API_KEY` and a supported `OPENROUTER_FAST_MODEL` or `OPENROUTER_DEFAULT_MODEL`. `/api/intent` validates all input and output; failures automatically return the deterministic demo intent.

## Quality gates

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Judge route

Follow [docs/DEMO.md](docs/DEMO.md). The fastest entry is `/demo`; the full graph is at `/app/goals/home-food-business/roadmap`; validation is at `/admin`.

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [AI system](docs/AI_SYSTEM.md)
- [Ingestion](docs/INGESTION.md)
- [Security](docs/SECURITY.md)
- [Design system](docs/DESIGN_SYSTEM.md)
- [Testing](docs/TESTING.md)
- [Deployment](docs/DEPLOYMENT.md)
- [Hackathon pitch](docs/HACKATHON_PITCH.md)
- [Implementation status](docs/IMPLEMENTATION_STATUS.md)

## Known limitations

Live crawling, PDFs, document upload, scheduled monitoring and notifications require a dedicated production Supabase project and worker infrastructure. The seeded Mumbai procedure is explicitly labelled as demonstration data and avoids presenting unreviewed legal claims as verified facts.

## Disclaimer

CivicFlow is not a government authority or legal adviser. Users must verify current requirements, fees, timelines and eligibility on the linked official source before acting.
