// ═══════════════════════════════════════════════════════════════
// GONES45 — pont Supabase transparent
// ═══════════════════════════════════════════════════════════════

import { supabase, chargerEtat, sauverEtat, deconnexion } from './supabase.js';

const overlay = document.createElement('div');
overlay.id = 'g45-boot';
overlay.style.cssText = 'position:fixed;inset:0;background:#0a0e1a;color:#fff;display:flex;align-items:center;justify-content:center;flex-direction:column;font-family:system-ui;z-index:99999;font-size:14px;gap:12px;';
overlay.innerHTML = '<div style="font-size:22px;font-weight:800;letter-spacing:-.5px;">🎯 GONES45</div><div id="g45-boot-msg" style="color:#8899aa;">Connexion…</div>';
document.body.appendChild(overlay);
const msg = (t) => { const el = document.getElementById('g45-boot-msg'); if (el) el.textContent = t; };

async function attendreSession() {
  const hash = window.location.hash || '';
  const search = window.location.search || '';
  // Deux formats possibles selon le flux du SDK : implicite (#access_token=…)
  // et PKCE (?code=…), qui est le défaut des versions récentes de supabase-js v2.
  // Ne renifler que le hash faisait tomber le flux PKCE sur getSession(), qui peut
  // répondre null avant l'échange du code → rebond intempestif vers login.html.
  const contientToken = /access_token=|error/.test(hash) || /[?&]code=/.test(search);
  if (!contientToken) {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  }
  return await new Promise(resolve => {
    let done = false;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (done) return;
      if (session) { done = true; subscription.unsubscribe(); resolve(session); }
    });
    setTimeout(async () => {
      if (done) return;
      done = true; subscription.unsubscribe();
      const { data: { session } } = await supabase.auth.getSession();
      resolve(session);
    }, 4000);
  });
}

const session = await attendreSession();
if (!session) {
  msg('Redirection vers la connexion…');
  window.location.href = './login.html';
  throw new Error('non connecté');
}
const user = session.user;

// ── Neutraliser les synchros GitHub et Dropbox
// Sur cette version test, seul Supabase doit stocker les données utilisateur —
// sans ça un ami connecté tirerait le state de la prod d'Antoine (ou l'inverse).
// On RANGE les tokens sous une autre clé au lieu de les supprimer : le token GitHub
// ne sert pas qu'aux paris (Mémoire Stats, joueurs.json, players.json passent par lui),
// et le perdre obligerait à le recoller à la main pour revenir en prod.
try {
  [
    ['gones45_github_token', 'gones45_github_token__off'],
    ['g45_dbx_token',        'g45_dbx_token__off'],
    ['g45_dbx_refresh',      'g45_dbx_refresh__off'],
    ['gones45_dbx_token',    'gones45_dbx_token__off']
  ].forEach(([vif, range]) => {
    const v = localStorage.getItem(vif);
    if (v !== null) { localStorage.setItem(range, v); localStorage.removeItem(vif); }
  });
  localStorage.setItem('g45_github_betsync', '0');
  console.log('🛑 synchros GitHub et Dropbox neutralisées (tokens rangés sous *__off)');
} catch (e) {}

try {
  msg('Chargement de tes données…');
  const data = await chargerEtat(user.id);
  if (data && data.state && Object.keys(data.state).length > 0) {
    localStorage.setItem('g45v5', JSON.stringify(data.state));
    console.log('✅ état chargé depuis Supabase — dernière maj :', data.updated_at);
  } else {
    console.log('ℹ️ nouveau compte, état vierge');
  }
} catch (e) {
  console.warn('⚠️ erreur chargement Supabase, on continue avec le localStorage :', e);
}

const origSet = localStorage.setItem.bind(localStorage);
let pushTimer = null;
let lastPushed = null;
localStorage.setItem = function(k, v) {
  origSet(k, v);
  if (k === 'g45v5') {
    clearTimeout(pushTimer);
    pushTimer = setTimeout(async () => {
      pushTimer = null;
      if (v === lastPushed) return;
      try {
        const state = JSON.parse(v);
        await sauverEtat(user.id, state);
        lastPushed = v;
        console.log('✅ poussé sur Supabase');
      } catch (e) {
        console.warn('❌ push Supabase échoué :', e);
      }
    }, 800);
  }
};

const flush = async () => {
  clearTimeout(pushTimer);
  pushTimer = null;
  try {
    const v = localStorage.getItem('g45v5');
    if (v && v !== lastPushed) {
      const state = JSON.parse(v);
      await sauverEtat(user.id, state);
      lastPushed = v;
    }
  } catch (e) {}
};
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flush(); });
window.addEventListener('pagehide', flush);
window.addEventListener('beforeunload', flush);

window._g45User = user;
window._g45Deconnexion = async () => { await flush(); await deconnexion(); window.location.href = './login.html'; };

msg('Démarrage de l\'application…');
console.log('✅ auth-guard actif, utilisateur :', user.email);

const s = document.createElement('script');
s.src = './app.js';

s.onerror = () => {
  msg('❌ échec du chargement de app.js');
  console.error('app.js introuvable ou bloqué (CSP ?)');
};

s.onload = () => {
  const el = document.getElementById('g45-boot');
  if (el) el.remove();

  // Verrouiller la synchro paris au niveau fonction, au cas où app.js ait déjà lu les flags
  if (typeof window._g45BetSyncOn === 'function') window._g45BetSyncOn = () => false;

  // ── POINT CRITIQUE ──────────────────────────────────────────────
  // app.js pose son initialisation principale sur `window.onload` (lignes 19396→20469,
  // soit 1073 lignes : 46 fonctions, 16 exports vers window, le préremplissage des clés
  // API, loadPublicStats(), _applyCardStyle(), initPariChips(), et les onclick des boutons
  // btn-refresh-cal / btn-comparer / btn-generate-pari / itab-saisons / itab-mondial /
  // btn-chat-params-*).
  // Comme on injecte app.js APRÈS que l'événement `load` soit passé, ce bloc ne partirait
  // jamais. `window.onload` étant le gestionnaire de l'événement `load`, redispatcher
  // l'événement suffit à tout relancer — inutile de rebrancher les boutons un par un,
  // d'autant que la plupart de leurs fonctions ne sont pas globales.
  // Les six autres blocs d'init d'app.js sont gardés par document.readyState et tournent
  // déjà tout seuls ; ils ne sont pas rejoués ici.
  try {
    window.dispatchEvent(new Event('load'));
    console.log('✅ événement load redispatché — init de app.js exécutée');
  } catch (e) {
    console.error('❌ redispatch de load échoué :', e);
  }
};

document.body.appendChild(s);
