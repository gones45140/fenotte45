// ═══════════════════════════════════════════════════════════════
// GONES45 — pont Supabase transparent (fenotte45)
// ═══════════════════════════════════════════════════════════════

import { supabase, chargerEtat, sauverEtat, deconnexion,
         sauverInstantane, listerInstantanes, lireInstantane } from './supabase.js?v=20260815b';

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

// ═══════════════════════════════════════════════════════════════
// ANTI-BOUCLE DE CONNEXION
// ═══════════════════════════════════════════════════════════════
// Sans session on redirigeait AUSSITÔT vers login.html. Si l'échange du code
// échoue — lien déjà utilisé, second lien demandé qui invalide le vérifieur du
// premier, URL de redirection absente de la configuration Supabase — on repart
// en boucle sans jamais voir la raison.
// On tente donc l'échange EXPLICITEMENT, puis on s'arrête et on AFFICHE l'erreur
// au lieu de rebondir. Un seul aller-retour automatique est autorisé.
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
      // On nettoie l'URL pour qu'un rechargement ne rejoue pas un code déjà consommé.
      if (session) history.replaceState({}, '', window.location.pathname);
    } catch (e) {
      console.error('échange du code échoué :', e);
      overlay.innerHTML = '<div style="max-width:420px;text-align:center;padding:20px;font-family:system-ui;">'
        + '<div style="font-size:22px;font-weight:800;margin-bottom:10px;">🎯 GONES45</div>'
        + '<div style="color:#ff8a8a;font-weight:700;margin-bottom:8px;">Lien de connexion refusé</div>'
        + '<div style="color:#8899aa;font-size:12px;line-height:1.6;margin-bottom:14px;">'
        + (e && e.message ? e.message : 'raison inconnue') + '<br><br>'
        + 'Causes habituelles : lien déjà utilisé, ou un second lien demandé qui a annulé le premier '
        + '(n\'utilise que le DERNIER email reçu), ou l\'adresse de redirection absente de la configuration Supabase.'
        + '</div><a href="./login.html" style="display:inline-block;padding:10px 18px;border-radius:9px;background:#2563eb;color:#fff;text-decoration:none;font-weight:700;font-size:13px;">Redemander un lien</a></div>';
      throw new Error('échange du code échoué');
    }
  }
}

if (!session) {
  // Un seul rebond : si on revient ici après être déjà passé par login.html,
  // on s'arrête et on le dit, plutôt que de tourner indéfiniment.
  if (sessionStorage.getItem('g45_login_bounce') === '1') {
    sessionStorage.removeItem('g45_login_bounce');
    overlay.innerHTML = '<div style="max-width:420px;text-align:center;padding:20px;font-family:system-ui;">'
      + '<div style="font-size:22px;font-weight:800;margin-bottom:10px;">🎯 GONES45</div>'
      + '<div style="color:#ffb13d;font-weight:700;margin-bottom:8px;">Connexion impossible</div>'
      + '<div style="color:#8899aa;font-size:12px;line-height:1.6;margin-bottom:14px;">'
      + 'La session n\'a pas pu être établie après le retour de login.html.<br><br>'
      + 'Vérifie dans Supabase → Authentication → URL Configuration que '
      + '<b>' + window.location.origin + window.location.pathname.replace(/[^\/]*$/, '') + '</b> '
      + 'figure bien dans les Redirect URLs.</div>'
      + '<a href="./login.html" style="display:inline-block;padding:10px 18px;border-radius:9px;background:#2563eb;color:#fff;text-decoration:none;font-weight:700;font-size:13px;">Réessayer</a></div>';
    throw new Error('boucle de connexion interrompue');
  }
  sessionStorage.setItem('g45_login_bounce', '1');
  msg('Redirection vers la connexion…');
  window.location.href = './login.html';
  throw new Error('non connecté');
}
sessionStorage.removeItem('g45_login_bounce');
const user = session.user;
console.log('👤 utilisateur :', user.email, '— user_id :', user.id);

