-- Idempotent public demo taxonomy. Procedural legal claims are intentionally not seeded without reviewed snapshots.
insert into public.jurisdictions(id,name,level,code) values
('10000000-0000-0000-0000-000000000001','India','country','IN'),
('10000000-0000-0000-0000-000000000002','Maharashtra','state','IN-MH'),
('10000000-0000-0000-0000-000000000003','Mumbai','city','IN-MH-MUM'),
('10000000-0000-0000-0000-000000000004','Brihanmumbai Municipal Corporation','local_body','IN-MH-MUM-BMC') on conflict(code) do nothing;
update public.jurisdictions set parent_id='10000000-0000-0000-0000-000000000001' where code='IN-MH';
update public.jurisdictions set parent_id='10000000-0000-0000-0000-000000000002' where code='IN-MH-MUM';
update public.jurisdictions set parent_id='10000000-0000-0000-0000-000000000003' where code='IN-MH-MUM-BMC';
insert into public.services(id,slug,title,summary,is_public) values('20000000-0000-0000-0000-000000000001','home-food-business','Start a home food business','Seeded demonstration workflow with explicit verification labels.',true) on conflict(slug) do nothing;
