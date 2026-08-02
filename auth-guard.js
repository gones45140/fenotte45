// ═══════════════════════════════════════════════════════════════
// GONES45 — pont Supabase transparent
// ═══════════════════════════════════════════════════════════════
// Ce fichier tourne AVANT app.js. Il fait trois choses :
//   1. Redirige vers login.html si l'utilisateur n'est pas connecté
//   2. Charge son state depuis Supabase et l'écrit en localStorage
//      (là où app.js s'attend à le trouver, aucun changement dans app.js)
//   3. Intercepte les futures écritures de g45v5 pour les pousser sur Supabase
//
// Puis il charge app.js dynamiquement — d'où la nécessité de RETIRER
// le <script src="app.js"> de index.html au profit de <script type="module"
// src="./auth-guard.js">.

import { supabase, utilisateurActuel, chargerEtat, sauverEtat, deconnexion } from './supabase.js';

// Petit overlay pendant le chargement, retiré une fois app.js prêt
const overlay = document.createElement('div');
overlay.id = 'g45-boot';
overlay.style.cssText = 'position:fixed;inset:0;background:#0a0e1a;color:#fff;display:flex;align-items:center;justify-content:center;flex-direction:column;font-family:system-ui;z-index:99999;font-size:14px;gap:12px;';
overlay.innerHTML = '<div style="font-size:22px;font-weight:800;letter-spacing:-.5px;">🎯 GONES45</div><div id="g45-boot-msg" style="color:#8899aa;">Connexion…</div>';
document.body.appendChild(overlay);
const msg = (t) => { const el = document.getElementById('g45-boot-msg'); if (el) el.textContent = t; };

// 1. Vérifier l'auth
const user = await utilisateurActuel();
if (!user) {
  msg('Redirection vers la connexion…');
  window.location.href = './login.html';
  throw new Error('non connecté');   // interrompt le reste du script
}

// 2. Charger le state depuis Supabase
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

// 3. Intercepter les écritures de g45v5 pour les pousser sur Supabase
//    On garde le comportement local intact (setItem d'origine), on ajoute juste
//    un push différé de 800ms pour grouper plusieurs modifs rapprochées.
const origSet = localStorage.setItem.bind(localStorage);
let pushTimer = null;
let lastPushed = null;
localStorage.setItem = function(k, v) {
  origSet(k, v);
  if (k === 'g45v5') {
    clearTimeout(pushTimer);
    pushTimer = setTimeout(async () => {
      if (v === lastPushed) return;   // évite les doubles push
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

// Filet de sécurité : pousser tout ce qui reste en attente au moment
// de quitter la page (analogue à _g45FlushBetSync côté GitHub)
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

// 4. Exposer utilitaires dans la console
window._g45User = user;
window._g45Deconnexion = async () => { await flush(); await deconnexion(); window.location.href = './login.html'; };

// 5. Enfin, charger app.js
msg('Démarrage de l\'application…');
console.log('✅ auth-guard actif, utilisateur :', user.email);

const s = document.createElement('script');
s.src = './app.js';
s.onload = () => {
  const el = document.getElementById('g45-boot');
  if (el) el.remove();
};
document.body.appendChild(s);
