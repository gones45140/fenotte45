-- ═══════════════════════════════════════════════════════════════════════════
-- BET45 — SUPPRESSION DE SON COMPTE PAR L'UTILISATEUR (RGPD, 17/10/2026)
-- À coller dans Supabase → SQL Editor → Run, dans LES DEUX projets :
--   • comptes BET45 (ofcizjaynonjtiusdwgi, « gones45-multi »)
--   • Potes / Social (vbsdewuvycaekfkixynh)
--
-- POURQUOI : le bouton « 🗑️ Supprimer mon compte et mes données » (Outils → Mon compte) ne peut pas
-- effacer un compte avec la clé publique de l'appli. Cette fonction s'exécute avec les droits du
-- propriétaire, mais SEULEMENT pour l'utilisateur connecté (auth.uid()) : personne ne peut effacer
-- le compte d'un autre.
-- Elle efface, dans toutes les tables du schéma public, les lignes dont une colonne uuid vaut
-- l'identifiant de l'utilisateur (état, sauvegardes, profil, bilans, paris partagés, abonnements
-- entre potes…), en deux passes pour passer les liens entre tables, puis le compte lui-même.
-- ═══════════════════════════════════════════════════════════════════════════

create or replace function public.g45_supprimer_compte()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  t record;
  passe int;
begin
  if uid is null then
    raise exception 'non connecté';
  end if;
  for passe in 1..2 loop
    for t in
      select c.table_name, c.column_name
      from information_schema.columns c
      join information_schema.tables tb
        on tb.table_schema = c.table_schema and tb.table_name = c.table_name and tb.table_type = 'BASE TABLE'
      where c.table_schema = 'public' and c.data_type = 'uuid'
    loop
      begin
        execute format('delete from public.%I where %I = $1', t.table_name, t.column_name) using uid;
      exception when others then
        null;  -- lien vers une autre table pas encore vidée : la 2e passe s'en charge
      end;
    end loop;
  end loop;
  delete from auth.users where id = uid;
end;
$$;

revoke all on function public.g45_supprimer_compte() from public, anon;
grant execute on function public.g45_supprimer_compte() to authenticated;
