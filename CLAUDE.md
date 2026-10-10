# CLAUDE.md — GONES45 / BET45

Lis ce fichier EN ENTIER avant toute action. Il remplace des semaines d'historique
que tu n'as pas. Mis à jour le 01/10/2026 (version déployée : 20261008e, même app.js sur gones45 et fenotte45).

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

## 5. Carte du code (les pièges d'abord)

- Onglet Saisons (sports hors foot) : `_g45SaisonsGen` (vue générique).
  ⚠ L'ancien `loadNbaSaisons` n'est plus affiché (écrasé par l'aiguillage vers
  `_g45SaisonsGen`). Ne rien y brancher.
- Filtres : lieu `_g45SgFiltre`, jours de repos `_g45SgRepos` (NBA, NHL),
  redessin qui garde la position : `_g45SgCursRedessiner(idAncre)`.
- Filtre joueur binaire `_g45JouBarre` (NHL, NFL, MLB, rugby, NRL) ;
  20261005p (« comment savoir si le joueur était pas absent », maquette validée « oui les deux ») : l'index garde idx.pres[eid] = ids
  présents sur la feuille (`_g45JouPresents`, didNotPlay exclu) ; clé g45_jou_v1_ → g45_jou_v2_ (MORTS) = « Analyser les joueurs » à
  relancer une fois. `_g45JouAbsent(eid)` : filtre actif + joueur hors feuille → ligne grisée « 🚫 <nom> absent », match RETIRÉ du
  compteur combiné (« · N matchs sans X retirés »). Pas de feuille pour un match = jamais absent.
  CONFIRMÉ par Antoine (capture 07/10, Oilers / McDavid : 7 matchs absents fin mars-avril grisés, compteur 4/34).
  filtre joueur NBA avec ligne : `_g45NbaPFBarre` / `_g45NbaPFCoul` / `_g45NbaPFLigne`.
- Moteur des curseurs de marchés : `_g45MarcheEval`.
- Onglet Compo : `loadTeamCompo` (DEUX copies) ; sports US → `_g45CompoEffectif` ;
  NBA → `_g45NbaTableau` (vues Saison / 10 / 5 / Match).
- Fenêtre de match : `_renderGenericDetail` ; stats d'équipe US `_g45UsTeamStats`
  20261005p (« j'ai pas les compo ») : hockey → « 👥 JOUEURS DU MATCH » `_g45NhlFeuilleHtml` (après la feuille NBA, même résumé, 0 requête) :
  bouton par équipe, Attaquants / Défenseurs (B, A, Pts, Tirs, +/-, Temps) / Gardien (Arrêts, Tirs reçus, Buts, % arrêts, Temps) ;
  catégories boxscore forwards/defenses/goalies, colonnes par clé puis libellé (`_G45_NHL_COLS`, noms NHL NON sondés : colonne absente = masquée).
  (couleurs via `g45CoulPaire` + `_g45CoulTexte`) ; feuille des joueurs NBA `_g45NbaFeuilleHtml`.
  20261006y (maquette validée, « trier par buts sinon ok go ») — 👥 AVANT LE MATCH NHL (match 'pre', `_g45NhlAvPoser` dans `_renderGenericDetail`,
  bloc en fin d'app.js) : SONDÉ PAR ANTOINE (2026020062) api-web /v1/gamecenter/<id>/play-by-play AVANT le match = rosterSpots 23 joueurs DISPONIBLES
  par équipe (2 gardiens, pas de lignes) ; /landing → matchup.skaterSeasonStats / goalieSeasonStats. `_g45NhlAvLire` : absents = stats de la saison
  de l'équipe sans rosterSpots (Bedard, Mangiapane) ; tri buts > points > passes ; patinoire `_g45NhlAvInterieur`, onglets `g45NhlAvEq`. Id NHL via
  club-schedule-season/<ABR>/now (`_g45RegEquipe`), coup d'envoi le plus proche. Worker host=nhl : chemin /v1/gamecenter/… NON vérifié (si refusé →
  ligne « indisponibles (…) »). Lignes / gardien titulaire : pas de source gratuite (Flashscore = CGU) ; piste : shiftcharts api.nhle.com
  (sonde demandée à Antoine, match 2026020061). Contrôle « NHL avant le match » dans smoke.js (14 contrôles). CONFIRMÉ par Antoine : le bloc s'affiche.
  20261006z (maquette validée, ordre gardien → défense → attaque) — 🏒 LIGNES PROBABLES : SONDÉ PAR ANTOINE api.nhle.com/stats/rest/en/shiftcharts
  ?cayenneExp=gameId=<id> (VIDE pendant le match, rempli après ; {playerId, teamId, period, startTime/endTime « mm:ss », duration, lastName}) ;
  le temps passé ENSEMBLE redonne les lignes de Flashscore (Carolina–Vancouver vérifié). `_g45NhlAvLigCharger` : dernier match fini de chaque
  équipe (club-schedule-season, gameType 2 d'abord) → shifts (sessionStorage g45nhlsh1_<ABR>) → `_g45NhlAvLignes` (paires de D puis trios,
  glouton par chevauchement ; poste = rosterSpots puis landing position) → `_g45NhlAvLigHtml` ; enveloppes de `_g45NhlAvInterieur` (boutons
  « 🏒 Lignes probables » / « 📋 Tous les joueurs », `g45NhlAvVue`) et de `_g45NhlAvCharger`. Joueur du dernier match hors rosterSpots = grisé.
  Worker : host=nhlstats (chemin shiftcharts SEUL) — À AJOUTER / REDÉPLOYER par Antoine ; refus → vue « Tous les joueurs » seule.
  (worker.js complet avec la route nhlstats donné à Antoine le 09/10.)
  20261007a (capture : « Joueurs pas encore publiés par la NHL » sur San Jose–Edmonton à venir) : rosterSpots VIDE tant que la NHL n'a pas publié
  la liste du match → `_g45NhlAvLire` construit l'effectif depuis landing (skaterSeasonStats position / goalies, nom « A. Frondell » coupé,
  photo assets.nhle.com/mugs/nhl/<season>/<ABR>/<id>.png déduite), E.synth = bandeau « ⏳ Liste officielle pas encore publiée… absents inconnus » ;
  lignes : sans liste officielle, personne n'est grisé (R._vide).
  CONFIRMÉ par Antoine (capture Edmonton, 09/10) : worker nhlstats déployé, lignes affichées (Draisaitl–McDavid–Podkolzin, paires…).
  20261007c (« manque les photos ») : sans liste officielle, R rempli depuis E.G/D/F (photos déduites) ; tout joueur sans photo →
  assets.nhle.com/mugs/nhl/<season>/<ABR>/<id>.png.
- 20261004w (captures d'Antoine 06/10) — Compétitions sports US : Classement (`g45LoadStandings`) demande &seasontype=2 (refus →
  ancienne adresse ; prise en compte par ESPN NON vérifiée) ; `g45RenderStandings` TRIE lui-même NHL/KHL (points) et NBA/NFL/MLB (% V)
  — le « rank » ESPN classait Thunder 15e, Jets 16e ; J absent = V+N+D ; hockey N = otLosses/overtimeLosses (noms NON vérifiés).
  Journées (`g45NrlCharger`) : calendrier par équipe en &seasontype=2 + événement seasonType.type 1 écarté (US seulement, pas NRL) ;
  cache g45nrlcal11_ → g45nrlcal12_.
  20261004x — SONDÉ PAR ANTOINE (NHL) : le classement IGNORE &seasontype=2 (2027 = 3 matchs de présaison avec ou sans) ;
  colonnes otLosses ET overtimeLosses présentes. → `_g45StPresaison(sp, slug)` lit le scoreboard (leagues[0].season.type.type 1 =
  présaison, année season.year ; type NON vu dans la sonde) : cette année-là sautée, gardée en dernier repli. Capture « Jets 16e » =
  saison 2024-25 (season=2025) : tri corrigé en w.
- Compétitions : `loadCompetTab`, vues `_g45CompetVue` ; matchs d'une ligue
  `_g45CompetMatchs` (un calendrier par équipe, cache 12 h, périodes hp/ap).
  Année auto `_g45CompetAnneeAuto` (30d) : NHL / NBA = année de FIN (dès septembre, 2026-27 =
  2027, comme `_g45SgAnAuto`) ; avant, 2026 = 2025-26 et 2026-27 n'était jamais demandée.
  30e — SONDÉ PAR ANTOINE (season.year du scoreboard de chaque ligue) : WNBA = année CIVILE
  (ajoutée à G45_LIGUES_CIVILES, `_g45SgLabel`, `_g45SgAnAuto` ; avant traitée comme la NBA) ;
  NCAA basket = année de FIN. Rugby : NE PAS toucher — l'appli lit ses matchs par DATES
  (août → juillet, `_g45ClsLireSaison`), ESPN mélange les conventions (Premiership/URC/Challenge
  = fin, Top 14/Six Nations/Tests = civile) ; les classements (standings) essaient plusieurs années.
- 🏅 Classements par catégorie : `g45ClsRender` (foot : scoreboard) ;
  US : `_g45ClsRenderUS` → `_g45ClsAfficherUS`, catégories `_G45_CLS_US`,
  valeurs `_g45ClsValUS`, ligues `_G45_CLS_US_LIGUES` / `_g45ClsUsOk`
  (NHL, MLB, NBA, WNBA, NFL) ; KHL : `_g45KhlVueClassements` +
  `_g45ClsKhlVersUS` ; rugby XV et NRL : `_g45ClsRugbyOk`,
  `_g45ClsRugbyMatchs`, barème `_G45_RG_PTS` ; logo en filigrane `_g45ClsFond`.
- Panneau joueur (mur) : `_g45ButIdMur` → club AVANT sélection
  (`_g45ButEstSelection`, `_g45ButClubEspn`).
- Temps réglementaire : `g45ScoreTR`, `G45_TR_PERIODES`.
  20261005j (capture : Edmonton 1-2 Colorado « Après TAB » compté en victoire, mode TR actif) : match aux TIRS AU BUT sans période > 3
  chez ESPN → le garde-fou renonçait. Hockey : 3 périodes présentes, égalité, final à 1 but d'écart = prolongation/TAB → score TR
  appliqué. Linescores ESPN d'un match aux TAB NON vérifiés (Antoine sur téléphone, ESPN bloqué depuis le cloud).
  20261005k (« inchangé ») — VRAIE CAUSE : `_g45SaisonsGen` rangeait sa mémoire `_g45SgMem` par sport|ligue|année seulement →
  activer le bouton reprenait la liste déjà chargée SANS le mode TR (enveloppe de _g45CompetMatchs jamais rappelée) ; clé + « |tr ».
  20261005l (toujours « inchangé », Antoine sur téléphone) : ligne de diagnostic sous le bouton TR actif (« N matchs prolongés recalculés ·
  M sans détail des périodes · v… ») pour savoir si ESPN donne les linescores du calendrier d'équipe NHL. À retirer une fois réglé.
  Résultat chez Antoine : « 22 recalculés · 1312 sans détail » → le calendrier d'équipe NHL (teams/<id>/schedule) n'a PAS de linescores.
  20261005m : `_g45CompetMatchs` garde m.ox (1 = « OT », 2 = « SO » dans status.type.detail, libellés « Final/OT » / « Final/SO » NON
  vérifiés sur cette adresse) ; `g45ScoreTR` sans périodes : hockey + ox + 1 but d'écart → min-min. Cache g45cm10_ → g45cm11_ (MORTS).
  CONFIRMÉ par Antoine (capture 07/10 : 14/04 = 1-1, 12/04 = 2-2) → « Final/OT » / « Final/SO » bien lus. 20261005n : ligne de diagnostic retirée.
  20261005o (« NBA et NFL pas besoin, mieux vaut prendre vainqueur ») : `_g45SgTROk(sp)` — bouton TR de Saisons et son application
  (clé mémoire, enveloppe de _g45CompetMatchs) EXCLUS pour basketball et football (US) ; hockey, baseball, NRL, foot inchangés.
- Couleurs lisibles : `_g45CoulTexte`, `g45CoulEquipe`, `g45CoulPaire`.
- Classements : filtre Phase `_g45ClsPhase` / `_g45ClsEstPO`, Par match / Total
  `_g45ClsCtx.tot` (`_g45ClsCelMoy`), lecture de saison MOIS PAR MOIS
  `_g45ClsLireSaison`, équipes étrangères écartées `_g45ClsGarderLigue`.
- Fenêtre de match KHL : `g45KhlDetailMatch` (ouverture instantanée, aucune
  requête pour un match à venir) ; sections vidéo / stats / moments forts /
  face-à-face `_g45KhlEnrichi` ; fiche `_g45KhlFiche` (cache `g45khl_fiche2_`).
