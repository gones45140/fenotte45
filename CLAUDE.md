# CLAUDE.md — GONES45 / BET45

Lis ce fichier EN ENTIER avant toute action. Il remplace des semaines d'historique
que tu n'as pas. Mis à jour le 26/09/2026 (version déployée : 20260926s).

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
| worker.js | Cloudflare Worker fd-proxy.touraine-antoine.workers.dev (proxy CORS, cron, push) |
| style.css | `?v=20260908a` |

À CHAQUE livraison, monter la version aux 3 endroits (format AAAAMMJJ + lettre) :
index.html (app.js) dans gones45 ; indexfenotte.html (auth-guard.js) et
auth-guard.js (s.src d'app.js) dans fenotte45. Livrer app.js dans LES DEUX dépôts.

Contrôle : `grep -on "?v=2026[0-9]*[a-z]" index.html indexfenotte.html auth-guard.js`

## 4. Procédure de livraison

1. `node --check app.js` (et tout fichier JS modifié).
2. Simulations node : extraire la zone modifiée (entre deux repères de texte),
   la charger dans vm avec des faux fetch / localStorage / document, et vérifier
   les cas limites. Donner le nombre de tests passés.
3. Les harnais de tests découpent le code entre deux repères : si tu modifies un
   repère, le test casse sans que le code soit faux → recaler le repère.
4. Monter ?v= (section 3).
5. Vérifier les fichiers livrés octet par octet (cmp). Le 22/09, un ancien
   app.js était parti à côté d'un index.html neuf.
6. Commit clair en français : `20260926i — filtre X : …`.
7. Rappeler à Antoine : Ctrl+Maj+R, puis contrôle console :
   `console.log([...document.scripts].map(s=>s.src).filter(s=>/app\.js|auth-guard/.test(s)))`

## 5. Carte du code (les pièges d'abord)

- Onglet Saisons (sports hors foot) : `_g45SaisonsGen` (vue générique).
  ⚠ L'ancien `loadNbaSaisons` n'est plus affiché (écrasé par l'aiguillage vers
  `_g45SaisonsGen`). Ne rien y brancher.
- Filtres : lieu `_g45SgFiltre`, jours de repos `_g45SgRepos` (NBA, NHL),
  redessin qui garde la position : `_g45SgCursRedessiner(idAncre)`.
- Filtre joueur binaire `_g45JouBarre` (NHL, NFL, MLB, rugby, NRL) ;
  filtre joueur NBA avec ligne : `_g45NbaPFBarre` / `_g45NbaPFCoul` / `_g45NbaPFLigne`.
- Moteur des curseurs de marchés : `_g45MarcheEval`.
- Onglet Compo : `loadTeamCompo` (DEUX copies) ; sports US → `_g45CompoEffectif` ;
  NBA → `_g45NbaTableau` (vues Saison / 10 / 5 / Match).
- Fenêtre de match : `_renderGenericDetail` ; stats d'équipe US `_g45UsTeamStats`
  (couleurs via `g45CoulPaire` + `_g45CoulTexte`) ; feuille des joueurs NBA `_g45NbaFeuilleHtml`.
- Compétitions : `loadCompetTab`, vues `_g45CompetVue` ; matchs d'une ligue
  `_g45CompetMatchs` (un calendrier par équipe, cache 12 h, périodes hp/ap).
- 🏅 Classements par catégorie : `g45ClsRender` (foot : scoreboard) ;
  US : `_g45ClsRenderUS` → `_g45ClsAfficherUS`, catégories `_G45_CLS_US`,
  valeurs `_g45ClsValUS`, ligues `_G45_CLS_US_LIGUES` / `_g45ClsUsOk`
  (NHL, MLB, NBA, WNBA, NFL) ; KHL : `_g45KhlVueClassements` +
  `_g45ClsKhlVersUS` ; rugby XV et NRL : `_g45ClsRugbyOk`,
  `_g45ClsRugbyMatchs`, barème `_G45_RG_PTS` ; logo en filigrane `_g45ClsFond`.
- Panneau joueur (mur) : `_g45ButIdMur` → club AVANT sélection
  (`_g45ButEstSelection`, `_g45ButClubEspn`).
- Temps réglementaire : `g45ScoreTR`, `G45_TR_PERIODES`.
- Couleurs lisibles : `_g45CoulTexte`, `g45CoulEquipe`, `g45CoulPaire`.
- Classements : filtre Phase `_g45ClsPhase` / `_g45ClsEstPO`, Par match / Total
  `_g45ClsCtx.tot` (`_g45ClsCelMoy`), lecture de saison MOIS PAR MOIS
  `_g45ClsLireSaison`, équipes étrangères écartées `_g45ClsGarderLigue`.
- Fenêtre de match KHL : `g45KhlDetailMatch` (ouverture instantanée, aucune
  requête pour un match à venir) ; sections vidéo / stats / moments forts /
  face-à-face `_g45KhlEnrichi` ; fiche `_g45KhlFiche` (cache `g45khl_fiche2_`).
- COMPTABILITÉ DES PARIS : `_g45BetEffetTotal` / `_g45BetAppliquer` = seule
  source de vérité (mise retirée AU PLACEMENT ; gagné +m×cote ; freebet :
  cagnotte −m, gain m×(cote−1)). `deleteArchived` (DEUX copies) et
  `saveBetEdit` retirent l'ancien effet puis appliquent le nouveau.
  `editArchived` n'est appelé nulle part (et son inversion est fausse de ±m).
- Score d'un pari : `_g45ScoreTexte`, cache `g45_score4_<id>` (négatif gardé
  2 h) — effacé par `saveBetEdit` pour relancer la recherche.

