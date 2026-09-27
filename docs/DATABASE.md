# Database

The foundation migration lives in `supabase/migrations`. It separates civic knowledge from private user workflow state. Public services and published procedure versions are readable; profiles, goals, workflows, step states and documents are owner-scoped. Source snapshots and change events remain server/admin only.

Run locally with Supabase CLI, then apply `supabase/seed.sql` for the jurisdiction and service taxonomy. The seed intentionally avoids unreviewed legal claims.
