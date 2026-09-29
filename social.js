/* ══════════════════════════════════════════════════════════
   GONES45 SOCIAL — Partage de bilans entre amis (Supabase)
   ══════════════════════════════════════════════════════════ */

var SB_URL = 'https://vbsdewuvycaekfkixynh.supabase.co';
var SB_KEY = 'sb_publishable_InmQEx1r4GDhUzDQTUzctA_LM_5Jpzg';
var _sb = null;
var _sbUser = null;
var _sbProfil = null;

function sbClient() {
  if(_sb) return _sb;
  if(typeof supabase === 'undefined') { console.error('SDK Supabase non chargé'); return null; }
  _sb = supabase.createClient(SB_URL, SB_KEY);
  return _sb;
}

/* ── Chargement de l'onglet Social ── */
async function loadSocialTab() {
  var el = document.getElementById('t-social');
  if(!el) return;
  var sb = sbClient();
  if(!sb) { el.innerHTML = '<div style="padding:20px;color:var(--r);text-align:center;">Erreur : SDK Supabase non disponible</div>'; return; }

  // Vérifier la session
  var { data } = await sb.auth.getSession();
  if(data && data.session) {
    _sbUser = data.session.user;
    await loadProfil();
    renderSocialConnected();
  } else {
    renderSocialAuth();
  }
}

/* ── Écran connexion / inscription ── */
function renderSocialAuth() {
  var el = document.getElementById('t-social');
  el.innerHTML = ''
    + '<div style="max-width:420px;margin:0 auto;padding:20px;">'
    + '<div style="text-align:center;margin-bottom:24px;">'
    + '<div style="font-size:32px;">🤝</div>'
    + '<div style="font-size:18px;font-weight:800;color:var(--t1);margin-top:8px;">GONES45 Social</div>'
    + '<div style="font-size:12px;color:var(--t3);margin-top:4px;">Partage ton évolution avec tes potes</div>'
    + '</div>'
    + '<div id="social-auth-tabs" style="display:flex;gap:8px;margin-bottom:16px;">'
    + '<button id="tab-login" onclick="switchAuthMode(\'login\')" style="flex:1;padding:10px;border-radius:8px;border:1px solid var(--b2);background:rgba(77,132,255,.2);color:#4d84ff;font-size:13px;font-weight:700;cursor:pointer;">Connexion</button>'
    + '<button id="tab-signup" onclick="switchAuthMode(\'signup\')" style="flex:1;padding:10px;border-radius:8px;border:1px solid var(--b2);background:rgba(255,255,255,.05);color:var(--t3);font-size:13px;font-weight:700;cursor:pointer;">Inscription</button>'
    + '</div>'
    + '<div id="social-signup-pseudo" style="display:none;margin-bottom:10px;">'
    + '<input id="social-pseudo" type="text" placeholder="Pseudo (visible par tes potes)" style="width:100%;padding:12px;border-radius:8px;border:1px solid var(--b2);background:rgba(255,255,255,.04);color:var(--t1);font-size:13px;box-sizing:border-box;">'
    + '</div>'
    + '<div style="margin-bottom:10px;">'
    + '<input id="social-email" type="email" placeholder="Email" style="width:100%;padding:12px;border-radius:8px;border:1px solid var(--b2);background:rgba(255,255,255,.04);color:var(--t1);font-size:13px;box-sizing:border-box;">'
    + '</div>'
    + '<div style="margin-bottom:16px;position:relative;">'
    + '<input id="social-pass" type="password" placeholder="Mot de passe" style="width:100%;padding:12px;padding-right:42px;border-radius:8px;border:1px solid var(--b2);background:rgba(255,255,255,.04);color:var(--t1);font-size:13px;box-sizing:border-box;">'
    + '<button type="button" onclick="togglePassView()" id="social-eye" style="position:absolute;right:8px;top:50%;transform:translateY(-50%);background:none;border:none;color:var(--t3);font-size:16px;cursor:pointer;padding:4px;">👁️</button>'
    + '</div>'
    + '<button id="social-submit" onclick="submitAuth()" style="width:100%;padding:14px;border-radius:10px;border:none;background:#4d84ff;color:#fff;font-size:14px;font-weight:800;cursor:pointer;">Se connecter</button>'
    + '<div id="social-auth-msg" style="margin-top:12px;font-size:12px;text-align:center;min-height:18px;"></div>'
    + '</div>';
  window._authMode = 'login';
}

function togglePassView() {
  var inp = document.getElementById('social-pass');
  var eye = document.getElementById('social-eye');
  if(inp.type === 'password') { inp.type = 'text'; eye.innerText = '🙈'; }
  else { inp.type = 'password'; eye.innerText = '👁️'; }
}

function switchAuthMode(mode) {
  window._authMode = mode;
  var tl = document.getElementById('tab-login'), ts = document.getElementById('tab-signup');
  var pseudoBox = document.getElementById('social-signup-pseudo');
  var btn = document.getElementById('social-submit');
  if(mode === 'login') {
    tl.style.background='rgba(77,132,255,.2)'; tl.style.color='#4d84ff';
    ts.style.background='rgba(255,255,255,.05)'; ts.style.color='var(--t3)';
    pseudoBox.style.display='none';
    btn.innerText='Se connecter';
  } else {
    ts.style.background='rgba(77,132,255,.2)'; ts.style.color='#4d84ff';
    tl.style.background='rgba(255,255,255,.05)'; tl.style.color='var(--t3)';
    pseudoBox.style.display='block';
    btn.innerText='Créer mon compte';
  }
  document.getElementById('social-auth-msg').innerText='';
}

