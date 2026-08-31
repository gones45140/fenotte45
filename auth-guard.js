// ═══════════════════════════════════════════════════════════════
// GONES45 — pont Supabase transparent (fenotte45)
// ═══════════════════════════════════════════════════════════════

import { supabase, chargerEtat, sauverEtat, deconnexion,
         sauverInstantane, listerInstantanes, lireInstantane } from './supabase.js?v=20260821a';

// ═══════════════════════════════════════════════════════════════
// CLOISONNEMENT DU localStorage
// ═══════════════════════════════════════════════════════════════
const CLE_ETAT     = 'g45v5';
const CLE_ETAT_FEN = 'g45v5__fen';

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
  if (Object.prototype.hasOwnProperty.call(MASQUE, k)) return;
  return rawDel(remap(k));
};

console.log('🔒 cloisonnement actif : ' + CLE_ETAT + ' → ' + CLE_ETAT_FEN + ', tokens masqués');

const overlay = document.createElement('div');
overlay.id = 'g45-boot';
overlay.style.cssText = 'position:fixed;inset:0;background:#0a0e1a;color:#fff;display:flex;align-items:center;justify-content:center;flex-direction:column;font-family:system-ui;z-index:99999;font-size:14px;gap:12px;';
overlay.innerHTML = '<div style="font-size:22px;font-weight:800;letter-spacing:-.5px;">🎯 BET45</div><div id="g45-boot-msg" style="color:#8899aa;">Connexion…</div>';
document.body.appendChild(overlay);
const msg = (t) => { const el = document.getElementById('g45-boot-msg'); if (el) el.textContent = t; };

