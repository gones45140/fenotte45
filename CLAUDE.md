# CLAUDE.md — GONES45 / BET45

Lis ce fichier EN ENTIER avant toute action (il est court exprès). Le détail de tout l'historique est dans HISTORIQUE.md
(à chercher avec grep, jamais à lire en entier). Mis à jour le 20/10/2026 (version déployée : 20261020k, même app.js sur gones45 et fenotte45).

## 1. Le projet

GONES45 (marque affichée : BET45) : PWA gratuite de suivi de paris sportifs,
développée en solo par Antoine (Orléans). Hébergée sur GitHub Pages
(gones45140.github.io/gones45), partagée avec des amis.

Antoine communique en français, souvent vite, avec des MAJUSCULES pour insister.
Réponds en français, simplement.

Antoine est malvoyant : texte blanc, grand (13–14 px minimum), contrasté.
Principe validé : « blason / logo derrière, bande sombre sous le texte ».

## 2. Règles NON NÉGOCIABLES

1. 100 % gratuit. Jamais d'option, de plan ou de service payant (Cloudflare,
   API, hébergement…). Ne pas reproposer Supabase.
   PROJET (expliqué par Antoine le 11/10) : AUJOURD'HUI tout est gratuit, pour lui comme pour les utilisateurs, et
   il ne paie RIEN → la règle s'applique pleinement. PLUS TARD : un abonnement utilisateurs (statut « soutien »
   user_supporter, verrou _g45AccesPremium déjà en place) apportera des rentrées ; ALORS il pourra payer des services
   pour faire évoluer l'appli tout en gardant une marge. Tant qu'il ne l'a pas dit, on reste au gratuit.
   Verrou premium aujourd'hui côté appli seulement → pour un vrai abonnement, vérifier côté serveur (Supabase / worker).
2. Changement visuel = maquette AVANT livraison. Décris ou montre le rendu,
   attends le « oui » d'Antoine, puis code. Une correction de bug purement
   fonctionnelle n'en a pas besoin.
3. SONDER AVANT DE CODER. Toute hypothèse non vérifiée sur une API (ESPN
   surtout) s'est révélée fausse au moins en partie. Si tu ne peux pas appeler
   l'API toi-même, donne à Antoine UNE commande console courte qui affiche
   exactement ce qu'il te faut (évite les réponses tronquées : supprime links,
   limite avec .slice(0,800)), et attends le résultat.
4. Ne refactorise pas app.js. ~3,4 Mo, un seul fichier, volontairement.
   Ajoute des blocs commentés, datés, qui expliquent le POURQUOI.
5. Région dupliquée : plusieurs fonctions existent en DEUX copies
   (toggleQuickStat, saveEditBet, g45SofaClassement, NBA_TEAMS,
   resolveNbaTeam, loadTeamCompo…). Toujours `grep -c` et corriger les deux.
6. Pas de secrets dans le code (clés, jetons).

## 3. Fichiers et versions (?v=)

DEUX DÉPÔTS GITHUB : gones45140/gones45 et gones45140/fenotte45 (un AUTRE dépôt).
(GONE45140/GONES45 et gones45140/manifest.json existent aussi : ne pas y toucher.)
app.js est déposé dans les deux ; indexfenotte.html et auth-guard.js
n'existent QUE dans fenotte45 — une session cloud sur gones45 ne les voit pas :
les demander à Antoine.

| Fichier | Dépôt | Rôle |
|---|---|---|
| index.html | gones45 | page principale, charge `app.js?v=…` |
| indexfenotte.html | fenotte45 | variante, charge `auth-guard.js?v=…` |
| auth-guard.js | fenotte45 | garde d'accès, crée le script `./app.js?v=…` (s.src) |
| app.js | les deux | toute l'application |
| worker.js | Cloudflare Worker fd-proxy.touraine-antoine.workers.dev (proxy CORS, cron, push) — DÉPLOYABLE PAR CLAUDE depuis le 15/10 : secret réseau CLOUDFLARE_API_TOKEN (Bearer, api.cloudflare.com/client/v4/, droits : Scripts Workers Modifier, reste Lu), compte 484f39cfd0f071e821782d569d5ed76d. TOUJOURS : télécharger le script (content/v2) + settings, garder une copie, PUT multipart avec les liaisons NON secrètes réécrites (ai AI, d1 DB, kv PUSH_KV, VAPID_PUBLIC / VAPID_SUBJECT) + keep_bindings [secret_text] + observability, puis revérifier liaisons et cron (*/5). |
| style.css | les deux (identiques) | `?v=20260927i` dans index.html et indexfenotte.html |

