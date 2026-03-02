-- The Artist Portal - Supabase SQL Setup v4

drop table if exists applications cascade;
drop table if exists saved_jobs cascade;
drop table if exists jobs cascade;
drop table if exists models cascade;
drop table if exists agency_profiles cascade;

create table models (
  id uuid references auth.users(id) on delete cascade primary key,
  name text not null default '',
  age int,
  city text default 'Dhaka',
  height text,
  specialization text,
  bio text default '',
  photo_url text default '',
  phone text,
  instagram text default '',
  experience_years int default 0,
  tags text[] default '{}',
  is_available boolean default true,
  portfolio_urls text[] default '{}',
  created_at timestamptz default now()
);

create table agency_profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  agency_name text not null default '',
  contact_person text default '',
  city text default 'Dhaka',
  website text default '',
  description text default '',
  logo_url text default '',
  is_verified boolean default false,
  created_at timestamptz default now()
);

create table jobs (
  id uuid default gen_random_uuid() primary key,
  agency_id uuid references agency_profiles(id) on delete cascade not null,
  title text not null,
  location text not null default 'Dhaka',
  pay_amount bigint default 0,
  pay_display text default '',
  description text,
  type text default 'Commercial',
  gender_requirement text default 'Any',
  age_range text,
  min_height text,
  experience_level text default 'Any Level',
  shoot_date date,
  is_open boolean default true,
  views int default 0,
  created_at timestamptz default now()
);

create table applications (
  id uuid default gen_random_uuid() primary key,
  job_id uuid references jobs(id) on delete cascade not null,
  model_id uuid references models(id) on delete cascade not null,
  message text,
  status text default 'pending',
  created_at timestamptz default now(),
  unique(job_id, model_id)
);

create table saved_jobs (
  id uuid default gen_random_uuid() primary key,
  model_id uuid references models(id) on delete cascade not null,
  job_id uuid references jobs(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(model_id, job_id)
);

alter table models enable row level security;
alter table agency_profiles enable row level security;
alter table jobs enable row level security;
alter table applications enable row level security;
alter table saved_jobs enable row level security;

create policy "Public read models" on models for select using (true);
create policy "Auth insert model" on models for insert to authenticated with check (true);
create policy "Model update own" on models for update using (auth.uid() = id);

create policy "Public read agencies" on agency_profiles for select using (true);
create policy "Auth insert agency" on agency_profiles for insert to authenticated with check (true);
create policy "Agency update own" on agency_profiles for update using (auth.uid() = id);

create policy "Public read jobs" on jobs for select using (true);
create policy "Agency insert jobs" on jobs for insert to authenticated with check (auth.uid() = agency_id);
create policy "Agency update own jobs" on jobs for update using (auth.uid() = agency_id);
create policy "Agency delete own jobs" on jobs for delete using (auth.uid() = agency_id);

create policy "Model apply" on applications for insert to authenticated with check (auth.uid() = model_id);
create policy "Model view own apps" on applications for select using (auth.uid() = model_id);
create policy "Agency view apps" on applications for select
  using (exists (select 1 from jobs j where j.id = applications.job_id and j.agency_id = auth.uid()));
create policy "Agency update app status" on applications for update
  using (exists (select 1 from jobs j where j.id = applications.job_id and j.agency_id = auth.uid()));

create policy "Model save" on saved_jobs for insert to authenticated with check (auth.uid() = model_id);
create policy "Model view saved" on saved_jobs for select using (auth.uid() = model_id);
create policy "Model unsave" on saved_jobs for delete using (auth.uid() = model_id);

insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true) on conflict do nothing;
insert into storage.buckets (id, name, public) values ('portfolios', 'portfolios', true) on conflict do nothing;

create policy "Anyone view avatars" on storage.objects for select using (bucket_id = 'avatars');
create policy "Auth upload avatars" on storage.objects for insert to authenticated with check (bucket_id = 'avatars');
create policy "Auth update avatars" on storage.objects for update to authenticated using (bucket_id = 'avatars');
create policy "Auth delete avatars" on storage.objects for delete to authenticated using (bucket_id = 'avatars');

create policy "Anyone view portfolios" on storage.objects for select using (bucket_id = 'portfolios');
create policy "Auth upload portfolios" on storage.objects for insert to authenticated with check (bucket_id = 'portfolios');
create policy "Auth delete portfolios" on storage.objects for delete to authenticated using (bucket_id = 'portfolios');
