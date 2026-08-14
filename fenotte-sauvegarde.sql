-- ═══════════════════════════════════════════════════════════════════════════
-- FENOTTE45 — INSTANTANÉS AUTOMATIQUES DE L'ÉTAT (paris compris)
-- À coller dans Supabase → SQL Editor → Run.
--
-- POURQUOI : `user_state` ne garde qu'UNE version vivante. Elle est écrasée à
-- chaque écriture. Une fausse manœuvre de Cédric, ou un état vidé par un bug,
-- est donc définitive — alors que la prod d'Antoine, synchronisée par commits
-- GitHub, peut toujours remonter dans l'historique.
--
-- Cette table conserve les 10 derniers instantanés par utilisateur. Aucun
-- Dropbox, aucun jeton, aucune action de l'utilisateur.
-- ═══════════════════════════════════════════════════════════════════════════

create table if not exists public.user_state_backup (
  id          bigserial primary key,
  user_id     uuid not null references auth.users(id) on delete cascade,
  state       jsonb not null,
  n_paris     integer default 0,      -- pour afficher « 42 paris » dans la liste
  created_at  timestamptz not null default now()
);

create index if not exists user_state_backup_user_date
  on public.user_state_backup (user_id, created_at desc);

alter table public.user_state_backup enable row level security;

-- Chacun ne voit et n'écrit QUE ses propres instantanés.
drop policy if exists "backup_select_own" on public.user_state_backup;
create policy "backup_select_own" on public.user_state_backup
  for select using (auth.uid() = user_id);

drop policy if exists "backup_insert_own" on public.user_state_backup;
create policy "backup_insert_own" on public.user_state_backup
  for insert with check (auth.uid() = user_id);

drop policy if exists "backup_delete_own" on public.user_state_backup;
create policy "backup_delete_own" on public.user_state_backup
  for delete using (auth.uid() = user_id);

-- ── Purge automatique : on ne garde que les 10 derniers par utilisateur ──
-- Fait côté base plutôt que côté client : si le navigateur est fermé au
-- mauvais moment, la purge doit quand même avoir lieu.
create or replace function public.purge_backups()
returns trigger
language plpgsql
security definer
as $$
begin
  delete from public.user_state_backup
  where user_id = new.user_id
    and id not in (
      select id from public.user_state_backup
      where user_id = new.user_id
      order by created_at desc
      limit 10
    );
  return new;
end;
$$;

drop trigger if exists trg_purge_backups on public.user_state_backup;
create trigger trg_purge_backups
  after insert on public.user_state_backup
  for each row execute function public.purge_backups();
