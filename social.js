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

/* ── Calcul du bilan local (depuis state) ── */
function computeMyBilan() {
  var bankroll = Object.values(state.b || {}).reduce(function(a,v){ return a+parseFloat(v||0); }, 0);
  var paris = (state.a || []).filter(function(h){ return !h.isPending; });
  var benefice = paris.reduce(function(acc,h){ return acc + (h.win ? (h.m*h.cote - h.m) : -h.m); }, 0);
  var wins = paris.filter(function(h){ return h.win; }).length;
  var nbParis = paris.length;
  var winRate = nbParis ? (wins/nbParis*100) : 0;
  var totalMise = paris.reduce(function(a,h){ return a+parseFloat(h.m||0); }, 0);
  var roi = totalMise ? (benefice/totalMise*100) : 0;
  // Courbe : profit cumulé (ordre chronologique inverse de state.a qui est anté-chrono)
  var cum = 0;
  var courbe = paris.slice().reverse().map(function(h){
    cum += (h.win ? (h.m*h.cote - h.m) : -h.m);
    return parseFloat(cum.toFixed(2));
  });
  return {
    bankroll: parseFloat(bankroll.toFixed(2)),
    benefice: parseFloat(benefice.toFixed(2)),
    win_rate: parseFloat(winRate.toFixed(1)),
    nb_paris: nbParis,
    roi: parseFloat(roi.toFixed(1)),
    courbe: courbe
  };
}

/* ── Publication du bilan + des paris ── */
async function publishBilan() {
  var sb = sbClient();
  if(!_sbUser || !_sbProfil) return;
  var btn = document.getElementById('btn-publish');
  if(btn) { btn.disabled=true; btn.style.opacity='.6'; btn.innerText='⏳ Publication...'; }

  var bilan = computeMyBilan();
  // Upsert bilan
  await sb.from('bilans').upsert({
    user_id: _sbUser.id,
    pseudo: _sbProfil.pseudo,
    bankroll: bilan.bankroll,
    benefice: bilan.benefice,
    win_rate: bilan.win_rate,
    nb_paris: bilan.nb_paris,
    roi: bilan.roi,
    courbe: bilan.courbe,
    updated_at: new Date().toISOString()
  });

  // Remplacer les paris : on efface les anciens et on réinsère
  await sb.from('paris').delete().eq('user_id', _sbUser.id);
  var parisToInsert = (state.a || []).filter(function(h){ return !h.isPending; }).slice(0, 100).map(function(h){
    return {
      user_id: _sbUser.id,
      match: (h.target && h.target !== '-') ? h.target : (h.n || 'Pari'),
      pronostic: h.n || '',
      cote: parseFloat(h.cote) || 0,
      mise: parseFloat(h.m) || 0,
      statut: h.win ? 'gagne' : 'perdu',
      sport: h.sport || '',
      bookmaker: h.b || '',
      competition: h.comp || '',
      type: h.isCombi ? 'Combiné' : (h.type || 'Simple'),
      ref: (h.id ? String(h.id).slice(-8).toUpperCase() : ''),
      created_at: h.date ? _parseDateFr(h.date, h.heure) : new Date().toISOString()
    };
  });
  if(parisToInsert.length) await sb.from('paris').insert(parisToInsert);

  if(btn) { btn.disabled=false; btn.style.opacity='1'; btn.innerText='✅ Publié !'; setTimeout(function(){ btn.innerText='📤 Publier mon bilan'; }, 2000); }
  renderSocialConnected();
}

function _parseDateFr(date, heure) {
  // date format "JJ/MM/AAAA" ou ISO
  try {
    if(date.indexOf('/') >= 0) {
      var p = date.split('/');
      var iso = p[2]+'-'+p[1].padStart(2,'0')+'-'+p[0].padStart(2,'0')+'T'+(heure||'12:00')+':00';
      return new Date(iso).toISOString();
    }
    return new Date(date).toISOString();
  } catch(e) { return new Date().toISOString(); }
}

