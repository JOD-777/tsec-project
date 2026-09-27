# Architecture

CivicFlow is a Next.js App Router application deployed on Vercel. Server Components render public and dashboard surfaces; small Client Components own the goal intake, dependency graph and review interactions. Supabase provides Auth, PostgreSQL, row-level security and private object storage. OpenRouter is reachable only from a server route and always has a deterministic cached-workflow fallback.

The core pipeline is: intent → jurisdiction → official source registry → structured claims → dependency graph → user workflow → monitored source changes. Canonical procedure versions are immutable once published. A user workflow records its procedure version so later changes can be reviewed rather than silently rewriting history.
