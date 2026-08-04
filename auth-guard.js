// ═══════════════════════════════════════════════════════════════
// GONES45 — pont Supabase transparent (fenotte45)
// ═══════════════════════════════════════════════════════════════

import { supabase, chargerEtat, sauverEtat, deconnexion } from './supabase.js';

// ═══════════════════════════════════════════════════════════════
// CLOISONNEMENT DU localStorage — À LIRE AVANT DE MODIFIER
// ═══════════════════════════════════════════════════════════════
// gones45140.github.io/gones45/ et gones45140.github.io/fenotte45/ sont sur la
// MÊME ORIGINE. Le localStorage est cloisonné par origine, jamais par chemin :
// les deux dépôts lisent et écrivent le même stockage.
//
// Sans ce bloc, fenotte45 lit le g45v5 de la prod (d'où une bankroll déjà remplie
// sur un compte neuf) et surtout l'ÉCRASE dès qu'un compte Supabase non vide se
// connecte. Idem pour les tokens : les supprimer côté fenotte les supprime aussi
// pour la prod.
//
// On remappe donc g45v5 vers une clé propre à fenotte, et on MASQUE les tokens en
// lecture au lieu de les toucher — la prod reste strictement intacte.
// ═══════════════════════════════════════════════════════════════

const CLE_ETAT     = 'g45v5';
const CLE_ETAT_FEN = 'g45v5__fen';

// Clés lues par app.js mais neutralisées ici : seul Supabase doit stocker les
// données de cette version, sinon un ami connecté tirerait le state de la prod.
// Valeur renvoyée en lecture, SANS jamais écrire dans le stockage partagé.
const MASQUE = {
  'gones45_github_token': null,
  'g45_dbx_token':        null,
  'g45_dbx_refresh':      null,
  'gones45_dbx_token':    null,
  'g45_github_betsync':   '0'
};

const rawGet = localStorage.getItem.bind(localStorage);
const rawSet = localStorage.setItem.bind(localStorage);
const rawDel = localStorage.removeItem.bind(localStorage);

const remap = (k) => (k === CLE_ETAT ? CLE_ETAT_FEN : k);

localStorage.getItem = function(k) {
  if (Object.prototype.hasOwnProperty.call(MASQUE, k)) return MASQUE[k];
  return rawGet(remap(k));
};
localStorage.removeItem = function(k) {
  if (Object.prototype.hasOwnProperty.call(MASQUE, k)) return;   // ne pas toucher la prod
  return rawDel(remap(k));
};

console.log('🔒 cloisonnement actif : ' + CLE_ETAT + ' → ' + CLE_ETAT_FEN + ', tokens masqués');

const overlay = document.createElement('div');
overlay.id = 'g45-boot';
overlay.style.cssText = 'position:fixed;inset:0;background:#0a0e1a;color:#fff;display:flex;align-items:center;justify-content:center;flex-direction:column;font-family:system-ui;z-index:99999;font-size:14px;gap:12px;';
overlay.innerHTML = '<div style="font-size:22px;font-weight:800;letter-spacing:-.5px;">🎯 GONES45</div><div id="g45-boot-msg" style="color:#8899aa;">Connexion…</div>';
document.body.appendChild(overlay);
const msg = (t) => { const el = document.getElementById('g45-boot-msg'); if (el) el.textContent = t; };

async function attendreSession() {
  const hash = window.location.hash || '';
  const search = window.location.search || '';
  // Deux formats possibles : flux implicite (#access_token=…) et PKCE (?code=…),
  // ce dernier étant le défaut des versions récentes de supabase-js v2. Ne renifler
  // que le hash faisait tomber le PKCE sur getSession(), qui peut répondre null
  // avant l'échange du code → rebond intempestif vers login.html.
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
console.log('👤 utilisateur :', user.email, '— user_id :', user.id);

try {
  msg('Chargement de tes données…');
  const data = await chargerEtat(user.id);
  if (data && data.state && Object.keys(data.state).length > 0) {
    rawSet(CLE_ETAT_FEN, JSON.stringify(data.state));
    console.log('✅ état chargé depuis Supabase — dernière maj :', data.updated_at);
  } else {
    rawSet(CLE_ETAT_FEN, JSON.stringify({}));
    console.log('ℹ️ nouveau compte, état vierge (la prod n\'est PAS lue)');
  }
} catch (e) {
  console.warn('⚠️ erreur chargement Supabase :', e);
}

let pushTimer = null;
let lastPushed = null;
localStorage.setItem = function(k, v) {
  if (Object.prototype.hasOwnProperty.call(MASQUE, k)) return;   // ne pas écrire chez la prod
  rawSet(remap(k), v);
  if (k === CLE_ETAT) {
    clearTimeout(pushTimer);
    pushTimer = setTimeout(async () => {
      pushTimer = null;
      if (v === lastPushed) return;
      try {
        await sauverEtat(user.id, JSON.parse(v));
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
    const v = rawGet(CLE_ETAT_FEN);
    if (v && v !== lastPushed) {
      await sauverEtat(user.id, JSON.parse(v));
      lastPushed = v;
    }
  } catch (e) {}
};
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flush(); });
window.addEventListener('pagehide', flush);
window.addEventListener('beforeunload', flush);

window._g45User = user;
window._g45Deconnexion = async () => { await flush(); await deconnexion(); window.location.href = './login.html'; };

// Secours : réinjecter une sauvegarde JSON dans CETTE version uniquement.
window._g45ImporterEtat = (json) => { rawSet(CLE_ETAT_FEN, typeof json === 'string' ? json : JSON.stringify(json)); location.reload(); };

msg('Démarrage de l\'application…');

const s = document.createElement('script');
s.src = './app.js';

s.onerror = () => {
  msg('❌ échec du chargement de app.js');
  console.error('app.js introuvable ou bloqué (CSP ?)');
};

s.onload = () => {
  const el = document.getElementById('g45-boot');
  if (el) el.remove();

  if (typeof window._g45BetSyncOn === 'function') window._g45BetSyncOn = () => false;

  // ── POINT CRITIQUE ──────────────────────────────────────────────
  // app.js pose son initialisation principale sur `window.onload` (l. 19396→20469,
  // soit 1073 lignes : 46 fonctions, 16 exports vers window, le préremplissage des
  // clés API, _applyCardStyle(), initPariChips(), et les onclick de btn-refresh-cal /
  // btn-comparer / btn-generate-pari / itab-saisons / itab-mondial / btn-chat-params-*).
  // Comme app.js est injecté APRÈS le passage de l'événement `load`, ce bloc ne
  // partirait jamais. `window.onload` étant le gestionnaire de `load`, redispatcher
  // l'événement relance tout — inutile de rebrancher les boutons un par un, d'autant
  // que la plupart de leurs fonctions ne sont pas globales.
  // Les six autres blocs d'init d'app.js sont gardés par document.readyState.
  try {
    window.dispatchEvent(new Event('load'));
    console.log('✅ événement load redispatché — init de app.js exécutée');
  } catch (e) {
    console.error('❌ redispatch de load échoué :', e);
  }
};

document.body.appendChild(s);