/* ── Écran connecté ── */
async function renderSocialConnected() {
  var el = document.getElementById('t-social');
  var sb = sbClient();
  var bilan = computeMyBilan();

  // Récupérer les abonnements
  var { data: follows } = await sb.from('abonnements').select('suivi_id').eq('follower_id', _sbUser.id);
  var suiviIds = (follows || []).map(function(f){ return f.suivi_id; });

  var html = '<div style="max-width:600px;margin:0 auto;padding:16px;">';

  // Header profil
  html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">';
  html += '<div><div style="font-size:16px;font-weight:800;color:var(--t1);">👤 '+(_sbProfil?_sbProfil.pseudo:'?')+'</div>';
  html += '<div style="font-size:10px;color:var(--t3);">Connecté · '+suiviIds.length+' abonnement(s)</div></div>';
  html += '<button onclick="socialLogout()" style="padding:6px 12px;border-radius:6px;border:1px solid var(--b2);background:rgba(255,255,255,.05);color:var(--t3);font-size:11px;cursor:pointer;">Déconnexion</button>';
  html += '</div>';

  // Mon bilan
  html += '<div style="background:var(--s1);border:1px solid var(--b2);border-radius:12px;padding:16px;margin-bottom:16px;">';
  html += '<div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--t3);margin-bottom:12px;">Mon bilan</div>';
  html += '<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:12px;">';
  html += _statBox('Bénéfice', (bilan.benefice>=0?'+':'')+bilan.benefice+'€', bilan.benefice>=0?'var(--g)':'var(--r)');
  html += _statBox('ROI', bilan.roi+'%', bilan.roi>=0?'var(--g)':'var(--r)');
  html += _statBox('Win rate', bilan.win_rate+'%', 'var(--t1)');
  html += _statBox('Paris', bilan.nb_paris, 'var(--t1)');
  html += '</div>';
  html += '<button id="btn-publish" onclick="publishBilan()" style="width:100%;margin-top:14px;padding:12px;border-radius:8px;border:none;background:#4d84ff;color:#fff;font-size:13px;font-weight:800;cursor:pointer;">📤 Publier mon bilan</button>';
  // Ma courbe BK
  if(bilan.courbe && bilan.courbe.length > 1) {
    html += '<div style="margin-top:12px;background:rgba(255,255,255,.02);border-radius:8px;padding:8px;">';
    html += '<div style="font-size:9px;color:var(--t3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px;">📈 Mon évolution bankroll</div>';
    html += '<div style="height:120px;position:relative;"><canvas id="curve-me"></canvas></div>';
    html += '</div>';
  }
  html += '</div>';

  // Recherche d'amis
  html += '<div style="background:var(--s1);border:1px solid var(--b2);border-radius:12px;padding:16px;margin-bottom:16px;">';
  html += '<div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--t3);margin-bottom:10px;">Ajouter un pote</div>';
  html += '<div style="display:flex;gap:8px;">';
  html += '<input id="social-search" type="text" placeholder="Pseudo du pote" style="flex:1;padding:10px;border-radius:8px;border:1px solid var(--b2);background:rgba(255,255,255,.04);color:var(--t1);font-size:13px;box-sizing:border-box;">';
  html += '<button onclick="searchAndFollow()" style="padding:10px 16px;border-radius:8px;border:none;background:var(--g);color:#000;font-size:13px;font-weight:800;cursor:pointer;">Suivre</button>';
  html += '</div>';
  html += '<div id="social-search-msg" style="margin-top:8px;font-size:11px;min-height:14px;"></div>';
  html += '</div>';

  // Feed des potes
  html += '<div id="social-feed"><div style="text-align:center;padding:20px;color:var(--t3);font-size:12px;">⏳ Chargement des potes...</div></div>';

  html += '</div>';
  el.innerHTML = html;

  // Dessiner ma courbe
  if(bilan.courbe && bilan.courbe.length > 1) {
    setTimeout(function(){
      var ctx = document.getElementById('curve-me');
      if(ctx && typeof Chart !== 'undefined') {
        var last = bilan.courbe[bilan.courbe.length-1];
        var col = last>=0 ? '#1ed760' : '#ff4545';
        var grad = ctx.getContext('2d').createLinearGradient(0,0,0,110);
        grad.addColorStop(0, last>=0?'rgba(30,215,96,.25)':'rgba(255,69,69,.25)');
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        new Chart(ctx, {
          type:'line',
          data:{ labels:bilan.courbe.map(function(_,i){return i+1;}), datasets:[{ data:bilan.courbe, borderColor:col, backgroundColor:grad, borderWidth:2, fill:true, tension:.35, pointRadius:0, pointHoverRadius:4 }] },
          options:{ responsive:true, maintainAspectRatio:false,
            plugins:{legend:{display:false}, tooltip:{callbacks:{label:function(i){return (i.raw>=0?'+':'')+i.raw+'€';}}}},
            scales:{x:{display:false}, y:{display:true, ticks:{color:'#8a93a8', font:{size:9}, callback:function(v){return v+'€';}}, grid:{color:'rgba(255,255,255,.04)'}}} }
        });
      }
    }, 50);
  }

  loadFriendsFeed(suiviIds);
}

