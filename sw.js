/* GONES45 — Service Worker
   À placer À LA RACINE du repo (même dossier que index.html).
   1) Notifications de match (push) — inchangé.
   2) NOUVEAU : "network-first" sur app.js / social.js / style.css / la page,
      pour que tes mises à jour s'appliquent TOUJOURS direct (fini le cache figé).
   3) 20261103q : 🖼️ ARCHIVE DE LOGOS DANS L'APPAREIL (Antoine : « faudra limite faire une archive de logos » → dans l'appareil, pas dans le
      dépôt public (logos = clubs / ESPN) → « oui ») : logos d'équipes ESPN servis depuis le cache « g45-logos » (téléchargés UNE fois),
      réseau seulement s'ils manquent ; 1500 logos max (les plus anciens retirés).
   4) 20261103r : 🖼️ + IMAGES TheSportsDB (fonds des cartes du Mur / Cockpit : fanart, bannière ; Antoine « oui, je suis capable de rajouter
      d'autres équipes plus tard ») : cache « g45-images », 200 max (≈ 60 Mo), une nouvelle équipe est gardée dès son 1er affichage.
   Version : 2026-11-03r  (changer ce commentaire force la mise à jour du SW) */

const G45_PUSH_BASE = 'https://fd-proxy.touraine-antoine.workers.dev';

self.addEventListener('install', function(e){ self.skipWaiting(); });
self.addEventListener('activate', function(e){ e.waitUntil(self.clients.claim()); });

/* ─────────── Anti-cache : toujours la dernière version des fichiers du site ───────────
   On va chercher app.js (et la page, social.js, style.css) sur le réseau en priorité,
   en ignorant le cache HTTP du navigateur. Si le réseau échoue (hors-ligne), on laisse
   le navigateur tenter sa version habituelle. Tout le reste (API ESPN, images, Worker…)
   n'est PAS intercepté → comportement normal, aucune incidence. */
self.addEventListener('fetch', function(event){
  try {
    if (event.request.method !== 'GET') return;
    var req = event.request;
    /* auth-guard.js et supabase.js ETAIENT ABSENTS de cette liste : sur fenotte45,
       toute correction apportee a ces deux fichiers restait donc invisible, servie
       depuis le cache HTTP, alors qu'app.js se mettait bien a jour. Piege parfait
       pour croire qu'un correctif ne fonctionne pas. */
    var _lg = /^https:\/\/a\.espncdn\.com\/(i\/teamlogos\/|combiner\/i\?img=\/i\/teamlogos\/)/.test(req.url), _ts = /^https:\/\/(r2|www)\.thesportsdb\.com\/images\//.test(req.url);
    if (_lg || _ts) {   /* 20261103q : logos ESPN ; 20261103r : + images TheSportsDB */
      var _cn = _lg ? 'g45-logos' : 'g45-images', _max = _lg ? 1500 : 200;
      event.respondWith(caches.open(_cn).then(function (c) {
        return c.match(req.url).then(function (hit) {
          /* 20261108q (cartes partagées « LAL / POR », « KIR / SAN » en lettres sur téléphone) : un logo mis en cache par une <img>
             est OPAQUE ; le rendre à une lecture « cors » (carte partagée : fetch → blob → image intégrée) = erreur réseau → plus de logo.
             Lecture cors + copie opaque → on va chercher une vraie copie cors (qui remplace l'opaque, valable pour les deux). */
          if (hit && !(hit.type === 'opaque' && req.mode === 'cors')) return hit;
          return fetch(req).then(function (r) {
            if (r && (r.ok || r.type === 'opaque')) {
              var cp = r.clone();
              c.put(req.url, cp).then(function () { return c.keys(); }).then(function (k) { if (k.length > _max) for (var i = 0; i < k.length - _max; i++) c.delete(k[i]); }).catch(function () {});
            }
            return r;
          });
        });
      }).catch(function () { return fetch(req); }));
      return;
    }
    var freshAsset = /\/(app\.js|social\.js|style\.css|auth-guard\.js|supabase\.js)(\?|$)/.test(req.url);
    var isNav = (req.mode === 'navigate');
    if (freshAsset || isNav) {
      event.respondWith(
        fetch(req, { cache: 'no-store' }).catch(function(){ return fetch(req); })
      );
    }
  } catch (_e) { /* on laisse passer normalement */ }
});

/* ─────────── Notifications push (inchangé) ─────────── */
self.addEventListener('push', function(event){
  event.waitUntil((async function(){
    var events = [];
    try {
      var sub = await self.registration.pushManager.getSubscription();
      if (sub) {
        var r = await fetch(G45_PUSH_BASE + '/pevents?ep=' + encodeURIComponent(sub.endpoint), { cache: 'no-store' });
        if (r.ok) { var d = await r.json(); events = (d && d.events) || []; }
      }
    } catch (_e) {}

    // Si le push portait directement un payload (secours), on l'utilise
    if (!events.length && event.data) {
      try { var p = event.data.json(); if (p && (p.title || p.events)) events = p.events || [p]; }
      catch (_e2) { try { events = [{ title: 'GONES45 ⚽', body: event.data.text() }]; } catch (_e3) {} }
    }

    if (!events.length) events = [{ title: 'GONES45 ⚽', body: 'Mise à jour du match' }];

    for (var i = 0; i < events.length; i++) {
      var ev = events[i] || {};
      await self.registration.showNotification(ev.title || 'GONES45 ⚽', {
        body: ev.body || '',
        icon: ev.icon || 'icon-192.png',
        badge: 'icon-192.png',
        tag: ev.tag || undefined,          // ex. "but-<matchId>-3" → regroupe/met à jour
        renotify: !!ev.tag,
        vibrate: ev.vibrate || [90, 40, 90, 40, 120],
        timestamp: Date.now(),
        data: { url: ev.url || './' }
      });
    }
  })());
});

self.addEventListener('notificationclick', function(event){
  event.notification.close();
  var url = (event.notification.data && event.notification.data.url) || './';
  event.waitUntil((async function(){
    var all = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (var i = 0; i < all.length; i++) { if ('focus' in all[i]) { try { return all[i].focus(); } catch (_e) {} } }
    if (self.clients.openWindow) return self.clients.openWindow(url);
  })());
});

// Ré-abonnement automatique si le navigateur invalide l'abonnement
self.addEventListener('pushsubscriptionchange', function(event){
  event.waitUntil((async function(){
    try {
      var appKey = (event.oldSubscription && event.oldSubscription.options && event.oldSubscription.options.applicationServerKey) || null;
      if (!appKey) return;
      var newSub = await self.registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: appKey });
      await fetch(G45_PUSH_BASE + '/psub', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sub: newSub, resubscribe: true,
          oldEndpoint: event.oldSubscription && event.oldSubscription.endpoint })
      });
    } catch (_e) {}
  })());
});