async function submitAuth() {
  var sb = sbClient();
  var email = document.getElementById('social-email').value.trim();
  var pass = document.getElementById('social-pass').value;
  var msg = document.getElementById('social-auth-msg');
  var btn = document.getElementById('social-submit');
  if(!email || !pass) { msg.style.color='var(--r)'; msg.innerText='Email et mot de passe requis'; return; }

  btn.disabled = true; btn.style.opacity='.6';

  if(window._authMode === 'signup') {
    var pseudo = document.getElementById('social-pseudo').value.trim();
    if(!pseudo) { msg.style.color='var(--r)'; msg.innerText='Choisis un pseudo'; btn.disabled=false; btn.style.opacity='1'; return; }
    // Vérifier que le pseudo est libre
    var { data: exist } = await sb.from('profils').select('pseudo').eq('pseudo', pseudo).maybeSingle();
    if(exist) { msg.style.color='var(--r)'; msg.innerText='Ce pseudo est déjà pris'; btn.disabled=false; btn.style.opacity='1'; return; }

    var { data, error } = await sb.auth.signUp({ email: email, password: pass, options: { data: { pseudo: pseudo } } });
    if(error) { msg.style.color='var(--r)'; msg.innerText=error.message; btn.disabled=false; btn.style.opacity='1'; return; }
    // Tenter de créer le profil (marche si pas de confirmation email ; sinon créé au 1er login via loadProfil)
    if(data.user) {
      try { await sb.from('profils').insert({ id: data.user.id, pseudo: pseudo }); } catch(e){}
    }
    msg.style.color='var(--g)';
    msg.innerText='✅ Compte créé ! Vérifie ton email pour confirmer, puis connecte-toi.';
    btn.disabled=false; btn.style.opacity='1';
    switchAuthMode('login');
  } else {
    var { data, error } = await sb.auth.signInWithPassword({ email: email, password: pass });
    if(error) { msg.style.color='var(--r)'; msg.innerText=error.message; btn.disabled=false; btn.style.opacity='1'; return; }
    _sbUser = data.user;
    await loadProfil();
    renderSocialConnected();
  }
}

async function loadProfil() {
  var sb = sbClient();
  if(!_sbUser) return;
  var { data } = await sb.from('profils').select('*').eq('id', _sbUser.id).maybeSingle();
  if(!data) {
    // Profil absent (ex: créé avant confirmation email) → le créer maintenant
    var pseudo = (_sbUser.user_metadata && _sbUser.user_metadata.pseudo)
      || (_sbUser.email ? _sbUser.email.split('@')[0] : 'joueur'+Date.now());
    var { data: created } = await sb.from('profils').insert({ id: _sbUser.id, pseudo: pseudo }).select().maybeSingle();
    _sbProfil = created;
  } else {
    _sbProfil = data;
  }
}

async function socialLogout() {
  var sb = sbClient();
  await sb.auth.signOut();
  _sbUser = null; _sbProfil = null;
  renderSocialAuth();
}

/* ══════════════════════════════════════════════════════════════════════════
   SOCIAL V1 (29/09/2026, maquette validée par Antoine : « OUI »)
   ──────────────────────────────────────────────────────────────────────────
   Avant : bilan envoyé SEULEMENT au bouton « Publier » → les potes voyaient
   un bilan de juin. Maintenant :
   · PARTAGE AU CHOIX (RGPD) : 'non' (défaut) | 'bilan' | 'tout' (bilan +
     paris), clé g45_soc_partage (sur l'appareil). Un compte qui avait DÉJÀ
     publié à la main garde son partage ('tout') : il l'avait choisi. 'non'
     efface ce qui était en ligne ; 'bilan' efface les paris.
   · PUBLICATION AUTOMATIQUE (_g45SocAuto) : 20 s après l'ouverture puis
     chaque minute, SI le partage est actif, SI le bilan a changé (empreinte
     g45_soc_sig) et au plus toutes les 10 min.
   · CALCUL JUSTE : effet de chaque pari = _betSettleEffect d'app.js (freebet
     perdu = 0, gagné = m × (cote − 1)) — avant, un freebet perdu coûtait m.
   · Potes : « à jour il y a… », 5 derniers résultats (lus dans la courbe,
     donc même pour un partage « bilan seul »), classement 30 jours (paris
     partagés, 10 paris minimum), rafraîchi toutes les 2 min onglet ouvert.
   Tables Supabase INCHANGÉES (bilans, paris, profils, abonnements).
   ══════════════════════════════════════════════════════════════════════════ */