async function attendreSession() {
  const hash = window.location.hash || '';
  const search = window.location.search || '';
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

// ═══════════════════════════════════════════════════════════════
// GESTION DU CODE DE CONNEXION / MAGIC LINK
// ═══════════════════════════════════════════════════════════════
let session = await attendreSession();

if (!session) {
  const url = window.location.href;
  const aUnCode = /[?&]code=/.test(window.location.search) || /access_token=/.test(window.location.hash);
  if (aUnCode) {
    try {
      msg('Validation du lien de connexion…');
      const { data, error } = await supabase.auth.exchangeCodeForSession(url);
      if (error) throw error;
      session = data && data.session;
      if (session) history.replaceState({}, '', window.location.pathname);
    } catch (e) {
      console.error('échange du code échoué :', e);
      overlay.innerHTML = '<div style="max-width:420px;text-align:center;padding:20px;font-family:system-ui;">'
        + '<div style="font-size:22px;font-weight:800;margin-bottom:10px;">🎯 BET45</div>'
        + '<div style="color:#ff8a8a;font-weight:700;margin-bottom:8px;">Lien de connexion refusé</div>'
        + '<div style="color:#8899aa;font-size:12px;line-height:1.6;margin-bottom:14px;">'
        + (e && e.message ? e.message : 'raison inconnue') + '<br><br>'
        + 'Causes habituelles : lien déjà utilisé, ou un second lien demandé qui a annulé le premier.'
        + '</div><a href="./login.html" style="display:inline-block;padding:10px 18px;border-radius:9px;background:#2563eb;color:#fff;text-decoration:none;font-weight:700;font-size:13px;">Redemander un lien</a></div>';
      throw new Error('échange du code échoué');
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// ACCÈS CONNECTÉ OU VISITEUR
// ═══════════════════════════════════════════════════════════════
let user = null;

if (!session) {
  console.log('👀 Mode visiteur : navigation sans compte actif');
  sessionStorage.removeItem('g45_login_bounce');
} else {
  sessionStorage.removeItem('g45_login_bounce');
  user = session.user;
  console.log('👤 utilisateur :', user.email, '— user_id :', user.id);
}

// ═══════════════════════════════════════════════════════════════
// FORME DE L'ÉTAT INITIAL
// ═══════════════════════════════════════════════════════════════
// MUR DE DÉMARRAGE (28/08, demande d'Antoine : "je veux en page d'entrée...
// sur un nouveau compte"). Contrairement à `PRESETS` dans app.js (qui RÉAJOUTE
// une équipe manquante à CHAQUE démarrage, un comportement qu'Antoine a dû
// contourner avec une liste d'exclusion `g45_presets_off` sur gones45), cette
// liste n'est écrite QU'UNE FOIS, à la création du compte — un nouvel inscrit
// peut ensuite supprimer n'importe laquelle sans la voir revenir. Noms
// choisis pour correspondre EXACTEMENT aux clés déjà connues ailleurs dans
// app.js (ESPN_TEAM_LEAGUE, NBA_TEAMS, MLB_TEAMS, la convention "AU NRL"/
// "FORMULE 1" déjà utilisée sur le mur perso) — sinon la résolution du score
// et du logo ne fonctionnerait pas pour ces équipes-là spécifiquement.
const MUR_DEMARRAGE = [
  {n:'France',              abbr:'FRA', color:'#3b82f6', s:'4', l:1, sport:'⚽'},
  {n:'PSG',                 abbr:'PSG', color:'#c8a050', s:'4', l:1, sport:'⚽'},
  {n:'Real Madrid',         abbr:'RMA', color:'#94a3b8', s:'5', l:1, sport:'⚽'},
  {n:'Barcelona',           abbr:'BAR', color:'#a50044', s:'5', l:1, sport:'⚽'},
  {n:'Arsenal',             abbr:'ARS', color:'#ef4444', s:'4', l:1, sport:'⚽'},
  {n:'Manchester City',     abbr:'MCI', color:'#6cabdd', s:'4', l:1, sport:'⚽'},
  {n:'Inter Milan',         abbr:'INT', color:'#0ea5e9', s:'4', l:1, sport:'⚽'},
  {n:'Bayern Munich',       abbr:'FCB', color:'#dc2626', s:'4', l:1, sport:'⚽'},
  {n:'Colorado Avalanche',  abbr:'COL', color:'#7c3aed', s:'3', l:1, sport:'🏒'},
  {n:'FORMULE 1',           abbr:'F1',  color:'#e10600', s:'3', l:1, sport:'🏎'},
  {n:'AU NRL',              abbr:'NRL', color:'#f0b020', s:'3', l:1, sport:'🏉🇦🇺'},
  {n:'Los Angeles Lakers',  abbr:'LAL', color:'#552583', s:'4', l:1, sport:'🏀'},
  {n:'LA Dodgers',          abbr:'LAD', color:'#3b82f6', s:'3', l:1, sport:'⚾'}
];
const ETAT_VIDE = { b:{}, u:MUR_DEMARRAGE.slice(), h:[], a:[], start_bk:0, goal:0, ugoals:{}, notes:{}, bkColors:{} };

function normaliser(etat) {
  const out = Object.assign({}, ETAT_VIDE, etat || {});
  if (!Array.isArray(out.u)) out.u = [];
  if (!Array.isArray(out.h)) out.h = [];
  if (!Array.isArray(out.a)) out.a = [];
  ['b','ugoals','notes','bkColors'].forEach(k => {
    if (!out[k] || typeof out[k] !== 'object' || Array.isArray(out[k])) out[k] = {};
  });
  return out;
}

try {
  msg('Chargement de tes données…');
  if (user) {
    const data = await chargerEtat(user.id);
    if (data && data.state && Object.keys(data.state).length > 0) {
      rawSet(CLE_ETAT_FEN, JSON.stringify(normaliser(data.state)));
      console.log('✅ état chargé depuis Supabase — dernière maj :', data.updated_at);
    } else {
      rawSet(CLE_ETAT_FEN, JSON.stringify(ETAT_VIDE));
      console.log('ℹ️ nouveau compte, état vierge complet');
    }
  } else {
    if (!rawGet(CLE_ETAT_FEN)) rawSet(CLE_ETAT_FEN, JSON.stringify(ETAT_VIDE));
    console.log('ℹ️ mode visiteur, état local initialisé');
  }
} catch (e) {
  console.warn('⚠️ erreur chargement :', e);
  if (!rawGet(CLE_ETAT_FEN)) rawSet(CLE_ETAT_FEN, JSON.stringify(ETAT_VIDE));
}

let pushTimer = null;
let lastPushed = null;

// ═══════════════════════════════════════════════════════════════
// INSTANTANÉS ET SYNCHRO
// ═══════════════════════════════════════════════════════════════
const CLE_DERNIER_SNAP = 'g45_snap_ts__fen';
const SNAP_INTERVALLE = 3600000;

async function peutEtreInstantane(state) {
  if (!user) return;
  try {
    if (!state || !Object.keys(state).length) return;
    const dernier = parseInt(rawGet(CLE_DERNIER_SNAP) || '0', 10) || 0;
    if (Date.now() - dernier < SNAP_INTERVALLE) return;
    await sauverInstantane(user.id, state);
    rawSet(CLE_DERNIER_SNAP, String(Date.now()));
    console.log('📸 instantané de sécurité déposé');
  } catch (e) {
    console.warn('instantané non déposé :', e && e.message);
  }
}

localStorage.setItem = function(k, v) {
  if (Object.prototype.hasOwnProperty.call(MASQUE, k)) return;
  rawSet(remap(k), v);
  if (k === CLE_ETAT && user) {
    clearTimeout(pushTimer);
    pushTimer = setTimeout(async () => {
      pushTimer = null;
      if (v === lastPushed) return;
      try {
        const objet = JSON.parse(v);
        await sauverEtat(user.id, objet);
        lastPushed = v;
        console.log('✅ poussé sur Supabase');
        peutEtreInstantane(objet);
      } catch (e) {
        console.warn('❌ push Supabase échoué :', e);
      }
    }, 800);
  }
};

const flush = async () => {
  if (!user) return;
  clearTimeout(pushTimer);
  pushTimer = null;
  try {
    const v = rawGet(CLE_ETAT_FEN);
    if (v && v !== lastPushed) {
      const objet = JSON.parse(v);
      await sauverEtat(user.id, objet);
      lastPushed = v;
      await peutEtreInstantane(objet);
    }
  } catch (e) {}
};

document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flush(); });
window.addEventListener('pagehide', flush);
window.addEventListener('beforeunload', flush);

window._g45User = user;
window._g45Deconnexion = async () => {
  if (user) await flush();
  await deconnexion();
  rawDel(CLE_ETAT_FEN);
  rawDel(CLE_DERNIER_SNAP);
  sessionStorage.removeItem('g45_login_bounce');
  Object.keys(localStorage).filter(k => k.indexOf('sb-') === 0).forEach(k => rawDel(k));
  window.location.href = './login.html';
};

// ═══════════════════════════════════════════════════════════════
// PANNEAU « MES SAUVEGARDES »
// ═══════════════════════════════════════════════════════════════
window._g45Sauvegardes = async function () {
  if (!user) { alert('Connecte-toi pour accéder à tes sauvegardes.'); return; }
  const fond = document.createElement('div');
  fond.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.8);z-index:99998;display:flex;align-items:center;justify-content:center;padding:16px;font-family:system-ui;';
  fond.onclick = (e) => { if (e.target === fond) fond.remove(); };
  fond.innerHTML = '<div style="background:#141a2a;border:1px solid #2a3550;border-radius:14px;max-width:460px;width:100%;padding:16px;color:#e6ecf5;">'
    + '<div style="font-size:15px;font-weight:800;margin-bottom:4px;">💾 Mes sauvegardes</div>'
    + '<div style="font-size:11px;color:#8899aa;margin-bottom:12px;">Copies automatiques de tes paris et de ta bankroll. Une par heure, les 10 dernières sont gardées.</div>'
    + '<div id="g45-snap-liste" style="font-size:12px;color:#8899aa;">Chargement…</div></div>';
  document.body.appendChild(fond);

  let liste = [];
  try { liste = await listerInstantanes(user.id); }
  catch (e) {
    document.getElementById('g45-snap-liste').textContent = 'Erreur de lecture : ' + (e && e.message);
    return;
  }
  const box = document.getElementById('g45-snap-liste');
  if (!liste.length) {
    box.innerHTML = 'Aucune sauvegarde pour l\'instant.<br><span style="opacity:.7;">La première sera déposée automatiquement après ta prochaine modification.</span>';
    return;
  }
  box.innerHTML = liste.map(s => {
    const d = new Date(s.created_at);
    const q = String(d.getDate()).padStart(2,'0') + '/' + String(d.getMonth()+1).padStart(2,'0')
            + ' à ' + String(d.getHours()).padStart(2,'0') + 'h' + String(d.getMinutes()).padStart(2,'0');
    return '<div style="display:flex;align-items:center;gap:8px;padding:8px 2px;border-bottom:1px solid rgba(255,255,255,.06);">'
      + '<div style="flex:1;"><div style="color:#e6ecf5;font-weight:700;">' + q + '</div>'
      + '<div style="font-size:10px;color:#8899aa;">' + (s.n_paris || 0) + ' paris</div></div>'
      + '<button data-snap="' + s.id + '" style="padding:5px 10px;border-radius:7px;border:1px solid rgba(30,215,96,.4);background:rgba(30,215,96,.12);color:#1ed760;font-size:11px;font-weight:700;cursor:pointer;">Restaurer</button></div>';
  }).join('');

  box.querySelectorAll('[data-snap]').forEach(b => {
    b.onclick = async () => {
      if (!confirm('Restaurer cette sauvegarde ?')) return;
      b.textContent = '…';
      try {
        const actuel = rawGet(CLE_ETAT_FEN);
        if (actuel) { try { await sauverInstantane(user.id, JSON.parse(actuel)); } catch (e) {} }
        const snap = await lireInstantane(user.id, b.getAttribute('data-snap'));
        if (!snap || !snap.state) throw new Error('sauvegarde illisible');
        await sauverEtat(user.id, snap.state);
        rawSet(CLE_ETAT_FEN, JSON.stringify(snap.state));
        location.reload();
      } catch (e) {
        alert('Échec de la restauration : ' + (e && e.message));
        b.textContent = 'Restaurer';
      }
    };
  });
};

// ═══════════════════════════════════════════════════════════════
// BLOC COMPTE DANS L'ONGLET OUTILS
// ═══════════════════════════════════════════════════════════════
function _g45PoserBoutonSauvegardes() {
  if (document.getElementById('g45-bloc-compte')) return;
  const hote = document.getElementById('t-outils') || document.getElementById('ip-outils');
  if (!hote) return;

  const bloc = document.createElement('div');
  bloc.id = 'g45-bloc-compte';
  bloc.style.cssText = 'margin:10px 0 14px;padding:12px;border-radius:12px;border:1px solid rgba(255,255,255,.10);background:rgba(255,255,255,.03);';
  
  if (user) {
    bloc.innerHTML =
        '<div style="font-size:9px;font-weight:800;letter-spacing:1px;text-transform:uppercase;color:#4f5d88;margin-bottom:8px;">Mon compte</div>'
      + '<div style="font-size:12px;color:#e6ecf5;font-weight:700;word-break:break-all;margin-bottom:10px;">' + user.email + '</div>'
      + '<button id="g45-btn-snap" style="width:100%;margin-bottom:7px;padding:11px;border-radius:10px;border:1px solid rgba(77,132,255,.35);background:rgba(77,132,255,.12);color:#4d84ff;font-size:13px;font-weight:800;cursor:pointer;">💾 Mes sauvegardes</button>'
      + '<button id="g45-btn-imp" style="width:100%;margin-bottom:7px;padding:11px;border-radius:10px;border:1px solid rgba(240,176,32,.35);background:rgba(240,176,32,.10);color:#f0b020;font-size:13px;font-weight:800;cursor:pointer;">⬇️ Importer mes paris de GONES45</button>'
      + '<button id="g45-btn-out" style="width:100%;padding:11px;border-radius:10px;border:1px solid rgba(255,107,107,.35);background:rgba(255,107,107,.10);color:#ff8a8a;font-size:13px;font-weight:800;cursor:pointer;">🚪 Se déconnecter</button>';
    hote.insertBefore(bloc, hote.firstChild);

    document.getElementById('g45-btn-snap').onclick = () => window._g45Sauvegardes();
    document.getElementById('g45-btn-imp').onclick = (e) => window._g45ImporterDeProd(e.target);
    document.getElementById('g45-btn-out').onclick = async (e) => {
      if (!confirm('Se déconnecter de ' + user.email + ' ?')) return;
      e.target.textContent = '⏳ Enregistrement…';
      await window._g45Deconnexion();
    };
  } else {
    bloc.innerHTML =
        '<div style="font-size:9px;font-weight:800;letter-spacing:1px;text-transform:uppercase;color:#4f5d88;margin-bottom:8px;">Mode Visiteur</div>'
      + '<div style="font-size:11px;color:#8899aa;margin-bottom:10px;">Connecte-toi pour sauvegarder tes paris et tes réglages sur ton compte.</div>'
      + '<a href="./login.html" style="display:block;text-align:center;padding:11px;border-radius:10px;background:#2563eb;color:#fff;text-decoration:none;font-size:13px;font-weight:800;">🔑 Se connecter / S\'inscrire</a>';
    hote.insertBefore(bloc, hote.firstChild);
  }
}

// ═══════════════════════════════════════════════════════════════
// REPRISE DES DONNÉES DE LA PROD
// ═══════════════════════════════════════════════════════════════
window._g45ImporterDeProd = async function (btn) {
  if (!user) { alert('Connecte-toi pour importer tes données sur ton compte.'); return; }
  let brut = null;
  try { brut = rawGet(CLE_ETAT); } catch (e) {}
  if (!brut) { alert('Aucune donnée GONES45 trouvée sur cet appareil.'); return; }

  let prod = null;
  try { prod = JSON.parse(brut); } catch (e) { alert('Données GONES45 illisibles.'); return; }
  const nParis = ((prod.h && prod.h.length) || 0) + ((prod.a && prod.a.length) || 0);
  const nEquipes = (prod.u && prod.u.length) || 0;
  if (!nParis && !nEquipes) { alert('Les données GONES45 de cet appareil sont vides.'); return; }

  let actuel = { h: [], a: [], u: [] };
  try { actuel = JSON.parse(rawGet(CLE_ETAT_FEN) || '{}') || {}; } catch (e) {}
  const dejaLa = ((actuel.h && actuel.h.length) || 0) + ((actuel.a && actuel.a.length) || 0);

  if (!confirm('Importer depuis GONES45 :\n\n' + nParis + ' paris\n' + nEquipes + ' équipes du mur')) return;

  if (btn) { btn.disabled = true; btn.textContent = '⏳ Import…'; }
  try {
    if (dejaLa) { try { await sauverInstantane(user.id, actuel); } catch (e) {} }
    const propre = normaliser(prod);
    await sauverEtat(user.id, propre);
    try { await sauverInstantane(user.id, propre); } catch (e) {}
    rawSet(CLE_ETAT_FEN, JSON.stringify(propre));
    rawSet(CLE_DERNIER_SNAP, String(Date.now()));
    alert('✅ ' + nParis + ' paris importés.');
    location.reload();
  } catch (e) {
    if (btn) { btn.disabled = false; btn.textContent = '⬇️ Importer mes paris de GONES45'; }
    alert('Échec de l\'import : ' + (e && e.message));
  }
};

window._g45ImporterEtat = (json) => { rawSet(CLE_ETAT_FEN, typeof json === 'string' ? json : JSON.stringify(json)); location.reload(); };

msg('Démarrage de l\'application…');

const s = document.createElement('script');
s.src = './app.js?v=20260831b';

s.onerror = () => {
  msg('❌ échec du chargement de app.js');
  console.error('app.js introuvable ou bloqué (CSP ?)');
};

s.onload = () => {
  const el = document.getElementById('g45-boot');
  if (el) el.remove();

  if (typeof window._g45BetSyncOn === 'function') window._g45BetSyncOn = () => false;

  try {
    window.dispatchEvent(new Event('load'));
    console.log('✅ événement load redispatché — init de app.js exécutée');
  } catch (e) {
    console.error('❌ redispatch de load échoué :', e);
  }

  setTimeout(_g45PoserBoutonSauvegardes, 800);
  setTimeout(_g45PoserBoutonSauvegardes, 3000);
  document.addEventListener('click', () => setTimeout(_g45PoserBoutonSauvegardes, 300));
};

document.body.appendChild(s);