À CHAQUE livraison, monter la version aux 3 endroits (format AAAAMMJJ + lettre) :
index.html (app.js) dans gones45 ; indexfenotte.html (auth-guard.js) et
auth-guard.js (s.src d'app.js) dans fenotte45. Livrer app.js dans LES DEUX dépôts.

Contrôle : `grep -on "?v=2026[0-9]*[a-z]" index.html indexfenotte.html auth-guard.js`

fenotte45 : TOUJOURS livrer ensemble app.js + indexfenotte.html + auth-guard.js
(consigne d'Antoine). Plus de lettre après « z » dans la journée → prendre la date
du lendemain + « a » (ex. 20260927z → 20260928a) : ce n'est qu'une clé de cache.
gones45 reçoit des commits automatiques « Sync paris Antoine » (fichier chiffré
données/paris_antoine.json, toutes les minutes quand l'appli tourne) : avant de
pousser, `git fetch origin main && git rebase origin/main`, sinon le push est refusé.

## 4. Procédure de livraison

1. `node --check app.js` (et tout fichier JS modifié), puis OBLIGATOIRE :
   `node tests/smoke.js` (dans gones45) — ouvre l'appli dans Chromium, tout
   l'extérieur simulé, 11 contrôles (démarrage, pari simple + joueur, montante,
   render, fenêtre de match, Outils/santé, règles gagné/perdu, avis IA, radars, zéro erreur JS).
   Code de sortie 1 = NE PAS LIVRER. Ajouter un contrôle quand on crée une
   fonction importante.
2. Simulations node : extraire la zone modifiée (entre deux repères de texte),
   la charger dans vm avec des faux fetch / localStorage / document, et vérifier
   les cas limites. Donner le nombre de tests passés.
3. Les harnais de tests découpent le code entre deux repères : si tu modifies un
   repère, le test casse sans que le code soit faux → recaler le repère.
4. Monter ?v= (section 3).
5. Vérifier les fichiers livrés octet par octet (cmp). Le 22/09, un ancien
   app.js était parti à côté d'un index.html neuf.
6. Commit clair en français : `20260928d — filtre X : …`.
7. Rappeler à Antoine : Ctrl+Maj+R, puis contrôle console :
   `console.log([...document.scripts].map(s=>s.src).filter(s=>/app\.js|auth-guard/.test(s)))`

## 5. Où trouver les choses (le détail est dans HISTORIQUE.md)

TOUT le détail daté (pourquoi, sondes, pièges, captures, confirmations d'Antoine) est dans HISTORIQUE.md, mot pour mot.
AVANT de toucher une zone : `grep -n "<fonction ou mot-clé>" HISTORIQUE.md` puis lire autour. Ne pas lire HISTORIQUE.md en entier.
Index des zones (fonction d'entrée → mot à chercher dans HISTORIQUE.md) :
- Saisons hors foot `_g45SaisonsGen` (l'ancien loadNbaSaisons n'est plus affiché) · foot `loadTeamSaisons` · critères 4 saisons `_g45CrHtml`
- Séries individuelles `_g45RegBloc` / `g45RegOuvrir` / `_g45RegCalc` / `_g45RegHtml` / `_g45RegPhotos`
- Compétitions `loadCompetTab`, `_g45CompetMatchs`, `_g45CompetEquipes`, classements `g45ClsRender` / `_g45ClsRenderUS`
- Fenêtre de match `_renderGenericDetail` (hors foot), `_renderSaisonDetail` (foot), NHL avant match `_g45NhlAvPoser`
- Agenda `loadCalendrier` (`_agSuivis`, `_agJou`, `_agPalier`, cache 'ag1'), cotes `_g45AgCotes`
- Ticket `_g45TicketIa` / `_g45TicketRemplir` / `_g45TicketRemplirCockpit` / `_g45TkRacines`
- Paris : comptabilité `_g45BetEffetTotal` / `_g45BetAppliquer` (seule source de vérité), cartes « en cours » (data-g45ec), synchro `_g45PushBetsGithub` / `_g45BetsFusion`
- Mur / accueil `_g45AccRegrouper`, cartes joueur `_g45JoueurVisLire`, logos `g45LogoUrlDe`, fond `_g45FondLogo`, limite bet45 `_g45MurLimite`
- Tendances `g45TrRun` / `_g45TrRender`, officielles `_g45TrOffHtml` (robot .github/scripts/tendances.mjs), sélection du jour `_g45TrSelHtml`
- Tennis (analyse ESPN) `g45TnAnalyser` / `_g45TnSaison` / `_g45TnCalc` / `_g45TnSurf`, bouton Tendances perso `_g45TnPerso`
- Marqueurs `g45ButeursView`, `g45MarqueursUS`, `g45NbaMq` · CLV `g45ClvView` · quota cotes `_g45QtHtml`
- IA du match `_g45MultiAI` · articles `_g45ArticleBloc` · santé `g45SanteTester` (gones seulement : `_g45SanteActive`)
- KHL `g45KhlDetailMatch`, Euroleague / Pro A `_g45ElRendre`, Top 14 / Pro D2 `g45LnrRender` / `_g45Pd2Rendre`, NRL `g45NrlStatsRender`, KBO `_g45KboRendre`, F1 `g45F1Detail` / `_g45F1Off…`
- Stockage `_G45_CACHE_PREFIXES` / `_G45_CACHE_MORTS` (nouvelle version de clé = ancienne dans MORTS), nettoyage ?menage=1, diagnostic ?diag=1
- Secours ESPN (IndexedDB g45esp), relais TheSportsDB (worker host=tsdb), Social (social.js, 2 projets Supabase)

PIÈGES À NE JAMAIS OUBLIER :
- Fonctions en DEUX copies (render, loadTeamCompo, openClub, deleteArchived, pari, rendu des cartes du mur…) : `grep -c`, corriger les deux.
- Beaucoup de fonctions sont ENVELOPPÉES par des blocs en fin d'app.js : chercher toutes les affectations (`nom = ` / `window.nom = `).
- Les harnais de test découpent entre deux repères : un repère modifié casse le test.
- Script de patch écrit avec Write : les \uXXXX deviennent de vrais caractères → recaler les repères.
- Un écran qui se redessine après une recherche doit toujours voir un résultat « connu » ensuite (sinon boucle sans fin, cf. 20261016p).
- Hors bet45 seulement (outils d'Antoine) : `_g45SanteActive()`.

## 6. Interdits et sujets clos (détail : HISTORIQUE.md)

- Respecter les CGU : NE PAS lire lnh.fr, fis-ski.com, koreabaseball.com, npb.jp, football-data.co.uk, Transfermarkt, FotMob, Flashscore,
  motogp.com au-delà de l'existant ; pas de jeton lnb.fr ; pas de scraping de bookmakers / Oddsportal / DraftKings ; pas de multi-comptes
  pour contourner un quota ; Polymarket (ANJ) et Kalshi abandonnés ; jamais les photos de be-basketball.
- Abandonné / refusé (ne pas reproposer) : NPB, handball, Workers AI (IA), BTS The Odds API par match, stats live Pro A Sofascore,
  mi-temps Pro D2, papier peint clair, panneaux pub autour du terrain, tuile « ➕ Ajouter ».
- Antoine parie sur la FIN des séries : ne pas lui refaire la leçon sur le « biais du parieur ».

## 7. Reste à faire / en attente (détail : HISTORIQUE.md § 7)

- ⚾ Lanceurs MLB dans l'Agenda : sonde probables à faire par Antoine (ou mars).
- Cotes en direct hors foot : commande console « 4 ligues » à lancer par Antoine pendant un match.
- Abonnement : plan prêt, NON codé (_G45_ABO_PLAN false) ; micro-entreprise reportée ; verrou serveur à faire le moment venu.
- RGPD : SQL supprimer-compte.sql à installer par Antoine dans les 2 projets Supabase.
- 🎾 Cotes tennis : ESPN = 0 (Bruxelles 250, Bâle / Vienne 500, sondé le 20/10) → re-sonder pendant le Masters de Paris ; robot tennis officiel en attente du choix d'Antoine (« combiné » proposé).
- Surebet : mises « Mise 1 / Mise 2 » en blanc. Cédric : toucher 🤍 sur Portugal. Worker : budget `_lourd` 4 → 2 proposé.

## 8. Façon de travailler en session cloud

CE FICHIER et HISTORIQUE.md sont dans les DEUX dépôts (gones45 et fenotte45), identiques : à chaque
mise à jour, les recopier dans les deux (cmp). Jamais de clé, jeton ou mot de passe.
Antoine lit mal les longs textes : réponses courtes, claires.

ÉCONOMIE (demande d'Antoine, 20/10) : CLAUDE.md doit rester COURT. Les notes datées de chaque livraison vont dans
HISTORIQUE.md (rubrique de la zone touchée), PAS ici. Ici on ne change que : la ligne de version, l'index § 5 si une
nouvelle zone apparaît, § 6 si un interdit est décidé, § 7 (reste à faire).

Une tâche (ou une liste regroupée par Antoine) par session, sur une branche, avec un commit à la fin.
Commence par `grep -n` dans app.js et HISTORIQUE.md : ne lis aucun des deux en entier.
Avant de coder, résume à Antoine ce que tu as compris et ce que tu vas toucher.
Si une API doit être vérifiée, donne la commande console et arrête-toi.
Fin de session : liste des fichiers modifiés, version ?v=, tests passés, note ajoutée dans HISTORIQUE.md.
