/* GONES45 — Service Worker
   À placer À LA RACINE du repo (même dossier que index.html).
   1) Notifications de match (push) — inchangé.
   2) NOUVEAU : "network-first" sur app.js / social.js / style.css / la page,
      pour que tes mises à jour s'appliquent TOUJOURS direct (fini le cache figé).
   Version : 2026-06-27a  (changer ce commentaire force la mise à jour du SW) */

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
    var freshAsset = /\/(app\.js|social\.js|style\.css)(\?|$)/.test(req.url);
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