## 6. Sources sondées (ne pas re-deviner)

- CORS : site.api.espn.com et sports.core.api.espn.com passent depuis le
  navigateur. site.web.api.espn.com (common v3) est BLOQUÉ → passer par le
  worker : `FD_PROXY + '?host=espnweb&path=' + encodeURIComponent(chemin)`.
- NBA effectif : site v2 …/nba/teams/{id|abbr}/roster. Stats saison : core
  …/leagues/nba/seasons/{S}/types/2/athletes/{id}/statistics (S+1 = 404 avant
  le début de saison ; rookie = 404).
- NBA journal de matchs : common v3 …/athletes/{id}/gamelog?season=S via le
  worker. Colonnes par names : minutes, totalRebounds, assists, points,
  threePointFieldGoalsMade-…, steals, blocks, turnovers. Événements : atVs,
  gameDate, homeTeamId, awayTeamId, team, opponent.abbreviation,
  score (du point de vue du joueur), gameResult.
- NBA résumé de match : boxscore.players[].statistics[0] → keys (⚠ ici
  rebounds, PAS totalRebounds), athletes[] = {starter, didNotPlay, stats[]}.
- NBA_TEAMS.espnId corrigés : ORL 19, PHX 21, POR 22, SA 24.
- Foot, club d'un joueur : core …/soccer/athletes/{id} → defaultLeague,
  puis core …/soccer/leagues/{lg}/athletes/{id} → team.
