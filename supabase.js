// ═══════════════════════════════════════════════════════════════
// GONES45 — client Supabase multi-utilisateur
// ═══════════════════════════════════════════════════════════════
// Fichier isolé de app.js : on peut le brancher progressivement
// sans casser l'existant. À intégrer plus tard dans index.html via :
//   <script type="module" src="./supabase.js"></script>

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL      = 'https://ofcizjaynonjtiusdwgi.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_-fsq1xp-DkH2llJ6MjIvEA_IwXeHoYa';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── Authentification par magic link ────────────────────────────
// L'utilisateur reçoit un email avec un lien qui le connecte
// directement, sans mot de passe à mémoriser.

export async function envoyerMagicLink(email) {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: window.location.origin + window.location.pathname.replace(/[^\/]*$/, '')
    }
  });
  return error;
}

// ── Authentification par email + mot de passe (27/08) ──────────
// Demande d'Antoine : plus de lien à chaque connexion. Supabase exige
// malgré tout UN email de confirmation la toute première fois qu'un compte
// bascule sur mot de passe (aucun moyen de le définir sans preuve qu'on
// possède l'adresse) — ensuite, connexion = email + mot de passe, sans lien.

export async function connexionMotDePasse(email, password) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return error;
}

// Envoie l'email one-shot (première configuration OU mot de passe oublié).
// Réutilise le flux de récupération de Supabase : le lien renvoie sur
// reset.html, où `definirNouveauMotDePasse` fixe le mot de passe.
export async function demanderReinitialisation(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + window.location.pathname.replace(/[^\/]*$/, '') + 'reset.html'
  });
  return error;
}

// Appelé depuis reset.html, une fois la session de récupération active.
export async function definirNouveauMotDePasse(password) {
  const { error } = await supabase.auth.updateUser({ password });
  return error;
}

export async function utilisateurActuel() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function deconnexion() {
  await supabase.auth.signOut();
}

// ── État utilisateur ────────────────────────────────────────────
// L'ancien `state` (b, u, h, a…) est stocké tel quel en JSONB.
// Zéro migration de format : on prend/on pousse tout d'un bloc.

export async function chargerEtat(userId) {
  const { data, error } = await supabase
    .from('user_state')
    .select('state, updated_at')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return data;   // { state, updated_at } ou null
}

export async function sauverEtat(userId, state) {
  const { error } = await supabase
    .from('user_state')
    .upsert({
      user_id: userId,
      state,
      updated_at: new Date().toISOString()
    });
  if (error) throw error;
}

// ── Instantanés de sécurité ────────────────────────────────────
// `user_state` n'a qu'UNE version vivante, écrasée à chaque écriture. La prod
// d'Antoine peut remonter dans l'historique de ses commits GitHub ; ici, sans
// ces instantanés, une mauvaise manœuvre serait définitive.
// La table garde les 10 derniers par utilisateur (purge par trigger côté base).

export async function sauverInstantane(userId, state) {
  const nParis = ((state && state.h && state.h.length) || 0)
               + ((state && state.a && state.a.length) || 0);
  const { error } = await supabase
    .from('user_state_backup')
    .insert({ user_id: userId, state, n_paris: nParis });
  if (error) throw error;
}

export async function listerInstantanes(userId) {
  const { data, error } = await supabase
    .from('user_state_backup')
    .select('id, n_paris, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(10);
  if (error) throw error;
  return data || [];
}

export async function lireInstantane(userId, id) {
  const { data, error } = await supabase
    .from('user_state_backup')
    .select('state, created_at')
    .eq('user_id', userId)
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

// ── Config CLV et grille de mises ──────────────────────────────

export async function chargerClvConfig(userId) {
  const { data, error } = await supabase
    .from('user_clv_config').select('config').eq('user_id', userId).maybeSingle();
  if (error) throw error;
  return data ? data.config : null;
}
export async function sauverClvConfig(userId, config) {
  const { error } = await supabase
    .from('user_clv_config')
    .upsert({ user_id: userId, config, updated_at: new Date().toISOString() });
  if (error) throw error;
}

export async function chargerStrats(userId) {
  const { data, error } = await supabase
    .from('user_strats').select('strats').eq('user_id', userId).maybeSingle();
  if (error) throw error;
  return data ? data.strats : null;
}
export async function sauverStrats(userId, strats) {
  const { error } = await supabase
    .from('user_strats')
    .upsert({ user_id: userId, strats, updated_at: new Date().toISOString() });
  if (error) throw error;
}
