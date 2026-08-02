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