var _G45_SOC_PARTAGE = 'g45_soc_partage', _G45_SOC_SIG = 'g45_soc_sig', _G45_SOC_DER = 'g45_soc_der';
var _G45_SOC_MIN_CLS = 10;                 /* paris minimum sur 30 jours pour être classé */
function _g45SocPartage() { try { return localStorage.getItem(_G45_SOC_PARTAGE) || ''; } catch (e) { return ''; } }
function _g45SocEsc(x) { return String(x == null ? '' : x).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }
function _g45SocEffet(h) {
  if (typeof _betSettleEffect === 'function') return _betSettleEffect(h);
  var m = parseFloat(h.m) || 0, c = parseFloat(h.cote) || 0;
  if (h.isFreebet) return h.win ? m * (c - 1) : 0;
  return h.win ? (m * c - m) : -m;
}
/* Date d'un pari (« JJ/MM/AAAA » ou ISO), heure si connue, sinon midi. */
function _parseDateFr(date, heure) {
  try {
    var hh = /^\d{1,2}:\d{2}$/.test(String(heure || '')) ? heure : '12:00';
    if (String(date).indexOf('/') >= 0) {
      var p = String(date).split('/');
      return new Date(p[2] + '-' + p[1].padStart(2, '0') + '-' + p[0].padStart(2, '0') + 'T' + hh + ':00').toISOString();
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(String(date))) return new Date(date + 'T' + hh + ':00').toISOString();
    var d = new Date(date);
    return isNaN(d) ? new Date().toISOString() : d.toISOString();
  } catch (e) { return new Date().toISOString(); }
}
/* Résultats (V/D) des n derniers paris, lus dans une courbe de profit cumulé. */
function _g45SocDerniers(courbe, n) {
  var c = (courbe || []).map(Number), out = [];
  for (var i = c.length - 1; i >= 0 && out.length < n; i--) {
    var d = c[i] - (i ? c[i - 1] : 0);
    out.unshift(d > 0 ? 'V' : (d < 0 ? 'D' : 'N'));
  }
  return out;
}
function computeMyBilan() {
  var bankroll = Object.values(state.b || {}).reduce(function (a, v) { return a + parseFloat(v || 0); }, 0);
  var paris = (state.a || []).filter(function (h) { return !h.isPending; });
  var benefice = paris.reduce(function (acc, h) { return acc + _g45SocEffet(h); }, 0);
  var wins = paris.filter(function (h) { return h.win; }).length;
  var nbParis = paris.length;
  var winRate = nbParis ? (wins / nbParis * 100) : 0;
  /* Mise réellement engagée : un freebet n'est pas de l'argent du joueur. */
  var totalMise = paris.reduce(function (a, h) { return a + (h.isFreebet ? 0 : (parseFloat(h.m) || 0)); }, 0);
  var roi = totalMise ? (benefice / totalMise * 100) : 0;
  var cum = 0;
  var courbe = paris.slice().reverse().map(function (h) { cum += _g45SocEffet(h); return parseFloat(cum.toFixed(2)); });
  /* 30 derniers jours (pour le classement, calculé ici pour soi). */
  var lim = Date.now() - 30 * 86400000, b30 = 0, m30 = 0, n30 = 0;
  paris.forEach(function (h) {
    var t = Date.parse(_parseDateFr(h.date || '', h.heure));
    if (!(t >= lim)) return;
    n30++; b30 += _g45SocEffet(h); m30 += h.isFreebet ? 0 : (parseFloat(h.m) || 0);
  });
  return {
    bankroll: parseFloat(bankroll.toFixed(2)),
    benefice: parseFloat(benefice.toFixed(2)),
    win_rate: parseFloat(winRate.toFixed(1)),
    nb_paris: nbParis,
    roi: parseFloat(roi.toFixed(1)),
    courbe: courbe,
    j30: { n: n30, b: parseFloat(b30.toFixed(2)), roi: m30 ? parseFloat((b30 / m30 * 100).toFixed(1)) : 0 }
  };
}
/* Titre lisible d'un pari publié : l'équipe / le match, jamais « - » ni « SIMPLE ». */
function _g45SocTitre(h) {
  var ok = function (x) { x = String(x || '').trim(); return x && x !== '-' && !/^(simple|pari|pari simple|combin[ée])$/i.test(x) ? x : ''; };
  return ok(h.eq) || ok(h.target) || ok(h.comp) || ok(h.type) || (h.isCombi ? 'Combiné' : 'Pari');
}
function _g45SocSig(b) {
  var a = (state.a || []), t = a.length ? String(a[0].id || '') + (a[0].win ? 'w' : 'l') : '';
  return [b.benefice, b.nb_paris, b.win_rate, b.roi, t, _g45SocPartage()].join('|');
}
async function publishBilan(silencieux) {
  var sb = sbClient();
  if (!sb || !_sbUser || !_sbProfil) return false;
  var mode = _g45SocPartage();
  if (mode !== 'bilan' && mode !== 'tout') return false;
  var btn = silencieux ? null : document.getElementById('btn-publish');
  if (btn) { btn.disabled = true; btn.style.opacity = '.6'; btn.innerText = '⏳ Publication...'; }
  var bilan = computeMyBilan();
  try {
    var r1 = await sb.from('bilans').upsert({
      user_id: _sbUser.id, pseudo: _sbProfil.pseudo, bankroll: bilan.bankroll, benefice: bilan.benefice,
      win_rate: bilan.win_rate, nb_paris: bilan.nb_paris, roi: bilan.roi, courbe: bilan.courbe,
      updated_at: new Date().toISOString()
    });
    if (r1 && r1.error) throw r1.error;
    await sb.from('paris').delete().eq('user_id', _sbUser.id);
    if (mode === 'tout') {
      var parisToInsert = (state.a || []).filter(function (h) { return !h.isPending; }).slice(0, 100).map(function (h) {
        return {
          user_id: _sbUser.id,
          match: _g45SocTitre(h),
          pronostic: String(h.type || h.n || ''),
          cote: parseFloat(h.cote) || 0,
          mise: parseFloat(h.m) || 0,
          statut: h.win ? 'gagne' : 'perdu',
          sport: h.sport || '',
          bookmaker: h.b || '',
          competition: h.comp || '',
          type: (h.isFreebet ? 'Freebet · ' : '') + (h.isCombi ? 'Combiné' : (h.type || 'Simple')),
          ref: (h.id ? String(h.id).slice(-8).toUpperCase() : ''),
          created_at: _parseDateFr(h.date || '', h.heure)
        };
      });
      if (parisToInsert.length) await sb.from('paris').insert(parisToInsert);
    }
    try { localStorage.setItem(_G45_SOC_SIG, _g45SocSig(bilan)); localStorage.setItem(_G45_SOC_DER, String(Date.now())); } catch (e) {}
  } catch (e) {
    if (btn) { btn.disabled = false; btn.style.opacity = '1'; btn.innerText = '⚠️ Échec, réessaie'; }
    return false;
  }
  if (btn) { btn.disabled = false; btn.style.opacity = '1'; btn.innerText = '✅ Publié !'; setTimeout(function () { btn.innerText = '🔄 Publier maintenant'; }, 2000); }
  return true;
}
/* Changer de partage. 'non' retire tout ce qui était en ligne. */
async function g45SocPartager(mode) {
  try { localStorage.setItem(_G45_SOC_PARTAGE, mode); localStorage.removeItem(_G45_SOC_SIG); } catch (e) {}
  var sb = sbClient();
  if (sb && _sbUser) {
    try {
      if (mode === 'non') {
        await sb.from('paris').delete().eq('user_id', _sbUser.id);
        var d = await sb.from('bilans').delete().eq('user_id', _sbUser.id);
        /* Suppression refusée par la base ? on vide le bilan (masqué chez les potes). */
        if (d && d.error) await sb.from('bilans').upsert({ user_id: _sbUser.id, pseudo: _sbProfil ? _sbProfil.pseudo : '', bankroll: 0, benefice: 0, win_rate: 0, nb_paris: 0, roi: 0, courbe: [], updated_at: new Date().toISOString() });
      } else await publishBilan(true);
    } catch (e) {}
  }
  renderSocialConnected();
}
window.g45SocPartager = g45SocPartager;
/* Premier passage : un compte qui avait déjà un bilan en ligne l'avait choisi. */
async function _g45SocInitPartage() {
  if (_g45SocPartage() || !_sbUser) return;
  var mode = 'non';
  try {
    var r = await sbClient().from('bilans').select('user_id,nb_paris').eq('user_id', _sbUser.id).maybeSingle();
    if (r && r.data && r.data.nb_paris > 0) mode = 'tout';
  } catch (e) {}
  try { localStorage.setItem(_G45_SOC_PARTAGE, mode); } catch (e) {}
}
/* Boucle automatique (publication + rafraîchissement de l'onglet ouvert). */
var _g45SocSessionVue = 0, _g45SocFeedVu = 0;
async function _g45SocAuto() {
  try {
    var sb = sbClient(); if (!sb || typeof state === 'undefined' || !state) return;
    if (!_sbUser && Date.now() - _g45SocSessionVue > 10 * 60000) {
      _g45SocSessionVue = Date.now();
      var s = await sb.auth.getSession();
      if (s && s.data && s.data.session) { _sbUser = s.data.session.user; await loadProfil(); }
    }
    if (!_sbUser || !_sbProfil) return;
    await _g45SocInitPartage();
    var mode = _g45SocPartage();
    if (mode === 'bilan' || mode === 'tout') {
      var sig = _g45SocSig(computeMyBilan()), der = 0, anc = '';
      try { der = parseInt(localStorage.getItem(_G45_SOC_DER) || '0', 10) || 0; anc = localStorage.getItem(_G45_SOC_SIG) || ''; } catch (e) {}
      if (sig !== anc && Date.now() - der >= 10 * 60000) await publishBilan(true);
    }
    var ong = document.getElementById('t-social');
    if (ong && ong.offsetParent !== null && document.getElementById('social-feed') && Date.now() - _g45SocFeedVu > 2 * 60000) {
      _g45SocFeedVu = Date.now();
      loadFriendsFeed(_g45SocSuivis);
    }
  } catch (e) {}
}
if (typeof window !== 'undefined') {
  setTimeout(function () { _g45SocAuto(); setInterval(_g45SocAuto, 60000); }, 20000);
}

