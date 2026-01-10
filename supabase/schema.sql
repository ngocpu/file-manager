-- =========================
-- 1. EXTENSIONS
-- =========================
create extension if not exists "pgcrypto";

-- =========================
-- 2. PROFILES (MAP AUTH)
-- =========================
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  display_name text,
  avatar_url text,
  created_at timestamptz default now()
);

-- =========================
-- 3. ENUMS
-- =========================
do $$ begin
  create type file_type as enum ('folder', 'file');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type permission_level as enum ('viewer', 'editor', 'owner');
exception when duplicate_object then null;
end $$;

-- =========================
-- 4. FILES TABLE
-- =========================
create table if not exists files (
  id uuid primary key default gen_random_uuid(),

  name text not null,
  type file_type not null,

  parent_id uuid references files(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,

  size bigint,
  mime_type text,

  depth int not null default 0,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_files_parent on files(parent_id);
create index if not exists idx_files_owner on files(owner_id);
create index if not exists idx_files_owner_parent on files(owner_id, parent_id);

-- =========================
-- 5. FILE PERMISSIONS
-- =========================
create table if not exists file_permissions (
  id uuid primary key default gen_random_uuid(),
  file_id uuid not null references files(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  permission permission_level not null,
  created_at timestamptz default now(),
  unique (file_id, user_id)
);

-- =========================
-- 6. UPDATED_AT TRIGGER
-- =========================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_files_updated on files;

create trigger trg_files_updated
before update on files
for each row execute function update_updated_at();

-- =========================
-- 7. ENABLE RLS
-- =========================
alter table profiles enable row level security;
alter table files enable row level security;
alter table file_permissions enable row level security;

-- =========================
-- 8. PROFILES POLICIES
-- =========================
create policy "profiles_select_own"
on profiles for select
using (id = auth.uid());

create policy "profiles_update_own"
on profiles for update
using (id = auth.uid());

-- =========================
-- 9. FILES POLICIES
-- =========================
create policy "files_select_own_or_shared"
on files for select
using (
  owner_id = auth.uid()
  or exists (
    select 1 from file_permissions fp
    where fp.file_id = files.id
      and fp.user_id = auth.uid()
  )
);

create policy "files_insert_own"
on files for insert
with check (owner_id = auth.uid());

create policy "files_update_owner_or_editor"
on files for update
using (
  owner_id = auth.uid()
  or exists (
    select 1 from file_permissions fp
    where fp.file_id = files.id
      and fp.user_id = auth.uid()
      and fp.permission in ('editor', 'owner')
  )
);

create policy "files_delete_owner"
on files for delete
using (owner_id = auth.uid());

-- =========================
-- 10. PERMISSIONS POLICIES
-- =========================
create policy "permissions_manage_by_owner"
on file_permissions
for all
using (
  exists (
    select 1 from files f
    where f.id = file_permissions.file_id
      and f.owner_id = auth.uid()
  )
);
