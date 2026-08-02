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
  const contientToken = /access_token=|error/.test(hash);
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
  if (pushTimer) {
    clearTimeout(pushTimer);
    try {
      const v = localStorage.getItem('g45v5');
      if (v && v !== lastPushed) {
        const state = JSON.parse(v);
        await sauverEtat(user.id, state);
        lastPushed = v;
      }
    } catch (e) {}
  }
};
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flush(); });
window.addEventListener('pagehide', flush);
window.addEventListener('beforeunload', flush);

window._g45User = user;
window._g45Deconnexion = async () => { await flush(); await deconnexion(); window.location.href = './login.html'; };

msg('Démarrage de l\'application…');
console.log('✅ auth-guard actif, utilisateur :', user.email);

// Rebrancher les handlers d'onglets une fois app.js chargé
// Quand app.js est injecté dynamiquement, certains handlers inline plantent
// silencieusement à cause d'IDs qui n'existent pas dans ce contexte — on recolle
// ceux qui comptent pour naviguer.
function rebrancherOnglets() {
  const paires = [
    ['itab-saisons',      () => window.swInner && swInner('saisons', document.getElementById('itab-saisons'))],
    ['itab-mondial',      () => { window.swInner && swInner('mondial', document.getElementById('itab-mondial')); window.loadMondial2026 && loadMondial2026(); }],
    ['btn-generate-pari', () => window.generatePariDuJour && generatePariDuJour()],
    ['btn-chat-params-pc',      () => window.toggleChatParamsPC && toggleChatParamsPC()],
    ['btn-chat-params-mobile',  () => window.toggleChatParamsPC && toggleChatParamsPC()],
    ['btn-refresh-cal',   () => window.loadCalendrier && loadCalendrier()],
    ['btn-comparer',      () => window.runComparateur && runComparateur()],
  ];
  paires.forEach(([id, fn]) => {
    const el = document.getElementById(id);
    if (el && !el.onclick) el.onclick = fn;
  });
  console.log('✅ handlers d\'onglets rebranchés');
}

const s = document.createElement('script');
s.src = './app.js';
s.onload = () => {
  const el = document.getElementById('g45-boot');
  if (el) el.remove();
  // Petit délai pour laisser app.js finir son init
  setTimeout(rebrancherOnglets, 100);
};
document.body.appendChild(s);
