-- CivicFlow AI foundation schema. All exposed tables have deliberate RLS.
create type public.verification_status as enum ('unverified','ai_extracted','human_verified','stale','conflicted');
create type public.step_state as enum ('not_started','ready','in_progress','submitted','awaiting_response','complete','blocked');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  locale text not null default 'en' check (locale in ('en','hi','mr')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.user_roles (
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('citizen','validator','admin')),
  created_at timestamptz not null default now(), primary key (user_id,role)
);
create table public.jurisdictions (
  id uuid primary key default gen_random_uuid(), parent_id uuid references public.jurisdictions(id),
  name text not null, level text not null, code text unique, created_at timestamptz not null default now()
);
create table public.agencies (
  id uuid primary key default gen_random_uuid(), jurisdiction_id uuid references public.jurisdictions(id),
  name text not null, official_url text, created_at timestamptz not null default now()
);
create table public.services (
  id uuid primary key default gen_random_uuid(), slug text unique not null, title text not null,
  summary text not null, is_public boolean not null default false, created_at timestamptz not null default now()
);
create table public.sources (
  id uuid primary key default gen_random_uuid(), agency_id uuid references public.agencies(id),
  title text not null, canonical_url text unique not null, authority_tier smallint not null check(authority_tier between 1 and 6),
  health text not null default 'healthy', first_seen_at timestamptz not null default now(), last_checked_at timestamptz
);
create table public.source_snapshots (
  id uuid primary key default gen_random_uuid(), source_id uuid not null references public.sources(id) on delete cascade,
  content_hash text not null, captured_at timestamptz not null default now(), storage_path text, extracted_text text
);
create table public.procedures (
  id uuid primary key default gen_random_uuid(), service_id uuid not null references public.services(id),
  jurisdiction_id uuid references public.jurisdictions(id), title text not null, is_public boolean not null default false, created_at timestamptz not null default now()
);
create table public.procedure_versions (
  id uuid primary key default gen_random_uuid(), procedure_id uuid not null references public.procedures(id) on delete cascade,
  version integer not null, status text not null check(status in ('draft','review','published','retired')),
  published_at timestamptz, created_at timestamptz not null default now(), unique(procedure_id,version)
);
create table public.procedure_steps (
  id uuid primary key default gen_random_uuid(), procedure_version_id uuid not null references public.procedure_versions(id) on delete cascade,
  stable_key text not null, title text not null, description text not null, agency_id uuid references public.agencies(id),
  mode text not null check(mode in ('online','physical','hybrid','unknown')), mandatory boolean not null default true,
  verification public.verification_status not null default 'unverified', metadata jsonb not null default '{}', unique(procedure_version_id,stable_key)
);
create table public.step_dependencies (
  from_step_id uuid not null references public.procedure_steps(id) on delete cascade,
  to_step_id uuid not null references public.procedure_steps(id) on delete cascade,
  dependency_type text not null check(dependency_type in ('REQUIRES','BLOCKS','OPTIONAL','ALTERNATIVE_TO','GENERATES_DOCUMENT_FOR','CAN_RUN_IN_PARALLEL_WITH')),
  condition jsonb, primary key(from_step_id,to_step_id,dependency_type), check(from_step_id<>to_step_id)
);
create table public.step_sources (
  step_id uuid not null references public.procedure_steps(id) on delete cascade,
  source_id uuid not null references public.sources(id) on delete cascade,
  evidence_note text, primary key(step_id,source_id)
);
create table public.goals (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  title text not null, raw_query text not null, jurisdiction_id uuid references public.jurisdictions(id),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.user_workflows (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  goal_id uuid not null references public.goals(id) on delete cascade, procedure_version_id uuid not null references public.procedure_versions(id),
  created_at timestamptz not null default now(), unique(user_id,goal_id)
);
create table public.workflow_step_states (
  workflow_id uuid not null references public.user_workflows(id) on delete cascade,
  step_id uuid not null references public.procedure_steps(id), state public.step_state not null default 'not_started',
  note text, updated_at timestamptz not null default now(), primary key(workflow_id,step_id)
);
create table public.user_documents (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  label text not null, storage_path text not null, mime_type text not null, created_at timestamptz not null default now()
);
create table public.change_events (
  id uuid primary key default gen_random_uuid(), source_id uuid not null references public.sources(id),
  old_snapshot_id uuid references public.source_snapshots(id), new_snapshot_id uuid references public.source_snapshots(id),
  status text not null check(status in ('pending','approved','rejected')), diff jsonb not null default '{}', created_at timestamptz not null default now()
);
create table public.audit_logs (
  id bigint generated always as identity primary key, actor_id uuid references auth.users(id), action text not null,
  entity_type text not null, entity_id text not null, detail jsonb not null default '{}', created_at timestamptz not null default now()
);

create index goals_user_idx on public.goals(user_id,updated_at desc);
create index workflows_user_idx on public.user_workflows(user_id);
create index steps_version_idx on public.procedure_steps(procedure_version_id);
create index snapshots_source_idx on public.source_snapshots(source_id,captured_at desc);

alter table public.profiles enable row level security; alter table public.user_roles enable row level security;
alter table public.jurisdictions enable row level security; alter table public.agencies enable row level security;
alter table public.services enable row level security; alter table public.sources enable row level security;
alter table public.source_snapshots enable row level security; alter table public.procedures enable row level security;
alter table public.procedure_versions enable row level security; alter table public.procedure_steps enable row level security;
alter table public.step_dependencies enable row level security; alter table public.step_sources enable row level security;
alter table public.goals enable row level security; alter table public.user_workflows enable row level security;
alter table public.workflow_step_states enable row level security; alter table public.user_documents enable row level security;
alter table public.change_events enable row level security; alter table public.audit_logs enable row level security;

grant select on public.jurisdictions,public.agencies,public.services,public.sources,public.procedures,public.procedure_versions,public.procedure_steps,public.step_dependencies,public.step_sources to anon,authenticated;
grant select,insert,update,delete on public.goals,public.user_workflows,public.workflow_step_states,public.user_documents to authenticated;
grant select,update on public.profiles to authenticated; grant select on public.user_roles to authenticated;

create policy "public jurisdictions" on public.jurisdictions for select using(true);
create policy "public agencies" on public.agencies for select using(true);
create policy "published services" on public.services for select using(is_public);
create policy "official source registry" on public.sources for select using(true);
create policy "public procedures" on public.procedures for select using(is_public);
create policy "published procedure versions" on public.procedure_versions for select using(status='published');
create policy "public procedure steps" on public.procedure_steps for select using(exists(select 1 from public.procedure_versions v join public.procedures p on p.id=v.procedure_id where v.id=procedure_version_id and v.status='published' and p.is_public));
create policy "public dependencies" on public.step_dependencies for select using(true);
create policy "public step evidence links" on public.step_sources for select using(true);
create policy "own profile" on public.profiles for select to authenticated using((select auth.uid())=id);
create policy "update own profile" on public.profiles for update to authenticated using((select auth.uid())=id) with check((select auth.uid())=id);
create policy "read own roles" on public.user_roles for select to authenticated using((select auth.uid())=user_id);
create policy "own goals all" on public.goals for all to authenticated using((select auth.uid())=user_id) with check((select auth.uid())=user_id);
create policy "own workflows all" on public.user_workflows for all to authenticated using((select auth.uid())=user_id) with check((select auth.uid())=user_id);
create policy "own workflow step states" on public.workflow_step_states for all to authenticated using(exists(select 1 from public.user_workflows w where w.id=workflow_id and w.user_id=(select auth.uid()))) with check(exists(select 1 from public.user_workflows w where w.id=workflow_id and w.user_id=(select auth.uid())));
create policy "own documents all" on public.user_documents for all to authenticated using((select auth.uid())=user_id) with check((select auth.uid())=user_id);

create function public.handle_new_user() returns trigger language plpgsql security definer set search_path='' as $$ begin insert into public.profiles(id,display_name) values(new.id,new.raw_user_meta_data->>'display_name'); insert into public.user_roles(user_id,role) values(new.id,'citizen'); return new; end $$;
revoke all on function public.handle_new_user() from public,anon,authenticated;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

insert into storage.buckets(id,name,public) values('user-documents','user-documents',false),('government-snapshots','government-snapshots',false),('exports','exports',false) on conflict(id) do nothing;
create policy "upload own documents" on storage.objects for insert to authenticated with check(bucket_id='user-documents' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy "read own documents" on storage.objects for select to authenticated using(bucket_id='user-documents' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy "update own documents" on storage.objects for update to authenticated using(bucket_id='user-documents' and (storage.foldername(name))[1]=(select auth.uid())::text) with check(bucket_id='user-documents' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy "delete own documents" on storage.objects for delete to authenticated using(bucket_id='user-documents' and (storage.foldername(name))[1]=(select auth.uid())::text);
