# CLAUDE.md — GONES45 / BET45

Lis ce fichier EN ENTIER avant toute action. Il remplace des semaines d'historique
que tu n'as pas. Mis à jour le 27/09/2026 au soir (version déployée : 20260928k, même app.js sur gones45 et fenotte45).

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
   l'extérieur simulé, 9 contrôles (démarrage, pari simple + joueur, montante,
   render, fenêtre de match, Outils/santé, règles gagné/perdu, zéro erreur JS).
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
- Arbitre d'un match de foot (fenêtre `_renderSaisonDetail`) : `_g45ArbPlace` (stade +
  bloc posé dans la chaîne) puis `_g45ArbRemplir` après `el.innerHTML` ; stats
  `_g45ArbStats` = matchs `_g45ClsMatchs` (cartons `c`, fautes `fo`, cache
  `g45cls4_`) + arbitre de chaque match `_g45ArbOfficiel` (cache PERMANENT
  `g45arb1_<id>`) ; cumul `_g45ArbCumul`, verdict `_g45ArbVerdict` (±10 %, < 4 matchs = « peu »).
- Photos sur le terrain : `_g45PitchPrecharger` (perso dépôt → api-sports/TheSportsDB) puis
  `_g45PitchWiki` pour les joueurs restés sans photo (attribut `data-nm`) ; recherche
  `_g45WkPhoto` (cache `g45wk1_<nom>` : trouvé = permanent, rien = 14 j), garde-fou
  `_g45WkValide` (description « football » + nom de famille dans le titre).
  Onglet Compo (`_g45CompoEffectif`, foot) : attribut `data-g45wk` puis `_g45CompoWiki(el)`.
  CSP de index.html (ligne 15, connect-src) : fr.wikipedia.org ajouté ; en.wikipedia.org y était.
- Tableau de l'effectif (`loadFdSquad`, portrait < 600 px) : bloc par poste sur fond du club
  `_g45SquadFond` (g45CouleursDe + g45LogoUrlDe, couleurs claires assombries `_g45SqAssombrir`),
  photo ronde `_g45SquadAvatar` (perso synchrone, sinon initiales) complétée par
  `_g45SquadPhotos` (api-sports `_g45PhotosFoot`/`_g45PhotoDe`, puis Wikipédia). Même fond et mêmes
  photos en paysage/PC (colonne nom 180 px ; gardiens : 2 cases vides pour atteindre les 15 colonnes).