- Effectif KHL (onglet Compo, `g45KhlCompoFiche` → `_g45KhlJoueurs`) : 30a — SONDÉ PAR ANTOINE,
  players_v2_light → 522 (20 s) alors que players_v2 page 2 → 200 en 3 s. Si la liste allégée
  échoue : `_g45KhlJoueursSansLight` lit les pages de 16 (lots de 4) jusqu'à une page < 16,
  page 1 à part ; lot entier perdu = arrêt ; cache g45khl_joueurs_<stage> seulement si complet.
  30b — Compo lit D'ABORD l'équipe seule : `_g45KhlJoueursEquipe(eqId)` = players_v2 avec
  q[team_id_eq]=<id> (SONDÉ : 16 joueurs de l'équipe 113 seulement, 3 s), pages de 16 tant que
  pleines et nouvelles ; cache g45khl_eq1_<stage>_<id> 3 h. La ligue entière (231 Ko, jamais
  stockée : relue à chaque ouverture, ≈ 5 min) n'est plus qu'un secours.
  30c — tableau aligné (maquette validée) : largeurs FIXES (flex:none) ; colonne pastilles
  PAST_L px en-tête ET lignes (avant : texte « 9 derniers » seul en en-tête → chiffres décalés),
  nom ≥ 150 px, largeur mini LARG_MIN (défilement horizontal au-delà).
- TICKET COLLÉ DANS LE PENSE-BÊTE (#pc-note, PC) — 20261007m (capture MyMatch Inter–Parme : cote 7,70 = les GAINS, mise / heure /
  équipes non lues) : l'ancienne lecture (IIFE « SCAN TICKET via bloc-notes », DEUX copies, Tesseract + regex) est court-circuitée par un
  écouteur paste / drop en CAPTURE sur document → `_g45TicketIa` (Groq vision `g45GroqModeleVision`, clé locale sinon worker /ia, JSON
  equipe / adversaire / domicile / date / heure / competition / sport / type / cote / mise / gains / bookmaker ; cote = gains ÷ mise si l'IA
  a pris les gains) → `_g45TicketRemplir` (n-team, n-analysis, n-date, n-heure, n-comp, n-type, n-cote, n-mise, n-book, p-sport, setLieu) ;
  échec → `_g45TicketTesseract`. Testé Chromium (réponse IA simulée). Worker /ia avec une image : NON vérifié.
  20261007n (« marche pas en cockpit ») : mode Cockpit (`_g45TicketCockpit` = #sub-strat affiché + #btn-cpit « on ») → `_g45TicketRemplirCockpit` :
  #c-unit = équipe du mur au nom proche (sinon alerte « choisis l'équipe à la main ») + updMise / renderCrash, #c-target, #c-date, #c-heure,
  #c-comp, #c-sport, #c-lieu (+ g45LieuChange), mmRows = 1 ligne {type, cote totale} + renderMmRows, #c-mise = mise du TICKET (après le palier),
  #c-book. Testé Chromium : Cockpit (Inter, Parme, 18:00, @1.54, 5 €) ET Simple.
  20261007o (capture Dembélé « décisif » France–Belgique : date « Lun. 05/10 » lue 10/05/2025, joueur mis dans Équipe) : consigne = dates
  JJ/MM françaises + date du jour ; date corrigée au plus près d'aujourd'hui (jour/mois inversés, année ±1) ; nouveau champ JSON « joueur »
  → #n-joueur / #c-joueur, « equipe » = l'ÉQUIPE du joueur. Testé Chromium (réponse simulée erronée → 2026-10-05, France, O. Dembélé).
  20261007p (capture Vilardi Winamax : compétition « Squad Game », heure 00:07 = heure de SAISIE à côté de « Réf », joueur dans Équipe) :
  consigne (Squad Game / MyMatch / Boost / Cashout = jeux Winamax ; heure « Réf » ≠ match ; pari joueur = club du joueur) + garde-fous :
  compétition « squad|mymatch|boost|cashout|freebet » → vidée et bookmaker winamax ; equipe = joueur → equipe vidée.
  20261007q (« pour différencier les books ça va être compliqué », ticket Winamax Yamal envoyé) : consigne = signes WINAMAX (carte bleu nuit,
  étiquette En cours / Gagné / Perdu, cote en pastille blanche chiffres rouges, Mise / Gains potentiels jaunes, COMPLÉTER, « Réf : … » + date
  de saisie) ; champ bookmaker_sur : false (et pas Winamax) → bookmaker NON changé ; date « Réf » = date du pari, pas du match.
  20261007r — BETCLIC (capture Dembélé, que j'avais crue Winamax) : carte BLANCHE, « Simple » en haut à gauche, état en pastille en haut à
  droite, marché en vert, cote en pastille JAUNE chiffres noirs penchés, « Lun. 05/10 20:45 » = date + heure DU MATCH au-dessus des équipes,
  « Réf » + hexadécimal long + « 05/10/2026 20:17 ». « Boost » = les deux sites (n'indique plus Winamax) ; bookmaker gardé si sûr OU
  Winamax / Betclic nommés. 20261007s — UNIBET (capture Lille–Le Havre) : bandeau NOIR « SIMPLE », « À 17h15 » gris = heure du match,
  « 1 N 2 - 90 Mins : Lille » + cote de ligne, pied gris Cote totale | Mise | Gains potentiels, liseré jaune ; cote retenue = « Cote totale ».
  BETIFY (capture 10/10) : nom écrit sur le ticket (bookmaker « betify » déjà dans la liste). 20261007t : sport cyclisme → 🚴 (p-sport / c-sport).
  20261007u — PMU (capture « Mes paris » PMU PLAY) : cartes blanches à barre gauche verte / rouge, « Simple @ 9,50 • Perdu », « Référence Du
  Pari: <chiffres> » + date du PARI, match vert « France - Maroc », « Cote: 1,90 2,50 » (barrée = ancienne, garder la dernière), « Mise : … •
  Gain : … » ; plusieurs paris sur la capture → le PREMIER seulement. Bookmaker gardé si nommé winamax|betclic|unibet|pmu|betify.
  20261007v — BET365 (captures Hadjar F1 + Anderlecht–Lyon « Pari personnalisé ») : carte gris foncé, montant turquoise en haut à gauche = MISE,
  « Perdu » gris / « GAGNÉ » turquoise en haut à droite, « Nom - Non 3.05 » (cote après la sélection), pari personnalisé = sélections cochées
  d'un même match + UNE cote, équipes avec maillot + score (1re = reçoit), bouton « ✓ 0,00 € Gagné » ≠ gain. bet365 ajouté à la liste « sûr ».
  20261007w (deux tickets Betsson) : repères BETSSON (carte bleu marine, « Pari Simple - Ouvert », « Mon pari, ton bonus », date + « ID de pari » =
  date du PARI, « Aujourd'hui 17:15 » = heure du match, « Russell, George », « Cote totale - » → cote de la sélection) ; betsson ajouté à la liste « sûr ».
  AUTRES : Piwi plus tard (Antoine enverra une capture « le moment venu »).
  20261007x (maquette validée « oui » : « en rouge quand ça remplit pas, jaune pour facultatif, vert le reste ») — COULEURS APRÈS UN TICKET :
  `_g45TicketCouleurs(cockpit, ids)` (bloc en fin d'app.js, appelé dans traiter) : champs `_G45_TK_CHAMPS` (s = Simple, c = Cockpit dont mm-sel
  et c-lieu) ; VERT = rempli PAR le ticket (ids), ROUGE + « ⚠️ X à remplir » (vide) / « à vérifier (pas lu sur le ticket) » (valeur par défaut,
  ex. date du jour), JAUNE « facultatif » = joueur / notes ; champ caché ignoré ; effacé au focus / saisie (`_g45TkEffacer`), tout effacé par
  enveloppes de pari / saveMmAsPari et au ticket suivant (`g45TkToutEffacer`). Testé Chromium (Simple + Cockpit, captures).
  20261007y (« manuellement rouge puis vert », « OUI AUSSI POUR COCKPIT ») : couleurs PERMANENTES (`_g45TkPeindre`, cadre 2 px : vert rempli,
  rouge obligatoire vide, jaune joueur / notes) sur Simple ET Cockpit, repeintes à chaque input / change (capture), renderMmRows et toutes les
  1,5 s onglet Pari visible ; menus déjà choisis (équipe, sport, lieu, book) = verts d'office. Ticket : `_g45TkEtat` {msg, verif} = cadre 3 px +
  texte jusqu'à ce que le champ soit bon (« à vérifier » tant qu'on n'y a pas touché). `_g45TkEffacer` supprimé.
  20261007z (maquette validée « oui fait le ») — BOUTONS DE MARCHÉ (#mm-types Cockpit / #mm-types-simple) : `_g45MmCouleurs` après
  renderMmRows / renderMmRowsSimple / setLieu (enveloppes) et changement de #c-lieu : choisi = vert « ✓ », contradictoire = rouge barré
  (cliquable), couvert = vert clair (Over 2.5 ⇒ Over 1.5) ; règles `_g45MmRegles(lieu)` (Victoire ≠ Nul / Défaite, Vainqueur ≠ Défaite,
  HC -1 ≠ Nul / Défaite, BTS Oui ≠ Non, Over 2.5 ≠ Under 2.5, doubles chances selon lieu dom / ext ; sans lieu : pas de règle).
  20261008a : les mêmes enveloppes repeignent aussitôt les cadres des champs (`_g45TkPeindre`) — « Type de pari » restait rouge 1,5 s.
  20261008b (« sur téléphone ça ne marche que sur PC », maquette « galerie oui, photo sert à rien ») — bouton « 📷 Lire un ticket (capture
  d'écran) » au-dessus de « Ton pari » (Cockpit + Simple, `_g45TicketBoutons`) → `g45TicketChoisir` (input file image/*, sans capture=) →
  `window._g45TicketTraiter` (traiter du collage exposé ; pense-bête caché → bandeau fixe en bas, 96 px). Testé Chromium 390 px (filechooser).
  20261008d (capture Winamax MyMatch GP de Singapour « Vainqueur Verstappen ou Antonelli ou … » : Équipe vide, Antonelli en adversaire,
  Verstappen seul en joueur, lieu Dom) : champ JSON « selections » + consigne COURSE ; garde-fou dans `_g45TicketIa` : F1 / MotoGP / cyclisme →
  Équipe = carte du mur du sport (🏎 ou nom « FORMULE 1 »…) sinon « Formule 1 », Type = « Vainqueur : Verstappen, Antonelli… » (noms de famille),
  adversaire / joueur vidés, compétition sans année ni « - Course », lieu neutre (setLieu('')) ; `window._g45TkCourse` → Adversaire jaune
  « facultatif ». Testé Chromium (réponse simulée).
  ⚠ app.js contient un jeton Dropbox en dur (localStorage.setItem('gones45_dbx_token', 'sl.…'), ≈ l. 15585 et sa copie) : SIGNALÉ à Antoine le 10/10.
- SYNCHRO DES PARIS (GitHub, Antoine seul, données/paris_antoine.json chiffré) — 20261007l : le 09/10, PC éteint après 3 paris (22:16-22:20),
  téléphone resté ANCIEN saisit Lens–Lyon → poussait SON état entier (23:19) → 3 paris perdus partout (restaurés par commande console depuis
  le commit adc4c09). Correctif (bloc en fin d'app.js) : `_g45PushBetsGithub` REMPLACÉE — avant chaque envoi, version GitHub plus récente que
  g45_betsync_ts → déchiffrée et fusionnée par `_g45BetsFusion` (pari absent ajouté + effet solde ; en cours ici / réglé là-bas → repris réglé,
  palier recopié ; pierres tombales state.hOff 120 j via enveloppes deleteArchived / cancelBet) ; illisible → envoi ANNULÉ ; sha refusé → 1
  nouvel essai ; envois sérialisés. NON fusionnés : modification d'un pari présent des deux côtés, dépôts / retraits manuels. Testé : 15 cas vm +
  scénario complet Chromium avec faux GitHub (4 paris, solde juste).
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
- Terrain des compositions (placeTeam, ≈ l. 27243) : 20261003d — lignes 5→42 % (haut) / 95→58 % (bas) ; avant 4→47 / 96→53 :
  les deux lignes d'attaque se chevauchaient (capture France–Italie). 20261003g — 6→42 / 94→58 ; PLUS GRAND (« un poil trop petit »,
  validé « oui ») : photos/maillots 44–52 px, nom 13 px sur bande sombre (numéro devant ESSAYÉ puis retiré : trop large sur un terrain
  de 272 px — badge 11 px sur la photo), cases égales x = (rang+0,5)/n, nom ≤ 100cqw/n (container-type sur le terrain), min-height 620.
  Vérifié en rendu Chromium à 272 px : seuls les noms longs d'une ligne de 4 sont coupés (Calafi…, Upam…).
  20261003h (« il manque des cages ») : surfaces de but + cages à filet (haut / bas) ; lignes 9→42 / 91→58, min-height 660.
  20261003i : quarts de cercle + drapeaux 🚩 de corner (« on met pas les tribunes » — promis).
  20261003j (validé « oui c'est mieux ») : GONES45 / BET45 (bet45.fr ou window._g45User) en filigrane dans le rond central ;
  panneaux publicitaires tout autour du terrain REFUSÉS (« un poil chargé »).
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
- 🖼️ FOND PAR ÉQUIPE (20261007e, essai console validé par Antoine sur PC) : fiche d'équipe ouverte (#detail visible, MutationObserver + enveloppe
  d'openClub) → `_g45BgMaj` pose --bg-img = fanart TheSportsDB (strFanart1..4 puis strStadiumThumb, PAS le bandeau ; bon sport via u.sport /
  g45TeamsPerso, `_G45_BG_SPORT`), sinon logo en grand au centre (fixed) sur dégradé bleu nuit ; fiche fermée → fond d'avant (perso ou fond.jpg).
  Cache g45bgclub1_ (30 j / rien 7 j). Cause du flou d'origine : photo perso réduite à 900 px (applyBgFromFile, localStorage), fond.jpg 468 × 1024.
  20261007f (« ok 2 ») : photo perso (Outils → Apparence → fichier) gardée en PLEINE TAILLE (≤ 2560 px, JPEG .88) dans IndexedDB (base g45,
  magasin kv, clé 'bg') et posée en blob: ; localStorage = drapeau g45_bg_idb seulement (ancienne data:URL g45_bg_img effacée). Fonctions
  d'Apparence dans une portée FERMÉE → enveloppes sur window.applyBgFromFile / resetBgDefault / applyBgFromUrl + #bg-file-input.onchange
  rebranché. Vérifié dans Chromium (2560 × 1280, rechargement, remise à zéro). Antoine doit RE-CHOISIR sa photo une fois.
  Fond clair « papier peint » multi-sports REFUSÉ (« ça fait papier peint ») ; filigrane BET45 d'accueil : proposé, sans suite.
  09/10 — FOND PAR DÉFAUT DE BET45 : montage multi-sports d'Antoine (Gemini 1024 × 572 agrandi ×4 avec Upscayl → fond.png 4096 × 2288,
  10,8 Mo, déposé dans gones45 SANS être utilisé) converti en JPEG fond-sports.jpg (2560, 580 Ko) / fond-sports-m.jpg (1280, 180 Ko, ≤ 900 px)
  dans fenotte45 ; <style> en ligne dans indexfenotte.html juste après style.css. gones45 garde fond.jpg. « Voile » = curseur
  d'assombrissement (--scrim, 60 % par défaut) d'Outils → Apparence.
- Mode paysage téléphone (style.css, bloc « MODE PAYSAGE SUR TÉLÉPHONE », media
  landscape + max-height 520 + max-width 1099) : barre du bas → colonne de 80 px,
  logo dans la colonne, en-tête/bandeau affinés ; `--g45-paysage:1` sur :root.
  Réglage Orientation (app.js) : `_g45OriDispo` (lit --g45-paysage), `_g45OriAppliquer`
  (plein écran + screen.orientation.lock ; refus → retour « auto »), `g45OriPoser`
  (bloc en tête d'Outils), clé `g45_orientation`.
- 🏠 ACCUEIL PAR SPORT (20261002l, maquette validée « oui » + « les replier serait bien aussi ») : bloc en FIN d'app.js,
  enveloppe de `render` (render existe en DEUX copies, la 2e ≈ l. 11287 gagne ; carte d'équipe NON touchée) → `_g45AccRegrouper`
  regroupe les `.g45-murcard` de #dash-units par sport (`_g45AccSport` = G45_SPORTS_PARI, emoji le plus long d'abord : 🏉🇦🇺 NRL
  ≠ 🏉 Rugby) : tuiles 2 par ligne (#g45-acc-zone, visuel TheSportsDB d'une équipe du sport, nb d'équipes, gain = m×cote−m /
  −m), `g45AccChoisir(emoji)` = cartes du sport + « ← Sports » (sessionStorage g45_acc_sel). `_g45AccRepliables` déplace
  Objectif bankroll et Pari du jour SOUS les équipes, repliés (localStorage g45_acc_obj / g45_acc_pdj = '1' ouvert) ;
  ligne #g45-acc-auj « 🔴 AUJOURD'HUI » sous Bankroll (`_g45AccAujourdhui`, source `_g45BandMesEquipes` = ESPN seulement,
  pas de KHL / Euroleague ; 5 min mini entre deux lectures). Contrôle « Accueil par sport » dans smoke.js (13 contrôles).
  20261002m (« le but est de voir les sports que propose l'application ») : les 13 sports de `_G45_ACC_SPORTS` ont TOUJOURS une
  tuile ; sans équipe au mur → `_g45AccAller(v)` : sport d'équipe = showTab t-compet + g45CompetSport(comp), sport individuel =
  showTab t-resultats + son écran (g45F1Open, g45TennisResults(0), g45MmaOpen(0), g45MotoOpen, g45CyclingOpen('tdf'), g45BiaOpen)
  et gain / perte des PARIS du sport (`_g45AccParis`, h.sport ; 🏉 sans 🇦🇺). Avec entrées au mur : filtre + bouton 📅 / 🏆.
  Une équipe créée se range dans la tuile de son u.sport (liste #u-sport du formulaire) ; 20261002n : 🏍 MotoGP et 🎿 Biathlon
  ajoutés à #u-sport (index.html ET indexfenotte.html).
  20261002o — ligne « 🔴 AUJOURD'HUI » RETIRÉE (doublon du bandeau du haut, même source ; « oui enlève la »).
  20261005g (« screen 2 il depasse largement ») : `g45AccChoisir` remettait les cartes avec style.display='' → le display:flex
  en ligne de la carte était EFFACÉ (bande du texte et gain sur toute la largeur) ; remis à 'flex'.
  20261002p (« F1 avait sa bannière, NRL aussi que tu as mis dans rugby ») : `_G45_ACC_NOMS` range d'abord par NOM les cartes
  « catégorie » du mur (FORMULE 1, AU NRL, TENNIS, Basket, RUGBY, MMA, MotoGP…), et un club NRL connu (`_g45NrlEqId`) saisi en 🏉
  va en NRL ; images PERSO permises en fond de tuile (bannière de la carte catégorie prioritaire) ; image presque carrée
  (largeur < 1,3 × hauteur : logo ASVEL, aunrl.png) posée ENTIÈRE (contain) ; 20261002q : bannière très allongée (largeur > 2,2 × hauteur : formule1.png 584×192) aussi ENTIÈRE, en haut de la tuile ; couleur par sport `_G45_ACC_COUL` ; emoji 52 px à 60 %.
  20261002r (« le cache noir sur PC cache vraiment l'image ») : bandeau du texte à la largeur du TEXTE (plus 100 %), fond .72,
  tuile min-height clamp(96px, 22vw, 130px). Images de compétition TheSportsDB `_g45AccLigueImg` / `_G45_ACC_LIGUES` (tuile sans
  visuel ni logo) : SONDÉ PAR ANTOINE 4464 ATP (tennis), 4465 UCI World Tour (cyclisme) ; MotoGP 4407 / UFC 4443 NON sondés →
  gardés seulement si strLeague correspond ; Biathlon / Skiing / Fighting : aucune image chez TheSportsDB. Cache g45acc_img_<emoji>.
  20261002s : tuile sans visuel → image PERSO au NOM du sport (`_g45ImgPersoLire(g.s.n)` : images/equipes/biathlon.png ajoutée,
  337×183, envoyée par Antoine — photo de presse probable, droits signalés) avant l'image TheSportsDB. 20261002t : nombre impair de tuiles → la dernière sur toute la largeur (grid-column 1 / -1) ; tuile « ➕ Ajouter » refusée (« illogique »). 20261002u : `img` dans `_G45_ACC_SPORTS` (biathlon.png) = fichier posé directement (mémoire négative 3 h du perso l'avait caché). CONFIRMÉ en capture : MotoGP 4407 et UFC 4443 = images OK.
  20261002z — IMAGES PERSO SUR BET45 : `g45IndexImages` lisait TOUJOURS l'arbre gones45 (`_G45_DEPOT_ARBRE`) → tennis.png (fenotte45
  seulement) déclarée absente sur bet45 ; bloc `_g45IdxDepotBet45` (fin d'app.js) : bet45.fr → arbre fenotte45, ancienne liste et
  « pas d'image » effacés une fois (clé g45_idx_fen). 20261003c : images/equipes/tennis.png (dessin) RETIRÉE de fenotte45 (« moche ») →
  tuile Tennis = image ATP TheSportsDB comme gones ; clé g45_idx_fen2 efface liste + mémoire perso « tennis » une fois. 🎾 JOUEURS DE TENNIS SUR LE MUR (`_g45TennisMurBrancher`) : SONDÉ PAR ANTOINE,
  TheSportsDB searchplayers Sinner / Swiatek / Fils = strSport « Tennis », strTeam « ATP Mens » / « WTA Tour Womens », détouré +
  portrait, pas de fanart → `_G45_VIS_SPORT.tennis`, passe dédiée aux cartes 🎾 (clé g45jv_tennis_<nom>), `_g45JoueurVisLire(nom)`
  sans sport retombe sur la clé tennis, pas de logo de club pour le tennis. Tuile : photo d'un joueur du mur (g.jv) avant l'image de ligue.
  Photos des joueurs dans Résultats tennis : ESPN scoreboard = drapeau seulement (athlete sans headshot, id dans links /id/3666/) ;
  a.espncdn.com/i/headshots/tennis/players/full/<id>.png = image VIDE (SONDÉ PAR ANTOINE, id 3666).
  20261003a (maquette validée « oui ») — PHOTOS DANS RÉSULTATS TENNIS : `_g45EspnTennisFlag` enveloppée → `_g45TenAvatar(a, 32|40)`
  (photo ronde, drapeau en petit en bas à droite, initiales dessous ; 40 px dans le détail `_g45EspnTennisDetail` ; doubles inchangés) ;
  `_g45TenPhotos(racine)` après `_g45RenderTennisRes`, `g45EspnTennisToggle`, `g45TennisBracket` : TheSportsDB searchplayers sur le
  NOM COMPLET ESPN, strSport Tennis, 10 noms nouveaux par passage, 429 = arrêt ; mémoire g45tph1_<nom> trouvée = POUR TOUJOURS
  (demande d'Antoine), rien = 14 j ; image strThumb puis strCutout (www → r2).
  20261003b (« Djokovic sans photo ») : plus de plafond de 10 — la recherche continue tant qu'il reste un rond sans photo à l'écran,
  1 demande / 2,5 s (≈ 24/min), page relue à chaque tour, 429 = pause 60 s.
- 📅 AGENDA (`loadCalendrier`, onglet Agenda) — 20261005b (« il manque peut-être le sport ? », maquette validée « OUI ») : `_agSp(m)`
  (dans loadCalendrier) = rond du sport 44 px (emoji + couleur : 🏒 #5ad6ff, ⚾ #ff9f43, 🏀 #ff7a2f, 🏈 #c084fc, 🏉 #f5c542, ⚽ #1ed760, aussi sur la
  barre de gauche), compétition en nom court (NHL, MLB… ; foot : nom de G45_LEAGUE_GROUPS par slug), m.sp ajouté aux matchs ⭐ hors foot ;
  jours blanc 14 px sur bande sombre, équipes 15 px, heure 15 px.
  20261005d (capture : « Lyon @ Lens » + « OL Lyonnes @ Lens ») : `_calTeamSchedule` (par NOM) rattachait l'équipe FÉMININE du mur au club
  masculin → dans loadCalendrier, équipe ESPN déjà vue sautée (`window._g45CalIdsVus`) et nom féminin (Lyonnes, féminin, women…) sans
  AUCUNE compétition féminine dans son calendrier (.w., women, premiere-ligue, wsl, liga-f…) écarté. Matchs réels des OL Lyonnes : NON ajoutés.
  20261005e (« l'ASVEL et Sotchi n'y sont pas ») : loadCalendrier ajoute 🏀 clubs du mur hors NBA (4 max) → `_g45EbResoudre` +
  `_g45EbCharger(.av)` (Euroleague + Pro A, 21 j) et 🏒 KHL (mur + ⭐ `_g45KhlEquipesSuivies`, `_g45KhlMatchsPlage` 14 j, team_a = reçoit) ;
  mur sans foot mais avec 🏀/🏒 → plus de message « ajoute des équipes de foot ».
  20261007j (capture : « met beaucoup de temps à chercher ») : loadCalendrier lisait TOUT en série (14 équipes foot, 6 scoreboards ⭐,
  Euroleague/Pro A, KHL) → foot (`_agFoot` par équipe), ⭐ (`_agSuivis`, scoreboards en parallèle), basket (`_agEb`) et KHL (`_agKhl`)
  lancés EN MÊME TEMPS, délai max `_agMax` (foot 20 s/équipe, ⭐ 15 s, basket 25 s, KHL 20 s, stats publiques 5 s) ; source trop lente = ignorée.
  Test Chromium (toutes réponses retardées de 0,7 s) : 110 s → 20 s. ⚠ _calTeamSchedule n'est pas surchargeable depuis window (portée).
  CONFIRMÉ par Antoine (capture 10/10 : matchs foot affichés). 20261007k (« le palier actuel du cockpit », maquette validée « oui seulement
  championnat ») : `_agPalier(m)` (dans loadCalendrier) → pastille jaune « 🚀 Palier N · mise X € » sous la compétition ; équipe DU MUR avec
  u.s (pas ⭐), foot, CHAMPIONNAT seulement (slug « fra.1 »… ou nom de ligue, coupes / Europe écartées) ; palier `_g45PalLieu(u, dom|ext)`,
  mise STRATS[u.s][p−1].
  20261008c (capture Agenda : « on a que les paliers foot ») : `_agPalier` pour TOUS les sports — hors foot, match d'une équipe du mur avec u.s
  = championnat sauf Euroleague / Eurocup / coupe / cup / Champions Cup / amical / présaison (testé vm 8/8). ⭐ Suivies toujours sans palier.
  20261008e (capture : Hurricanes / Avalanche / Stade Toulousain sans palier — « nhl rugby baseball nfl ») : ces équipes du mur arrivent par le
  chemin ⭐ (m.suivi + m.sp, isDom juste) → `_agPalier` cherche l'équipe du mur par nom souple (égal, inclus, mot ≥ 5 lettres, ou 6 premières
  lettres : Toulousain ≈ Toulouse ; Toulon ≠ Toulouse) ; matchs suivis À LA MAIN (sans m.sp) toujours sans palier. Testé vm 6/6.
- 🏷️ SPORT SUR CHAQUE PARI (20261005h, « il manque peut-être le sport ? », maquette validée « Oui ») : bloc en fin d'app.js —
  `_g45ParisSport(h)` = h.sport, sinon u.sport de l'équipe du mur (h.n), sinon deviné par h.comp (`_G45_PARIS_COMP`, MotoGP avant F1) ;
  rond `_g45ParisRond(h, px)` (couleurs Agenda `_G45_PARIS_COUL`) au-dessus du logo du book dans `_g45BetRowMini` (Paris filtrés) et
  à la place de l'ancien sportIco (archive, DEUX copies) ; pastille « 🏈 NFL » `_g45ParisCompPastille` dans `_g45LigneMatch`.
- Bandeau de scores `g45BandeauMaj` : si tout tient à l'écran, UNE copie, sans défilement.
- Suivies « Matchs à venir / direct » (`g45DirectMesEquipes`, groupes `_g45DirEquipes`) : 29v —
  le plafond (10) porte sur les REQUÊTES réelles (`aInterroger`, tout le foot = 1 requête `all`),
  plus sur les championnats : les ligues de foot d'Antoine occupaient les 8 places et la NHL
  (Hurricanes id 7, Avalanche id 17, SONDÉ : scoreboard OK, type 2) n'était jamais interrogée.
  29w — tri : un match EN DIRECT passe en tête (avant, `rang['in'] || 3` = 3 → en dernier).
  30o — la KHL n'est plus demandée à ESPN (400 à chaque rafraîchissement, vu en console : sa carte vient du
  site KHL) ; tout championnat en 400/404 est mis de côté pour la session (`_g45DirKo`).
- `espnLeagueOf(nom)` (29w) : une clé courte (≤ 4 lettres : OL, OM, PSG, Roma…) doit être un MOT
  ENTIER du nom. Avant, « OL » dans « CarOLina » / « COLorado » envoyait les équipes NHL du mur
  en Ligue 1 → absentes du bandeau `g45BandeauMaj` (`_g45BandChemin`). Colorado Rapids aussi.
- NOTIFICATIONS, équipes du mur (29x) : `_g45NotifEquipes(p)` sert `g45SyncNotifs` ET son
  enveloppe « paris » (≈ l. 42960). Avant : l'enveloppe renvoyait /psub avec le FOOT SEUL (/psub
  écrase tout) → équipes NHL/NBA/NFL/MLB effacées ; et `_g45ResolveTeam` ne cherche qu'en foot.
  Hors foot : id + championnat depuis `g45TeamsPerso()` (même sport) puis étoile Suivies ;
  rien trouvé = pas envoyée. Détection des buts hors foot : côté Worker (code NON vu ici).
  CONFIRMÉ (capture d'Antoine, 03/10 05:14) : notifications NHL reçues — chaque BUT (« Hurricanes 1-4 Capitals · Aho Goal (sup. num.)
  … — passes … »), « 🎯 Pari — fin du match », « ❌ Pari PERDU », « ⏱️ Fin du match Carolina Hurricanes 2-5 Washington Capitals ».
- PWA gones45 : index.html déclare manifest.json (icônes locales icon-192/512.png,
  display standalone). fenotte45 : manifeste PAS encore déclaré dans indexfenotte.html.
- 20261003e : la fenêtre générique sert AUSSI au foot depuis Suivies (France–Italie) → libellés foot ajoutés à
  `_G45_US_STATS_FR` (Goal Difference, Total Goals, Goals Against…) et « Meilleurs joueurs » traduit par `_g45LdFr` (Matches, Goals,
  Assists, Total Shots). 20261003f : `_genericLineups` enveloppée → foot = terrain `_renderEspnMatchPitch` (changements + banc
  dessous), liste en secours ; autres sports inchangés. CONFIRMÉ par Antoine (03/10).
- « Meilleurs joueurs » de `_renderGenericDetail` (data.leaders ESPN) : 20261007b (« Celebrini et Toffoli c'est qui ? ») — nom + logo de l'équipe
  (tl.team.displayName, logo ou logos[0].href) au-dessus de ses 3 lignes, blanc 14 px sur bande sombre. CONFIRMÉ (capture Ducks / Oilers).
  20261007d (« on voit à peine le chiffre ») : lignes en 14 px, valeur en blanc gras sur pastille.
- Fenêtre de match hors foot (`_renderGenericDetail`) : ligne stade + ville sous le score
  (gameInfo.venue, repli comp.venue), comme la fenêtre foot.
- Saisons (`_g45SaisonsGen`) : « Points par match » et « Stats clés » calculés sur `sf`
  (issu de `liste`, filtrée lieu/repos/phase) et non plus sur `st` (toute la saison).
  Filtre phase `_g45SgPhase` ('tout'|'reg'|'po') sur `m.po`.
  20261005c (capture « 0/50 — WIN + AO0.5 · 0% ») : compteur COMBINÉ (combN) et barre / étiquettes de chaque match (passes) passaient
  TOUTES les clés à `_g45SgCompte`, qui ne connaît pas les clés des curseurs (AO0.5, EU1.5, H-1.5, MT:…) → toujours faux. Hors CLES :
  `_g45MarcheEval(k, _g45SgX(m, sp))`, null = ne bloque pas (comme le foot) ; libellés du compteur lisibles (Victoire + Adv O0.5).
  20261005i (« le nombre de buts, possible de le commencer plus bas ? ») : `_G45_SG_L.hockey.tot` 3,5→7,5 devient 0,5→7,5 ; l'index
  mémorisé (g45_curs_gen_hockey, Match entier) est décalé de 3 une seule fois (drapeau e.h05) pour garder la même ligne.
- `_g45CompetMatchs` : cache `g45cm10_` (20261001r ; g45cm9_ → MORTS) ; le repli scoreboard mensuel (NRL, rugby) pose
  `po` via `_g45ClsEstPO(e)` (slug de saison « …-final-… »). 20261001r — bloc PHASE FINALE (scoreboard seasontype=3 sur
  la fenêtre après le dernier match) : en début de saison il ramenait la PRÉSAISON NHL, marquée « PO » (capture d'Antoine,
  Avalanche) → événement gardé seulement si slug de saison = phase finale (`_g45ClsEstPO`) ou, sans slug, season.type 3.
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
  20261006x (capture : résumé coupé sur « Thatcher Demko ( ») : g45ArticleTraduire avait max_tokens 700 (Groq GPT-OSS raisonne avant
  d'écrire) → 2500 ; finish_reason « length » = Gemini essayé, sinon texte montré avec « ✂️ Texte coupé » et NON gardé ; mémoire lue
  seulement si v:2 (anciennes traductions, peut-être coupées, refaites au prochain appui).
- 🧠 « Analyse IA du match » (refonte 29b) : FOOT `g45LoadMatchAI(btn)` (~l. 30679, bouton
  ~l. 28046 avec data-lg), AUTRES SPORTS + tennis `g45LoadUsAI(btn)` (~l. 31356) ; tous
  (F1, cyclisme, MotoGP aussi) passent par `_g45MultiAI(box, boxId, sys, facts, title)`
  (~l. 30891). Les 3 avis partent EN PARALLÈLE et sont INDÉPENDANTS (Groq en panne ≠ tout
  en panne) : GROQ principal (`g45GroqModele`, vrai nom via `g45GroqLibelle`), GEMINI,
  3e avis cascade `g45GroqCascade` (souvent Qwen) ; puis 4e : Mistral seulement (veille 24 h
  `g45_mistral_veille`). WORKERS AI SUPPRIMÉ en 29r (« on le brûle » : FAVORI N/A, points vides
  ou inventés) — ne pas le remettre ; clé g45_cfai_veille dans _G45_CACHE_MORTS.
  Bloc « 🤝 ACCORD DES IA » `_g45IaAccord` (pronostic regroupé 1/X/2 ou nom, value de
  chacun), cartes `_g45IaCarte` + `_g45IaTexteHtml` (14 px blanc). Avis gardés 6 h
  (`g45ia1_`, `_g45IaCle(title, facts[0])`), bouton « 🔄 Relancer » `g45IaRelancer(boxId)`
  (re-clique le bouton d'origine ; `_g45IaForcer`). Foot : si avis gardé, `_dejaIa` saute
  Sofascore / The Odds API (quotas).
  FAITS FOOT = STATS DE L'ÉCRAN `_g45IaFaitsEcran(eid, lg, iso)` : RÈGLE D'ANTOINE,
  l'équipe qui REÇOIT jugée sur ses matchs À DOMICILE, celle qui SE DÉPLACE sur ses
  matchs À L'EXTÉRIEUR, + FORME GLOBALE (8 derniers, toutes compétitions,
  `espnClubSchedule(nom,null,'all')`) ; saison en cours + précédente côté du match
  (`_g45DomExtCharger`, cache g45_domext1_) ; face-à-face `_g45H2HDepuisResume` ;
  cotes ESPN pickcenter 1X2 + Over/Under avec probas SANS marge calculées par l'appli.
  8 s max par source (`_g45IaDelai`). Consigne : 🎯 PRONOSTIC (confiance /5) / 📊 PROBAS /
  💎 VALEUR (tous marchés, value si +5 pts) / 🔑 POINTS CLÉS chiffrés / ⚠️ ; aucun chiffre
  hors des FAITS.
  29c : GPT-OSS (modèle qui raisonne) coupé après « PROBAS : » avec max_tokens 700 →
  2500 pour Groq ; finish_reason « length » signalé dans l'avis. `_g45IaNettoyer` retire
  les « < … > » et les lignes « REGLE … » recopiées (Workers AI, étiqueté « petit
  modèle, moins fiable »). Ligne The Odds API (Pinnacle) : probas sans marge ajoutées.
  29d (« si il dit pas de connerie, oui ») : `_g45IaIncoherent(txt, facts)` écarte le 4e avis
  Workers AI (ligne « écarté : raison ») si format absent, probas ≠ ~100 % ou à > 20 pts
  des cotes sans marge, consigne recopiée, « a perdu/gagné tous » contredit par les bilans
  nV nN nD des faits, ou > 1 chiffre des points clés absent des faits. Gemini : des 429
  en console sur les premiers modèles de la cascade sont normaux (le suivant répond).
  29e — SONDÉ PAR ANTOINE (Real–Villarreal) : résumé ESPN foot SANS cote (pickcenter
  [null]) → `_g45IaFaitsEcran` lit les cotes dans le scoreboard du jour
  (soccer/<lg>/scoreboard?dates=AAAAMMJJ, event par id : moneyline.home|away|draw,
  total.over|under.close|open.odds, overUnder) ; seules les clés manquantes sont complétées.
  29f — AUTRES SPORTS (NBA, NHL, NFL, MLB, WNBA, rugby, NRL) : `g45LoadUsAI` reçoit
  `_g45FaitsDuResume` (résumé gardé dans `_g45ResumeIA` par `_renderGenericDetail`) +
  `_g45IaFaitsGen(sp, lg, eid, hId, aId, hN, aN)` = mêmes calendriers que le bouton
  Dom/Ext (`_g45CompetEquipes` + `_g45CompetMatchs`, cache g45cm9_, 20 s max) : derniers
  matchs du BON côté, forme globale (8), saison régulière en cours + précédente du bon
  côté avec les lignes des curseurs cochés (`_g45DeStats`/`_g45DeLib`), face-à-face ;
  `_g45IaProbasUs` (vainqueur + total, marge retirée). Même format chiffré que le foot
  (PROBAS en noms d'équipes) ; tennis / MMA gardent leurs règles, sans règle domicile.
  Accord : `_g45IaAccord(liste, titre)` rapproche « Lakers » de « Los Angeles Lakers »
  (dernier mot du nom). Consigne : plus de « (ton estimation ; rappelle celle des
  cotes…) », que Workers AI recopiait.
  29g — couleurs validées : `_g45IaCouleurs(h, "A vs B")` (1 + équipe qui reçoit bleu
  #6d9dff, X gris #c9d3ee, 2 + équipe qui se déplace jaune #f5c542) sur les lignes 🎯/📊/💎
  et l'accord ; 1/X/2 coloré seulement suivi de %, « ( », « = » ou « — » (pas 2-0, 2.5, 4/5).
  29h — xG : SONDÉ PAR ANTOINE, le résumé ESPN d'avant-match n'a AUCUN xG d'équipe
  (goalDifference, totalGoals, goalAssists, goalsConceded). `_g45IaFaitsEcran` les calcule
  depuis les tirs (`g45TirsMatch(slug, id, true)`, cache définitif g45_tirs2_) des 5 derniers
  matchs DU BON CÔTÉ (liste « all » : `_g45IaVue` garde id + slug de compétition) ; 15 s max,
  camp identifié par l'id ESPN dans les tirs ; écart buts − xG ≥ 0,3/match signalé.
  29i — xG dans le bloc Domicile/Extérieur foot (`g45DomExtLancer`, maquette validée) :
  place `<box>-xg-h0|a0|h1|a1` sous chaque cellule ; `_g45DeXgLancer` remplit la saison en
  cours tout seul (`_g45DeXgRemplir` → `_g45DeXgCalc` sur m.espnId + ligue du bloc,
  `_g45DeXgTuiles` : xG pour–contre, Buts − xG vert/rouge, buts marqués) ; saison
  précédente = bouton `g45DeXgBouton(slot)`. xG = FOOT SEULEMENT (ESPN n'en a pas ailleurs).
  29q — F1 / cyclisme / MotoGP (consigne « 🎯 FAVORI », sans PROBAS) : `_g45IaIncoherent(txt,
  facts, sys)` n'exige PROBAS que si `sys` les demande, et accepte FAVORI ; `_g45IaAccord` lit
  PRONOSTIC ou FAVORI (avant : Workers AI toujours écarté, pas de bloc Accord sur ces sports).
  29s — consignes F1 et MotoGP durcies : FAITS UNIQUEMENT (plus de « tes connaissances des
  circuits » : GPT OSS citait « Leclerc en Autriche »), chaque point clé cite un chiffre ou un nom des FAITS.
  29t — accord : hors 1/X/2 et hors noms du titre « A vs B », regroupement par NOM DE FAMILLE
  (« Antonelli » = « Kimi Antonelli »). Faits d'une analyse en console : `_g45IaCtx[boxId].facts`.
  29u — NOTES PERSO (Mémoire stats) : `_g45Accents(t)` répare le texte mal encodé (« rÃ©ussit »),
  dans les faits IA et sur les cartes de stats ; F1 / MotoGP + ampoule 💡 du calendrier F1 :
  `_g45NoteGpOk(txt, lieu)` garde une note seulement si elle ne cite AUCUN GP ou cite CE GP
  (table `_G45_GP_MOTS` pays / ville / circuit, fr + en). Cause : la note d'Antoine « le GP
  d'Autriche ne réussit pas à Ferrari » partait aux IA pour le GP de Malaisie.
  20261002v : le bloc « 💡 STATS DU DICO » de la fiche GP (`g45F1Detail`) n'appliquait NI `_g45NoteGpOk` NI `_g45Accents`
  (capture d'Antoine : note Autriche, « rÃ©ussit », sur le GP de Singapour) → filtrés et réparés (texte + place + contexte).
  29k — tirs / cadrés / corners / possession du bon côté ajoutés aux faits IA (depuis
  `_g45ClsMatchs`, voir Classements ci-dessous).
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
  20261007g (« il y a victoire mais il manque vainqueur ») : type « Vainqueur » (prolongation / TAB compris, sans nul) ajouté après
  Victoire dans MM_TYPES / MM_GROUPES (DEUX copies) et _CP_TYPES ; jugé sur le score final dans `_g45AvJambe` ET le Worker
  (`_g45VerdictJambe`, + regex garantie d'écart) — worker.js complet donné à Antoine, À REDÉPLOYER.
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
- Classements foot, STATS DE MATCH (29k, maquette validée) : SONDÉ PAR ANTOINE, le scoreboard
  foot donne par camp foulsCommitted, wonCorners, goalAssists, possessionPct, shotAssists,
  shotsOnTarget, totalGoals, totalShots (PAS d'arrêts ni de xG). `_g45ClsLireMatch` garde
  m.sh / m.sa = [tirs, cadrés, corners, possession, fautes] (null si absent) ; cache
  g45cls4_ → g45cls5_ (ancien dans _G45_CACHE_MORTS). Catégories `ti`, `tc`, `co`, `pos`,
  `fau` de `_G45_CLS_EQ` ; sélecteur `_g45ClsCtx.stP` ('pour'|'contre'|'tot' = total match ;
  Possession toujours « pour »). Tacles, interceptions, grosses occasions… : PAS dans le
  scoreboard (résumé par match trop lourd, ou propre à FotMob — non utilisable, CGU).
- Classements foot, JOUEURS (29l, maquette validée) : SONDÉ PAR ANTOINE, leaders ESPN foot =
  goalsLeaders, assistsLeaders, goals, assists, shotsOnTarget, yellowCards, redCards,
  foulsCommitted, foulsSuffered, totalShots, accuratePasses, saves — PAS de minutes (aucune
  stat « par 90 », ni xA, dribbles, occasions créées). Ajouts `_G45_CLS_JO` : pr (passes
  réussies), cro (rouges), fc (fautes commises), pen (penalties marqués, source 'b'), xg
  (source 'x' → `_g45ClsTableXg`) : somme des tirs par NOM + club (les tirs n'ont pas d'id
  joueur), csc exclus ; résumé compact par match `g45xgj1_<lg>_<id>` = [[club, nom, xG, xGOT,
  buts, tirs]] (`_g45ClsXgResume` / `_g45ClsXgLire`), tirs complets lus pour l'occasion
  effacés (stockage) ; lecture sur bouton `g45ClsXgCalc(slug, ids)` (3 en parallèle) ;
  tri `_g45ClsCtx.xgTri` ('xg'|'xgot'|'buts'|'diff', xgInv).
  29m (maquette validée, « oui partout ») : TOUS les classements joueurs foot ont une photo
  ronde `_g45ClsAvatar(nom, club, logo)` (bord = g45CouleursDe éclaircie, pastille logo ESPN
  PE.info[id].logo, initiales en attendant) + ligne club `_g45ClsClub` ; photos Wikipédia
  posées après le rendu par `_g45ClsPhotos(body)` (appelé en fin de g45ClsRender si mode jo).
  29n : `_g45ClsPhotoDe(nom, club, budget)` = perso (`_g45ImgPersoLire`, cache seul) →
  Wikipédia → TheSportsDB (`_g45JoueurVisChercher`, thumb puis cut, www → r2 via `_g45R2`) →
  API-Sports (`_g45PhotosFoot(club)` + `_g45PhotoDe`, 5 clubs NON en cache max par affichage) ;
  chaque URL testée par `_g45ClsImgOk` avant d'être posée.
- Classements foot, « ⏱️ Quand ? » (28k) : catégorie `quand` → `_g45ClsTableQuand`
  (au lieu de _g45ClsTableEq) ; calcul `_g45ClsQuandEq(id, liste, mode)` sur m.b
  (m.f seulement) : % 1re MT (minute ≤ 45, 45'+x compris) / 2e MT (reste, prolongation
  comprise), minute moyenne du 1er et du DERNIER but par match (demande d'Antoine :
  pas la moyenne de tous les buts), tranches de 15 min. Contexte : qMode
  ('pour'|'contre'), qTri (m1|m2|prem|der|g, re-toucher = inverser), qOuvert
  (équipe dépliée : histogramme + bouton fiche).
- Classements foot « 🔁 Séries » (28o) : catégorie `serie` → `_g45ClsTableSerie`
  (toute la saison, X.n ignoré) ; `_g45SerieCalc(id, liste, ev, avec)` (série en cours,
  record, % saison) ; événements `_G45_SERIE_EV` ; prochain match + cotes DraftKings
  `_g45ClsProchains(lg)` (scoreboard 14 j → découpé en MOIS par l'enveloppe fetch, car
  les plages de dates ESPN répondent 400) ; `_g45SerieCote` = cote de FIN de série
  (over/under seulement si la ligne DK = la ligne choisie, souvent 2,5 ; victoire / nul
  / défaite) ; filtre sCote (≥ 1,5, demande d'Antoine). Antoine parie sur la FIN des
  séries : ne pas lui refaire la leçon sur le « biais du parieur ».
- ⚠ Script de patch écrit avec l'outil Write : les \uXXXX deviennent de vrais
  caractères ; app.js garde souvent les échappements → recaler les repères.
- News d'équipe (onglet 📰 News, `loadTeamNews`, cache g45news8_) : `_g45FeedFetch` lit
  TOUS les flux en parallèle (Le Monde, France TV, RMC ; foot : + L'Équipe, Maxifoot,
  Foot Mercato — autorisés par host=rss du worker), 5 max par source, tri par date ;
  foot : autres sports écartés (`_G45_AUTRES_SPORTS`). PIÈGES corrigés 28s :
  `_g45SportWord` ne reconnaissait pas l'emoji du mur (⚽) ; `_g45Norm` existe en DEUX
  définitions, la dernière (≈ ligne 42463) COLLE les mots → normaliser aussi les
  mots-clés, et nettoyer à part quand on cherche des mots séparés.
  28t : chaque article a le logo de sa source (favicon Google s2, rond 32 px + filigrane).
- STOCKAGE (28n, mesure d'Antoine : 5731 Ko, saturé) : filet existant « quota →
  _g45FreeSpace() → nouvel essai » (setItem enveloppé + save). `_G45_CACHE_PREFIXES` =
  caches reconstructibles purgeables (jamais g45v5). `_G45_CACHE_MORTS` = clés
  ABANDONNÉES effacées à chaque ouverture (`g45MenageStockage`, 3 s après le
  chargement ; purge préventive au-delà de 4 M caractères). RÈGLE : quand on change
  la version d'une clé de cache (ex. g45cm8_ → g45cm9_), ajouter l'ANCIENNE à
  _G45_CACHE_MORTS et la NOUVELLE à _G45_CACHE_PREFIXES.
- SOCIAL (social.js, dans les DEUX dépôts, chargé avec ?v= depuis 29o ; Supabase DÉJÀ en place
  pour les comptes bet45 : tables bilans, paris, profils, abonnements, INCHANGÉES) — V1 29o,
  maquette validée : partage `g45_soc_partage` ('non' défaut RGPD | 'bilan' | 'tout'), un compte
  qui avait déjà un bilan en ligne passe à 'tout' (`_g45SocInitPartage`) ; `g45SocPartager(mode)`
  ('non' efface bilan + paris, 'bilan' efface les paris) ; publication AUTO `_g45SocAuto` (20 s
  après ouverture puis chaque minute ; si empreinte `g45_soc_sig` changée ET ≥ 10 min depuis
  `g45_soc_der`) ; calcul via `_betSettleEffect` (freebet perdu = 0, mise freebet hors ROI) ;
  potes : « à jour il y a… », 5 derniers (`_g45SocDerniers` sur la courbe), classement 30 j
  (table paris, 10 paris min `_G45_SOC_MIN_CLS`), rafraîchi toutes les 2 min onglet ouvert ;
  tickets `_renderBetTicket` (titre `_g45SocTitre`, date sans heure, freebet) ; formule officielle de prévention (29p, 🔞, SANS logo de l’État).
  IDÉES validées pour plus tard : carte bilan à partager, notifications, récap semaine, ligues.
- VS ÉQUIPES avec radar (30f, maquette validée) : onglet Pari → VS, `runComparateur` appelle d'abord
  `_g45VsV2(n1, n2)` (bloc dans une portée FERMÉE : helpers exposés sur window pour smoke.js) :
  `espnResolveTeam` → ligue, matchs du championnat `_g45ClsMatchs` (moins de 4 matchs → saison
  précédente), `_g45VsAgg` (buts, tirs, cadrés, corners, possession, fautes, Over, BTS, CS, marque
  en 1er, BTS 1re MT, victoires dom/ext), bornes = toutes les équipes de la/des ligues
  `_g45VsBornes` (3 matchs mini), radar `_g45VsRadar` (10 axes `_G45_VS_AXES`, bleu #6d9dff /
  jaune #f5c542), filtres `g45VsMode` ('saison'|'der5'|'domext' : gauche à DOMICILE, droite à
  l'EXTÉRIEUR), xG 8 derniers `_g45VsXg` (g45TirsMatch). Sélection / équipe inconnue / < 2 matchs →
  ancien comparateur inchangé.
  30h (« oui tout ») : réglages `_g45VsAn` (Saison ▾, 0 = auto, `g45VsSaison` relit via _g45VsV2),
  `_g45VsN` (Matchs ▾ : 0 = tous, 5/10/15/20/30, `g45VsNb`), `_g45VsDE` (bouton Dom/Ext, `g45VsDE`) ;
  N derniers COMPLÉTÉS par la saison précédente (`_g45VsListe` / `_g45VsPrec`, lue à la demande),
  sous-titre « 10 (5 + 5 en 2025-26) ». `g45VsMode` gardé pour compatibilité.
  30i (« oui les deux ») — NOUVEAU SÉLECTEUR #g45-vse (l'ancien, équipes du mur, est caché) : sport
  (`_G45_VJ_SPORTS`) → ligue → par côté ÉQUIPE (toute la ligue, `_g45CompetEquipes`) + SAISON
  (`_g45VeSaisons` : foot depuis 2016 — SONDÉ, stats de match ESPN présentes dès 2016 ; US 10 saisons) ;
  même équipe des deux côtés permise. Foot → `_g45VeLancer` construit les T et appelle
  `window._g45VsAfficher(D)` (D.picker : pas de liste Saison sous le radar). US → `_g45VeStatsUS`
  (core …/types/2/teams/<id>/statistics, SONDÉ 2020 et 2026, « catégorie.nom », + ligne de classement
  j/v/bp/bc dans S._R, cache g45vse1_) → gabarits `_G45_VE_GAB` (bords fixes), `_g45VeVals`.
- RADAR JOUEUR foot (30f, maquette validée) : bouton « 🕸️ Radar du joueur » dans `_g45CompoJoueur`
  (Classements joueurs ET Compo) → `g45RadOuvrir(pid, lg, pos)` ; SONDÉ : core …/seasons/<an>/types/0/
  athletes/<id>/statistics (minutes, totalGoals, shotAssists, touches, duelsWon, recoveries…),
  cache g45prad1_ 12 h, < 90 min → saison précédente ; PAR 90 MIN ; gabarits `_G45_RAD_GAB`
  att/mil/def (bords FIXES, pas des centiles), poste deviné `_g45RadDevine` ; « ➕ Comparer »
  `g45RadComparer` superpose le radar suivant.
  20261001k — GARDIEN (maquette validée) : gabarit `gk` de `_G45_RAD_GAB` (arrêts, % arrêts RECALCULÉ = arrêts ÷ (arrêts +
  buts encaissés) car savePct ESPN faux, buts encaissés inversé, clean sheets %, bigChanceSaves, sorties aériennes =
  crossesCaught + punches, longs ballons, % longs ballons, % passes, récupérations ; SONDÉ PAR ANTOINE sur Greif) ;
  `_g45RadDevine` : poste G / GK / Goalkeeper (ou, sans poste, arrêts > 0) → 'gk' ; aussi dans `_G45_VJ_CHOIX.soccer`.
- VS JOUEURS (30g, maquette validée « oui tout ») : bascule `g45VsBascule('eq'|'jo')` posée par
  `initComparateur` en tête de #t-comp (#g45-vs-bascule, boîte #g45-vsj) ; sports `_G45_VJ_SPORTS`
  (⚽ 8 ligues, NBA/WNBA, NHL, NFL, MLB) → équipes `_g45CompetEquipes` → effectif site v2
  …/teams/<id>/roster (`_g45VjRoster`, liste simple OU groupée items[]) → stats : foot
  `_g45RadStats`, US `_g45VjStatsUS` (core types/2, `_g45SgAnAuto` puis an−1 si < 3 matchs, cache
  g45vsj1_, chaque stat en « nom » ET « catégorie.nom ») ; gabarits `_G45_VJ_GAB` (nba, nhlJ, nhlG,
  mlbF, mlbL, nflQB, nflRB, nflWR, nflD ; choix `_G45_VJ_CHOIX`, poste `_g45VjGabPoste`) ; axe sans
  valeur retiré, < 4 axes → message. 30h : Saison ▾ `g45VjAn` (V.an ; `_g45RadStats` et
  `_g45VjStatsUS` acceptent anForce = cette saison seulement, 1 match/minute suffit). 30i — SONDÉ PAR ANTOINE : lanceurs MLB pitching.ERA/WHIP/innings/
  strikeouts/walks/wins/strikeoutsPerNineInnings OK ; NFL défense defensive.totalTackles/soloTackles/sacks/
  tacklesForLoss/passesDefended, defensiveInterceptions.interceptions, general.fumblesForced OK ; coureurs /
  receveurs NFL : 404 sur les joueurs testés, noms rushing.* / receiving.* toujours NON vérifiés.
- CARTE DU MATCH foot (30j, maquette validée, live compris) : bouton « 📊 Carte du match » (« 🔴 … en
  direct » si state 'in') ajouté par `_g45SgCarteTirs` au-dessus de la carte des tirs ; `g45AmOuvrir` →
  `_g45AmCharger` (résumé `_g45AmSum[eid]`, relu site v2 soccer/<lg>/summary?event= ; tirs
  `g45TirsMatch`) → `_g45AmCalc` (xG cumulé, buts pen./csc, grosses occasions = tirs xG ≥ 0,3, stats
  boxscore possessionPct/totalShots/shotsOnTarget/wonCorners/foulsCommitted/yellowCards — CONFIRMÉS par
  Antoine sur Lyon–Rennes 4-0 (capture 30/09) ; repli sur les tirs, ligne absente = retirée ; joueur le plus dangereux = buts + xG) → `_g45AmHtml`
  (course aux xG `_g45AmCourbe`). Direct : relu toutes les 2 min (`_g45AmTimer`, s'arrête carte fermée).
  Partage `g45AmPartager` : `_g45AmSvgPartage` (SVG sans logos) → canvas → PNG → navigator.share / téléchargement.
  30p : la fenêtre foot d'un match en cours est REDESSINÉE toutes les 30 s (`_renderSaisonDetail`, el._refresh) →
  cartes ouvertes retenues (`_g45AmOuvert` / `_g45TirsOuvert`) et rouvertes par `_g45SgCarteTirs` (derniers chiffres
  tout de suite) ; défilement gardé par `_g45GarderDefilement(el, redessiner)` — 30s : hauteur mini GELÉE 4 s (sinon la
  fenêtre #g45-betlive-modal .g45-bl-card rétrécit pendant le rechargement et remonte en haut) + remise en place toutes les
  150 ms, arrêtée si Antoine fait défiler (wheel/touchstart/keydown). Reproduit en test PC (1280×800) : 900 → 37 avant, 900 → 900 après.
  30u (« le fait que ça saute m'énerve sérieusement » — 30s ne suffisait pas chez Antoine : les blocs du HAUT, terrain
  en direct / Carte du match / tirs, étaient recréés 60 ms après le redessin) : `_g45RedessinDoux(el, eid, lg)` prépare
  le nouveau contenu dans une div DÉTACHÉE (tmp._refresh = 1 : pas de 2e minuterie ; _lastScore recopié), puis échange
  d'un coup les enfants de el SAUF le bloc `#g45-tirs-<eid>` (gardé tel quel, avec ses propres minuteries) ; position
  remise dans la même image ; échec réseau = ancien contenu gardé. `_g45GarderDefilement` n'est plus appelé (gardé).
  30v — LA FENÊTRE D'ANTOINE ÉTAIT L'AUTRE : Saisons/Direct ouvre le foot par `_renderGenericDetail` + `_g45SgButeurs`
  (cotes DraftKings, « Statistiques d'équipe ») ; son redessin de 30 s effaçait buteurs / carte / tirs. Son minuteur passe
  aussi par `_g45RedessinDoux(el, eid, lg, rendre)` (tous sports) : tout enfant direct marqué `data-g45garde` est GARDÉ
  (bloc `#g45-tirs-<eid>`, buteurs `#g45-sgbut-<eid>`, absences `[data-g45abs]`) ; puis `_g45SgButeurs(el, lg, eid, sum)`
  met la liste des buteurs à jour SUR PLACE (sum = `_g45ResumeIA`, aucune requête). Blocs du haut sur fond sombre
  rgba(11,16,29,.80), buteurs en 13–14 px.
- PROBABILITÉ DE VICTOIRE (30k, maquette validée) : `_g45WpBloc(data, eid, hN, aN, sport, lg)` dans
  `_renderGenericDetail` (sous `_g45DeuxAvis`). SONDÉ PAR ANTOINE : summary.winprobability [{homeWinPercentage,
  tiePercentage, playId}] en MLB pendant le match ; NFL/NBA/NHL/foot vides AVANT le match (pendant : à vérifier)
  → bloc seulement si ≥ 2 points. Repères de période via summary.plays (playId → period). Cote avant-match =
  `window._g45LastUsOdds` (hDec/aDec, marge retirée). « Ta cote en direct » (`g45WpCote`) → value = ESPN − 1/cote
  (±3 pts). Direct : résumé relu chaque minute tant que #g45-wp-<eid> existe (`_g45WpEtat[eid].timer`).
  30l : échelle EN MIROIR comme ESPN (100 % en haut = club qui reçoit, bleu ; 100 % en bas = visiteur,
  jaune ; 50 % au milieu), ligne colorée par moitié, « ↑ X favoris / ↓ Y favoris » (Antoine ne lisait pas 0→100 %).
- MATCH EN DIRECT « gamecast » (30q, maquettes validées) : ⚽ `_g45LiveFootPoser` (dans `_g45SgCarteTirs`, match
  'in') → `_g45LiveFootMaj` / `_g45LiveFootActions` : SONDÉ PAR ANTOINE, core …/competitions/<id>/plays = TOUTES les
  actions (Pass, Take On, Tackle… ; fieldPositionX/Y départ, fieldPosition2X/2Y arrivée ; team.$ref ; texte
  « Nom (Club) Type at 27' »), pages de 400 → on lit la DERNIÈRE page (+ l'avant-dernière si < 8) ; visiteur retourné
  (x → 100−x) ; types traduits `_G45_LIVE_TYPES` ; relu toutes les 20 s, dernier rendu `_g45LiveHtml` reposé au redessin.
  30r (« ça bouge pas ») : à chaque NOUVELLE action le ⚽ roule le long des dernières actions (animateMotion SVG,
  clé `_g45LiveHtml['k'+eid]`), sinon immobile ; fetch en cache:'no-store' ; ballon borné dans le terrain ; Out / Ball touch traduits.
  30t (« OUI ») : relecture toutes les 10 s (foot et MLB) ; foot = UNE demande d'actions (numéro de dernière page retenu dans
  `_g45LiveFootMem[eid]`, page suivante si pleine, dernières actions vues gardées en file) ; résumé relu 1 fois sur 3 ;
  message `_g45LiveDonnees()` « environ 1 Mo par minute, en 4G préfère le Wi-Fi » (orange si navigator.connection = cellular).
  30v (« on va faire seulement l'action complète de chaque but », maquette validée) : le terrain 10 s n'est PLUS posé
  (`_g45LiveFootPoser` gardé, inutilisé). ⚽ LES BUTS EN ACTION `_g45ButsPoser` (dans `_g45SgCarteTirs` : direct = auto,
  match fini = bouton si score > 0). SONDÉ PAR ANTOINE (Lens–Monaco) : but = scoringPlay (types Goal, Goal - Header, Own
  Goal), « Assist » juste après sans coordonnées, texte « Goal! Monaco 1, Lens 0. Paris Brunner (Monaco) right footed… ».
  `_g45ButsLire` (pages de 400, toutes lues une fois, compactées `_g45ButsCompact`), `_g45ButsSeq` (remonte depuis le but :
  même équipe, adversaire « neutre » ignoré — duel, arrêt, contrôle —, arrêt sur Out / autre action adverse / coup de pied
  arrêté inclus / > 2 min / 12 actions ; csc : équipe créditée = l'autre, tir retourné), rendu `_g45ButsHtml` + `_g45ButsSvg`
  (numéros, flèches, pointillés = conduite, tir rouge, ballon animé une fois ; « ▶ Revoir » `g45ButsRevoir`, repli
  `g45ButsOuvrir`). Direct : toutes les 30 s `_g45ButsMaj` compare le SCORE du résumé déjà chargé (`_g45AmSum`) au nombre de
  buts trouvés — aucune requête si égal ; sinon relit la dernière page. Match fini : cache `g45buts1_<eid>` (permanent).
  20261004y (maquette PC validée « OUI ») — PHOTOS dans « Les buts en action » : enveloppes `_g45ButsPhotosBrancher` de `_g45ButsHtml`
  (→ `_g45ButsPhotosPoser(eid)` après rendu : en-tête buteur 56/72 px + passeur, photo 36 px dans la liste) et de `_g45ButsSvg` (B._pcW ≥ 700 =
  bloc large → `_g45ButsSvgPc` : terrain à la taille réelle, photo DANS le rond, numéro en pastille, nom sur bande sombre ; téléphone inchangé).
  Photos `_g45ClsPhotoDe` (budget API-Sports 2 clubs), mémoire de session `_g45ButsPh`, initiales sinon ; terrain PC redessiné une fois (8 s max).
  20261004z (capture d'Antoine) : nom « saved. Igor Matanovic » (texte ESPN « Attempt saved. Igor Matanovic (Croatia)… ») → `_g45ButsNet`
  (après le dernier « . », aussi via l'enveloppe de `_g45ButsNom`) ; ronds PC qui se chevauchaient → boîtes rond + pastille + nom écartées
  (axe le moins coûteux, 60 tours), flèches raccrochées au rond déplacé si la fin de passe est à < 8 unités du départ suivant.
  20261005a (« C'EST UNE CAGE DE HOCKEY SUR GLACE ? ») : vraie cage `_g45ButsCage` DERRIÈRE la ligne (filet quadrillé, poteaux, barre), des deux
  côtés, + petites surfaces (5,2 % × 36,5→63,5 %) ; PC dans `_g45ButsSvgPc`, téléphone par remplacement du petit rectangle dans l'enveloppe de `_g45ButsSvg`.
  ⚾ `_g45LiveMlbBloc` (dans `_renderGenericDetail`, baseball 'in') : SONDÉ, summary.situation (balls, strikes, outs,
  onFirst/Second/Third, batter, pitcher, lastPlay.id, situationNotes RISP traduite) ; noms via boxscore.players /
  rosters ; manche traduite (Bot 6th → Bas 6e) ; relu toutes les 20 s. NFL / NBA / NHL : à sonder pendant un match.
- FOOT FÉMININ (30m) : groupe « ⚽ Féminin » dans `G45_LEAGUE_GROUPS` (Compétitions, Résultats, Direct) +
  listes VS (`_G45_VJ_SPORTS`). SONDÉ PAR ANTOINE : uefa.wchampions, fra.w.1, eng.w.1, esp.w.1, usa.nwsl,
  fifa.wwc, uefa.weuro = 200 ; ger.w.1 et ita.w.1 = 400 ; Antoine confirme : Frauen-Bundesliga et
  Serie A féminine ABSENTES du site ESPN → ne pas les rechercher. NWSL / CdM / Euro
  dans G45_LIGUES_CIVILES ; D1 / WSL / Liga F comme les hommes (août → juillet, NON vérifié chez ESPN).
  30n : logos manquants des équipes féminines (Classements foot) complétés par `_g45ClsLogosFem(slug, ms)`
  (appelé dans g45ClsRender) avec le logo du club MASCULIN du même pays (`_G45_FEM_HOMMES`, _g45CompetEquipes),
  sur nom IDENTIQUE seulement (`_g45FemNorm`, nom long ou court) : Paris FC ≠ PSG, Saint-Malo reste sans logo.
- 🏀 EUROLEAGUE (30w, maquette validée) : SONDÉ PAR ANTOINE, ESPN n'a NI Euroleague NI Pro A (ligues basket ESPN :
  fiba, NBA, NBA dev/summer, NBL, WNBA, NCAA H/F, JO). API officielle api-live.euroleague.net via le WORKER
  (host=euroleague, ajouté et redéployé par Antoine le 30/09 : chemins /v2|v3/competitions/<X>/seasons/<X><an>… seulement ;
  la saison 2026-27 est refusée en direct navigateur — CORS — alors que 2025-26 passait). /v2/competitions/E/seasons/
  E<an>/games → data[] {gameCode, round, phaseType{code RS…, alias}, played, utcDate, local/road {club{code, editorialName,
  images.crest}, score, partials{partials1..4, extraPeriods}}, venue, referee1..4} (≈ 1 Mo ; 380 matchs 2026-27 au 30/09).
  `_g45ElMatchs(an)` compacte (`_g45ElCompact`), cache `g45el1_<an>` (10 min si match du jour, sinon 2 h) ; saison =
  année de DÉBUT (`_g45ElSaison`, dès septembre). Vues `_g45ElRendre` : Journées `_g45ElJourneesHtml` (par round, journée en
  cours dépliée, match déplié = quarts-temps / salle / arbitres ; format venue et referee NON vérifiés : lus en .name) et
  Classement `_g45ElClassement` (saison régulière RECALCULÉE : V, D, points ±). Branché comme la KHL : tuile dans
  G45_SPORTS basketball, interception de loadCompetTab (Compétitions) ET de g45LoadCalendar (Résultats → Basket).
  « En cours » = non joué et commencé depuis < 3 h (score de la liste, cache 10 min : pas un vrai direct).
  PRO A (30x, « pareil que l'Euroleague ») : MÊME écran (`_g45ElLigue` = 'el' | 'proa', mémoire `_g45ElMem[_g45ElCle()]`,
  tuile slug 'proa' dans la carte Basket, mêmes interceptions). TheSportsDB (id 4423) écarté : clé gratuite = 1 prochain /
  1 dernier / 5 matchs. SONDÉ PAR ANTOINE : serveur api-prod.lnb.fr (celui du site lnb.fr, NON public : peut changer,
  Antoine prévenu), SANS jeton, CORS refusé → worker host=lnb (liste blanche de chemins ; POST quand `post=<json>`,
  corps dans la clé de cache). POST match/getMatchesByCompetitionAndRound {competition_external_id, round_number} →
  data.matches[] (teams[0] = club qui reçoit) — `_g45ProaMatchs` lit par lots de 5 jusqu'à une journée vide, cache
  `g45proa1_<an>` PAR JOURNÉE (jouée entière 7 j, sinon 10 min / 2 h), mémoire des journées `_g45ElMem['proaR'+an]`
  (⚠ pas 'proa'+an : collision avec la clé de liste, bug vu en test). Pas de quarts-temps ni d'arbitres. GET
  match/getCalenderByDivision?division_external_id=1&year=2026 = 10 matchs seulement (semaine en cours + suivante).
  Classement officiel altrstats/getStandingByCompetition = POST qui exige competition_filter_name + round_numbers
  (non utilisé : recalculé). competition_external_id par saison `_G45_PROA_CID` (2026 = 317) : À COMPLÉTER chaque été.
  30y — onglet 📊 Stats (Pro A seulement, maquette validée) : `_g45PsHtml` / `_g45PsLire(an, 'jo'|'eq')` ; SONDÉ PAR
  ANTOINE : POST altrstats/getPersonsLeaders {competitionExternalId, year} (sans year → 400) et getTeamsLeaders
  {competitionExternalId} → 12 catégories (type sPoints…, title FR, items[5] {value, person{first_name, family_name,
  photo.sm}, team{team_name, logo_white.sm}}) ; chemins ajoutés à la liste blanche du worker (redéployé par Antoine) ;
  cache g45proast1_<an>_<mode> 1 h ; boutons `g45PsMode` / `g45PsCat`. % : valeur ≤ 1 × 100 (format NON vérifié) ;
  valeurs = total ou moyenne ? NON vérifié (après 1 journée c'est pareil) → aucun libellé « par match ».
  30z — SAISONS DEPUIS 1987 + PLAYOFFS / LEADERS CUP (maquette validée) : sélecteur Saison ▾ (`g45PaAn`, `_g45PaAn`,
  0 = auto) + boutons Saison régulière / Playoffs / Leaders Cup (`g45PaComp`, `_g45PaComp` 'rs'|'po'|'lc', grisé si
  absent) ; `_g45ElAn()` = saison affichée, `_g45ElCle()` inclut la compétition. SONDÉ PAR ANTOINE : GET
  competition/getStandingCompetitions?division_external_id=1&year=<an>&is_final_show=true → {external_id, name} (2025 :
  302 / 308 Leaders Cup / 311 Playoffs ; 2020 : 12 LC / 18 Jeep ÉLITE / 19 Phase Finale ; 1987 : 260 N1A / 261 Playoffs
  N1A ; J1 = 8 matchs partout). ⚠ 1re de la liste ≠ championnat → tri par NOM (`_g45PaComps`, cache g45proacid1_<an>).
  Cache des journées PAR COMPÉTITION : g45proa1_<cid>, mémoire 'proaR'+cid. Playoffs / LC : tours via
  competition/getCompetitionRounds (NON vérifié pour ces compétitions), sinon 1, 2, 3… ; titre = round_description ;
  pas d'onglet Classement hors saison régulière. Saison finie : dernière journée dépliée. Worker : liste blanche LNB
  élargie à toutes les lectures /(match|competition|altrstats)/get… (redéploiement demandé à Antoine le 30/09).
  `_G45_PROA_CID` ne sert plus que de secours pour 2026.
- 📊 EUROLEAGUE STATS (20261001v, maquette validée « OUI ») : onglet 📊 Stats aussi pour l'Euroleague (avant : Pro A seule) →
  `_g45EsRendre(body, an)` (Pro A garde `_g45PsHtml`). SONDÉ PAR ANTOINE (onglet api-live.euroleague.net) :
  /v3/competitions/E/statistics/players/leaders?seasonMode=Single&seasonCode=E<an>&limit=N (catégories points, rebounds,
  assists, steals, blocks, offensiveRebounds, 2P/3P/FT Percentage ; pir VIDE ; details{name « SHORTS, TJ », imageUrl,
  team{code,name,imageUrl}}, gamesPlayed, average) ; players/traditional E2026 = 0 SAUF phaseTypeCode=RS&statisticMode=perGame,
  E2025 sans paramètre ; teams/traditional E2026 = statisticMode=PerGame (P MAJUSCULE), E2025 sans paramètre. Chaque
  lecture essaie les variantes dans l'ordre (`_g45EsGet`). Noms `_g45EsNom` (« TJ Shorts », « Nando De Colo ») ; vues
  Joueurs (leaders + 📋 Tous : tri + filtre club) / Équipes (points encaissés et écart RECALCULÉS depuis les matchs,
  `_g45EsDefense`). Valeur des catégories % : champ NON vérifié. Cache g45es1_. Worker host=euroleague : liste blanche
  + statistics/(players|teams)/(traditional|leaders) (déployé). CONFIRMÉ par Antoine (captures 01/10) : photos, logos, noms,
  % en « 66.7% » bien lus. 20261001w (validé « OUI ») : les leaders % de l'API mettaient à 100 % des joueurs à 1 sur 1 →
  % JOUEURS RECALCULÉS depuis players/traditional (clé jo2_ avec m2/a2, m3/a3, mf/af par match), minimum de tentatives
  par match `_G45_ES_MIN` (2 pts : 3, 3 pts : 2, LF : 2), ligne « réussis / tentés par match ». % équipes inchangés.
  20261001x — SAISONS PASSÉES Euroleague (maquette validée « OUI ») : sélecteur Saison ▾ 2000-01 → en cours (`g45ElAnSel`,
  `_g45ElAnEl`, 0 = en cours ; `_g45ElAn()` le lit hors Pro A). SONDÉ PAR ANTOINE : games + players/traditional répondent de
  E2000 à E2025. Saison passée : matchs gardés 7 j (g45el1_<an>), stats 7 j. Playoffs : la liste des matchs contient toutes
  les phases (apparaîtront seules) ; stats joueurs de la saison EN COURS lues avec phaseTypeCode=RS → playoffs peut-être
  NON comptés (à vérifier au printemps). Passage à la saison suivante automatique en septembre (`_g45ElSaison`).
- 🏀 ÉQUIPES EUROLEAGUE / PRO A SUR LE MUR (20261001y, demande d'Antoine : « le même principe que Saisons des autres clubs ») :
  bloc en FIN d'app.js `_g45EbBrancher` (enveloppe loadTeamSaisons, _g45CompetEquipes, _g45CompetMatchs, _g45SgMatch, comme la KHL).
  Équipe du mur en 🏀 hors NBA (NBA_TEAMS / resolveNbaTeam) → `_g45EbResoudre(nom)` : noms des clubs Euroleague (SONDÉ PAR ANTOINE :
  /v2/competitions/E/seasons/E<an>/clubs → code, name, abbreviatedName, editorialName, clubPermanentName/Alias ; cache g45eb1_clubs
  7 j) + clubs de la Pro A en cours, comparaison `_g45EbCorrespond` (égalité normalisée ou inclusion ≥ 5 lettres). Panneau générique
  `_g45SaisonsGen` avec perso {sport 'basketball', league 'eb:<code EL>|<code Pro A>', id 'EB'} (UN pseudo-championnat par club :
  _g45SgMem est rangé par sport|lg|an) ; matchs `_g45EbCharger` = Euroleague (toutes phases, _g45ElLigue forcé à 'el' pendant la
  lecture) + Pro A saison régulière + playoffs (_g45PaComp remis) ; m.comp affiché dans Prochains matchs ; quarts-temps hp/ap
  (Euroleague seulement) ; ids 7<an><gameCode> / 8<external_id> → `_g45EbIdx` ; clic = `_g45EbCarte`. Onglet Compo : PAS encore
  (effectif SONDÉ : /v2/competitions/E/seasons/E<an>/clubs/<code>/people → type J joueurs, dorsal, positionName, images.headshot,
  person{name, height, birthDate, country} ; maquette proposée, « oui » non donné). Pro A : effectif non sondé.
- ⛔ PRO A FERMÉE (20261001z) : le 01/10 après-midi, api-prod.lnb.fr répond à TOUT {"success":false,"message":"Authorization
  header missing"} (VU PAR ANTOINE ; worker et appli inchangés, vérifié ligne à ligne). Ne PAS récupérer le jeton du site lnb.fr
  (contournement). lnb.fr : pages vides (données chargées après coup avec ce jeton) ; robots.txt sans interdiction (mal configuré).
  API-Sports basket gratuit (ligue LNB = id 2) : « Free plans do not have access to this season, try from 2022 to 2024 ».
  → tuile Pro A RETIRÉE sur bet45 (`_g45ProaCachee()` : window._g45User ou hôte bet45.fr), GARDÉE sur gones45 pour voir si la LNB
  rouvre (demande d'Antoine). Refus 401/403 → window._g45LnbKo : les équipes du mur ne redemandent plus la Pro A de la session.
  20261002a (« oui ») — équipes Euroleague / Pro A du mur, comme la fiche foot du PSG : `_g45EbHaut(el, R)` (après
  _g45SaisonsGen dans l'enveloppe de loadTeamSaisons) remonte « Prochains matchs » EN HAUT et pose « Filtrer par compétition »
  (Toutes / Euroleague / Pro A, si le club a des matchs dans les deux ; `g45EbComp`, filtre dans l'interception de
  _g45CompetMatchs, _g45SgMem 'basketball|eb:' vidé) ; logo officiel = écusson Euroleague (enveloppe de `_g45HeroLogo`,
  u.logoUrl remplacé comme le badge NRL).
  20261002b — Compo des clubs Euroleague du mur (demandée par Antoine, « aucune compo ») : enveloppe de loadTeamCompo →
  `g45EbCompo(el, R)` : effectif `_g45EbEffectif(code, an)` (clubs/<code>/people, type J + coach E, cache g45eb1_ro_ 12 h),
  postes `_G45_EB_POSTES`, stats par match de `_g45EsJoueurs` (team.code), tri par points. Fond du panneau Saisons :
  écusson `window._g45EbCrestMap[lg]` au lieu du CDN ESPN (EB.png = 404 vu en console). Captures d'Antoine en version y :
  logo absent (corrigé en a, à revérifier) ; bannière de la carte du mur (ASVEL sans image) : À VOIR après Ctrl+Maj+R.
  20261002c (maquette validée « oui ») — ⭐ dans le Classement Euroleague (`_g45ElClassementHtml`, g45SuiviEqEtoile, league
  'euroleague', id = code club ; t.c ajouté à `_g45ElClassement`) ; Suivies « À venir / direct » et « Résultats » : enveloppe de
  g45DirectMesEquipes → `g45ElDirectSuivies` (zone #g45-el-direct, clubs = étoiles + équipes 🏀 du mur reconnues
  `_g45ElCodesSuivis`, à venir −3 h → +7 j, résultats 7 j), cartes `_g45ElCarteDirect`, clic `g45ElDirOuvrir` → `_g45EbCarte`.
  Compo : équipe suivie hors mur reconnue aussi via g45TeamsPerso (sport basketball).
  20261002d (maquette validée « oui ») — FICHE DE MATCH COMPLÈTE `g45ElFiche(m, comp)` (Journées : bouton « 📊 Fiche complète »
  `g45ElFicheId` ; Saisons du mur ; Suivies) : vidéo = g45YT (lecteur DANS l'appli, demande d'Antoine) ; SONDÉ PAR ANTOINE
  /v3/…/seasons/E<an>/games/<code>/stats → local|road {coach, players[{player.person, stats{timePlayed s, valuation, points,
  fieldGoalsMade/Attempted2|3, freeThrows…, totalRebounds, offensiveRebounds, assistances, steals, turnovers, blocksFavour,
  foulsCommited, plusMinus, startFive}}], team, total} → `_g45ElFeuilleLire` (cache g45eb1_f_ 30 j), barres `_g45ElBarre`,
  joueurs triés par minutes ; face-à-face CALCULÉ `_g45ElH2H` (5 saisons). playbyplay / events / comparison / headtohead /
  quarters = 404 → pas de moments forts. Pro A : carte simple.
  CONFIRMÉ par Antoine (captures Panathinaikos–ASVEL 01/10 : stats d'équipe, face-à-face 9 matchs, joueurs, ★ 5 de départ).
  20261002e (« oui ») — écussons sur pastille CLAIRE `_g45ElPastille` (fiche + cartes Suivies ; ASVEL noir illisible) ;
  BANNIÈRE des clubs Euroleague du mur `_g45EbBannieres` (8 s après l'ouverture) : `_g45FanChercher(<nom officiel>, 'basketball')`
  sur chaque nom de la liste Euroleague, image recopiée sous le nom de la carte (g45_fanart2_), un essai / 30 j (g45eb1_fan_),
  sinon écusson (u.logoUrl) en filigrane. Présence de bannières basket chez TheSportsDB NON vérifiée (sonde non faite).
  20261002f (« je vois rien ») — logo perso de l'ASVEL (images/equipes/asvel.png, BLANC sur transparent, 700×700, recolorié
  depuis le fichier d'Antoine) caché par un « pas d'image » mémorisé 3 h avant sa publication → `_g45EbBannieres` reteste le
  dépôt (`_g45ImgPersoTester`) à chaque ouverture pour les clubs 🏀 hors NBA sans image ; sur la carte du mur (DEUX copies du
  rendu, l. ~3105 et ~11455), une image perso images/equipes|joueurs d'une équipe 🏀 = FILIGRANE CENTRÉ (86 %, opacité .6 depuis 20261002h, « fonce »)
  au lieu du plein cadre (un logo carré n'en montrait qu'une tranche).
  20261002g : `_g45ImgPersoTester` ajoute « ?j=AAAAMMJJ » aux adresses testées (404 périmé gardé par le navigateur : l'adresse nue
  échouait, la même avec ?x= passait — console d'Antoine).
  20261002i — VRAIE CAUSE sur le PC : `_g45ImgPersoTester` est ENVELOPPÉ (`_g45BrancherIndexImages`) par une LISTE du dépôt
  (`g45IndexImages`, API GitHub, cache g45_idx_images 6 h) faite avant l'ajout du logo → « absent » sans essayer d'adresse.
  Nom absent d'une liste de plus de 10 min → liste refaite une fois par session (window._g45IdxRefait). CONFIRMÉ par Antoine (PC + téléphone, 01/10).
  20261002j — en-tête de la fiche (enveloppe EB de `_g45HeroLogo`) : logo PERSO du dépôt en priorité, écusson Euroleague en secours
  (noir sur rond sombre, capture d'Antoine).
  20261002k (maquette validée « OUI » : « il manque les équipes à suivre ») — onglet 👥 ÉQUIPES en tête de l'écran Euroleague
  (`_g45ElVue` 'equipes', pas en Pro A) : `_g45ElEquipesRendre(body, g, an)` = clubs de la saison tirés des matchs (`_g45ElClubs`,
  rang + bilan de `_g45ElClassement`), ⭐ `_g45ElEtoile` (g45SuiviEqEtoile, league 'euroleague') ; fiche `g45ElClub(code)` /
  `g45ElClubVue('r'|'e'|'s')` : Résultats (joué → g45ElFicheId), Effectif = `g45EbCompo` (saison EN COURS), Stats `_g45ElClubStats`
  (global / dom / ext, marqués / encaissés par match, 5 derniers). `_g45ElLogo` = pastille claire partout. Onglets en flex-wrap
  (2 × 2 sur téléphone). Contrôle ajouté dans smoke.js (bloc KBO + Euroleague).
  20261003k — EUROLEAGUE EN DIRECT : la liste …/games ne donne le score qu'APRÈS le match (en cours = 0-0, played false) et
  …/games/<code>/stats est VIDE pendant le match (SONDÉ PAR ANTOINE, match 26 ASVEL–Valencia). SONDÉ : live.euroleague.net/api/Header?
  gamecode=<n>&seasoncode=E<an> → Live, ScoreA/ScoreB (A = club qui reçoit), Quarter (« » à la pause), RemainingPartialTime,
  FoultsA/B, TimeoutsA/B. Worker host=eulive (ce chemin seul, cache 60 s) — À DÉPLOYER par Antoine. Appli : `_g45ElMatchs` enveloppée
  (`_g45ElLiveBrancher`) → m.lv via `_g45ElLiveLire` (30 s mini), score du moment dans m.h.s / m.a.s, Live false + score → m.p ;
  carte Suivies « ● QT3 · 05:12 / Pause » (`_g45ElLvTexte`), fiche `_g45EbCarte` « 🔴 EN DIRECT ». Format de Quarter NON vérifié hors pause.
  CONFIRMÉ par Antoine (capture 61-50 « EN DIRECT · Pause », worker redéployé). 20261003l : quarts-temps du direct = ScoreQuarterN
  CUMULÉS (Q1A 33, Q2A 61, Q3A 61, Q4A 0 à la pause) → différences (lv.qa / lv.qb) ; hypothèse vue sur un seul instantané.
  20261003m — FEUILLE DES JOUEURS EN DIRECT : SONDÉ PAR ANTOINE live.euroleague.net/api/Boxscore?gamecode=&seasoncode= (Live,
  ByQuarter = quarts-temps NON cumulés, EndOfQuarter = cumulés → confirme 20261003l ; Stats[0] = club qui reçoit, PlayersStats{Player
  « NOM, PRÉNOM », Dorsal, IsStarter, IsPlaying, Minutes « mm:ss » | « DNP », Points…, Plusminus}, totr = totaux). `_g45ElBoxVersStats`
  → format …/stats → `_g45ElFeuilleLire` + `_g45ElFeuilleHtml` ; `g45ElFiche` enveloppée (m.lv) : relue toutes les 30 s fiche ouverte.
  Worker host=eulive : chemin (Header|Boxscore) — REDÉPLOYÉ et feuille live CONFIRMÉE par Antoine (02/10, « c bon »). QT3 · 09:01 CONFIRMÉ (capture). 20261003n : erreur
  de la feuille live affichée au lieu du « ⏳ » figé.
  20261003o (« le score aussi, ça bouge pas ») : à chaque tour de 30 s, la carte du HAUT (score + quarts-temps) est refaite ; score et
  quarts-temps pris dans le Boxscore (totr.Points, ByQuarter) pour coller à la feuille ; Header = chrono seulement. Cache worker 60 s.
- Classements individuels TOP 14 (`g45LnrRender`, `_G45_LNR_CATS`, page top14.lnr.fr/classement/joueurs/<cat> via
  worker host=lnr) : 20261001a — LA LNR A REFAIT SON SITE (« page reçue mais illisible ») : plus de liens /joueur/ ;
  SONDÉ PAR ANTOINE : JSON dans l'attribut `:ranking` de <players-ranking> (100 joueurs {rank, player{name, url,
  image.original}, club{name, logo}, position, nbPoints, nbTries, nbPenalties, nbDrops, nbConversions,
  nbMatchesPlayed, nbMinutesPlayed}) → `_g45LnrJson(doc, cat)` d'abord, ancienne lecture par liens en secours.
  Cartons : CONFIRMÉ par Antoine (capture : jaunes / rouges lus). Taux de transformation : champ repéré par motif (NON vérifié).
  20261001b — LIFTING (maquette validée) : fond sombre, nom 15 px, club 13 px + logo (club.logo['thumbnail-1x']),
  photo ronde (player.image.original, initiales dessous), podium or/argent/bronze, « · N matchs » (nbMatchesPlayed),
  cartons 🟨 x 🟥 y sans unité, 30 lignes puis « Voir plus » (`_g45LnrPlus[cat]`, 100 max), boutons courts.
- NRL — CLASSEMENTS JOUEURS OFFICIELS (20261001c, maquette validée) : `g45NrlStatsRender(box)` (onglet Individuel ET
  Classements → Joueurs, c.s === '3') ; renvoie false si nrl.com muet → ancien calcul ESPN `g45StatsIndRender` (secours).
  SONDÉ PAR ANTOINE : www.nrl.com/stats/players/data?competition=111&season=<an>&stat=<id> = JSON PUBLIC (la page HTML
  /stats/players/?… renvoie au Worker un formulaire OpenID « login_required » : ne PAS la lire ni contourner la connexion).
  → filterSeasons (2013→2026), filterStats[37], totalStats / averageStats.leaders[50] {firstName, lastName, theme.key,
  theme.logos['badge.png'], headImage (/remote.axd?… relatif), teamName, value (texte), played}. Logo :
  https://www.nrl.com/.theme/<key>/badge.png?bust=<version>. Worker host=nrl (chemin /stats/players/(data)?… seul,
  redéployé par Antoine le 01/10). Réglages `_g45NrlSt` {an, stat, mode 'tot'|'moy', plus} via `g45NrlReg` ; stats
  traduites `_G45_NRL_STATS` ; cache g45nrlst2_<an>_<stat> (1 h saison en cours, 7 j sinon ; g45nrlst1_ → MORTS).
  Logos OK chez Antoine (capture 01/10). Photos : relais nrl.com/remote.axd = initiales chez Antoine → 1001d : adresse
  d'ORIGINE extraite (rugbyimages.statsperform.com/…png, sans ?center=) en premier, relais en secours (data-alt),
  referrerpolicy no-referrer. Résultat NON vérifié (domaines bloqués depuis la session cloud).
- TRANSFERTS (`g45TrfRender`, `g45Transferts`, ESPN site v2 …/transactions?season=&limit=400) — 20261001e, SONDÉ PAR
  ANTOINE le 01/10/2026 : NBA / NHL → `season` = ANNÉE CIVILE (2026 = janv.–sept. 2026, 2027 = 0) alors que
  _g45CompetAnnee donne l'année de FIN → hors foot, année civile en cours par défaut. FOOT : ESPN a ARRÊTÉ (fra.1 /
  eng.1 : sans saison / 2026 / 2027 = 0 ; 2025 = jusqu'au 08/09/2025 seulement) → bandeau « Liste ESPN figée » si
  dernier transfert > 90 j. Aucune source gratuite de transferts foot trouvée (Transfermarkt : CGU, ne pas scraper).
  Plafond 400 par réponse (NHL 2026 atteint) ; pagination `page=` NON vérifiée.
  20261001f — onglet Transferts RETIRÉ pour le foot (demande d'Antoine), gardé pour les autres sports.
- Compo NRL (20261001g, maquette validée) : ESPN = « Aucun joueur renvoyé » (Roosters, rugby-league/3 id 289204) →
  `g45NrlCompo(el, nom)` appelé en tête de `_g45CompoEffectif` si ctx.sp === 'rugby-league' (sinon ancien chemin ESPN).
  SONDÉ PAR ANTOINE : www.nrl.com/players/data?competition=111&team=<id> → filterTeams[18] (ids dans `_G45_NRL_EQ`,
  club retrouvé par SURNOM dans le nom ESPN, `_g45NrlEqId`), profileGroups[0].profiles[] {firstName, lastName, position,
  bodyImage /remote.axd?http://rugbyimages.statsperform.com/Player%20Bodyshots/…, url}. Worker host=nrl élargi à
  /players/data (redéployé, 33 joueurs Roosters vérifiés). Postes traduits `_G45_NRL_POSTES` ; photo = portrait
  DÉDUIT (Bodyshots → Player%20Profile%20Headshots) : CONFIRMÉ par Antoine (capture Panthers). Cache g45nrlsq1_<id> 24 h.
  20261001h — STATS DU JOUEUR DANS BET45 (maquette validée « OUI ») : toucher un joueur déplie `g45NrlJoueur(k, id)`
  (titres de poste sur bande sombre). Fiche nrl.com : …/data = 404 et HTML bloqué → SONDÉ PAR ANTOINE :
  /draw/data?competition=111&season=<an>&team=<id> (29 matchs Panthers d'un coup ; matchMode 'Post', matchState
  'FullTime', matchCentreUrl) puis <matchCentreUrl>data → stats.players.homeTeam|awayTeam[] {playerId, minutesPlayed,
  allRunMetres, allRuns, lineBreaks, offloads, missedTackles, errors, conversions, kickMetres…} + homeTeam.players
  (noms ; présence de playerId À CONFIRMER). Somme saison = `_g45NrlEquipeStats` (4 feuilles à la fois, compteur
  « Match n/N »), feuilles compactées POUR TOUJOURS g45nrlm1_<url>, calendrier g45nrldr1_<an>_<id> 1 h ; saison =
  année civile, aucun match fini → an − 1. Libellés `_G45_NRL_JS` (tries / tryAssists / tacklesMade / tackleBreaks /
  penalties : CONFIRMÉS par Antoine — capture Dylan Edwards, toutes les lignes présentes). Worker : /draw/data et
  /draw/…/data ajoutés (redéployé).
  20261001i — LOGO DES CLUBS NRL (en-tête, `_g45HeroLogo`) : TheSportsDB avait donné aux Panthers une panthère au ballon
  de BASKET → si le club est NRL (sport du mur contenant 🇦🇺, ou équipe perso rugby-league) et reconnu par `_g45NrlEqId`,
  badge officiel https://www.nrl.com/.theme/<surnom>/badge.png, qui REMPLACE un logo mémorisé (u.logoUrl). Carolina
  Panthers (🏈) non touché. Surnoms à 2 mots → tiret (sea-eagles, wests-tigers : NON vérifié).
- Compo TOP 14 (20261001l, maquette validée) : ESPN = « Aucun joueur renvoyé » (rugby/270559) → `g45T14Compo(el, nom)` en tête
  de `_g45CompoEffectif` si ctx.sp === 'rugby' (sinon chemin ESPN). SONDÉ PAR ANTOINE : top14.lnr.fr/club/<slug>/effectif-staff
  (worker host=lnr) = HTML sans JSON, <a class="player-block"> : .player-block__player-img (photo cdn.lnr.fr …/photoFull.<hash>
  SANS extension — la console Chrome raccourcit l'adresse avec « … », elle est entière), __name, __position (8 postes
  `_G45_T14_POSTES`), __country (alt = pays, src = drapeau), __statistics « N matches joués / N minutes jouées / N points
  marqués » ; lecture `_g45T14Lire`. Slugs `_G45_T14_CLUBS` / `_g45T14Slug` (toulouse, toulon, pau, lyon, montpellier,
  clermont, bayonne, castres, vannes, racing-92, paris, la-rochelle, perpignan, bordeaux-begles). Cache g45t14sq1_<slug> 12 h.
  Pro D2 : NON fait (prod2.lnr.fr autorisé par le worker, slugs non sondés).
  20261001o — LOGOS Top 14 dans Classements → Équipes (`_g45ClsRenderRugby`, c.s 270559) : ESPN donnait un drapeau US à
  Perpignan et rien à Bayonne (captures d'Antoine) → `_g45T14Logos()` relève les cdn.lnr.fr/club/<slug>/photo/logo… de
  top14.lnr.fr/classement (motif vu sur prod2 ; page top14 NON sondée), cache g45t14lg1 7 j ; nom ESPN → slug `_g45T14Slug`.
- 🏉 PRO D2 (20261001m, maquette validée) : ESPN ne l'a pas → tuile slug 'prod2' (Compétitions → Rugby → Clubs, après Top 14,
  `_g45Pd2Brancher` enveloppe loadCompetTab si _g45CompetSport 'rugby' et _g45CompetSel 'prod2' ; PAS dans Résultats). Site
  prod2.lnr.fr via worker host=lnr&lnrhost=prod2.lnr.fr. SONDÉ PAR ANTOINE : /calendrier-et-resultats → <filters-fixtures
  :current-week {slug « j6 », name, edition_id} :current-season {name « 2026-2027 »} :filter-list> (index `_g45Pd2Index` ;
  liste des journées cherchée dans filter-list, NON vérifiée → repli j1…j30) ; /calendrier-et-resultats/<saison>/<jN> →
  .match-calendar-line (2 .club-line, 1re = reçoit ; __name, __rank, __icon-img ; .match-line__score-wrapper « 41 - 26 » ou
  « 21h00 ») → `_g45Pd2Journee` (titre du jour : texte « Vendredi… » au-dessus, NON vérifié) ; /classement = HTML DANS un
  <template> (DOMParser n'y entre pas → `_g45Pd2Doc` remplace template par div) : .table-line--ranking-fixed (rang, logo) +
  --ranking-scrollable (club | Pts | M | G | N | P | Bonus | Pts M. | Pts E. | Diff | forme | prochain) → `_g45Pd2Classement`
  (OFFICIEL : bonus offensif non recalculable). Rendu `_g45Pd2Rendre`, `g45Pd2Vue('j'|'c')`, `g45Pd2Sem(slug)`.
  Cache g45pd2_ (index 1 h, classement 10 min, journée finie 7 j sinon 10 min). Plus tard : effectifs Pro D2, saisons passées.
  20261001n — FENÊTRE DE MATCH (maquette validée) : match JOUÉ cliquable → `g45Pd2Match(i)` (liste `_g45Pd2.M`) lit la
  feuille /feuille-de-match/<saison>/<jN>/<id-a-b> + /statistiques-du-match → `_g45Pd2Feuille`. SONDÉ PAR ANTOINE (Brive–
  Colomiers) : <header-timeline :game-facts> [{type Point|Exclusion joueur, subtype Essai|Pénalité|Jaune…, club home|away,
  period, minute, additionalMinute, score [dom, ext] APRÈS l'action, player{firstName…}}] (PAS de transformations ; nom de
  famille du joueur : lastName NON vérifié) ; <video-block :item {title « Résumé » (accents décomposés), url
  geo.dailymotion.com/player.html?video=…}> ; stats : 2 × <players-ranking :ranking> {player{name, image.original},
  position, tempsJeu, nbPoints, nbEssais, offload, lineBreak, totalSuccessfulTackles, nbCartons*} (1er = reçoit, NON vérifié).
  Mi-temps = score du dernier fait de la période 1. Rendu `_g45Pd2MatchRendre`, équipe `g45Pd2Eq`, vidéo `g45Pd2Video`
  (iframe ; CSP frame-src + geo/www.dailymotion.com dans index.html ET indexfenotte.html). /compositions : pas de JSON,
  non utilisé. Cache g45pd2_f_<chemin> 30 j (5 min si pas fini).
  20261001p — onglets 📈 Forme (maquette validée) et 🏅 Classements Équipes / Joueurs (comme le Top 14, demande d'Antoine) :
  `_g45Pd2Stats(z, I)` ; matchs joués de j1 → journée en cours `_g45Pd2Tous` (lots de 4, même cache que Journées) ; lignes
  par club `_g45Pd2Equipes(ms, lieu 'g'|'d'|'e', n)` (pp = 4 V + 2 N, v12 = victoire > 12 pts, bd = défaite ≤ 5 pts) ;
  catégories `_G45_PD2_CAT` / `_g45Pd2Val` ; réglages `_g45Pd2S` via `g45Pd2Reg` (nF Forme = 5, nS Classements = saison).
  Mi-temps (mène à la pause, 1re MT, 2e MT) : ABANDONNÉ (Antoine : « on laisse tomber »). Joueurs : `g45LnrRender` sur une
  boîte data-lnrhost="prod2.lnr.fr" (`_g45LnrPage(chemin, hote)`) ; SONDÉ : players-ranking identique au Top 14.
  20261001q — onglet 👥 Équipes EN PREMIER (maquette validée, « placer 1er ») : `_g45Pd2Clubs` (16 clubs du classement
  officiel, club = SLUG de son logo `_g45Pd2Slug`) → fiche dans l'écran Pro D2 `_g45Pd2Fiche` (`g45Pd2Club`, `g45Pd2ClubVue`
  'r'|'e'|'s') : Résultats (`_g45Pd2Tous(I, null, true)` = matchs à venir + journée suivante), Effectif = `g45T14Compo(el,
  nom, 'prod2.lnr.fr', slug)` (SONDÉ : page effectif-staff identique, Brive 52 joueurs ; cache g45t14sq1_p2_<slug>),
  Stats Global / Domicile / Extérieur (`_g45Pd2Equipes`).
- 🔥 CARTES DE CHALEUR foot (20261001j, maquette validée) : bouton posé par `_g45ChPoser` dans `_g45SgCarteTirs` (match 'in'
  ou 'post', avant le bouton des tirs) → `g45ChOuvrir` (2e appui = refermer) relit les actions avec `_g45ButsLire` (mêmes
  pages que « les buts en action », `_g45ButsMem`) → `_g45ChRendre` (équipe bleu / jaune, joueurs triés par nombre
  d'actions, `g45ChChoix`) → `_g45ChCanvas` (densité gaussienne, jaune → orange → rouge, terrain vert clair dessiné AVANT).
  VÉRIFIÉ PAR ANTOINE contre Sofascore (Tolisso, Openda) : largeur RETOURNÉE (y → 100 − y) ; chaque équipe attaque vers x = 100.
- ⚾🇰🇷 KBO (20261001s, maquette validée « yes we can ») : tuile slug 'kbo' (Compétitions → Baseball, après MLB),
  `_g45KboBrancher` enveloppe loadCompetTab (_g45CompetSport 'baseball' + _g45CompetSel 'kbo'). koreabaseball.com ÉCARTÉ
  (robots.txt « Disallow: / » + « collecte automatique interdite sans autorisation », SONDÉ PAR ANTOINE — ne pas y revenir,
  même si /ws/Main.asmx/GetKboGameList et /ws/Schedule.asmx/GetScheduleList renvoient du JSON). Source = mykbostats.com
  (site de FANS ; robots : tout permis sauf /stats/compare/, Crawl-delay 5) via worker host=mykbo (À AJOUTER par Antoine,
  liste blanche : /games, /games/<n>-…, /schedule/week_of/<date>, /standings, /stats/top/<cat>, /stats/team_splits,
  /teams/<n>-<Nom>). HTML seulement (standings.json / games.json = 404). SONDÉ : cartes a#game-line-<n>
  (data-game-datetime UTC, 1re ligne = VISITEUR, 2e = club qui REÇOIT, « Final ») ; semaines du MARDI
  (/schedule/week_of/…, liens ◀ ▶ lus dans la page) ; feuille : div.scoreboard (en-tête « '' 1…9 '' R H E B », lignes
  dont la 1re case a la classe team), tables frappeurs (AB) / lanceurs (ERA + IP) / notes (Deciding Hit, HR, 2B…).
  Lecture : `_g45KboTable` (alignement depuis la cellule du NOM : lien /players/, sinon /teams/, sinon 1re avec lettres ;
  « Rank » sauté côté en-têtes), `_g45KboSemaine`, `_g45KboFeuille`, `_g45KboClassement`, `_g45KboEquipe`,
  `_g45KboLeaders` (colonne affichée = 1re après Team, NON vérifié), `_g45KboSplits`. Vues `_g45KboRendre`
  (Équipes → fiche Effectif / Résultats, Matchs par semaine + feuille dépliée `g45KboMatch`, Classement officiel, Forme =
  L10 + série du classement + pastilles des 3 dernières semaines `_g45KboRecents`, Classements Équipes (team splits) /
  Joueurs (9 catégories `_G45_KBO_CATS`)). Cache g45kbo1_ (classement 10 min, semaine finie 7 j, feuille finie 30 j,
  effectif 6 h, stats 1 h). NON vérifié : texte d'un match en cours / annulé. Logos chargés depuis mykbostats.com.
  20261001t — PHOTOS (maquette validée « OUI ») : SONDÉ PAR ANTOINE, l'effectif a <img data-player-photo
  src="/photos/player/<id>/<n>.jpg?v=…"> dans la cellule du nom → `_g45KboTable` sépare o.ph (photo) de o.l (logo).
  Effectif en cartes (photo ronde 44 px `_g45KboAvatar`, bord = `_g45KboCoul` (teintes NON vérifiées), initiales dessous),
  postes traduits `_G45_KBO_POSTES` (CP = closeur). Photos aussi dans Classements joueurs (40 px) et feuille de match
  (28 px) SI le site en donne (NON vérifié). Clés de cache eq2_ / top2_ / m2_ (anciennes sans photo).
  20261001u — SAISONS PASSÉES (maquette validée « OUI ») : sélecteur Saison ▾ (`g45KboAn`, _g45Kbo.an, 0 = en cours) ;
  années lues dans <select id="stats_year"> de /stats/top/hr (`_g45KboAnsLire`, cache 24 h). SONDÉ PAR ANTOINE :
  /stats/top/<cat>?year= et /stats/team_splits?year= OK ; /standings?year|season= et /teams/<id>?year= IGNORÉS ;
  /schedule/week_of/<date> OK pour 2024/2025. Saison passée : Classement RECALCULÉ `_g45KboClsDepuisSplits` (pas de
  série), Équipes et Forme grisés, Matchs = semaine du mardi ≤ 30/09 (`_g45KboSemFin`). « Rained Out » → (pluie).
  Worker : ?year=AAAA ajouté à la liste blanche host=mykbo (déployé). CONFIRMÉ « ça marche » par Antoine (01/10).
- KHL Saisons, liste de résultats en retard (vu par Antoine le 01/10, HC Sotchi) : la lecture par étape `_g45KhlMatchsStage`
  (events_v2 + stage_id) s'arrêtait au 28/09 (96 matchs, aucun à venir) alors que `_g45KhlMatchsPlage` (par dates, Suivies) était
  à jour ; RÉSOLU SEUL quelques minutes plus tard (retard côté KHL). Si ça revient : compléter la lecture par étape avec
  `_g45KhlMatchsPlage(dernier match − 2 j, maintenant + 21 j)` quand enCours (correctif écrit puis jeté le 01/10).
- Score d'un pari : `_g45ScoreTexte`, cache `g45_score4_<id>` (négatif gardé
  2 h) — effacé par `saveBetEdit` pour relancer la recherche.
  Score = {hs: DOMICILE, as: EXTÉRIEUR} ; la ligne du pari (`_g45LigneMatch`) met le club qui reçoit À GAUCHE d'après la fiche
  `_g45MatchMeta` (ESPN, `_g45EclairTrouver`, cache g45_mmeta2_). 20261003p (capture d'Antoine : « Washington 2-5 Carolina », vrai
  5-2 pour Washington) : aller-retour de présaison NHL deux soirs de suite → la fiche prenait le match du LENDEMAIN (scoreboard de
  la date du pari lu en premier). `_g45EclairTrouver(c, jour, heure)` : avec l'heure, garde le match au coup d'envoi le plus proche
  de l'heure du pari (3 jours parcourus) ; fiches US (🏒🏀⚾🏈) effacées une fois (clé g45_mmeta_us1).
  20261003q (« toujours pareil ») : NHL — le cache du score garde md (mon équipe recevait ? d'après homeTeam.abbrev de l'API NHL,
  match le plus proche de l'heure du pari via startTimeUTC) ; `_g45LigneMatch` le fait passer AVANT la fiche ESPN et h.domicile.
  Scores NHL sans md relus une fois par session (`_g45MdTente`, ancien score gardé si la relecture échoue `_g45MdAncien`).
  20261006v (capture : Jets–Avalanche 09/10 01:30 sans score) : négatif « pas trouvé » écrit < 5 h après le coup d'envoi (h.date + h.heure)
  = nouvel essai au bout de 10 min (avant : 2 h, un score cherché pendant le match restait vide). Cause exacte chez Antoine NON confirmée.

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
  Aperçu hors séance : `g45F1Apercu()` en console.
  20261003y — tableau ABSENT sur téléphone pendant les qualifs (capture d'Antoine, PC OK) : `_g45F1LiveStart` ne lisait /f1live
  qu'à l'ouverture de la fiche (ouverte avant la séance ou pendant une pause Q1/Q2 → rien, pour toujours). Enveloppe `_g45F1Veille` :
  /f1live relu chaque minute tant que la fiche est ouverte ; séance de CE GP en direct et rien ne se rafraîchit → `_g45F1OffDemarrer`. CONFIRMÉ (« c'était juste long »).
  20261003z (« oui tu peux ») — QUALIFS EN 3 MANCHES : SONDÉ PAR ANTOINE (archive TimingData.json d'une qualif 2026 ; l'archive du
  jour n'est publiée qu'après coup, Path absent d'Index.json) : racine SessionPart 1|2|3, NoEntries [22,16,10], CutOffTime ; par
  pilote KnockedOut, BestLapTimes[] (une case par manche). Worker /f1live : sess.part, sess.entrees, p.ko (À REDÉPLOYER). App
  (`_g45F1OffHtml`) : « · Q2 » (SQ en sprint), éliminé grisé « Éliminé Q1/Q2 » (manche d'après place > NoEntries[1|2]), ligne rouge
  « Zone d'élimination » sous la place NoEntries[part] en Q1/Q2.
  20261004f (« la F1 manque juste ça », comme F1 Pulse ; « ok ») — 🗺️ CARTE EN DIRECT ESTIMÉE : GPS des voitures = F1 TV seulement depuis le GP
  des Pays-Bas 2025 ; F1 Pulse affiche un tracé SANS données de position (leur « important notice ») → position ESTIMÉE depuis les
  mini-secteurs de /f1live (`_g45F1CtPasses`, `_g45F1CtBornes`, `_g45F1CtPos` : début du mini-secteur franchi + temps écoulé × tour de réf /
  dernier tour, plafonné). TRACÉ : SONDÉ PAR ANTOINE (OpenF1 qualifs Malaisie 11730 : laps → meilleur tour, duration_sector_1..3,
  location?…&date>&date< = 373 points) → `_g45F1TraceLire(ev)` (séances finies du week-end, qualifs d'abord), cache PERMANENT
  g45f1tr1_<circuit> ; pendant une séance OpenF1 = 401 → il faut avoir ouvert la fiche du GP une fois HORS séance. Bloc #g45-f1-carte
  posé AVANT #f1-live (`_g45F1CtPoser`, enveloppe de `_g45F1OffDessiner`), animé 4 fois/s pendant le direct, bouton `g45F1CarteBasculer`
  (clé g45_f1carte) ; stand / abandon listés sous la carte. Sens du tracé CONFIRMÉ (aperçu comparé à F1 Pulse) ; justesse des positions NON vérifiée.
  20261004g (« oui ») — VOIE DES STANDS : SONDÉ PAR ANTOINE OpenF1 pit?session_key=11730 (81 passages {date, driver_number, lane_duration
  souvent null}) + location autour du passage (251 points) → `_g45F1PitVoie` (plus longue suite de points à > 6 m du tracé), tr.pit ; cache
  g45f1tr2_ (g45f1tr1_ → MORTS). VIRAGES : MultiViewer via worker host=mv (/api/v1/circuits/<clé>/<an>, cache 7 j) — SONDÉ : corners
  [{number, angle, trackPosition{x,y}}], rotation, x[], y[] ; PAS de Malaisie (clé 12), aucune année 2026 dans la liste → `_g45F1Virages`
  essaie l'année puis 6 ans en arrière (g45f1mv1_<clé>) ; clé = /f1live sess.cle (worker). Repère MultiViewer = repère OpenF1 : NON vérifié
  (à voir à Austin). Zones d'aileron (pointillés rouges de F1 Pulse) : aucune source gratuite trouvée.
  20261004h — OpenF1 429 « Too Many Requests » (capture d'Antoine) : demandes du tracé espacées de 1,2 s, 429 → attente 4/8/12 s ; tracé
  absent → nouvel essai toutes les 60 s (5 fois) tant que la fiche du GP est ouverte.
  20261004i (« OUI ») — PLAN DU CIRCUIT dans la fiche du GP (`_g45F1Map` enveloppée, `_g45F1PlanBrancher`) : l'image Wikipédia s'affiche
  d'abord puis est remplacée par une boîte sombre « 🏁 Tracé du circuit » `_g45F1PlanSvg(tr, mv)` : 3 secteurs rouge / bleu / jaune (tr.D),
  voie des stands pointillée, ligne de départ, virages ; tracé OpenF1 (`_g45F1TraceLire`, clé circuit_key `_g45F1CleOF1`) sinon contour
  MultiViewer `_g45F1MvLire` (g45f1mv2_). Aucun tracé (GP pas encore couru, pas de MultiViewer) → image Wikipédia gardée.
  20261004j (« OUI ») — SAISONS PASSÉES F1 : sélecteur Saison ▾ 2010 → en cours sous le titre de `g45F1Open` (`_g45F1AnSelect`, `g45F1An`) ;
  `_g45F1AnSel()` donne l'année à `g45F1Open` ET `g45F1Standings` (Jolpica) ; window._g45F1An (0 = en cours) remis à 0 par l'enveloppe de
  loadResultatsTab, `g45DirectF1` et `g45GoF1`. SONDÉ PAR ANTOINE : ESPN scoreboard?dates=2025 / 2020 / 2010 = 24 / 17 / 19 GP.
  20261004k — SONDÉ PAR ANTOINE : 2005 / 1995 / 1990 / 1980 / 1970 / 1960 / 1950 = 19 / 17 / 16 / 14 / 13 / 10 / 7 GP → `_G45_F1_AN_MIN` = 1950.
  20261004l — fiche d'un GP PASSÉ (enveloppe `_g45F1PasseBrancher` de g45F1Detail) : ESPN recopie le circuit ACTUEL sur les vieilles courses
  (France 1950 = « Paul Ricard » au lieu de Reims, capture d'Antoine) → ligne 📍 refaite depuis Jolpica ergast/f1/<an>.json (`_g45F1JolCircuits`,
  cache permanent g45f1jc1_<an> ; `_g45F1JolProche` = course à ≤ 4 j de la date ESPN) ; « Analyse IA du GP » et « Résumés vidéo » retirés.
  20261004m : ligne 📍 de la fiche GP et légende « Tracé du circuit · Wikipédia » en blanc 13–14 px sur bande sombre (illisibles sur la photo de fond).
  20261004n — DRAPEAU ROUGE sur la carte estimée (capture d'Antoine, Malaisie tour 1 : F1 Pulse = voitures dans la voie des stands, nous = 4
  pastilles figées sur la piste) : enveloppes `_g45F1CtRougeBrancher` de `_g45F1CtSvg` / `_g45F1CtDessiner` — j.piste.s === '5' → voitures rangées
  sur tr.pit (leader côté sortie), sinon alignées avant la ligne ; bandeau « 🟥 Drapeau rouge ».
  20261004o — « pas de pluie » affiché pendant un départ retardé par la pluie : la case ne lisait que WeatherData.Rainfall (pluviomètre
  officiel, resté à 0) → `_g45F1PluieRc(j)` lit aussi les messages de course j.rc des 90 dernières min (RAIN, WET, SLIPPERY… → « 🌧️ pluie
  (direction de course) » ; RISK OF RAIN seul → « 🌦️ risque de pluie »). Textes exacts des messages de pluie NON vérifiés.
  20261004p (« obligé de faire g45F1Apercu() à chaque fois sur le PC ») : pendant le retard pluie / drapeau rouge, statut ≠ Started|Aborted|
  Suspended (« Dernier état connu ») → aucun tableau, aperçu non rafraîchi. `_g45F1OffActif(j)` = séance pas finie (≠ Finished|Finalised|Ends)
  utilisé par _g45F1LiveStart, _g45F1OffDemarrer (relecture 5 s) et la veille ; la veille ne s'efface plus devant la boucle OpenF1
  (_g45OF1.timer, bloquée en séance) : _g45F1LiveStop puis tableau officiel. Statut exact pendant le retard NON vu (« Inactive » supposé).
  20261004q (« roule 3 secondes et s'arrête », « les pastilles s'arrêtent puis font un bond ») : `_g45F1CtPos` plafonnait l'estimation à la fin
  du mini-secteur (2-4 s) alors que /f1live arrive toutes les 5 s + cache 5 s → enveloppe `_g45F1CtLisseBrancher` : estimation jusqu'à 12 s après le
  dernier mini-secteur, position AFFICHÉE lissée (`_g45F1CtLisse` : rattrape à 1,6 ×, jamais en arrière, en avance → 0,3 × et 3 s max, recalage si
  écart > 20 s). CONFIRMÉ par Antoine pendant la course de Malaisie (« c'est beaucoup mieux »).
  20261004r (« manque des voitures ») : les voitures d'un même mini-secteur, changé dans le même instantané, tombaient au MÊME point (VER caché
  sous ANT) → en COURSE, cible = estimation du LEADER (`_g45F1CtBrut`) − écart GapToLeader (`_g45F1CtGap`, « +2.451 » / « +1:02.3 ») × vitesse
  (`_g45F1CtVit`) ; « 1 LAP » / leader / hors course = mini-secteurs comme avant ; même lissage.
  20261004s (maquette validée « oui », idée d'Antoine) — COULEUR DE LA PISTE sur la carte (`_g45F1CtCouleurBrancher`, enveloppes de
  `_g45F1CtSvg` / `_g45F1CtDessiner`) : j.piste.s 2 / 4 / 6 / 7 → tracé jaune #f5c542, 5 → rouge #ff4545, sinon blanc ; bandeau « 🚗 Safety car
  en piste » / « VSC » / « Fin de VSC ». Toute la piste (secteurs de commissaires ≠ notre tracé).
  20261004t (« quand une voiture va au stand rien le dessine ») : enveloppe `_g45F1CtStandBrancher` de `_g45F1CtSvg` — voiture p.stand dessinée
  DANS tr.pit (bord blanc pointillé), avance de l'entrée vers la sortie en ≈ 25 s (`_g45F1CtStand[n]` = heure d'entrée, effacée à la sortie),
  puis attend près de la sortie ; drapeau rouge inchangé ; sans voie des stands connue : liste « Au stand » seule.
  20261004u (maquette validée « OUI ») — RETARDATAIRES : `_g45F1CtRetardBrancher` (enveloppe de `_g45F1CtSvg`) : GapToLeader « 1 LAP » / « 2 LAPS »
  (`_g45F1CtTours`) → pastille opacité .6 + « +1T » ; drapeau bleu (`_g45F1CtBleus` : j.rc drapeau BLUE, numéro après « CAR », < 60 s ; format du
  message NON vérifié) → liseré bleu #3b82ff. Placement des retardataires inchangé (choix 1, écart à la voiture devant, NON retenu).
  20261004v (« c'est chiant de devoir lire la carte avant », essai sur bet45) — TRACÉ PARTAGÉ : nouvelle route worker /f1trace?c=<clé g45f1tr2_…>
  (GET = tracé déposé, POST texte JSON = dépôt ; D1 via d1kv, clé f1trace:<clé>, premier dépôt gardé, nombres seulement P/T/D/pit/k, 120 Ko max)
  — À REDÉPLOYER par Antoine. App : enveloppe `_g45F1TrPartageBrancher` de `_g45F1TraceLire` : tracé lu (OpenF1 ou cache local) → déposé une fois
  par session (sessionStorage g45f1trp_) ; rien → GET worker, contrôlé `_g45F1TrPropre`, gardé en localStorage.
  02/10/2026 (FP2 Malaisie) — /f1live répondait 502 : la route n'ENVOYAIT ni la poignée de main SignalR ni le Subscribe
  (seul /f1test le faisait) → worker corrigé (fichier complet donné à Antoine, à redéployer). /f1test OK pendant FP2 (negotiate 200,
  WS 101, type 3 reçu). PIÈGE : la F1 nomme ce GP « Bahrain Grand Prix » (« … BAHRAIN GRAND PRIX IN MALAYSIA 2026 »), lieu
  Kuala Lumpur → `_g45F1OffCorrespond` accepte aussi le lieu F1 trouvé dans nom du GP / circuit / ville ESPN (20261002w).
  CONFIRMÉ par Antoine (capture 02/10 10:19, FP2) : worker redéployé, tableau en direct affiché (statut, chrono, météo, pneus, mini-secteurs).
  20261002x (« oui les deux ») : en PAYSAGE le tableau tient entier (constaté par Antoine) → pas de refonte ; en portrait tactile,
  ligne « 📱↻ Tourne ton téléphone… » ; photo ronde 26 px si p.ph — worker /f1live : ph = DriverList.HeadshotUrl (CONFIRMÉ par Antoine, capture des qualifs Malaisie 03/10 : photos rondes affichées ;
  fichier worker redonné à Antoine). Photos / chronos des onglets FP1… : OpenF1 (bloqué pendant une séance) ; archive officielle
  livetiming /static/2026/<Path>… SONDÉ PAR ANTOINE (02/10, FP1 Malaisie, Path 2026/2026-10-04_Bahrain_Grand_Prix/2026-10-02_Practice_1/) :
  TimingData.json / TimingAppData.json / DriverList.json = 200 PENDANT FP2 (HeadshotUrl confirmé) → worker route /f1arch?q=<ville>&s=
  <Practice 1|Qualifying|Race|Sprint|Sprint Qualifying>&d=<date> (Index.json → séance la plus proche de d, cache 10 min) ; appli
  20261002y : `_g45F1SessOF1` ENVELOPPÉE → si OpenF1 ne rend rien, `_g45F1ArchMap` (même forme {tyre,time,kind,team,col,photo}) ;
  `_g45F1ArchNom` (FP1→Practice 1, SS→Sprint Qualifying…). Worker à redéployer (fichier complet donné). Tableau façon feuille de
  chrono (mini-secteurs : codes 2051 violet, 2049 vert, 2048 jaune, 2064
  stand) + chronologie : messages de course (30 derniers) et événements
  DÉDUITS de deux instantanés (`_g45F1OffEvenements`), donc seulement depuis
  l'ouverture de la page. Carte des voitures et
  temps aux stands : réservés à F1 TV en direct depuis 2025.
- MOTOGP et CGU (09/10) : CGU motogp.com point 3 (lues par Antoine) = usage PERSONNEL seulement, « not permitted to provide, copy…
  or transmit any Content… whether for profit or free of charge » (api.motogp.pulselive.com : pas de robots.txt ; TimingPass = direct PAYANT).
  20261007h retirait tout le MotoGP de bet45 → Antoine : « ON A PLUS RIEN » → 20261007i : existant REMIS sur bet45 (choix A) ; seul reste
  `_g45MotoActive()` (= `_g45SanteActive`, faux sur bet45). DEMANDE d'Antoine : sur GONES45, direct poussé « comme la F1 » (chronos en live +
  circuit) → tout ajout de ce genre derrière `_g45MotoActive()`. Sonde livetiming-lite demandée (pendant ou juste après une séance).
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
- Cotes ESPN foot, match À VENIR (scoreboard, sondé 28/09 Lyon-Lens) : clés overUnder,
  total, pointSpread, moneyline, drawOdds, details ; over/under dans
  total.over|under.close|open.odds (« +130 »), PAS d'overOdds/underOdds (ancien format,
  vu sur un summary de match joué). La ligne DK n'est pas toujours 2,5 (3,5 vu).
- API-Sports (clé dans le worker, host=apisports…) : répond 200 AVEC `errors` rempli
  (quota, « Too many requests… per minute ») → worker.js corrigé le 28/09 pour ne PLUS
  mettre ces réponses en cache (avant : erreur servie 10 min, photos comprises). À
  redéployer par Antoine. Clé OK (/timezone → 427). Cotes « toutes lignes » via
  /odds?league=61&season=2026&bet=5 : REFUSÉ en gratuit (« Free plans do not have access
  to this season, try from 2022 to 2024 ») → API-Sports inutilisable pour les cotes à
  venir. Reste ESPN (1N2 + ligne principale).
- THE ODDS API : DÉJÀ intégrée avant le 28/09 (route worker `/odds?sport=&regions=&markets=
  [&event=]`, secret ODDS_API_KEY, cache KV 3 h, plafond « odds » ; `/odds-quota`) — utilisée
  par « Cotes réelles (bookmakers FR) », plus de marchés (alternate_totals, btts, buteur
  par event). ⚠ Le 28/09 j'ai d'abord codé une route en double (host=oddsapi, ODDSAPI_KEY)
  sans l'avoir vue : retirée. TOUJOURS grep le worker avant d'ajouter une route.
  Gratuit : 500 crédits/mois, 1 crédit = 1 marché × 1 région ; chaque bookmaker ne donne
  que SA ligne principale d'over/under. Séries (28r) : `_g45OaCote` UNIQUEMENT si ESPN n'a
  pas la cote (règle d'Antoine) → /odds totals région eu ou h2h région fr ; cache appareil
  g45oa1_ (échec : 30 min) ; ligues `_G45_OA_LIGUES`. Plusieurs comptes/clés pour
  contourner le quota : REFUSÉ (CGU). Scraping de bookmakers /
  Oddsportal / DraftKings via VPN : REFUSÉ (CGU, géoblocage), ne pas reproposer.
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

## 7. Reste à faire (trié avec Antoine le 28/09/2026)

EN COURS / À FAIRE DE SUITE (maquettes proposées le 28/09) :
- (4) FAIT 28l : Over période « 1re vs 2e » → `_g45ClsTableOuVs` (tri vsTri/vsInv).
- (5) FAIT 28l : `_g45DeuxAvis(data, eid, hN, aN)` dans `_renderGenericDetail` (hors foot) :
  predictor ESPN vs moneyline (hDec/aDec ajoutés à window._g45LastUsOdds), marge
  retirée, alerte > 8 pts orientée vers l'équipe qu'ESPN voit plus haut.
- (8) FAIT 28m : bloc « 📈 Tes cotes contre la clôture » en tête du Bilan (#g45-clv,
  `_g45ClvPoser`, greffé sur renderBilanTab, même si la courbe échoue ; suit filteredA).
  SONDÉ 28/09 : scoreboard d'un match joué → odds [null] ; soccer/all/summary?event=ID
  → pickcenter[0] DraftKings (home/away/drawOdds.moneyLine US, overUnder + over/
  underOdds) ; soccer/summary sans « all » → 404. Match retrouvé par
  soccer/all/scoreboard?dates=JOUR (noms, 2 camps sinon match unique). V1 = FOOT,
  paris simples 1 jambe : victoire / nul / défaite, over-under sur LA ligne de clôture ;
  exclus combiné, lay, boost (isFlash), joueur. Cache g45clv1_<id> (négatif 3 j).
  À faire plus tard si Antoine le demande : autres sports (summary US par ligue).

NPB (baseball japonais) : ABANDONNÉ par Antoine le 01/10 (« laisse tomber ») — NE PAS reproposer. Sondé : ESPN rien ;
  npb.jp = pas de robots.txt mais /policy/ « 二次利用および無断転載を固く禁じます » (utilisation secondaire interdite) ;
  npbstats.com = dernières stats 2022 ; en.baseball-data.jp = crawl autorisé, mais ni matchs, ni logos, ni photos, ni stats
  dans les effectifs (projet de fans) → jugé pas assez solide. Pistes non sondées : 102.jp (DELTA, en partie payant → non).
HANDBALL (LNH, Starligue) : SONDÉ PAR ANTOINE le 01/10 — pas de robots.txt (404), classement écrit dans la page HTML,
  MAIS www.lnh.fr/mentions-legales : « Toute reproduction… diffusion… traitement ou utilisation, même partielle… sans l'autorisation
  expresse et préalable de la LNH est interdite » (logos aussi) → NE PAS lire lnh.fr. ESPN n'a pas de handball. Seule voie propre :
  autorisation écrite de la LNH, ou une autre source gratuite qui le permet (non trouvée).
  ⚠ Le jeton lnb.fr/api/token (basket) apparaît dans les sondes : NE PAS l'utiliser (règle Pro A).
PRO A — BE-BASKETBALL BRANCHÉ (20261003r, maquette validée « oui ») : bloc en fin d'app.js qui REMPLACE `_g45ProaMatchs`,
  `_g45PaComps` (rs + po, pas de Leaders Cup) et `_g45PsHtml` (→ `_g45BbStatsHtml`) ; écran `_g45ElRendre` inchangé ; tuile Pro A
  rendue à bet45 (`_g45ProaCachee` = faux). Worker host=bebasket (liste blanche : calendar/<an>?mode=&month=, teams-stats,
  leaders, game/<uuid>) — À DÉPLOYER par Antoine. SONDÉ PAR ANTOINE : /league/betclic-elite/calendar/<an>?mode=regular|playoff
  &month=<n> (an = DÉBUT de saison ; /ligue/…/calendrier = 404) → données Next.js `_g45BbFlight` (morceaux __next_f recollés)
  → objets match `_g45BbMatchsLire` {id uuid, datetime.atom, mode, number, displayStage, marking finished|none, teams.home|away
  {name, abbreviation, slug, image.src}, statTeams.home|away.points} ; chaque page contient d'autres matchs (finale de juin,
  derniers résultats) → fenêtre de saison + uuid unique ; `_g45BbCompact` (id = 12 derniers chiffres hex de l'uuid). Cache
  g45bb1_<an><r|p><mois>. Stats d'équipes : /teams-stats = <table> (ORtg, DRtg, NRtg, Poss., PTS… ; 3 groupes M A % = 2 pts,
  3 pts, LF) → `_g45BbTableEquipes`, cache g45bbst1_<an> 1 h, saison en cours seulement ; tri `g45BbTri`, 4e colonne `g45BbCol`.
  Logo : perso du dépôt puis be-basketball (accord d'Antoine). À SONDER : leaders (catégories : 1 seul tableau Rank|Player|
  Average|Total|Games), feuille de match /game/<uuid> (table « Starting Five | min | PTS… », clé statPlayers), saisons passées
  des stats, plus ancienne saison du calendrier, valeur de marking pendant un match. Photos joueurs prévues (accord) :
  Euroleague → TheSportsDB → Wikipédia → initiales, JAMAIS celles de be-basketball.
  20261003s — LEADERS JOUEURS (stats → 👤 Joueurs) : SONDÉ PAR ANTOINE /league/betclic-elite/leaders/<an>/<pts|reb|ast>?mode=regular
  → "leaders":[{games, total, average, rank, player{firstname, lastname, slug, image (JAMAIS reprise)…}}] (`_g45BbLeadersLire`, club :
  clé NON vue → team | player.team si présent) ; cache g45bbld1_ ; autres catégories NON sondées. Photos `_g45BbPhotos` =
  TheSportsDB (strSport Basketball, nom exact, g45bbph1_ : trouvée pour toujours, rien 14 j), sinon initiales. Worker : chemin
  leaders/<an>/<cat>?mode= ajouté (À REDÉPLOYER). `_g45BbBloc` lit aussi les tableaux [ ].
  20261003t — CLUB DES LEADERS + FEUILLE DE MATCH : leaders SANS club (SONDÉ : aucune clé d'équipe) → club pris dans la fiche
  de match /game/<uuid> "statPlayers":{home:[…], away:[…]} {player{firstname, lastname, slug}, playerNumber, timePlayed (unité
  NON vérifiée : > 60 → secondes), points, twoPointersMade…, rebounds, reboundsOffensive, assists, steals, turnovers, blocks, fouls,
  plusMinus, isStarter, pir} ; `_g45BbStatsVersEl` → format Euroleague → `_g45ElFeuilleHtml` ; bouton « 📊 Fiche complète » en
  Pro A (enveloppes `_g45ElMatchHtml`, `g45ElFiche`) ; `_g45BbFeuille` (g45bbf1_<uuid> pour toujours si fini), clubs g45bbjc1
  (slug → [nom, logo]) ; `_g45BbClubsCompleter` lit 8 feuilles max par affichage. Photos : + Wikipédia fr en secours (clé
  g45bbph2_, g45bbph1_ → MORTS).
  20261003u — bouton Leaders Cup RETIRÉ de l'écran Pro A (« oui retire »).
  20261003v — clubs des leaders rangés PAR SAISON (g45bbjc2 = {an: {slug: [nom, logo]}}, g45bbjc1 → MORTS) et complétés aussi pour les saisons passées.
  20261003w — onglet 👥 Équipes ouvert à la Pro A (enveloppe `_g45ElEquipesRendre`, drapeau `_g45BbEqAppel`) : étoile remplacée par « ➕ Mur »
  (`g45BbMur` → state.u sport 🏀, comme addUnit) ; Effectif = `_g45BbEffectif` CONSTRUIT depuis les feuilles de match (page /team/<slug> SANS
  effectif, SONDÉ PAR ANTOINE) : joueurs ayant joué, n°, matchs, moyennes, titularisations. Contrôle ajouté dans smoke.js.
  20261003x — BUG `_g45EbResoudre` : alias Euroleague mêlés au nom Pro A → un club Euroleague du mur (ASVEL) rattaché au 1er club Pro A lu ;
  corrigé (nom du mur ou alias EL comparé AU nom Pro A) ; be-basketball = « Lyon-Villeurbanne » pour l'ASVEL (alias ajouté, aussi dans `_g45BbAuMur`).
  20261004a — PAS DE DIRECT chez be-basketball (SONDÉ PAR ANTOINE pendant Bourg–Chalon 03/10 : liste marking none + points null,
  fiche /game 0-0, /games-of-the-day/direct absente, bebasket.fr « - - ») → score seulement à la fin ; mois relu toutes les 3 min si un
  match est commencé (`_g45BbMois`), worker : calendrier bebasket traité comme « live » (cache 60 s, À REDÉPLOYER).
  20261004b — PRO A EN DIRECT VIA SOFASCORE (RapidAPI sofascore6, clé du worker PARTAGÉE) : SONDÉ PAR ANTOINE (Bourg–Chalon) /api/sofascore/v1/match/live?sport_slug=basketball
  (145 Ko ; la liste du jour = 2,3 Mo, écartée) → tournament.name « France Pro A », homeTeam.name « JL Bourg Basket », status.description
  « 3rd quarter », homeScore{current, period1..}, time{played s, periodLength}. `_g45BbLvLire` (seulement si un match est commencé),
  `_g45BbLvAppliquer` (les DEUX clubs par mots ≥ 4 lettres `_g45BbLvMeme`, alias ASVEL), `_g45BbLvTexte` (QT3 · 06:01), écran Journées relu
  toutes les 2 min. QUOTA (« faut pas que ça explose le reste ») : worker cache 120 s sur match/live (À REDÉPLOYER), 429 → coupé 1 h,
  40 lectures / jour / appareil (g45bblv_j).
  20261004c — BUG doublons : la page de SEPTEMBRE (cache 30 j) contenait une vieille copie « à jouer » des matchs du 3/10 et la 1re
  copie lue gagnait (Nancy–Cholet fini affiché 18:00) → `_g45ProaMatchs` garde la copie TERMINÉE, sinon celle de la page de SON mois (_mo).
  20261004d (choix B d'Antoine) — date du match (« sam. 10/10 ») au-dessus de l'heure ou du score dans `_g45ElMatchHtml` (Euroleague + Pro A, pas en direct).
  20261004e — QUARTS-TEMPS d'un match FINI : SONDÉ PAR ANTOINE, fiche /game/<uuid> = pointsQuarter1..4 + pointsOverTime par équipe (home
  puis away) → `_g45BbQuartsTexte` / `_g45BbQuartsLire` (match déplié ou fiche complète), cache PERMANENT g45bbq1_<uuid>, reposés sans requête
  (enveloppes `_g45ProaMatchs`, `g45ElOuvrir`, `g45ElFiche` : carte du haut refaite).
  Stats des joueurs EN DIRECT via Sofascore : proposées (1 demande de plus par match ouvert), REFUSÉES par Antoine (« laisse comme ça ») — ne pas reproposer.
  Ancienne note (02/10) : www.be-basketball.com (SAS NEO BASKET, Montarnaud) a les stats Betclic ÉLITE 2026-27
  (équipes : ORTG, DRTG, NRTG, POSS., PTS, REB… ; joueurs ; calendrier). robots.txt : seuls /_health, /my-account/*,
  /manage-newsletters/* interdits ; Legal Notice : SEULES les PHOTOS sont protégées (reproduction interdite sans accord écrit).
  ACCORD DONNÉ PAR TÉLÉPHONE à Antoine le 02/10 (confirmation écrite conseillée). Ne JAMAIS reprendre leurs photos.
  À FAIRE : sonder comment les données arrivent (page stats équipes, console : __NEXT_DATA__ / appels api|json) — domaine bloqué
  depuis la session cloud ; sera à ajouter au worker (liste blanche) une fois le chemin connu.
SKI ALPIN (FIS) : SONDÉ PAR ANTOINE le 02/10 — robots.txt « Allow: / » (sauf /api/, /_next/…), MAIS
  www.fis-ski.com/terms-and-conditions : « You may not scrape the content on this Website » + reproduction sans autorisation
  écrite interdite ; flux RSS = usage privé, republication interdite → NE PAS lire fis-ski.com. ESPN : pas de ski.
KBO : CONFIRMÉ « c'est bon » par Antoine (01/10, worker host=mykbo déployé) ; états
  « en cours » / annulé d'un match toujours NON vus.
RÉGLÉ (worker, 01/10) : cron « exceededCpu » (cpuTimeMs 10) à CHAQUE passage — vu par Antoine dans Observability.
  Correction livrée (fichier worker complet) : calendriers COMPACTS clé scht: {ts, e:[{id, d}]} (`schedPoser` /
  `schedLire`) au lieu de décoder le calendrier ESPN complet 2 × N + 4 fois par passage ; runRappelCron sort avant Intl
  hors 6-11 h UTC. CONFIRMÉ par Antoine (Observability 01/10) : dernier cron rouge vers 14:47, ensuite */5 en « info ».
  REVENU le samedi 03/10 19:50 UTC (soirée chargée : foot + NHL + paris en direct ; cpuTimeMs 10) : trop de fiches ESPN décodées par
  passage (8 équipes en direct + ⭐ + scoreboards des paris), passage tué toujours au même endroit. Worker corrigé (fichier complet
  donné, À REDÉPLOYER) : budget `_lourd()` de 4 lectures lourdes par passage, `sumLire` (fiche d'un match lue une fois par passage,
  partagée équipe du mur / ⭐), rotation `_tourne` (paris, ⭐, détection et traitement des équipes en direct). Notification possiblement
  retardée de 5-10 min un soir très chargé. Redéployé le 03/10 au soir : passages « ok » (Antoine) ; à revérifier un soir chargé (dimanche).
  03/10 — « seulement celles d'après match » : les cases « Types d'alertes » (Outils → Notifications, rec.ev compo/start/goals/end)
  n'étaient respectées que pour les équipes du mur (evaluateMatch) ; paris (b…) et ⭐ (f…) les ignoraient → worker `_evType(tag)` /
  `_evRefuse(rec, ev)` (bstart/fstart → start ; bscore/fscore/bvar/bqt → goals ; bend/fend → end ; verdicts, jambes, rappels : toujours).
  10/10 — Observability d'Antoine (12 h : 298 ok / 60 erreurs exceededCpu) : erreurs à PRESQUE CHAQUE passage de 8 h à 14 h (Paris) sans
  match = runRappelCron créait le formateur Intl (Europe/Paris) à chaque passage de 6-11 h UTC AVANT le drapeau rappel:<jour> → heure de
  Paris calculée à la main (dernier dimanche de mars / octobre 01:00 UTC ; 6 cas comparés à Intl, identiques). worker.js complet donné, À
  REDÉPLOYER. Erreurs du SOIR (multiplex foot) : budget `_lourd` 4 → 2 PROPOSÉ, en attente de réponse.
À VOIR (en attente d'un retour d'Antoine) :
- 🎯 BUTEURS LES PLUS RÉGULIERS (07/10, maquette « oui ») : Antoine veut un CLASSEMENT des 10 meilleurs buteurs de la LIGUE (NHL
  d'abord, autres sports ensuite si ça lui plaît) : buts, matchs joués, % de matchs avec but, PIRE SÉRIE sans marquer (matchs joués
  seulement, vert < 6 / orange 6-9 / rouge ≥ 10), série en cours ; toucher = filtre Buteur. Contrainte : « faut pas que ça bloque tout »
  → chargement SUR BOUTON seulement, cache 12 h, ≤ 11 requêtes. SONDE À FAIRE PAR ANTOINE SUR PC (worker host=nhl) :
  SONDÉ PAR ANTOINE le 08/10 : les deux = 200 via le worker host=nhl (leaders goals[{id, firstName.default, lastName.default, headshot,
  teamAbbrev, teamLogo, value}] ; gameLog[{gameDate, goals, assists, …}] du plus récent au plus ancien, matchs joués seulement).
  20261005q — NHL LIVRÉ : bloc « 🎯 LES PLUS RÉGULIERS DE LA NHL » `_g45RegBloc(sp, lg, an)` sous `_g45JouBarre` dans `_g45SaisonsGen`
  (hockey + nhl), bouton → `g45RegOuvrir` → `_g45RegLire(saison, 'g'|'a')` (10 leaders + 10 gameLogs, 3 à la fois, cache g45reg1_ 12 h)
  → `_g45RegCalc(log, cle)` (mj, tot, pct, pire, cours) ; Buteurs / Passeurs, tri Pire série / % ; saison = Saison ▾ du panneau
  (an = année de FIN → « 20252026 ») ; < 10 matchs → message. Catégorie « assists » NON sondée. « Toucher = filtre Buteur » NON fait
  (joueurs d'autres équipes).
  20261005r (« je devrais seulement avoir les joueurs de Colorado » + « l'ensemble pourrait remplacer Individuel », maquette « OUI ») :
  fiche d'équipe (Saisons) → 10 meilleurs de L'ÉQUIPE `_g45RegLireEq` (SONDÉ : /v1/club-stats/<ABR>/<saison>/2 → skaters[{playerId,
  goals, assists, positionCode…}], abréviation NHL par nom `_G45_REG_EQ` / `_g45RegEquipe`, game-log filtré sur teamAbbrev s'il existe ;
  cache g45reg1_<saison>_<cat>_<ABR>) ; équipe non reconnue = ligue. Compétitions → NHL → 🏅 Individuel = classement de la LIGUE
  (chargé à l'ouverture de l'onglet) ; leaders toujours dans Classements → Joueurs. Catégorie « assists » SONDÉE (McDavid 90).
  20261005s (« on pourrait rajouter pointeur ? ») : 3e bouton ⭐ Pointeurs (cat 'p') ; points d'un match = gameLog.points, sinon buts + passes ;
  équipe = club-stats points (sondé) ; ligue = leaders categories=points (SONDÉ PAR ANTOINE : McDavid 138).
  20261005t (« c'est chiant cette limite à 10 ») : plus de minimum de matchs ; < 10 matchs → avertissement « Début de saison » + bouton
  `g45RegAn` (saison précédente ↔ retour, _g45Reg.an0 = saison du panneau).
  20261005u (idée d'Antoine, « b et seulement or pour les équipes ») : top 10 de la saison D'AVANT (même catégorie, leaders LIGUE,
  `_g45RegPrec`, cache g45reg1_p_ 7 j, _g45Reg.prev) en couleur : ligue or 1-3 / bronze 4-10 ; fiche d'équipe or seulement ; « n°X en AAAA-AA ».
  Blessures / absences : le game-log ne contient que les matchs JOUÉS → jamais comptées dans une série.
  20261005v (« les boutons ont du mal à réagir ») : boutons gardés pendant la lecture (`_g45Reg.cle` = dernier choix seul affiché) ;
  game-log lu une fois par session `_g45RegLog` (buts + passes + points) → changer de bouton ne relit que les joueurs nouveaux.
  « cache non persisté (trop volumineux : 136 Ko) — g45cm11_hockey_nhl_2027 » en console = plafond VOULU de 60 Ko (_G45_CACHE_MAX), sans rapport.
  20261005w : onglet NHL renommé « 🎯 Séries individuelles » (« sinon impeccable »). SUITE demandée : foot, NFL, rugby, NRL, KHL (une sonde par sport).
  20261005x — FOOT (« remplace Buteurs, pareil est déjà dans Classements ») : onglet ⚽ Buteurs de chaque championnat → « 🎯 Séries
  individuelles » (`_g45RegBlocFoot(lg, anCompet, nom)`, même rendu `_g45RegHtml`, _g45Reg.lg = slug, clés `_g45RegK` / `_g45RegPK`,
  libellé `_g45RegLab`). SONDÉ PAR ANTOINE (Gouiri 259743) : leaders core …/seasons/<an DÉBUT>/types/0/leaders (goalsLeaders /
  assistsLeaders) ; journal common v3 via worker espnweb /apis/common/v3/sports/soccer/<lg>/athletes/<id>/gamelog → names
  [totalGoals, goalAssists…], seasonTypes[].categories[].events[{eventId, stats}] (CE championnat, matchs joués), events{id:{gameDate}},
  filters season. `_g45RegLogFoot` : ?season= NON sondé → saison renvoyée contrôlée (autre = joueur ignoré). « Buts + passes » =
  top buteurs + top passeurs, sans couleur (or recalculé buts + passes de l'an − 1 PROPOSÉ le 10/10, REFUSÉ : « on laisse »). Noms / clubs `_g45RegFtNom` (g45regft1_), photos `_g45ClsAvatar` + `_g45ClsPhotos`.
  Saisons d'une équipe de foot : PAS encore (effectif à sonder). Restent : NFL, rugby, NRL, KHL.
  20261005z — SONDÉ PAR ANTOINE (Torres 265869, Marquinhos, Thauvin faux : « 3 buts en 1 match ») : gamelog?season=2026 renvoie la
  LIGUE DES CHAMPIONS (« League Phase ») malgré filters league=fra.1 ; SANS paramètre = Ligue 1 en cours (5 matchs). → lecture sans
  paramètre d'abord ; saison passée seulement : ?season=&league= (NON vérifié), types « phase/knockout/… » refusés. Cache g45reg1_f_ → f2_.
  Joueur dont l'équipe par défaut est une sélection (268720 : team 10528, 0 match, &team= ignoré) → absent du tableau.
  20261006a (« OUI COULEUR BLEU ») : badge « 🆕 nouveau » bleu #5aa9ff à côté du club (`_g45RegNouveaux`) = joueur absent de l'effectif
  de son club la saison d'avant (SONDÉ : site v2 …/teams/<id>/roster?season=2025, PSG 36 joueurs sans Torres) ; effectif actuel relu,
  listes identiques = paramètre ignoré = pas de badge ; cache g45reg1_ro_ 7 j ; liste g45reg1_f2_ → f3_.
  20261006b (« OUI ») : tri Pire série ▲ (ou %) puis le plus de buts/passes/points, puis la plus petite série en cours, puis le nom.
  20261006c — SAISON PASSÉE foot (capture : 1 joueur sur 10) : SONDÉ PAR ANTOINE, ligue DANS le chemin + ?season= = dernière compétition
  jouée (Marquinhos 2025 → Ligue des champions ; league/leagues/slug/team ignorés) ; /apis/common/v3/sports/soccer/athletes/<id>/gamelog
  ?season=2025&league=fra.1 (SANS ligue dans le chemin) = « 2025-26 Ligue 1 : 29 ». Saison en cours : chemin avec ligue, sans paramètre.
  Liste g45reg1_f3_ → f4_.
  20261006d (« manque buts ») : 3e bouton de tri « Buts ▼ » (_g45Reg.tri 'tot' : total, puis %, puis pire série).
  20261006e — FICHE SAISONS D'UN CLUB DE FOOT (loadTeamSaisons, après _g45BlocAVenir) : `_g45RegClubFootPoser(nom)` → espnResolveTeam
  (sélections / coupes écartées) → bloc sur bouton, _g45Reg.eq = 'T'+id. SONDÉ PAR ANTOINE : site v2 soccer/<lg>/teams/<id>/roster →
  athletes[] avec statistics.splits.categories[].stats (totalGoals, goalAssists ; compétitions comptées NON vérifié) + injuries →
  `_g45RegCandidatsClub` choisit 12 candidats, journal du championnat pour les vrais chiffres, 10 gardés ; or = top 10 de la LIGUE an − 1.
  20261006f (capture) : bloc posé SOUS « Analyser buteurs / passeurs » (après _scoreBarHtml, 1re saison affichée, drapeau _g45RegPose).
  20261006g (« B en précisant ») : le bloc du club SUIT « Filtrer par compétition » (`_g45RegFiltreComp` → _g45Reg.cf : T = championnat +
  coupe d'Europe du joueur, L, C, E, K, N) ; compétitions = options du filtre league du journal ; autre compétition par
  `_g45RegLogAutre` (/soccer/athletes/<id>/gamelog?season=&league=<slug>, NON vérifié hors ligue) ; fusion `_g45RegLogClub` par eventId ;
  ligne « 📋 Compétitions comptées » (`_g45RegCompsLib`) ; club déjà ouvert (_g45Reg.ouvert) = relu tout seul au changement de filtre.
  CONFIRMÉ par Antoine (capture Bayern, filtre LDC : « Compétitions comptées : Ligue des champions », 1 match, Olise 2 buts) → la forme
  ?season=&league=uefa.champions marche aussi pour une coupe d'Europe.
  20261006h — NFL (Compétitions → NFL → « 🎯 Séries individuelles », via _g45RegBlocFoot('nfl') ; libellés par sport `_g45RegLib`) :
  SONDÉ PAR ANTOINE : core …/football/leagues/nfl/seasons/2026/types/2/leaders (totalTouchdowns, passingTouchdowns…) ; journal common v3
  /football/nfl/athletes/<id>/gamelog (names par poste, « 2026 Regular Season », matchs joués). TD marqué = colonnes …Touchdowns sauf
  passingTouchdowns (receivingTouchdowns NON vu) ; Passes de TD = QB ; présaison écartée ; saison = année de début (2026) ;
  `_g45RegLeadersNfl`, `_g45RegLogNfl` (sans paramètre d'abord) ; photos headshots NFL ; caches noms g45regft1_n…. Restent : KHL, NRL, rugby.
  20261006i (« sans photo et bouton pas réactif ») : chaque redessin relançait _g45ClsPhotos sans arrêter le précédent (recherches
  empilées, 429 TheSportsDB) → `_g45RegPhotos` : mémoire de session _g45RegPh (posée tout de suite), recherches partagées _g45RegPhP,
  jeton _g45RegPhTok (nouveau dessin = ancienne recherche arrêtée), budget API-Sports commun ; 2e clic pendant une lecture = pas de
  2e lecture (_g45Reg.enCours).
  20261006j — FICHE SAISONS D'UNE ÉQUIPE NFL (_g45RegBloc(sp, lg, an, nom, eqId) → `_g45RegBlocNflEq`) : SONDÉ PAR ANTOINE (Bills id 2) :
  effectif site v2 SANS stats ; core …/nfl/seasons/<an>/types/2/teams/<id>/leaders → rushingTouchdowns 2, receivingTouchdowns 5,
  passingTouchdowns 1, rushingLeader 7, receivingLeader 10… → `_g45RegCandidatsNfl` (marqueurs de TD puis meilleurs coureurs / receveurs,
  10 max ; QB pour Passes de TD), cache g45reg1_nt_ 6 h. NFL confirmée « ok » par Antoine (Compétitions).
  20261006k — 🏉 TOP 14 (Compétitions → Rugby → Top 14 → « 🎯 Séries individuelles » ; fiche Saisons d'un club lg '270559') : la page
  joueur LNR n'a que les totaux par saison (history-season-list) ; SONDÉ PAR ANTOINE : /calendrier-et-resultats (current-week number,
  current-season name) → /calendrier-et-resultats/<saison>/jN (liens feuille-de-match) → <lien>/statistiques-du-match = 2 × players-ranking
  (23 + 23, tempsJeu, nbEssais, player.url /joueur/<id>-…). `_g45RegLireRug` : journées j1 → en cours, page stats de chaque match joué
  (4 à la fois, compteur), joué = tempsJeu > 0 ; match compact g45reg1_rm_<id> permanent, journée finie g45reg1_rj_ 7 j ; 1er bloc = club
  qui reçoit (NON vérifié) ; club = slug du logo ; fiche club `_g45RegBlocRugEq` (_g45T14Slug). Saison en cours seulement, pas d'or. Pro D2 : pas fait.
  20261006l (« on aurait pu mettre meilleure série aussi ») : _g45RegCalc → best (plus longue série AVEC) / bcours ; colonne bleue « Meilleure »,
  4e tri « Meilleure série ▼ » (tri 'best') ; listes g45reg1_ → g45reg1_v2_ (NHL), g45reg1_f4_ → f5_ (foot / NFL).
  20261006m — NRL (Compétitions → NRL → « 🎯 Séries individuelles » ; fiche Saisons d'un club rugby-league / '3') : sources déjà sondées —
  `_g45NrlLire(an, 38|35)` (top 10 essais / passes d'essai), `_g45NrlCalendrier`, feuille <matchCentreUrl>data → `_g45RegNrlFeuille`
  (les DEUX équipes : nom, joué = minutes > 0, tries, tryAssists ; g45reg1_nm_<url> permanent) ; `_g45RegLireNrl` (club = tous ses joueurs),
  or = `_g45RegPrecNrl` (an − 1, par nom) ; saison civile (_g45NrlAnAuto). Reste : KHL.
  20261006n (« pas joué dernier match », capture Teddy Thomas 4 MJ / 5, maquette « oui ») : o.abs = matchs du CLUB joués après la dernière
  apparition → « 🚫 absent au dernier match (date) / aux N derniers matchs » en orange. Top 14 (matchs du club par slug, date = m.j de la
  journée, format NON vérifié) et NRL (feuilles du club).
  20261006o — NHL : SONDÉ PAR ANTOINE /v1/club-schedule-season/COL/20262027 (worker host=nhl) → games[88] {id, gameDate, gameType 1|2,
  gameState FINAL} → `_g45RegNhlCal` (saison régulière finie FINAL/OFF, g45reg1_cs_ 3 h) + `_g45RegNhlAbs` (matchs de l'équipe après la
  dernière date du journal) ; ligue et fiche d'équipe ; listes g45reg1_v2_ → v3_.
  20261006p — FOOT + NFL : SONDÉ PAR ANTOINE site v2 soccer/fra.1/teams/160/schedule (5 matchs finis, ordre NON chronologique) et
  football/nfl/teams/2/schedule?season=2026&seasontype=2 (17 matchs, 4 finis) → `_g45RegEspCal` (completed, g45reg1_es_ 3 h) +
  `_g45RegEspAbs` (o.tid, o.der = dernier match du joueur DANS LE CHAMPIONNAT) ; filtre LDC / coupes seules = pas de calcul ;
  listes g45reg1_f5_ → f6_. Foot saison passée CONFIRMÉE PAR ANTOINE : schedule?season=2025 = 34 matchs finis fra.1, du 17/08/2025
  au 17/05/2026. KHL : à faire plus tard (« quand tout sera open », dixit Antoine).
  20261006q — ⚾ MLB (Compétitions → MLB → « 🎯 Séries individuelles » ; fiche Saisons baseball / mlb) : SONDÉ PAR ANTOINE : leaders core
  …/baseball/leagues/mlb/seasons/2026/types/2/leaders (homeRuns, runs, avg, RBIs…) ; journal common v3 /baseball/mlb/athletes/<id>/gamelog
  (names atBats, runs, hits, doubles, triples, homeRuns, RBIs… ; « 2026 Regular Season » 157 + « 2026 Postseason » 3 ; filters season,
  category=batting). Boutons 💥 Home runs (g) / 🏃 Runs (a), saison régulière seule ; `_g45RegLeadersMlb`, `_g45RegLogMlb`,
  `_g45RegCandidatsMlb` (team leaders), `_g45RegBlocNflEq(an, nom, id, 'mlb')` ; calendrier schedule baseball. CONFIRMÉ PAR ANTOINE (Yankees 10) :
  team leaders 200 (homeRuns 22, runs 22, hits 22…), schedule?season=2026&seasontype=2 = 165 matchs dont 161 finis.
  20261006r — 🏒 KHL, FICHE D'ÉQUIPE seulement (Saisons, league 'khl') : SONDÉ PAR ANTOINE, players_v2 IGNORE le tri (q[s], order_by, sort →
  alphabétique) et la ligue entière est trop lente → pas de classement de ligue (onglet Individuel KHL inchangé). `_g45RegLireKhl` :
  effectif `_g45KhlJoueursEquipe` (st.g/a/pts, gardiens écartés, 12 candidats) + matchs finis `_g45KhlMatchsPlage` + feuilles `_g45KhlFiche`
  (présence = sur la feuille, buts j.g, passes buts[].pa) ; absences ; saison en cours seulement, pas d'or.
  CONFIRMÉ par Antoine (capture Stade Toulousain) : « 🚫 absent au dernier match (J5) » affiché (Teddy Thomas…). 20261006s : titres du tableau espacés (« EssaisMJ » collés).
  20261006t (« si mettre abs ici ? », maquette « OUI ») : lignes de résultats de `_g45SaisonsGen` marquées data-g45sgadv / data-g45sgdom /
  data-g45sgt ; `_g45RegAbsPoser` (après el.innerHTML et après g45RegOuvrir) ajoute « 🚫 Absents : … » = joueurs du tableau absents de la
  feuille. Top 14 : out.absM, match retrouvé par adversaire _g45T14Slug + domicile.
  20261006u (« sympa oui ») : ÉTENDU — NRL (absM par adversaire `_g45NrlEqId` + lieu, F._adv / F._dom ; 2 affiches au même endroit = rien),
  NHL / foot / NFL / MLB / KHL par DATE : o.jours = jours joués (journal ; NHL date locale, ligne = UTC − 6 h ; autres UTC, `_g45RegJour`),
  absents = joueurs du tableau sans ce jour, ligne ignorée si aucun joueur du tableau ce jour-là. Lignes foot (loadTeamSaisons) marquées
  data-g45sgdom / data-g45sgt. Listes g45reg1_v3_ (équipe NHL) → v4_, g45reg1_f6_ → f7_.
  20261006w (« différencie pas domicile et extérieur », maquette Tous / 🏠 / 🚌 acceptée) : chaque entrée de journal porte h (1 domicile,
  0 extérieur) — ESPN atVs « vs » / « @ » (foot SONDÉ ; NFL / MLB supposé pareil), rugby cote 0 = reçoit, NRL F.h.id, KHL m.a = reçoit, NHL
  homeRoadFlag H/R (SONDÉ PAR ANTOINE, téléphone, game-log 8478402 2025-26 : « H » / « R » présents) ; `_g45RegCalc` ajoute R.d / R.e ; `_g45RegHtml` vue par _g45Reg.lieu.
  Listes g45reg1_v4_/v3_ → v5_, g45reg1_f7_ → f8_.
- Saisons d'un club de FOOT (rendu après « Barre de filtres » dans loadTeamSaisons) — 20261005y (capture Real Madrid : seulement
  Prochains matchs, aucune case cochée) : le filtre g45_saison_filters est COMMUN à tous les clubs ; une case cochée ailleurs absente ici
  (Ligue Europa…) vidait toutes les saisons → si aucune case active n'existe chez ce club, « Toutes » pour cet affichage (sans effacer le choix).
  PÉRIMÈTRE voulu par Antoine (07/10) : foot buteur + passeur · hockey buteur + passeur · NFL touchdown · MLB run + home run ·
  rugby XV et NRL marqueur d'essai · PAS le basket (« un autre monde »). Chaque sport = sa propre sonde (sources différentes).
- Notifications multi-appareils (28g + worker redéployé : « N appareils reliés ») :
  vérifier qu'un pari saisi sur PC fait sonner le téléphone. Détail technique :
  `_g45NotifCompte()` (empreinte SHA-256 du compte), route /psub du worker (listes
  partagées entre appareils de même `compte`).
- Après la trêve : ESPN écrit-il des « Preview » pour le foot ? (summary sans lang=fr,
  article.type).

RÉGLÉ OU ABANDONNÉ (ne pas reproposer) :
- APK bet45 sans barre d'adresse : OK. Logos Lakers / hockey : OK. « Connexion » sur le
  logo, paysage gones, pression en portrait, « 1. FC », cartes KHL, compos rugby : OK
  selon Antoine. APK : garder l'ouverture actuelle (page d'accueil).
- Kalshi / Polymarket : abandonnés (429 en continu / bloqué ANJ). Voir §6.

PLUS TARD (saison) : KHL playoffs + curseurs KHL (printemps) ; bloc Arbitre rugby
(scoreboard par plage → 400).

HISTORIQUE UTILE (détails techniques) :
- APK TWA bet45 : paquet fr.bet45.twa, empreinte CE:21:79:F3:…:3C:2C ; fenotte45 :
  manifest.json, .well-known/assetlinks.json + .nojekyll, telecharger/bet45.apk ;
  bloc Outils `g45InstPoser` (bet45 seulement). La clé de signature est chez Antoine :
  NE JAMAIS la demander ni la mettre dans un dépôt.
- gones45 : icône = logo Bad Gones (icon-gones-192/512.png) ; installé par le navigateur.
- Kalshi : route host=kalshi dans worker.js (inoffensive), séries KX…GAME ; 429 via
  Cloudflare. Polymarket bloqué en France (ANJ) : ne pas contourner.
- Tout test console lancé SUR la page BET45 subit sa CSP : sonder un domaine absent de
  connect-src dans un onglet à part ou via le worker.

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