function _statBox(label, val, color) {
  return '<div style="background:rgba(255,255,255,.03);border-radius:8px;padding:10px;text-align:center;">'
    + '<div style="font-size:9px;color:var(--t3);text-transform:uppercase;letter-spacing:.5px;">'+label+'</div>'
    + '<div style="font-size:18px;font-weight:800;color:'+color+';margin-top:4px;">'+val+'</div>'
    + '</div>';
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

/* ── Feed des potes suivis ── */
async function loadFriendsFeed(suiviIds) {
  var feed = document.getElementById('social-feed');
  if(!feed) return;
  if(!suiviIds.length) {
    feed.innerHTML = '<div style="text-align:center;padding:20px;color:var(--t3);font-size:12px;">Tu ne suis personne pour l\'instant.<br>Ajoute le pseudo d\'un pote ci-dessus 👆</div>';
    return;
  }

  var sb = sbClient();
  var { data: bilans } = await sb.from('bilans').select('*').in('user_id', suiviIds).order('updated_at', { ascending: false });

  if(!bilans || !bilans.length) {
    feed.innerHTML = '<div style="text-align:center;padding:20px;color:var(--t3);font-size:12px;">Tes potes n\'ont pas encore publié de bilan.</div>';
    return;
  }

  var html = '<div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--t3);margin-bottom:12px;">Mes potes</div>';
  bilans.forEach(function(b){
    var benColor = b.benefice>=0?'var(--g)':'var(--r)';
    html += '<div style="background:var(--s1);border:1px solid var(--b2);border-radius:12px;padding:14px;margin-bottom:12px;">';
    html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">';
    html += '<div style="font-size:14px;font-weight:800;color:var(--t1);">👤 '+b.pseudo+'</div>';
    html += '<button onclick="unfollow(\''+b.user_id+'\')" style="padding:4px 10px;border-radius:6px;border:1px solid var(--b2);background:rgba(255,69,69,.1);color:#ff7b7b;font-size:10px;cursor:pointer;">Ne plus suivre</button>';
    html += '</div>';
    html += '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:10px;">';
    html += _statBox('Bénéf', (b.benefice>=0?'+':'')+b.benefice+'€', benColor);
    html += _statBox('ROI', b.roi+'%', b.roi>=0?'var(--g)':'var(--r)');
    html += _statBox('WR', b.win_rate+'%', 'var(--t1)');
    html += _statBox('Paris', b.nb_paris, 'var(--t1)');
    html += '</div>';
    // Courbe BK
    if(b.courbe && b.courbe.length > 1) {
      html += '<div style="margin-top:8px;background:rgba(255,255,255,.02);border-radius:8px;padding:8px;">';
      html += '<div style="font-size:9px;color:var(--t3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px;">📈 Évolution bankroll</div>';
      html += '<div style="height:110px;position:relative;"><canvas id="curve-'+b.user_id+'"></canvas></div>';
      html += '</div>';
    }
    html += '<button onclick="viewFriendBets(\''+b.user_id+'\',\''+b.pseudo+'\')" style="width:100%;margin-top:8px;padding:8px;border-radius:6px;border:1px solid var(--b2);background:rgba(255,255,255,.05);color:var(--t2);font-size:11px;font-weight:700;cursor:pointer;">Voir ses paris</button>';
    html += '<div id="bets-'+b.user_id+'" style="margin-top:8px;"></div>';
    html += '</div>';
  });
  feed.innerHTML = html;

  // Dessiner les courbes
  bilans.forEach(function(b){
    if(b.courbe && b.courbe.length > 1) {
      var ctx = document.getElementById('curve-'+b.user_id);
      if(ctx && typeof Chart !== 'undefined') {
        var last = b.courbe[b.courbe.length-1];
        var col = last>=0 ? '#1ed760' : '#ff4545';
        var grad = ctx.getContext('2d').createLinearGradient(0,0,0,100);
        grad.addColorStop(0, last>=0?'rgba(30,215,96,.25)':'rgba(255,69,69,.25)');
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        new Chart(ctx, {
          type:'line',
          data:{ labels:b.courbe.map(function(_,i){return i+1;}), datasets:[{ data:b.courbe, borderColor:col, backgroundColor:grad, borderWidth:2, fill:true, tension:.35, pointRadius:0, pointHoverRadius:4 }] },
          options:{ responsive:true, maintainAspectRatio:false,
            plugins:{legend:{display:false}, tooltip:{callbacks:{label:function(i){return (i.raw>=0?'+':'')+i.raw+'€';}}}},
            scales:{x:{display:false}, y:{display:true, ticks:{color:'#8a93a8', font:{size:9}, callback:function(v){return v+'€';}}, grid:{color:'rgba(255,255,255,.04)'}}} }
        });
      }
    }
  });
}

/* ── Voir les paris d'un pote (rendu ticket) ── */
async function viewFriendBets(userId, pseudo) {
  var container = document.getElementById('bets-'+userId);
  if(!container) return;
  if(container.innerHTML.trim()) { container.innerHTML=''; return; } // toggle

  container.innerHTML = '<div style="text-align:center;padding:10px;color:var(--t3);font-size:11px;">⏳...</div>';
  var sb = sbClient();
  var { data: bets } = await sb.from('paris').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(30);

  if(!bets || !bets.length) { container.innerHTML = '<div style="text-align:center;padding:10px;color:var(--t3);font-size:11px;">Aucun pari publié</div>'; return; }

  var html = '<div style="border-top:1px solid var(--b1);padding-top:10px;margin-top:4px;">';
  bets.forEach(function(p){
    html += _renderBetTicket(p);
  });
  html += '</div>';
  container.innerHTML = html;
}

/* ── Carte ticket de pari ── */
function _renderBetTicket(p) {
  var win = p.statut === 'gagne';
  var mise = parseFloat(p.mise) || 0, cote = parseFloat(p.cote) || 0;
  var profit = win ? (mise * cote - mise) : -mise;
  var statutLabel = win ? '✅ Gagné' : '❌ Perdu';
  var statutColor = win ? '#1ed760' : '#ff4545';
  var statutBg = win ? 'rgba(30,215,96,.15)' : 'rgba(255,69,69,.15)';

  var dateStr = '';
  try {
    var d = new Date(p.created_at);
    var hh = String(d.getHours()).padStart(2,'0');
    var mm = String(d.getMinutes()).padStart(2,'0');
    var mois = ['jan','fév','mar','avr','mai','juin','juil','août','sep','oct','nov','déc'];
    dateStr = hh+'h'+mm+' · '+d.getDate()+' '+mois[d.getMonth()]+' '+d.getFullYear();
  } catch(e) {}

  // Sélection = le match (on évite "SIMPLE"/"Pari" comme titre)
  var titre = (p.match && p.match !== 'Pari' && p.match !== 'SIMPLE') ? p.match
            : (p.pronostic && p.pronostic !== 'SIMPLE' ? p.pronostic : '—');
  // Marché parié = type s'il est informatif (Victoire, Over 2.5…)
  var marche = (p.type && p.type !== 'Simple' && p.type !== 'Combiné') ? p.type : '';
  var categorie = (p.type === 'Combiné') ? 'Combiné' : 'Simple';
  // Sous-ligne : marché + compétition (sans doublonner le titre)
  var subBits = [];
  if(marche) subBits.push(marche);
  if(p.competition && p.competition !== titre) subBits.push(p.competition);
  var book = p.bookmaker ? (p.bookmaker.charAt(0).toUpperCase()+p.bookmaker.slice(1)) : '';

  var h = '<div style="background:var(--bg2,#161b28);border:1px solid var(--b2);border-left:3px solid '+statutColor+';border-radius:12px;margin-bottom:10px;overflow:hidden;">';

  // Header : statut + catégorie + cote
  h += '<div style="display:flex;align-items:center;gap:8px;padding:10px 12px 8px;">';
  h += '<span style="background:'+statutBg+';color:'+statutColor+';font-size:11px;font-weight:800;padding:3px 9px;border-radius:6px;white-space:nowrap;">'+statutLabel+'</span>';
  h += '<span style="font-size:10px;font-weight:700;color:var(--t3);border:1px solid var(--b2);padding:2px 7px;border-radius:5px;">'+categorie+'</span>';
  h += '<span style="flex:1;"></span>';
  h += '<span style="background:rgba(77,132,255,.15);border:1px solid rgba(77,132,255,.3);color:#4d84ff;font-size:14px;font-weight:800;padding:3px 10px;border-radius:8px;white-space:nowrap;">@'+cote.toFixed(2)+'</span>';
  h += '</div>';

  // Corps : sélection en gros + marché/compétition en dessous
  h += '<div style="padding:0 12px 10px;">';
  h += '<div style="font-size:15px;font-weight:800;color:var(--t1);line-height:1.3;overflow:hidden;text-overflow:ellipsis;">'+titre+'</div>';
  if(subBits.length) h += '<div style="font-size:11px;color:var(--t3);margin-top:3px;">'+subBits.join(' · ')+'</div>';
  h += '</div>';

  // Footer : mise / gain net
  h += '<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 12px;background:rgba(255,255,255,.02);border-top:1px solid var(--b1);">';
  h += '<div style="font-size:12px;color:var(--t3);">Mise <span style="color:var(--t1);font-weight:800;font-size:13px;">'+mise.toFixed(2)+' €</span></div>';
  h += '<div style="font-size:12px;color:var(--t3);">Gain <span style="color:'+statutColor+';font-weight:800;font-size:13px;">'+(profit>=0?'+':'')+profit.toFixed(2)+' €</span></div>';
  h += '</div>';

  // Réf + date (discret)
  if(p.ref || dateStr || book) {
    h += '<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;padding:6px 12px;font-size:9px;color:var(--t3);">';
    h += '<span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">'+book+(book&&p.ref?' · ':'')+(p.ref?'Réf '+p.ref:'')+'</span>';
    h += '<span style="white-space:nowrap;">'+dateStr+'</span>';
    h += '</div>';
  }

  h += '</div>';
  return h;
}