// ═══════════════════════════════════════════════════════════════
// FORME DE L'ÉTAT — NE JAMAIS ÉCRIRE UN OBJET VIDE
// ═══════════════════════════════════════════════════════════════
// app.js démarre ainsi :
//   var state = JSON.parse(localStorage.getItem('g45v5')) || {b:{},u:[],h:[],…};
// Or `{}` est VRAI en JavaScript : le repli ne se déclenche pas, `state.u` reste
// indéfini, et le premier `state.u.find(...)` (bloc PRESETS, l. ~1225) lève une
// TypeError qui tue tout le script. Symptôme observé sur un compte neuf :
// capital 0 €, onglets vides, aucune erreur visible pour l'utilisateur.
// On écrit donc une structure COMPLÈTE, et on complète aussi un état venu de
// Supabase auquel il manquerait des champs.
const ETAT_VIDE = { b:{}, u:[], h:[], a:[], start_bk:0, goal:0, ugoals:{}, notes:{}, bkColors:{} };

function normaliser(etat) {
  const out = Object.assign({}, ETAT_VIDE, etat || {});
  // Les tableaux et objets doivent avoir le bon TYPE, pas seulement exister :
  // un `u` à null passerait Object.assign et planterait de la même façon.
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
  const data = await chargerEtat(user.id);
  if (data && data.state && Object.keys(data.state).length > 0) {
    rawSet(CLE_ETAT_FEN, JSON.stringify(normaliser(data.state)));
    console.log('✅ état chargé depuis Supabase — dernière maj :', data.updated_at);
  } else {
    rawSet(CLE_ETAT_FEN, JSON.stringify(ETAT_VIDE));
    console.log('ℹ️ nouveau compte, état vierge complet (la prod n\'est PAS lue)');
  }
} catch (e) {
  // Même en cas d'échec Supabase, l'app doit démarrer sur une structure valide.
  console.warn('⚠️ erreur chargement Supabase :', e);
  if (!rawGet(CLE_ETAT_FEN)) rawSet(CLE_ETAT_FEN, JSON.stringify(ETAT_VIDE));
}

let pushTimer = null;
let lastPushed = null;

// ═══════════════════════════════════════════════════════════════
// INSTANTANÉS DE SÉCURITÉ
// ═══════════════════════════════════════════════════════════════
// `sauverEtat` ÉCRASE la ligne : une seule version vivante. Un état vidé par
// erreur serait définitif, là où la prod peut remonter dans ses commits GitHub.
// On dépose donc une copie horodatée, AU PLUS UNE PAR HEURE — un instantané à
// chaque frappe remplirait la table pour rien, et la fenêtre d'une heure suffit
// largement à rattraper une fausse manœuvre.
// Le dépôt se fait APRÈS un push réussi : jamais de copie d'un état qu'on n'a
// pas réussi à enregistrer.
const CLE_DERNIER_SNAP = 'g45_snap_ts__fen';
const SNAP_INTERVALLE = 3600000;