- Foot, scoreboard d'une ligue (?dates=A-B&limit=500) : tous les matchs +
  competitions[0].details (buts : minute, équipe, buteur, penaltyKick,
  ownGoal ; cartons). Minute ≤ 45 (y compris 45'+x) = 1re mi-temps.
- Foot, leaders : core …/seasons/{an}/types/0/leaders (goals, assists,
  shotsOnTarget, totalShots, foulsSuffered, saves…, top 25).
- Calendriers US : ajouter &seasontype=2 (sinon présaison). Présaison
  exclue via e.seasonType.type === 1.
- Hockey : prolongation = période 4, TAB = période 5 ; MLB manches > 9 ; NRL
  numérote sa prolongation 20.
- soccer/all/teams/{id}/schedule : matchs joués seulement, saison ignorée.
- Rugby : calendrier par équipe → 500, passer par les scoreboards mensuels.
  Top 14 : matchs fantômes (doublons inversés).
- NRL : `linescores` CUMULÉS — période 1 = score à la pause, période 2 = score
  final ; prolongation en période 20. season.type 1 = saison régulière (pas présaison).
- Rugby à XV : période 1 TOUJOURS à 0, période 2 = score final. Mi-temps
  reconstruite depuis `details` (try, conversion, penalty goal, drop goal ;
  AUCUN scoreValue fourni) ; si la somme ne redonne pas le score final → mi-temps inconnue.
- F1 / OpenF1 : pendant une séance (≈ −30 min → +30 min), l'API gratuite
  répond 401 à TOUT (direct réservé aux abonnés). L'app l'affiche
  (`_g45OF1Bloque`, `_g45OF1MsgBloque`, nouvel essai toutes les 5 min).
  Seule source gratuite du direct : livetiming.formula1.com (SignalR Core),
  mais la F1 renvoie 403 à beaucoup d'IP d'hébergeurs. TESTÉ LE 26/09 via
  `/f1test` : Cloudflare PASSE (negotiate 200, Index.json 200, WS 101).
  Route `/f1live` du worker = instantané allégé (cache partagé 5 s) ; côté
  app : `_g45F1OffLire` / `_g45F1OffHtml` / `_g45F1OffDemarrer`, prioritaire
  dans `_g45F1LiveStart` si la séance EN COURS est celle du GP ouvert.
  Aperçu hors séance : `g45F1Apercu()` en console. Tableau façon feuille de
  chrono (mini-secteurs : codes 2051 violet, 2049 vert, 2048 jaune, 2064
  stand) + chronologie : messages de course (30 derniers) et événements
  DÉDUITS de deux instantanés (`_g45F1OffEvenements`), donc seulement depuis
  l'ouverture de la page. Carte des voitures et
  temps aux stands : réservés à F1 TV en direct depuis 2025.
- Logos NBA : par abréviation (…/500/lal.png), pas par id (404 vu sur 13.png).
- NRL phases finales : season.type 2, slug `2026-final-nrl` (saison régulière :
  type 1, `2026-reg-nrl`) — l'INVERSE des sports US : se fier au SLUG.
- Scoreboards ESPN : réponse plafonnée vers 100 matchs même avec limit=500 →
  lire mois par mois et recouper un mois qui atteint 100.
- NRL : le State of Origin (New South Wales, Queensland) est dans le même
  scoreboard que le championnat.
- KHL feuille `event_v2` : team_a/b.shots, vbr (mises au jeu gagnées),
  ppg/ppc, shg, pim, possession/distance/entrées de zone (souvent 0) ;
  violations [{time s, period, penalty_time, penalty_reason (anglais),
  violator (null = pénalité d'équipe), quote (clip)}] ; highlight /
  condensed_game {iframe_url « //api-video.khl.ru… »} ; geo_error ;
  this_pair_stat {events_count, team_a/b {wins_count, goals_count}}.

## 7. Reste à faire (ordre proposé)

(Classements par catégorie : foot, US, KHL, rugby XV et NRL — FAIT, 20260926g.)
(Comptabilité des paris corrigée et cache de score relancé à l'édition — 20260926i.)
1. KHL : repérer les playoffs (filtre Phase des Classements) — à sonder au printemps.
2. Curseurs KHL (module séparé) ; confirmer les lignes estimées (NFL, rugby, périodes).
3. Logo Lakers en 404 ; logo hockey `teamlogos/hockey/500/113.png` en 404 (logo par id au lieu de l'abréviation).
4. Liste d'avant : graphique pression en portrait, « 1. FC », cartes KHL dans
   Suivies, crédits photos, remonter --t3, compos rugby, garanties restantes.

## 8. Façon de travailler en session cloud

Une tâche par session, sur une branche, avec un commit à la fin.
Commence par `grep -n` sur les noms de fonctions de la section 5 : ne lis pas
app.js en entier.
Avant de coder, résume à Antoine ce que tu as compris et ce que tu vas toucher.
Si une API doit être vérifiée, donne la commande console et arrête-toi.
Fin de session : liste des fichiers modifiés, version ?v=, tests passés, et
mise à jour des sections 5 à 7 de ce fichier si quelque chose a changé.