- Mode paysage téléphone (style.css, bloc « MODE PAYSAGE SUR TÉLÉPHONE », media
  landscape + max-height 520 + max-width 1099) : barre du bas → colonne de 80 px,
  logo dans la colonne, en-tête/bandeau affinés ; `--g45-paysage:1` sur :root.
  Réglage Orientation (app.js) : `_g45OriDispo` (lit --g45-paysage), `_g45OriAppliquer`
  (plein écran + screen.orientation.lock ; refus → retour « auto »), `g45OriPoser`
  (bloc en tête d'Outils), clé `g45_orientation`.
- Bandeau de scores `g45BandeauMaj` : si tout tient à l'écran, UNE copie, sans défilement.
- PWA gones45 : index.html déclare manifest.json (icônes locales icon-192/512.png,
  display standalone). fenotte45 : manifeste PAS encore déclaré dans indexfenotte.html.
- Fenêtre de match hors foot (`_renderGenericDetail`) : ligne stade + ville sous le score
  (gameInfo.venue, repli comp.venue), comme la fenêtre foot.
- Saisons (`_g45SaisonsGen`) : « Points par match » et « Stats clés » calculés sur `sf`
  (issu de `liste`, filtrée lieu/repos/phase) et non plus sur `st` (toute la saison).
  Filtre phase `_g45SgPhase` ('tout'|'reg'|'po') sur `m.po`.
- `_g45CompetMatchs` : cache `g45cm9_` ; le repli scoreboard mensuel (NRL, rugby) pose
  `po` via `_g45ClsEstPO(e)` (slug de saison « …-final-… »).
- En-tête d'équipe (`openClub`, DEUX copies → `_g45HeroLogo(nom)`) : si pas de logo,
  recherche `g45SdbClub(nom, sport)` (TheSportsDB) ; sport = u.sport (mur) ou
  `g45TeamsPerso()[nom].sport` via `_G45_HERO_SP` (équipes ouvertes depuis Compétitions) ;
  mémorisé dans u.logoUrl (mur) ou `g45_herologo_<nom>` (hors mur) ; échec = `g45_herologo_ko_<nom>` 7 j.
  Pose : `_g45HeroPoser` remplace le 1er enfant de `#d-hero .dtop`.
- Pression du match (`_renderMatchPression`) : couleurs `_g45CoulClaire` /
  `_g45CoulPaireSombre` (lisibles sur fond sombre, écart minimal entre équipes) — 27p.
- Astuce « passe en paysage » (IIFE en fin d'app.js) : téléphone tactile en portrait
  seulement (`pointer: coarse`), clés `g45_astuce_paysage_off` / sessionStorage — 27q/r.
- Domicile / Extérieur dans la fenêtre de match : foot `g45DomExtLancer` (empilé si
  largeur < 520) ; autres sports `g45DomExtGenLancer` (+ `_g45DeStats`, `_g45DeLib`,
  `_g45DeTuiles`) : saison en cours + précédente, saison régulière seule, lignes =
  curseurs de Saisons cochés « dans le calcul » (`_g45SgCursClesActives`) — 27s/t.
- Formulaire cockpit (montante) : champs joueurs `c-joueur`, `c-joueur-match`,
  `c-joueurs-extra`, `c-jmode` ; fonctions joueurs à PRÉFIXE (`g45JAjout(nom,match,p)`,
  `_g45FormJoueurs(p)`, `_g45FJ(k,p)`, `g45JReset(p)`, p = 'n' simple / 'c' cockpit).
  `pari()` (DEUX copies) enregistre joueur/joueurs/jmode pour les deux ; garantie :
  pari simple seulement — 27u.
- Cotes US (`_g45EspnUsOdds`) : favori = moneyline (`_g45TrPickOdd` sur
  moneyline.home/away ou homeTeamOdds/awayTeamOdds) ; `details` (« LAR -1.5 ») =
  HANDICAP affiché à part, jamais une cote sauf |n| ≥ 100 (MLB « NYY -150 ») — 27v.
- Cartes de JOUEUR du mur : rond de droite = logo du CLUB `_g45JoueurClubLogo(u)`
  (note, sinon club TheSportsDB du visuel joueur ; `g45SdbClub`, cache
  `g45_herologo_<club>`) ; photo : repli `_g45ImgRepli` + `data-alt`
  (`_g45JoueurVisRepli` : même fichier sur r2.thesportsdb.com, puis portrait) — 27w.
- Tendance du public (Sofascore RapidAPI `g45LoadTendance`) : sports refusés
  `_G45_SOFA_KO` (american-football, baseball, ice-hockey) + appris au 1er refus 400
  (`g45_sofa_ko_<slug>`, 30 j) → bouton caché (`_g45SofaSportKo`) — 27x.
- Article ESPN traduit : `_g45ArticleBloc(data, eid, hN, aN)` (Preview = « L'AVANT-MATCH »,
  Recap = « LE COMPTE RENDU »), bouton `g45ArticleTraduire` (Groq `g45IaUrl` /
  `g45GroqModele`, secours Gemini ; verrou `_g45AccesPremium`). Hors foot : sous les
  cotes dans `_renderGenericDetail` ; foot : sous stade/arbitre dans
  `_renderSaisonDetail`, via `_g45ArticleFootEn` (résumé SANS lang=fr, voir §6).
  Mémoire `g45art1_<eid>_<typ>` (recap 30 j, preview 12 h), rendu `_g45ArtHtml` — 27y → 28c.
- Photos plus hautes que larges (Wikipédia en pied) : `_g45Cadrer(img)` au onload →
  object-position 50 % 6 % (terrain `g45PitchPhotosAppliquer` + rendu direct,
  Compo `_g45CompoWiki`, effectif `_g45SquadPhotos`) — 28b.
- Règlement semi-automatique (28d) : `_g45AvPari` / `_g45AvJambe` = COPIE des
  règles du Worker (`g45VerdictPari`, `_g45VerdictJambe`) — garder les deux
  identiques. `_g45AvProposer(h)` lit le cache `g45_score4_<id>` ({hs: domicile,
  as: extérieur}) ; moiDom = h.domicile ('dom'/'ext', sinon null → marchés
  symétriques seulement). Muet pour : combiné, lay, joueur, 🏒, 🎾, autres sports,
  perdu avec garantie (explicite ou g45GarantieAutoPour). `_g45AvScanner`
  complète #live-strat / #live-norm APRÈS rendu (MutationObserver + 20 s) ;
  bouton « ✅/❌ Valider » → `result(id, v)` (débrief inchangé).
- Santé des sources (28d) : `_G45_SANTE` (ESPN, ESPN core, worker, TheSportsDB,
  Wikipédia, NHL, MLB, Groq et Gemini listes de modèles), `g45SanteTester(auto)`
  (retest des échecs après 10 s), bloc `#g45-sante` en tête d'Outils, bandeau
  `#g45-sante-ban` + point rouge `.g45-sante-pt` si panne ; auto une fois par jour
  (`g45_sante_jour`, 20 s après l'ouverture), résultat `g45_sante_res`, bandeau
  fermé `g45_sante_vu`. ⚠ Chaque test doit imiter l'appel RÉEL de l'appli : NHL
  via le worker (host=nhl, CORS refusé en direct) ; Groq : Authorization seulement
  si clé locale `g45IaCle()` (vers le worker, l'en-tête fait échouer /ia-modeles).
  Faux « injoignable » vu par Antoine le 27/09 → corrigé en 28e ; résultat v:2,
  un résultat plus ancien est refait à l'ouverture. tests/smoke.js simule tout
  l'extérieur : il NE détecte PAS ce genre d'erreur (CORS, en-têtes).
  GONES45 SEULEMENT (28f) : `_g45SanteActive()` = faux sur bet45 (window._g45User
  défini par auth-guard.js, ou hôte bet45.fr) → ni test, ni bandeau, ni bloc, ni point.
  Même critère que DEF_BK pour tout ce qui doit rester perso (outils d'Antoine).
  RapidAPI / api-sports : `_G45_SANTE_PAYANT`, bouton à part
  avec confirmation, jamais automatique.
- Classements foot, bouton « Over » (28j) : catégorie `ou` de `_G45_CLS_EQ` (remplace
  o25 et o15mt, dont les cas restent dans `_g45ClsValEq`) ; période `_g45ClsCtx.ouP`
  ('ft' | '1' | '2', 2e MT = score final − pause) et ligne `ouL` (0,5 à 4,5), gardées
  dans localStorage `g45_cls_ou`. Mi-temps : seulement les matchs `m.f` (détail complet).
- Classements foot, « ⏱️ Quand ? » (28k) : catégorie `quand` → `_g45ClsTableQuand`
  (au lieu de _g45ClsTableEq) ; calcul `_g45ClsQuandEq(id, liste, mode)` sur m.b
  (m.f seulement) : % 1re MT (minute ≤ 45, 45'+x compris) / 2e MT (reste, prolongation
  comprise), minute moyenne du 1er et du DERNIER but par match (demande d'Antoine :
  pas la moyenne de tous les buts), tranches de 15 min. Contexte : qMode
  ('pour'|'contre'), qTri (m1|m2|prem|der|g, re-toucher = inverser), qOuvert
  (équipe dépliée : histogramme + bouton fiche).
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
- MotoGP (style officiel, 26/09) : API motogp.com via le worker (host=motogp).
  `/riders` → cs.pictures.profile.main (photo), team.color / text_color /
  constructor.name ; `_g45MotoColors` (carte pilote→{col,photo,team,moto}),
  `_g45MotoRec`, `_g45MotoPhoto`. Calendrier : drapeau flagcdn en fond +
  vainqueurs + points course/sprint `_g45MotoVainqueurs` (cache DÉFINITIF
  g45moto_win2_). Classement Moto2 : l'API répond 403 (27/09) → recalculé
  par `_g45MotoChampCalcule` (somme des points des courses). Séance `g45MotoSession`, championnat `g45MotoStandings`.
- Vidéos : `g45YT(q)` = lecteur YouTube INTÉGRÉ (youtube-nocookie) ; la route
  worker `/ytsearch?q=` lit la page de résultats YouTube (sans clé, sondée le
  27/09, cache 6 h). Tri `_g45YTScore` (chaînes officielles, highlights,
  pénalise F2/F3/Moto2/Moto3 non demandés, réactions). Les <a> et
  window.open vers youtube.com/results sont redirigés vers le lecteur
  (`data-g45-direct="1"` pour garder un vrai lien). Bloc Course / Sprint /
  Qualifs : `_g45BlocResumes` (F1 et MotoGP).
- Logos F1 : Simple Icons intégrés (`_G45_F1_LOGOS`, CC0) pour Ferrari, McLaren,
  Red Bull, Aston Martin, Audi, Cadillac, AMG (Mercedes). Alpine, Haas,
  Williams : fichiers `images/ecuries/{alpine,haas,williams}.svg` ou `.png`
  (pastille blanche, repli sur l'abréviation). Drapeaux GP : flagcdn w640,
  `object-fit:fill` (drapeau entier), 45 %.
- Arbitre (foot) : summary gameInfo.officials [{displayName, position.name
  "Referee", order}] SANS id ; core …/leagues/{lg}/events/{id}/competitions/{id}/officials
  → {items:[{id, displayName, position}]} ≈ 400 octets (summary ≈ 450 Ko). Pas de
  météo au foot, attendance toujours 0. Fautes : scoreboard competitors[].statistics foulsCommitted.
- Rugby XV (Top 14 270559) : scoreboard ?dates=A-B → 400 « Failed to get events endpoint » (27/09).
- Wikipédia (27/09) : fr.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=<nom>
  footballeur&gsrlimit=1&prop=pageimages|description&piprop=thumbnail&pithumbsize=200&format=json&origin=*
  → pages{…{title, description « footballeur brésilien », thumbnail.source}}. Joueurs peu
  connus : page sans image (Christ Makosso). `origin=*` refusé si ouvert dans le navigateur.
- Orientation (27/09) : screen.orientation.lock refusé (NotSupportedError) hors plein
  écran, dans le navigateur intégré d'une autre app (GitHub, Claude…) ET dans l'APK
  BET45 (WebView) — seule l'APK peut bloquer le sens (pont JS à ajouter au projet Android).
- fenotte45 = bet45.fr (fichier CNAME). APK « app-debug-1.apk » BET45 : projet sur l'ordi d'Antoine.
- ESPN summary foot avec `lang=fr&region=fr` : PAS d'`article` (articles en anglais
  seulement) → le relire sans ces paramètres. Sondé 27/09 (trêve) : eng.1 / fra.1 / esp.1
  ont des « Recap » ; uefa.champions, NHL, MLB, NBA, NRL : rien sur les matchs listés.
  NFL (Rams–Broncos 401872962) : article type « Preview » ~6 700 car. (story HTML),
  predictor.homeTeam/awayTeam.gameProjection, againstTheSpread (records VIDES),
  pickcenter, news (actus NFL générales). Pas de pronostics d'experts.
- Cotes ESPN US : `details` = handicap (« LAR -1.5 », côté favori) en NFL.
- Sofascore RapidAPI (sofascore6, via worker host=rapidapi) : match/list
  sport_slug=football OK (553 matchs) ; american-football, americanfootball,
  american_football, baseball, ice-hockey → 400 (27/09).
- TheSportsDB : anciennes images www.thesportsdb.com/images/… → 404 ; les récentes
  sont sur r2.thesportsdb.com. ESPN headshots soccer (…/players/full/<id>.png) : vides.
- SportsLine (CBS) : payant, pas d'accès gratuit. Polymarket / Kalshi : à sonder
  (bloqués depuis la session cloud ; la CSP connect-src d'index.html devrait aussi
  être élargie si on les branche).
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
(Stade hors foot — k ; Saisons : filtre lieu respecté — l ; phases finales NRL — m ; logo d'en-tête d'équipe, mur et hors mur — n/o. Tout en 20260927o sur les deux sites.)
(Mode paysage + réglage Orientation — fenotte45 20260927i, gones45 20260927i ; gones45 installable (manifeste) — 20260927j.)
(Tableau de l'effectif : fond du club + photos — 20260927g.)
(Photos Wikipédia en dernier recours sur le terrain — 20260927f.)
(Bloc Arbitre dans la fenêtre de match foot — 20260927e. Rugby : à sonder, le scoreboard par plage répond 400.)
(Saisons : match de sélection compté deux fois (soccer/all + uefa.nations) — dédoublonné par espnId dans `_ajouterCoupe` et `renderSaisonsChart`, 20260927d.)
(Depuis 27o : p pression lisible, q/r astuce paysage, s/t Domicile-Extérieur tous sports,
 u joueurs dans le cockpit, v handicap ≠ cote, w cartes joueur du mur, x Tendance cachée
 pour NFL/MLB/NHL, y/z/28a article ESPN traduit (foot compris), 28b cadrage des photos,
 28c traduction mémorisée.)
(28d : règlement semi-automatique, santé des sources, tests/smoke.js — FAIT.)
0. À FAIRE EN PREMIER :
   - NOTIFICATIONS MULTI-APPAREILS : FAIT côté appli (28g) + worker.js modifié le 27/09
     (à vérifier : Antoine l'a-t-il redéployé ? le panneau Notifications affiche
     « 📱 N appareils reliés » si oui). App : `_g45NotifCompte()` = SHA-256
     ('g45-compte|' + 'u:'+_g45User.id sur bet45, 'g:'+gones45_github_token sur gones)
     → 32 hex, envoyé dans /psub (`compte`). Worker /psub : les subs de même `compte`
     partagent teams/betTeams/matches/paris (dernier envoi = référence ; une liste vide
     ne remplace pas, elle hérite). Réponse {compte, appareils} → localStorage
     g45_notif_appareils. ⚠ L'APK (WebView) ne gère PAS le push : sur téléphone,
     utiliser Chrome / l'appli installée depuis Chrome, et activer les notifications
     une fois sur l'appareil.
   - APK TWA bet45 : FAIT le 28/09. PWABuilder (Google Play → Generate), paquet
     fr.bet45.twa, empreinte CE:21:79:F3:…:3C:2C (vérifiée = certificat de l'APK).
     fenotte45 : manifest.json (icônes locales icon-192/512, start_url
     ./indexfenotte.html) déclaré sur index/accueil/indexfenotte/login + sw.js
     enregistré ; .well-known/assetlinks.json + .nojekyll (sinon Pages ignore le
     dossier) ; APK publié dans telecharger/bet45.apk. La clé de signature est chez
     Antoine (NE JAMAIS la demander ni la mettre dans un dépôt) : sans elle, pas de mise
     à jour de l'APK. Outils (bet45 seulement) : bloc `g45InstPoser` (#g45-inst) :
     Android → lien APK (HEAD sinon « bientôt disponible »), iPhone → Safari « Sur
     l'écran d'accueil », PC → « Installer » ; masqué si déjà installé (standalone /
     referrer android-app://). 1er essai d'Antoine : APK ouvert en Custom Tab (barre
     d'URL) → installé avant publication d'assetlinks et/ou Edge navigateur par
     défaut ; conseil : Chrome par défaut, désinstaller/réinstaller. À vérifier.
     Piste : l'APK ouvre la page d'accueil marketing (bet45.fr → accueil.html) ;
     envisager d'envoyer vers indexfenotte.html si referrer android-app://fr.bet45.twa.
   - gones45 : icône installée = logo Bad Gones (icon-gones-192/512.png, manifest
     v=20260928h) ; Antoine installe gones par le navigateur (pas d'APK).
   - Marchés de prédiction (Polymarket / Kalshi) : 1er essai du 27/09 lancé dans la
     console de la page BET45 → bloqué par la CSP (connect-src ne contient ni
     gamma-api.polymarket.com ni api.elections.kalshi.com). Rien appris sur les API.
     Étape suivante : Antoine ouvre DIRECTEMENT dans un onglet
     https://gamma-api.polymarket.com/events?tag_slug=nfl&closed=false&limit=3 et
     https://api.elections.kalshi.com/trade-api/v2/markets?series_ticker=KXNFLGAME&status=open&limit=3
     et envoie une capture. Si données NFL présentes → brancher soit par la CSP
     (index.html ET indexfenotte.html, + vérifier le CORS), soit par une route du worker ;
     puis maquette « ESPN / cotes / marché » dans la fenêtre de match.
     RÉSULTAT (27/09, URL ouverte dans un onglet) : Polymarket BLOQUÉ en France (ANJ) —
     ne PAS contourner (ni worker ni autre). Kalshi RÉPOND :
     /trade-api/v2/markets?series_ticker=KXNFLGAME&status=open → markets[] : un marché
     PAR ÉQUIPE et par match, event_ticker « KXNFLGAME-26OCT05ATLNO » (date + abréviations),
     title « New Orleans wins », yes_sub_title « New Orleans », last_price_dollars « 0.6100 »
     (= 61 %), yes_bid/yes_ask_dollars, volume_fp, occurrence_datetime (UTC), status.
     CORS (27/09, fetch depuis example.com) : REFUSÉ (« Failed to fetch ») sur toutes les
     séries → Kalshi n'est PAS lisible depuis le navigateur : passer par le worker
     (liste blanche de hosts ; ajouter host=kalshi → api.elections.kalshi.com, lecture
     seule, cache court). worker.js n'est PAS dans le dépôt gones45 : le demander à Antoine.
     WORKER (27/09) : route `host=kalshi` ajoutée à worker.js (sans clé, chemins
     /trade-api/v2/(markets|events|series) seulement, cache 10 min) — fichier modifié
     remis à Antoine, déployé par lui. Test : /series?category=Sports → 200.
     Séries « par match » confirmées : KXNFLGAME, KXNBAGAME, KXNHLGAME, KXMLBGAME,
     KXWNBAGAME, KXKHLGAME, KXEPLGAME, KXLIGUE1GAME, KXLALIGAGAME, KXSERIEAGAME,
     KXBUNDESLIGAGAME, KXUCLGAME, KXUELGAME, KXUECLGAME, KXCOUPEDEFRANCEGAME,
     KXFACUPGAME, KXATPGAME, KXWTAGAME, KXEUROLEAGUEGAME, KXAFLGAME, KXRLGAME (XIII ?).
     ⚠ 2e appel immédiat → 429 « too_many_requests » : UNE requête par série (markets?
     series_ticker=…&status=open&limit=200) partagée par tous les matchs, cache worker
     10 min ; 429 → ligne Kalshi absente, jamais d'erreur affichée.
     CONCLUSION (27/09 soir) : /markets ET /events?with_nested_markets=true → 429 en
     continu via le worker (IP Cloudflare partagées, limite Kalshi déjà atteinte) ;
     le worker ne met PAS les erreurs en cache. Kalshi = NON FIABLE en gratuit →
     bloc « 3 avis » ABANDONNÉ. La route host=kalshi reste dans worker.js (inoffensive) ;
     on peut retenter un jour (autre heure) avant de la retirer.
     Repli possible, à proposer si Antoine le demande : « 2 avis » ESPN (predictor) /
     cotes DraftKings sans marge, alerte si écart > 8 points.
     Ancienne liste de séries à tester (faite) :
     KXNBAGAME, KXNHLGAME, KXMLBGAME, KXEPLGAME, KXUCLGAME, KXLALIGAGAME, KXLIGUE1GAME.
     Maquette proposée (pas encore validée) : bloc « QUI VA GAGNER ? — 3 AVIS » sous les cotes :
     ESPN (predictor) / cotes (DraftKings sans marge) / Kalshi, alerte si écart > 8 points.
     ⚠ Tout test console lancé SUR la page BET45 est soumis à sa CSP : pour sonder
     un domaine absent de connect-src, ouvrir l'URL dans un onglet ou passer par le worker.
   - Après la trêve internationale : vérifier si le foot a des « Preview » ESPN
     (commande : scoreboard + summary sans lang=fr, champ article.type).
1. fenotte45, paysage (plus tard, à la demande d'Antoine) : dans l'APK remplacer les
   boutons Orientation par une phrase (« Rotation auto ») ; en portrait, « Connexion »
   chevauche le logo ; déclarer le manifeste comme sur gones45.
   APK : récupérer le projet Android (ordi d'Antoine) pour le pont d'orientation.
   Vu en paysage sur gones45, laissé tel quel : en-tête transparent (sans flou),
   graphique « réussite par sport » qui dépasse à droite.
2. KHL : repérer les playoffs (filtre Phase des Classements) — à sonder au printemps.
3. Curseurs KHL (module séparé) ; confirmer les lignes estimées (NFL, rugby, périodes).
4. Logo Lakers en 404 ; logo hockey `teamlogos/hockey/500/113.png` en 404 (logo par id au lieu de l'abréviation).
5. Liste d'avant : graphique pression en portrait, « 1. FC », cartes KHL dans
   Suivies, crédits photos, remonter --t3, compos rugby, garanties restantes.

## 8. Façon de travailler en session cloud

CE FICHIER est dans les DEUX dépôts (gones45 et fenotte45), identique : à chaque
mise à jour, le recopier dans les deux (cmp). Il ne doit JAMAIS contenir de clé,
jeton ou mot de passe. Antoine lit mal les longs textes : réponses courtes, claires.

Une tâche par session, sur une branche, avec un commit à la fin.
Commence par `grep -n` sur les noms de fonctions de la section 5 : ne lis pas
app.js en entier.
Avant de coder, résume à Antoine ce que tu as compris et ce que tu vas toucher.
Si une API doit être vérifiée, donne la commande console et arrête-toi.
Fin de session : liste des fichiers modifiés, version ?v=, tests passés, et
mise à jour des sections 5 à 7 de ce fichier si quelque chose a changé.
