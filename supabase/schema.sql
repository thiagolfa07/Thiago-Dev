-- Execute este arquivo no SQL Editor do seu projeto Supabase.
create extension if not exists pgcrypto;

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  category text not null default 'Projeto',
  technologies text[] not null default '{}',
  image_url text,
  live_url text,
  github_url text,
  featured boolean not null default false,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.projects enable row level security;

-- Visitantes só podem ler projetos publicados.
drop policy if exists "Public can read published projects" on public.projects;
create policy "Public can read published projects"
on public.projects for select
to anon
using (published = true);

-- O administrador autenticado também precisa enxergar rascunhos no painel.
create policy "Authenticated users can read projects"
on public.projects for select
to authenticated
using (auth.uid() is not null);

-- Usuários autenticados podem gerenciar projetos.
-- Para uso individual, crie somente a conta do administrador no Supabase Auth.
drop policy if exists "Authenticated users can insert projects" on public.projects;
create policy "Authenticated users can insert projects"
on public.projects for insert
to authenticated
with check (auth.uid() is not null);

drop policy if exists "Authenticated users can update projects" on public.projects;
create policy "Authenticated users can update projects"
on public.projects for update
to authenticated
using (auth.uid() is not null)
with check (auth.uid() is not null);

drop policy if exists "Authenticated users can delete projects" on public.projects;
create policy "Authenticated users can delete projects"
on public.projects for delete
to authenticated
using (auth.uid() is not null);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
before update on public.projects
for each row execute procedure public.set_updated_at();

-- IMPORTANTE:
-- Esta política permite que qualquer usuário autenticado gerencie projetos.
-- Para um ambiente público de produção, restrinja insert/update/delete ao UUID
-- do seu usuário administrador, substituindo auth.uid() is not null por
-- auth.uid() = 'SEU-UUID-DE-ADMINISTRADOR'::uuid nas políticas acima.