/* ── Affichage (Social V1, 29/09/2026 — maquette validée) ── */
/* Nombre à la française : virgule, vrai signe moins, « + » si demandé. */
function _g45SocN(v, signe) { v = parseFloat(v) || 0; return (signe && v > 0 ? '+' : '') + String(v).replace('.', ',').replace('-', '−'); }
var _g45SocSuivis = [];
function _g45SocIlYa(iso) {
  var t = Date.parse(iso || ''); if (!t) return { txt: 'jamais', frais: false };
  var s = Math.max(0, (Date.now() - t) / 1000);
  var txt = s < 90 ? 'à l\'instant' : s < 3600 ? 'il y a ' + Math.round(s / 60) + ' min' : s < 86400 ? 'il y a ' + Math.round(s / 3600) + ' h' : 'il y a ' + Math.round(s / 86400) + ' j';
  return { txt: txt, frais: s < 86400 };
}
function _g45SocPastilles(courbe) {
  var d = _g45SocDerniers(courbe, 5);
  if (!d.length) return '';
  return '<div style="display:flex;align-items:center;gap:5px;flex-wrap:wrap;margin-top:8px;"><span style="font-size:13px;color:#c9d3ee;margin-right:2px;">5 derniers :</span>'
    + d.map(function (r) { var c = r === 'V' ? '#3ddf78' : (r === 'D' ? '#ff6b6b' : '#c9d3ee'); return '<span style="display:inline-flex;width:26px;height:26px;border-radius:6px;align-items:center;justify-content:center;font-weight:900;font-size:13px;color:#0b101d;background:' + c + ';">' + r + '</span>'; }).join('')
    + '</div>';
}
function _statBox(label, val, color) {
  return '<div style="background:rgba(255,255,255,.05);border-radius:8px;padding:8px 4px;text-align:center;">'
    + '<div style="font-size:12px;color:#c9d3ee;font-weight:700;">' + label + '</div>'
    + '<div style="font-size:17px;font-weight:800;color:' + color + ';margin-top:2px;">' + val + '</div></div>';
}
function _g45SocCourbe(id, courbe) {
  setTimeout(function () {
    var ctx = document.getElementById(id);
    if (!ctx || typeof Chart === 'undefined' || !courbe || courbe.length < 2) return;
    var last = courbe[courbe.length - 1], col = last >= 0 ? '#1ed760' : '#ff4545';
    var grad = ctx.getContext('2d').createLinearGradient(0, 0, 0, 110);
    grad.addColorStop(0, last >= 0 ? 'rgba(30,215,96,.25)' : 'rgba(255,69,69,.25)'); grad.addColorStop(1, 'rgba(0,0,0,0)');
    new Chart(ctx, {
      type: 'line',
      data: { labels: courbe.map(function (_, i) { return i + 1; }), datasets: [{ data: courbe, borderColor: col, backgroundColor: grad, borderWidth: 2, fill: true, tension: .35, pointRadius: 0, pointHoverRadius: 4 }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: function (i) { return (i.raw >= 0 ? '+' : '') + i.raw + '€'; } } } },
        scales: { x: { display: false }, y: { display: true, ticks: { color: '#c9d3ee', font: { size: 11 }, callback: function (v) { return v + '€'; } }, grid: { color: 'rgba(255,255,255,.05)' } } } }
    });
  }, 50);
}
var _G45_SOC_CARTE = 'background:rgba(20,27,46,.94);border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:14px;margin-bottom:12px;';
async function renderSocialConnected() {
  var el = document.getElementById('t-social');
  var sb = sbClient();
  await _g45SocInitPartage();
  var bilan = computeMyBilan(), mode = _g45SocPartage() || 'non';
  var r = await sb.from('abonnements').select('suivi_id').eq('follower_id', _sbUser.id);
  _g45SocSuivis = ((r && r.data) || []).map(function (f) { return f.suivi_id; });
  var der = 0; try { der = parseInt(localStorage.getItem(_G45_SOC_DER) || '0', 10) || 0; } catch (e) {}
  var etat = mode === 'non' ? '<span style="font-size:13px;color:#c9d3ee;font-weight:700;">🔒 Non partagé</span>'
    : '<span style="font-size:13px;color:#3ddf78;font-weight:700;">🟢 Publié automatiquement' + (der ? ' · ' + _g45SocIlYa(new Date(der).toISOString()).txt : '') + '</span>';
  var h = '<div style="max-width:600px;margin:0 auto;padding:14px;">';
  h += '<div style="' + _G45_SOC_CARTE + '">'
    + '<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;">'
    + '<div><div style="font-size:17px;font-weight:800;color:#fff;">👤 ' + _g45SocEsc(_sbProfil ? _sbProfil.pseudo : '?') + '</div>'
    + '<div style="font-size:12px;color:#c9d3ee;">' + _g45SocSuivis.length + ' pote(s) suivi(s)</div></div>' + etat + '</div>'
    + '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-top:10px;">'
    + _statBox('Bénéfice', _g45SocN(bilan.benefice, 1) + ' €', bilan.benefice >= 0 ? '#3ddf78' : '#ff6b6b')
    + _statBox('ROI', _g45SocN(bilan.roi) + ' %', bilan.roi >= 0 ? '#3ddf78' : '#ff6b6b')
    + _statBox('Réussite', Math.round(bilan.win_rate) + ' %', '#fff') + _statBox('Paris', bilan.nb_paris, '#fff') + '</div>'
    + _g45SocPastilles(bilan.courbe)
    + (bilan.courbe.length > 1 ? '<div style="height:120px;position:relative;margin-top:10px;"><canvas id="curve-me"></canvas></div>' : '');
  /* Choix du partage (RGPD : rien n'est publié sans accord). */
  var bt = function (k, lib) {
    var on = mode === k;
    return '<button onclick="g45SocPartager(\'' + k + '\')" style="flex:1;min-width:0;padding:9px 6px;border-radius:8px;cursor:pointer;font-size:13px;font-weight:' + (on ? 900 : 700) + ';border:1px solid ' + (on ? '#4d84ff' : 'rgba(255,255,255,.18)') + ';background:' + (on ? '#1b2a52' : 'rgba(11,16,29,.85)') + ';color:' + (on ? '#fff' : '#c9d3ee') + ';">' + lib + '</button>';
  };
  h += '<div style="font-size:13px;font-weight:800;color:#c9d3ee;margin:12px 0 6px;">Ce que tes potes voient</div>'
    + '<div style="display:flex;gap:6px;">' + bt('non', '🔒 Rien') + bt('bilan', '📊 Bilan') + bt('tout', '📊 Bilan + paris') + '</div>'
    + '<div style="font-size:12px;color:#c9d3ee;margin-top:6px;line-height:1.45;">' + (mode === 'non' ? 'Rien n\'est envoyé. Tes potes ne voient pas ton bilan.' : mode === 'bilan' ? 'Tes chiffres et ta courbe sont publiés tout seuls, pas le détail de tes paris.' : 'Tes chiffres, ta courbe et tes 100 derniers paris réglés sont publiés tout seuls.') + '</div>'
    + (mode !== 'non' ? '<button id="btn-publish" onclick="publishBilan()" style="width:100%;margin-top:8px;padding:9px;border-radius:8px;border:1px solid rgba(77,132,255,.5);background:rgba(77,132,255,.12);color:#9fc3ff;font-size:13px;font-weight:800;cursor:pointer;">🔄 Publier maintenant</button>' : '')
    + '<div style="display:flex;justify-content:flex-end;margin-top:8px;"><button onclick="socialLogout()" style="padding:6px 12px;border-radius:6px;border:1px solid rgba(255,255,255,.15);background:rgba(255,255,255,.05);color:#c9d3ee;font-size:12px;cursor:pointer;">Déconnexion</button></div>'
    + '</div>';
  h += '<div style="' + _G45_SOC_CARTE + '"><div style="font-size:13px;font-weight:800;letter-spacing:.6px;color:#c9d3ee;margin-bottom:8px;">➕ AJOUTER UN POTE</div>'
    + '<div style="display:flex;gap:8px;"><input id="social-search" type="text" placeholder="Pseudo du pote" style="flex:1;min-width:0;padding:10px;border-radius:8px;border:1px solid rgba(255,255,255,.15);background:rgba(255,255,255,.04);color:#fff;font-size:14px;">'
    + '<button onclick="searchAndFollow()" style="padding:10px 16px;border-radius:8px;border:none;background:#1ed760;color:#000;font-size:14px;font-weight:800;cursor:pointer;">Suivre</button></div>'
    + '<div id="social-search-msg" style="margin-top:8px;font-size:13px;min-height:14px;"></div></div>';
  h += '<div id="social-cls"></div><div id="social-feed"><div style="text-align:center;padding:20px;color:#c9d3ee;font-size:13px;">⏳ Chargement des potes…</div></div>'
    /* Formule officielle de prévention (29/09/2026, validée par Antoine), sans logo de l'État. */
    + '<div style="font-size:13px;font-weight:700;color:#fff;text-align:center;margin:12px 0 4px;padding:10px 12px;line-height:1.5;background:rgba(11,16,29,.9);border:1px solid rgba(255,255,255,.12);border-radius:10px;">🔞 Les jeux d\'argent et de hasard peuvent être dangereux : pertes d\'argent, conflits familiaux, addiction… Retrouvez nos conseils sur joueurs-info-service.fr (09 74 75 13 13 – appel non surtaxé).</div>';
  h += '</div>';
  el.innerHTML = h;
  _g45SocCourbe('curve-me', bilan.courbe);
  _g45SocFeedVu = Date.now();
  loadFriendsFeed(_g45SocSuivis);
}
async function loadFriendsFeed(suiviIds) {
  var feed = document.getElementById('social-feed'), cls = document.getElementById('social-cls');
  if (!feed) return;
  suiviIds = suiviIds || [];
  var sb = sbClient(), moi = computeMyBilan(), mode = _g45SocPartage();
  var bilans = [];
  if (suiviIds.length) { var r = await sb.from('bilans').select('*').in('user_id', suiviIds).order('updated_at', { ascending: false }); bilans = ((r && r.data) || []).filter(function (b) { return b.nb_paris > 0; }); }
  /* Classement 30 jours : paris partagés des potes + mes propres paris (calcul local). */
  var lignes = [];
  if (mode === 'bilan' || mode === 'tout') lignes.push({ nom: (_sbProfil ? _sbProfil.pseudo : 'Moi') + ' (toi)', moi: true, n: moi.j30.n, b: moi.j30.b, roi: moi.j30.roi });
  if (bilans.length) {
    try {
      var depuis = new Date(Date.now() - 30 * 86400000).toISOString();
      var rp = await sb.from('paris').select('user_id,statut,mise,cote,type,created_at').in('user_id', bilans.map(function (b) { return b.user_id; })).gte('created_at', depuis);
      var par = {};
      ((rp && rp.data) || []).forEach(function (p) {
        var A = par[p.user_id] = par[p.user_id] || { n: 0, b: 0, m: 0 }, m = parseFloat(p.mise) || 0, c = parseFloat(p.cote) || 0, fb = /freebet/i.test(p.type || '');
        A.n++; A.b += p.statut === 'gagne' ? (fb ? m * (c - 1) : m * c - m) : (fb ? 0 : -m); if (!fb) A.m += m;
      });
      bilans.forEach(function (b) { var A = par[b.user_id]; if (A) lignes.push({ nom: b.pseudo, n: A.n, b: parseFloat(A.b.toFixed(2)), roi: A.m ? parseFloat((A.b / A.m * 100).toFixed(1)) : 0 }); });
    } catch (e) {}
  }
  if (cls) {
    var classes = lignes.filter(function (l) { return l.n >= _G45_SOC_MIN_CLS; }).sort(function (a, b) { return b.b - a.b; });
    var hors = lignes.filter(function (l) { return l.n < _G45_SOC_MIN_CLS; });
    var hc = '';
    if (lignes.length) {
      hc = '<div style="' + _G45_SOC_CARTE + '"><div style="font-size:13px;font-weight:800;letter-spacing:.6px;color:#c9d3ee;margin-bottom:6px;">🏆 CLASSEMENT DES POTES · 30 DERNIERS JOURS</div>'
        + '<div style="display:grid;grid-template-columns:30px minmax(0,1fr) 72px 76px;gap:6px;padding:4px 6px;font-size:12px;color:#c9d3ee;font-weight:700;"><span>#</span><span>Pseudo</span><span style="text-align:right;">Bénéf</span><span style="text-align:right;">ROI</span></div>';
      classes.forEach(function (l, i) {
        var med = ['🥇', '🥈', '🥉'][i] || String(i + 1), cb = l.b >= 0 ? '#3ddf78' : '#ff6b6b';
        hc += '<div style="display:grid;grid-template-columns:30px minmax(0,1fr) 72px 76px;gap:6px;padding:8px 6px;border-top:1px solid rgba(255,255,255,.08);align-items:center;font-size:14px;' + (l.moi ? 'background:rgba(77,132,255,.14);border-radius:6px;' : '') + '">'
          + '<span style="font-weight:800;">' + med + '</span><b style="color:#fff;overflow-wrap:anywhere;">' + _g45SocEsc(l.nom) + ' <span style="font-size:12px;color:#c9d3ee;font-weight:600;">· ' + l.n + ' paris</span></b>'
          + '<span style="text-align:right;font-weight:800;color:' + cb + ';">' + _g45SocN(l.b, 1) + ' €</span><span style="text-align:right;font-weight:800;color:' + (l.roi >= 0 ? '#3ddf78' : '#ff6b6b') + ';">' + _g45SocN(l.roi, 1) + ' %</span></div>';
      });
      if (!classes.length) hc += '<div style="font-size:13px;color:#c9d3ee;padding:6px;">Personne n\'a encore ' + _G45_SOC_MIN_CLS + ' paris sur 30 jours.</div>';
      if (hors.length) hc += '<div style="font-size:12px;color:#c9d3ee;margin-top:6px;">Pas encore classé(s) (moins de ' + _G45_SOC_MIN_CLS + ' paris) : ' + hors.map(function (l) { return _g45SocEsc(l.nom) + ' (' + l.n + ')'; }).join(', ') + '</div>';
      hc += '</div>';
    }
    cls.innerHTML = hc;
  }
  if (!suiviIds.length) { feed.innerHTML = '<div style="text-align:center;padding:20px;color:#c9d3ee;font-size:13px;">Tu ne suis personne pour l\'instant.<br>Ajoute le pseudo d\'un pote ci-dessus 👆</div>'; return; }
  if (!bilans.length) { feed.innerHTML = '<div style="text-align:center;padding:20px;color:#c9d3ee;font-size:13px;">Tes potes n\'ont pas encore partagé de bilan.</div>'; return; }
  var html = '<div style="font-size:13px;font-weight:800;letter-spacing:.6px;color:#c9d3ee;margin:4px 0 8px;">👥 MES POTES</div>';
  bilans.forEach(function (b) {
    var q = _g45SocIlYa(b.updated_at), cb = b.benefice >= 0 ? '#3ddf78' : '#ff6b6b';
    html += '<div style="' + _G45_SOC_CARTE + '">'
      + '<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;"><div style="font-size:16px;font-weight:800;color:#fff;">👤 ' + _g45SocEsc(b.pseudo) + '</div>'
      + '<span style="font-size:13px;font-weight:700;color:' + (q.frais ? '#3ddf78' : '#ffd166') + ';">' + (q.frais ? '🟢' : '🟠') + ' à jour ' + q.txt + '</span></div>'
      + '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-top:10px;">'
      + _statBox('Bénéf', _g45SocN(b.benefice, 1) + ' €', cb) + _statBox('ROI', _g45SocN(b.roi) + ' %', b.roi >= 0 ? '#3ddf78' : '#ff6b6b')
      + _statBox('Réussite', Math.round(b.win_rate) + ' %', '#fff') + _statBox('Paris', b.nb_paris, '#fff') + '</div>'
      + _g45SocPastilles(b.courbe)
      + (b.courbe && b.courbe.length > 1 ? '<div style="height:110px;position:relative;margin-top:10px;"><canvas id="curve-' + b.user_id + '"></canvas></div>' : '')
      + '<div style="display:flex;gap:6px;margin-top:10px;">'
      + '<button onclick="viewFriendBets(\'' + b.user_id + '\')" style="flex:1;padding:9px;border-radius:8px;border:1px solid rgba(255,255,255,.15);background:rgba(255,255,255,.05);color:#fff;font-size:13px;font-weight:700;cursor:pointer;">🎟️ Voir ses paris</button>'
      + '<button onclick="unfollow(\'' + b.user_id + '\')" style="padding:9px 12px;border-radius:8px;border:1px solid rgba(255,107,107,.35);background:rgba(255,69,69,.08);color:#ff9a9a;font-size:13px;cursor:pointer;">Ne plus suivre</button></div>'
      + '<div id="bets-' + b.user_id + '" style="margin-top:8px;"></div></div>';
  });
  feed.innerHTML = html;
  bilans.forEach(function (b) { _g45SocCourbe('curve-' + b.user_id, b.courbe); });
}
async function viewFriendBets(userId) {
  var container = document.getElementById('bets-' + userId);
  if (!container) return;
  if (container.innerHTML.trim()) { container.innerHTML = ''; return; }
  container.innerHTML = '<div style="text-align:center;padding:10px;color:#c9d3ee;font-size:13px;">⏳…</div>';
  var r = await sbClient().from('paris').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(30);
  var bets = (r && r.data) || [];
  container.innerHTML = bets.length ? bets.map(_renderBetTicket).join('') : '<div style="text-align:center;padding:10px;color:#c9d3ee;font-size:13px;">Ton pote partage son bilan, pas le détail de ses paris.</div>';
}
function _renderBetTicket(p) {
  var win = p.statut === 'gagne', mise = parseFloat(p.mise) || 0, cote = parseFloat(p.cote) || 0, fb = /freebet/i.test(p.type || '');
  var profit = win ? (fb ? mise * (cote - 1) : mise * cote - mise) : (fb ? 0 : -mise);
  var dateStr = '';
  try { var d = new Date(p.created_at), mois = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.']; dateStr = d.getDate() + ' ' + mois[d.getMonth()] + ' ' + d.getFullYear(); } catch (e) {}
  var mauvais = function (x) { return !x || x === '-' || /^(simple|pari|pari simple|sans)$/i.test(String(x).trim()); };
  var titre = !mauvais(p.match) ? p.match : (!mauvais(p.pronostic) ? p.pronostic : (p.competition || 'Pari'));
  var marche = String(p.pronostic || '').trim();
  if (mauvais(marche) || marche === titre || /^(simple|combin[ée]|cockpit)$/i.test(marche)) marche = '';
  var book = p.bookmaker ? (p.bookmaker.charAt(0).toUpperCase() + p.bookmaker.slice(1)) : '';
  var col = win ? '#3ddf78' : '#ff6b6b';
  return '<div style="border-left:4px solid ' + col + ';background:rgba(255,255,255,.04);border-radius:8px;padding:9px 10px;margin-top:8px;">'
    + '<div style="display:flex;justify-content:space-between;gap:8px;align-items:flex-start;"><span style="font-size:15px;font-weight:800;color:#fff;overflow-wrap:anywhere;">' + _g45SocEsc(titre) + (marche ? ' — ' + _g45SocEsc(marche) : '') + '</span>'
    + '<b style="color:#9fc3ff;font-size:15px;white-space:nowrap;">@' + cote.toFixed(2).replace('.', ',') + '</b></div>'
    + '<div style="font-size:13px;color:#c9d3ee;margin-top:3px;">' + [(win ? '✅ Gagné ' : '❌ Perdu ') + (profit >= 0 ? '+' : '−') + Math.abs(profit).toFixed(2).replace('.', ',') + ' €', 'mise ' + mise.toFixed(2).replace('.', ',') + ' €' + (fb ? ' (freebet)' : ''), book, p.competition && p.competition !== titre ? _g45SocEsc(p.competition) : '', dateStr].filter(Boolean).join(' · ') + '</div></div>';
}

/* ── Recherche et suivi ── */
async function searchAndFollow() {
  var sb = sbClient();
  var pseudo = document.getElementById('social-search').value.trim();
  var msg = document.getElementById('social-search-msg');
  if(!pseudo) return;
  if(_sbProfil && pseudo === _sbProfil.pseudo) { msg.style.color='var(--r)'; msg.innerText='Tu ne peux pas te suivre toi-même 😄'; return; }

  var { data: prof } = await sb.from('profils').select('id,pseudo').eq('pseudo', pseudo).maybeSingle();
  if(!prof) { msg.style.color='var(--r)'; msg.innerText='Aucun pote avec ce pseudo'; return; }

  var { error } = await sb.from('abonnements').insert({ follower_id: _sbUser.id, suivi_id: prof.id });
  if(error) {
    if(error.code === '23505') { msg.style.color='var(--gold)'; msg.innerText='Tu suis déjà '+pseudo; }
    else { msg.style.color='var(--r)'; msg.innerText=error.message; }
    return;
  }
  msg.style.color='var(--g)'; msg.innerText='✅ Tu suis maintenant '+pseudo;
  setTimeout(function(){ renderSocialConnected(); }, 800);
}

async function unfollow(suiviId) {
  var sb = sbClient();
  await sb.from('abonnements').delete().eq('follower_id', _sbUser.id).eq('suivi_id', suiviId);
  renderSocialConnected();
}