async function peutEtreInstantane(state) {
  try {
    if (!state || !Object.keys(state).length) return;          // jamais d'état vide
    const dernier = parseInt(rawGet(CLE_DERNIER_SNAP) || '0', 10) || 0;
    if (Date.now() - dernier < SNAP_INTERVALLE) return;
    await sauverInstantane(user.id, state);
    rawSet(CLE_DERNIER_SNAP, String(Date.now()));
    console.log('📸 instantané de sécurité déposé');
  } catch (e) {
    console.warn('instantané non déposé :', e && e.message);    // jamais bloquant
  }
}
localStorage.setItem = function(k, v) {
  if (Object.prototype.hasOwnProperty.call(MASQUE, k)) return;   // ne pas écrire chez la prod
  rawSet(remap(k), v);
  if (k === CLE_ETAT) {
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
  await flush();                       // on pousse les dernières modifications
  await deconnexion();
  // PURGE LOCALE OBLIGATOIRE : sans elle, le compte suivant démarre en affichant
  // l'état du précédent le temps que Supabase réponde — et si le chargement
  // échoue, il le CONSERVE puis l'écrase avec ses propres données.
  rawDel(CLE_ETAT_FEN);
  rawDel(CLE_DERNIER_SNAP);
  sessionStorage.removeItem('g45_login_bounce');
  Object.keys(localStorage).filter(k => k.indexOf('sb-') === 0).forEach(k => rawDel(k));
  window.location.href = './login.html';
};

// ═══════════════════════════════════════════════════════════════
// PANNEAU « MES SAUVEGARDES »
// ═══════════════════════════════════════════════════════════════
// Accessible sans console : un bouton est posé dans l'onglet Outils si on le
// trouve, et la fonction reste appelable directement en secours.
window._g45Sauvegardes = async function () {
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
      if (!confirm('Restaurer cette sauvegarde ?\n\nTon état actuel sera remplacé. Une copie de sécurité est déposée juste avant, donc tu pourras revenir en arrière.')) return;
      b.textContent = '…';
      try {
        // Filet : on photographie l'état ACTUEL avant de l'écraser, sinon
        // restaurer par erreur ferait perdre ce qu'on avait.
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
// `_g45Deconnexion` existait depuis le début mais AUCUN bouton ne l'appelait :
// changer de compte imposait la console. On pose donc un bloc complet — email
// connecté, sauvegardes, déconnexion — après le démarrage d'app.js.
function _g45PoserBoutonSauvegardes() {
  if (document.getElementById('g45-bloc-compte')) return;
  const hote = document.getElementById('t-outils') || document.getElementById('ip-outils');
  if (!hote) return;

  const bloc = document.createElement('div');
  bloc.id = 'g45-bloc-compte';
  bloc.style.cssText = 'margin:10px 0 14px;padding:12px;border-radius:12px;border:1px solid rgba(255,255,255,.10);background:rgba(255,255,255,.03);';
  bloc.innerHTML =
      '<div style="font-size:9px;font-weight:800;letter-spacing:1px;text-transform:uppercase;color:#4f5d88;margin-bottom:8px;">Mon compte</div>'
    + '<div style="font-size:12px;color:#e6ecf5;font-weight:700;word-break:break-all;margin-bottom:10px;">' + (user.email || '—') + '</div>'
    + '<button id="g45-btn-snap" style="width:100%;margin-bottom:7px;padding:11px;border-radius:10px;border:1px solid rgba(77,132,255,.35);background:rgba(77,132,255,.12);color:#4d84ff;font-size:13px;font-weight:800;cursor:pointer;">💾 Mes sauvegardes</button>'
    + '<button id="g45-btn-imp" style="width:100%;margin-bottom:7px;padding:11px;border-radius:10px;border:1px solid rgba(240,176,32,.35);background:rgba(240,176,32,.10);color:#f0b020;font-size:13px;font-weight:800;cursor:pointer;">⬇️ Importer mes paris de GONES45</button>'
    + '<button id="g45-btn-out" style="width:100%;padding:11px;border-radius:10px;border:1px solid rgba(255,107,107,.35);background:rgba(255,107,107,.10);color:#ff8a8a;font-size:13px;font-weight:800;cursor:pointer;">🚪 Se déconnecter</button>'
    + '<div style="font-size:9.5px;color:#8899aa;margin-top:8px;line-height:1.5;">Tes données sont enregistrées avant la déconnexion.</div>';
  hote.insertBefore(bloc, hote.firstChild);

  document.getElementById('g45-btn-snap').onclick = () => window._g45Sauvegardes();
  document.getElementById('g45-btn-imp').onclick = (e) => window._g45ImporterDeProd(e.target);
  document.getElementById('g45-btn-out').onclick = async (e) => {
    if (!confirm('Se déconnecter de ' + (user.email || 'ce compte') + ' ?')) return;
    e.target.textContent = '⏳ Enregistrement…';
    await window._g45Deconnexion();
  };
}

// ═══════════════════════════════════════════════════════════════
// REPRISE DES DONNÉES DE LA PROD (gones45 → fenotte45)
// ═══════════════════════════════════════════════════════════════
// Les deux dépôts partagent l'origine, donc le stockage : les paris saisis sur
// gones45 sont lisibles ici, sous la clé d'origine `g45v5`. `rawGet` court-circuite
// le remappage, c'est le SEUL endroit où on lit volontairement la prod.
//
// POINT CRITIQUE : on ne peut pas se contenter d'écrire `g45v5__fen`, car
// auth-guard le réécrit depuis Supabase à chaque démarrage — la copie serait
// effacée au rechargement suivant. On POUSSE donc vers Supabase, qui devient la
// source, et on dépose un instantané au passage.
//
// La prod n'est jamais modifiée : lecture seule.
window._g45ImporterDeProd = async function (btn) {
  let brut = null;
  try { brut = rawGet(CLE_ETAT); } catch (e) {}
  if (!brut) { alert('Aucune donnée GONES45 trouvée sur cet appareil.\n\nOuvre d\'abord gones45 dans ce navigateur, puis reviens ici.'); return; }

  let prod = null;
  try { prod = JSON.parse(brut); } catch (e) { alert('Données GONES45 illisibles.'); return; }
  const nParis = ((prod.h && prod.h.length) || 0) + ((prod.a && prod.a.length) || 0);
  const nEquipes = (prod.u && prod.u.length) || 0;
  if (!nParis && !nEquipes) { alert('Les données GONES45 de cet appareil sont vides.'); return; }

  let actuel = { h: [], a: [], u: [] };
  try { actuel = JSON.parse(rawGet(CLE_ETAT_FEN) || '{}') || {}; } catch (e) {}
  const dejaLa = ((actuel.h && actuel.h.length) || 0) + ((actuel.a && actuel.a.length) || 0);

  if (!confirm('Importer depuis GONES45 :\n\n' + nParis + ' paris\n' + nEquipes + ' équipes du mur\n\n'
    + (dejaLa ? ('⚠️ Ton compte contient déjà ' + dejaLa + ' paris. Ils seront REMPLACÉS.\n(Une sauvegarde est déposée juste avant.)\n\n') : '')
    + 'Les données de GONES45 ne sont pas modifiées.')) return;

  if (btn) { btn.disabled = true; btn.textContent = '⏳ Import…'; }
  try {
    // Filet : on photographie l'état actuel avant de l'écraser.
    if (dejaLa) { try { await sauverInstantane(user.id, actuel); } catch (e) {} }
    const propre = normaliser(prod);
    await sauverEtat(user.id, propre);          // Supabase devient la source
    try { await sauverInstantane(user.id, propre); } catch (e) {}
    rawSet(CLE_ETAT_FEN, JSON.stringify(propre));
    rawSet(CLE_DERNIER_SNAP, String(Date.now()));
    alert('✅ ' + nParis + ' paris importés.\n\nIls sont maintenant enregistrés sur ton compte : tu les retrouveras sur n\'importe quel appareil.');
    location.reload();
  } catch (e) {
    if (btn) { btn.disabled = false; btn.textContent = '⬇️ Importer mes paris de GONES45'; }
    alert('Échec de l\'import : ' + (e && e.message));
  }
};

// Secours : réinjecter une sauvegarde JSON dans CETTE version uniquement.
window._g45ImporterEtat = (json) => { rawSet(CLE_ETAT_FEN, typeof json === 'string' ? json : JSON.stringify(json)); location.reload(); };

msg('Démarrage de l\'application…');

const s = document.createElement('script');
s.src = './app.js?v=20260815b';   /* version : force le rechargement apres deploiement */

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

  // L'onglet Outils n'existe pas forcément tout de suite : on retente.
  setTimeout(_g45PoserBoutonSauvegardes, 800);
  setTimeout(_g45PoserBoutonSauvegardes, 3000);
  document.addEventListener('click', () => setTimeout(_g45PoserBoutonSauvegardes, 300));
};

document.body.appendChild(s);
