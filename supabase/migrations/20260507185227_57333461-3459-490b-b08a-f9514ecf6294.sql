
-- Enums
create type public.app_role as enum ('user', 'admin');
create type public.difficulty_level as enum ('beginner', 'intermediate', 'advanced');

-- Profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  gender text,
  school_name text,
  class_level text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

-- Roles (separate table to avoid recursion)
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null,
  unique(user_id, role)
);
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

-- Topics
create table public.topics (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text,
  notes text,
  order_index int not null default 0,
  created_at timestamptz not null default now()
);
alter table public.topics enable row level security;

-- Questions
create table public.questions (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.topics(id) on delete cascade,
  difficulty difficulty_level not null default 'beginner',
  question text not null,
  options jsonb not null,
  correct_index int not null,
  explanation text,
  created_at timestamptz not null default now()
);
alter table public.questions enable row level security;
create index on public.questions(topic_id, difficulty);

-- Quiz attempts
create table public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  topic_id uuid not null references public.topics(id) on delete cascade,
  difficulty difficulty_level not null,
  score int not null,
  total int not null,
  answers jsonb not null default '[]',
  completed_at timestamptz not null default now()
);
alter table public.quiz_attempts enable row level security;
create index on public.quiz_attempts(user_id, completed_at desc);

-- Profile RLS
create policy "Profiles: self read" on public.profiles for select using (auth.uid() = id);
create policy "Profiles: admin read" on public.profiles for select using (public.has_role(auth.uid(), 'admin'));
create policy "Profiles: self update" on public.profiles for update using (auth.uid() = id);
create policy "Profiles: self insert" on public.profiles for insert with check (auth.uid() = id);

-- Roles RLS
create policy "Roles: self read" on public.user_roles for select using (auth.uid() = user_id);
create policy "Roles: admin read" on public.user_roles for select using (public.has_role(auth.uid(), 'admin'));

-- Topics RLS
create policy "Topics: read all auth" on public.topics for select to authenticated using (true);
create policy "Topics: admin write" on public.topics for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- Questions RLS
create policy "Questions: read all auth" on public.questions for select to authenticated using (true);
create policy "Questions: admin write" on public.questions for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- Quiz attempts RLS
create policy "Attempts: self read" on public.quiz_attempts for select using (auth.uid() = user_id);
create policy "Attempts: self insert" on public.quiz_attempts for insert with check (auth.uid() = user_id);
create policy "Attempts: admin read" on public.quiz_attempts for select using (public.has_role(auth.uid(), 'admin'));

-- Auto-create profile + role on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, gender, school_name, class_level)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'gender',
    new.raw_user_meta_data->>'school_name',
    new.raw_user_meta_data->>'class_level'
  );
  insert into public.user_roles (user_id, role) values (new.id, 'user');
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
