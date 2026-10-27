# HISTORIQUE.md — GONES45 / BET45 (détail de tout ce qui a été fait)

Ce fichier contient, MOT POUR MOT, les anciennes sections 5, 6 et 7 de CLAUDE.md (jusqu'au 19/10/2026, version 20261019c).
On ne le lit PAS en entier : on y cherche avec `grep -n "<nom de fonction ou mot>" HISTORIQUE.md` puis on lit autour (sed -n).
Chaque nouvelle livraison ajoute sa note datée (AAAAMMJJx + citation d'Antoine + quoi + où) dans la bonne rubrique ci-dessous.
Il est dans les DEUX dépôts (gones45 et fenotte45), identique (cmp). Jamais de clé, jeton ou mot de passe.

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
  20261018r (« il manque une sélection Écart ») : carte des curseurs foot « Handicap · écart de buts », chaque ligne expliquée (−1,5 = gagne de 2 buts ou +,
  +1,5 = perd de 1 but max, 0 = nul remboursé). Calcul inchangé (clés H / X).
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
- 20261020b (capture téléphone Forme : pastilles coupées, noms sur 3 lignes ; maquette validée « oui go », chiffres en gras) : `g45FormeRender` —
  < 600 px : tableau (.g45fo-tab) caché, CARTES .g45fo-cartes (nom 16 px, « MJ · V-N-D · buts · diff » 14 px gras blanc, pastilles 22 px en retour à
  la ligne, points / % à droite, bande verte 5 premiers / rouge 3 derniers, clic = g45CompetOuvrir). PC / paysage inchangés. Rendu vérifié Chromium 412 px.
- 20261020a (capture : Compétitions → Ligue 1 → Équipes = 519 équipes, Forme « recherche de 519 ») : la liste des équipes du formulaire de pari
  (eq de _g45CompetEquipes + équipes du calendrier « all » par eq.push) était le MÊME tableau que _g45CompetCache → la liste mémorisée de la
  ligue gonflait ; copie .slice() ; caches g45cm11_soccer_ effacés une fois (g45_cm_fix1). RÈGLE : ne jamais modifier un tableau rendu par un cache.
  19/10 : « boutons des Séries individuelles lents » → réparé tout seul selon Antoine (20/10), rien changé.
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
  20261015y (capture Mbappé « y a besoin de lifting », maquette validée « oui go ») : rendu de g45MurJoueurPanel (foot) refait en place —
  données inchangées (d / dC / dI) rangées dans window._g45MjD ; `_g45MjHtml` = en-tête photo (visuel TheSportsDB _g45JoueurVisLire sinon
  ESPN, aussi posé dans le rond de l'en-tête via _g45HeroPoser + u.logoUrl) + boutons par compétition `g45MjOnglet(i)` (_g45MjSel) + chance de
  marquer en grand + 4 cases + ligne penalty / minutes / conversion / titulaire + « 📋 Voir ses matchs » (g45ButToggleMatchs). Smoke (47).
  20261016k (« l'expliquer simplement ») : pied de la fiche « Chance = 1 − e^−buts par match » → « Calcul : d'après ses buts par match (statistiques ESPN). »
  20261015t (« mettre des joueurs NHL dans mon mur », maquette validée « oui go ») — 🏒 JOUEUR NHL DU MUR : entrée « 👤 Joueur / Buteur »
  avec sport 🏒 → onglet « 🏒 Stats » (enveloppes de g45MurJoueurPanel / _g45MurJoueurUI, bloc en fin d'app.js) : `g45NhlJoueurPanel` →
  `_g45NhlJCharger` (club = note sinon nom via _g45RegEquipe ; club-stats/<ABR>/<saison>/2, joueur par nom de famille `_g45NhlJTrouver` ;
  game-log ; club-schedule-season/<ABR>/now) → `_g45NhlJHtml` (saison : buts, passes, points + tirs / +/- / temps si présents ; séries
  _g45RegCalc avec boutons Buts / Passes / Points `g45NhlJCat` ; 10 derniers matchs ; prochain match ; gardien = victoires / % arrêts /
  moyenne / blanchissages). Champs NON sondés (shots, plusMinus, avgTimeOnIcePerGame, opponentAbbrev, sweaterNumber, stats gardien) :
  affichés seulement s'ils existent. Cache g45nhlj1_eq_ 6 h, g45nhlj1_log_ 1 h. Smoke (46). Recherche « Rechercher un club » = équipes seulement.
  CONFIRMÉ par Antoine (capture 15/10 23:53, McDavid) : photo, 4 B / 13 A / 17 pts, tirs 14, +/- +14, temps 23:34 → shots, plusMinus,
  avgTimeOnIcePerGame (secondes) EXISTENT dans club-stats.
  20261015u (« oui mets sa photo », rond de la fiche = « CON ») : g45NhlJoueurPanel garde p.headshot dans u.logoUrl (save) et le pose
  dans l'en-tête (_g45HeroPoser), comme _g45ButPhoto au foot. Carte du mur : rond de droite = logo du club (Oilers), inchangé.
  20261015v (« McDavid photo du joueur ») : la carte du mur (DEUX copies du rendu) lit _g45JoueurVisLire(u.n) SANS sport = clé foot → un
  joueur 🏒 n'avait jamais de visuel. Enveloppe window._g45JoueurVisLire : sans sport → sport de l'entrée (🏒 hockey, 🏉 rugby / NRL), puis pour
  🏒 la photo NHL gardée dans u.logoUrl (nhle.com) en détouré centré. Chicago Blackhawks sans fond : sonde TheSportsDB demandée à Antoine.
  CONFIRMÉ (capture 15/10 23:59) : photos McDavid et Celebrini sur leurs cartes. 20261015w : rond de droite (logo du club) d'un joueur 🏒 :
  _g45JoueurClubLogo cherchait le club en FOOT (g45SdbClub(club,'⚽')) → San Jose Sharks absent ; enveloppe : club NHL reconnu
  (_g45RegEquipe) → g45LogoUrlDe(note) sinon assets.nhle.com/logos/nhl/svg/<ABR>_light.svg, puis 20261015x (« je les vois à peine ») _dark.svg — CONFIRMÉ (capture 16/10 00:12 : Oilers, Sharks, Lightning, Bruins visibles). Lamine Yamal (foot, note « FC Barcelone ») sans photo ni logo : note à écrire « Barcelona », sinon sonde g45VisuelJoueur demain. Chicago : sonde demain sur PC.
  20261016a (« Vancouver il connaît pas » : ÉQUIPE 🏒 du mur sans logo) : enveloppe window.g45LogoUrlDe — rien trouvé et entrée du mur de ce
  nom en 🏒 (pas joueur) reconnue par _g45RegEquipe → assets.nhle.com/logos/nhl/svg/<ABR>_dark.svg. Fond (fanart TheSportsDB) des Canucks : même
  question que Chicago (sonde demain).
  20261016b (ticket Winamax « Passes décisives : 1 ou plus · Connor McDavid » en Cockpit → alerte « Edmonton Oilers n'est pas une équipe de ton
  mur ») : `_g45TicketRemplirCockpit` choisit D'ABORD dans #c-unit une carte JOUEUR du mur (u.type 'joueur') dont le nom contient le nom de famille
  du champ joueur du ticket (prénom pour départager), puis l'équipe comme avant. Smoke (48).
  20261018z (capture : « FC Barcelone » lu, « Barcelona » au mur → alerte « pas une équipe de ton mur ») : dernier essai par RACINES `window._g45TkRacines`
  (5 premières lettres des mots ≥ 5 lettres, mots génériques retirés, égalité des deux côtés : Barcelone = Barcelona, Séville = Sevilla, Manchester United ≠ City),
  pour l'équipe ET l'adversaire. Testé node 7/7.
  20261019a (« AS Rome » lu, « AS Roma » au mur) : mots de 4 lettres gardés + table TR ville française → nom du club (rome→roma, naples→napoli, turin→torino…) ; testé node 10/10.
  Même livraison : style #g45-opt-lisible = toutes les options de <select> sur fond sombre, texte blanc (liste « Équipe » blanc sur blanc sur PC).
  20261019b (capture : pari enregistré en type « Résultat ») : `_g45TicketIa` — « Résultat <équipe> » / « 1N2 » seul → « Victoire » ; « nul » → « Nul » ;
  sélection = adversaire (racines) → « Défaite » ; marché combiné (buts, +, &, mi-temps, handicap…) inchangé. Testé node 7/7.
  20261016c (« Équipe jouée Edmonton non ? ») : carte joueur choisie → #c-equipe = équipe du ticket, sinon note de la carte (Edmonton Oilers).
  20261020p (capture cockpit « soucis palier », « j'ai trouvé le coupable », « adversaire alors que non c'est l'équipe dans laquelle il joue » :
  ticket Celebrini lu « Montreal Canadiens » 🏠 + adversaire « San Jose Sharks » → palier DOMICILE au lieu d'extérieur) : `_g45TicketRemplirCockpit`,
  carte JOUEUR choisie → si le club de la carte (_g45UClub : u.club ou note) correspond à l'ADVERSAIRE lu (égal / inclus / _g45TkRacines) et pas à
  l'équipe lue → équipe ↔ adversaire inversés + lieu inversé (donc bon palier _g45PalLieu). Sans club noté sur la carte : rien ne change. Smoke tkj (65).
  20261016d (capture : champ toujours grisé « Connor McDavid ») : updMise → `_g45MajEquipeJouee` remettait u.n en lecture seule ; carte joueur →
  champ LIBRE = u.note (club), valeur déjà posée (ticket) gardée.
  20261016e : carte « En cours » (titre) = h.eq (Équipe jouée) avant h.n → « Edmonton Oilers – Utah Mammoth ».
  20261016f (ticket « Résultat Florida Panthers » vs Vancouver, Florida hors mur ; choix d'Antoine « celle de Vancouver ») : équipe du ticket absente
  du mur mais ADVERSAIRE au mur (club, pas joueur / compétition) → sa carte, adversaire = équipe du ticket, lieu inversé, Résultat / Victoire → « Défaite ». Smoke (49).
  20261024u (capture Winamax MyMatch « Résultat Atl. Madrid / Nombre de buts Moins de 3,5 » lue « Résultat + Moins de 3,5 buts ») : consigne IA → « Résultat » toujours avec sa sélection ; garde-fou COMBINÉ : chaque morceau « Résultat [sél.] » → Victoire / Nul / Défaite (sans sélection = Victoire, l'équipe pariée). 6/6 tests.
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
  20261013q (« dropbox je m'en sers plus ») : jeton, clé et secret Dropbox RETIRÉS d'app.js (_dbxConfig vide ×2, setItem du jeton ×2 remplacé par
  un effacement de l'ancien jeton chez les visiteurs ; sauvegarde auto sans jeton = muette). À RÉVOQUER côté Dropbox par Antoine (il reste dans
  l'historique git). LICENSE « Tous droits réservés » dans les deux dépôts + ligne © en tête d'app.js.
  20261013t (« faudrait indiquer que ce lieu lit les paris ? », maquette validée « OUI ») : encadré pointillé bleu .g45-tk-ban AU-DESSUS de #pc-note
  (bloc en fin d'app.js) « 📷 Colle ici la capture de ton ticket (Ctrl+V ou glisser-déposer) → le pari se remplit tout seul » + books reconnus ;
  clic = focus du pense-bête, dépôt d'image sur l'encadré = window._g45TicketTraiter ; placeholder « Ou écris tes notes, cotes… ». Contrôle smoke.js (20).
- SYNCHRO DES PARIS (GitHub, Antoine seul, données/paris_antoine.json chiffré) — 20261007l : le 09/10, PC éteint après 3 paris (22:16-22:20),
  téléphone resté ANCIEN saisit Lens–Lyon → poussait SON état entier (23:19) → 3 paris perdus partout (restaurés par commande console depuis
  le commit adc4c09). Correctif (bloc en fin d'app.js) : `_g45PushBetsGithub` REMPLACÉE — avant chaque envoi, version GitHub plus récente que
  g45_betsync_ts → déchiffrée et fusionnée par `_g45BetsFusion` (pari absent ajouté + effet solde ; en cours ici / réglé là-bas → repris réglé,
  palier recopié ; pierres tombales state.hOff 120 j via enveloppes deleteArchived / cancelBet) ; illisible → envoi ANNULÉ ; sha refusé → 1
  nouvel essai ; envois sérialisés. NON fusionnés : modification d'un pari présent des deux côtés, dépôts / retraits manuels. Testé : 15 cas vm +
  scénario complet Chromium avec faux GitHub (4 paris, solde juste).
  20261013v (capture Agenda « bizarre les paliers » : Carolina P3 🏠, Colorado P2 ✈️ alors que leur dernier pari de montante, le 09/10, était GAGNÉ ;
  console d'Antoine : lc {nhl|dom:3} / {nhl|ext:2}) : cause probable = paris remis à la main le 09/10 (restauration) sans palier. `_g45BetsFusion`
  étape 3 (pari absent ici, ajouté DÉJÀ RÉGLÉ) ne touchait pas au palier → recopie de la clé _g45PalKey(comp, lieu) depuis l'appareil distant, sinon
  gagné → 1. Testé Chromium (2 gagnés → P1, perdu sans info → inchangé). Données d'Antoine corrigées par commande console (pas par l'appli).
- 📋 PARIS « EN COURS » EN CARTES (20261013u, capture « c'est pareil on pourrait mieux faire ? », maquette validée « OUI viable pour combi cockpit et
  simple ») : bloc en fin d'app.js ; #live-norm et #live-strat (rendu d'origine de render, DEUX copies, intact) REMPLACÉS par des cartes via
  MutationObserver (ligne data-g45ec) : rond du sport `_g45ParisRond` + bbadge, compétition · « mar. 13/10 » · heure · lieu, match 17 px, type + joueur(s)
  (h.joueurs[].nom / h.joueur, jmode), cote « @2,00 », mise, gain possible (freebet m×(cote−1), lay sans gain), ✅ Gagné / ❌ Perdu (classes sbtn sw / sl
  gardées), 📡 Match / ✏️ / 🗑️ ; thead caché, min-width 0. `_g45AvScanner` pose son « 🤖 Valider » dans .g45ec-mid. DIRECT (pas les combinés) : coup
  d'envoi −5 min → +3 h 30 → `_g45MatchMeta` (eid/sp/lg) + scoreboard ESPN du jour (mémoire 60 s) → « 🔴 EN DIRECT · 2-0 · 67' · ✅ gagnant si ça reste
  comme ça / ⏳ pas encore gagnant » (`_g45AvPari`), fini → « 🏁 Terminé ». Relu chaque minute. Rendu vérifié Chromium 1280 + 400 px. Contrôle smoke.js (21).
- 🏦 ONGLET BANK (20261015e, aperçus en image validés « PEUT ÊTRE SÉPARER LES BANQUES ? » → « OUI ») : bloc en fin d'app.js. window.renderBooksChart
  REDÉFINIE (rond SVG + total au centre + légende 15 px triée montant / %, dans .cwrap → #g45-bk-cw ; titre « total · 🎰 bookmakers · 🏦 banques ») ;
  #books-grid refait après render (MutationObserver, cartes .g45bk) par `_g45BkGrille` : 🎰 Bookmakers triés par solde puis section #g45-bk-banques ;
  carte `_g45BkCarte` (bkFavicon 28 px, nom `_g45BkNom` : suffixe Antoine / Laura → étiquette, solde 26 px, barre % du capital, freebet, ligne « 🎯 Paris »
  `_g45BkParis` = paris RÉGLÉS de state.a sur ce book, règle de _betSettleEffect, ✏️ Modifier / 🎟 Freebet (pas pour une banque) / 🗑️, couleur).
  Banque = nom `_G45_BK_BANQUE` / `_g45BkEstBanque` (Boursorama, BNP, LCL, Revolut…) ; choix à la main NON fait (à la demande). Smoke (38).
  20261015f (« avec la pastille Laura mets le vrai logo du book… et le logo de Boursorama ») : enveloppe window.bkFavicon (vaut PARTOUT) — clé hors BK
  finissant par antoine / laura → logo du book de base (BK) ; sinon nom reconnu dans `_G45_BK_DOM` (Boursorama → boursobank.com, Pinnacle, Zebet,
  NetBet, banques…) → favicon Google s2 du domaine. Domaines NON vérifiés un par un (échec = initiales via logoErr).
- 💳 20261027a — ABONNEMENTS dans Bank (« j'ai souscrit Windscribe 3 €/mois ; section abonnement qui déduit par mois sur une banque choisie, avec un historique », maquette image « OUI, le 27 et premier aujourd'hui ») : bloc fin d'app.js, #g45-abo sous Banques. state.abo [{id,n,m,j,b,on,cree}], state.aboH [{id: abo|AAAA-MM, a,n,m,b,d}] ; `_g45AboTraiter(auj)` prélève chaque échéance (jour j ou dernier jour du mois) depuis la création, une fois par mois (id), au chargement + toutes les heures ; formulaire (nom, montant, jour, compte : banques d'abord), Modifier / ⏸️ / ✕ (aboOff, historique gardé) ; `_g45BetsFusion` enveloppé : abonnements + lignes d'historique de l'autre appareil (appliquées une fois). Bankroll baisse, bénéfice des paris non. Smoke abo (105), capture vérifiée.
- 📜 20261027b — HISTORIQUE DES MOUVEMENTS dans Bank (« l'historique pourrait écrire les dépôts et retraits », maquette image « Oui ») : editBook (2 copies) enveloppé par son nom global → state.mvt [{id,d,k,v,av,ap}] (500 max) ; #g45-mvt sous les abonnements = dépôts (+ vert) / retraits (− rouge) / prélèvements (state.aboH), filtres Tout / Dépôts / Retraits / Abonnements (g45_mvt_f), total du mois ; l'ancien « historique des prélèvements » de la section abonnements est remplacé. Synchro : lignes mvt de l'autre appareil ajoutées (sans toucher aux soldes). Commence le 27/10 (rien noté avant). Smoke mvt (106), capture vérifiée.
- 🪜 20261027c (Real « domicile devrait être P1 » ; sonde : u.lc = {laliga|ext:1, laliga|dom:2, liga|dom:1, liga|ext:1} ; liste compétitions = LaLiga, Liga, La Liga, Spanish LALIGA) : `_g45CompNz` + _G45_COMP_ALIAS (Liga / La Liga / LaLiga / Spanish LALIGA / Primera Division → liga ; Ligue 1 McDonald's → ligue1 ; Serie A Enilive → seriea ; EPL → premierleague ; LDC / C1 ; Europa / C3 ; noms longs NHL / NBA / NFL / MLB) ; `_g45LcCanon` (fin d'app.js, avant chaque render) fusionne les clés u.lc en double en gardant le palier de l'échelle du pari le plus récent ; datalist compétitions : une écriture par championnat. Test vm (Real → liga|dom 1), smoke lcCanon (107).
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
  20261008p (maquette validée « oui sur mobile, PC bouge pas ») : bouton « 📱 Auto ▾ » dans header.topbar entre le logo et .top-cap
  (`g45OriHautPoser`, TÉLÉPHONE seulement : pointer coarse + _g45OriDispo) → menu fixe `g45OriHautMenu` Auto / Portrait / Paysage →
  `g45OriHautChoisir` → g45OriChoisir (appel synchrone dans le clic) ; refus → message orange 6 s. Bloc d'Outils GARDÉ. Testé Chromium (mobile + PC).
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
  20261008f (AS Roma « 📌 🏠 victoire+under 3.5 » : « Roma extérieur ne doit pas être dans l'agenda ») : `_agMur(m)` (recherche souple
  partagée avec `_agPalier`) + `window._g45AgLieuOk(m, u)` : consigne u.note avec 🏠 SEUL → matchs à l'extérieur RETIRÉS de l'Agenda ; ✈️ seul →
  domicile retirés ; les deux / aucun / suivi à la main = gardé. Testé vm 8/8. 20261008g (maquette validée « JE VALIDE LA MAQUETTE ») — COTES DANS L'AGENDA : bloc en fin d'app.js ;
  `_g45AgConsigne(note, isDom)` (partie 🏠 / ✈️ du lieu, « OU » = options, « + » = jambes vic / def (jouer contre) / vqr / ov / un X / but / ?,
  seuil « inférieure à 1.5 », no bet) ; loadCalendrier pose « 📌 consigne » + #g45agod-<i> (liste _agOd) → `window._g45AgCotes` : scoreboard ESPN du
  jour (puis veille) sport/compSlug, mémoire 30 min, ≤ 8 jours, match par id ou noms (`_g45AgOdEv`, _g45TrOddsEv + total.over/under) →
  `_g45AgOdHtml` (combiné = produit ESTIMÉ, ligne over/under ≠ ESPN → « ligne non proposée », ✅/❌ seuil sur cote victoire/défaite).
  Pas de cotes : KHL, Euroleague, Pro A. Testé vm 15/15 + rendu Chromium. CONFIRMÉ par Antoine (capture) : NHL Hurricanes 1,56.
  20261025k (« l'agenda va comprendre ? » : consigne « Dallas Stars Nombre de buts de Dallas Stars Plus de 2,5 », ticket MyMatch Vainqueur Dallas + buts de Dallas +2,5) : « Plus de 2,5 » était pris pour le TOTAL du match → `_g45AgConsigne` : jambe 'teq' (« buts de / du / des / d' <équipe> plus / moins de N ») ; « vainqueur » ignoré si la jambe parle de buts d'une équipe ; `_g45AgOdHtml` : « 🎯 <équipe> plus de N buts · pas de cote chez ESPN, regarde ton book ». Test vm 4/4, smoke 103.
  20261014o (« le cache est trop noir et vide au milieu », maquette en image, choix 2 validé) : carte de l'Agenda = logos des DEUX équipes face à face
  en filigrane « VS » (.g45ag-vs, opacité .24, à gauche de l'heure ; téléphone < 600 px : plus petits, .3) ; m.ourLogo / m.advLogo : foot = homeLogo /
  awayLogo du calendrier sinon a.espncdn.com/i/teamlogos/soccer/500/<id>.png ; ⭐ suivies = _espnLogoDe ; Euroleague = u.logoUrl / écusson + x.ol
  (ajouté aux av de _g45EbCharger) ; KHL = g45KhlLogo ; suivi à la main = rien. Bande de la consigne 📌 à la largeur du texte. Smoke (31).
  20261014p (capture : « centrer les logos et les mettre plus visibles ») : filigrane centré (left 58 %, translate −50 %), opacité .55, 120 px max ;
  téléphone : à droite, .35. CONFIRMÉ en capture (14o) : vrais logos ESPN affichés (PSG, City, Real, Roma, Brewers, Dodgers, Avalanche, Stars).
  20261014q (« à droite on laisse l'horaire ? », maquette « oui ») : heure SOUS le « VS » (blanc 20 px, bande sombre, .g45ag-ht) ; heure de droite
  cachée (.g45ag-hr) ; logos DANS la ligne (ressorts flex 1 1 0 de part et d'autre, texte flex 0 1 auto) au lieu de position absolue (passait sous la
  consigne à 1100 px) ; téléphone < 600 px : logos cachés, heure à droite.
  20261018w (captures paysage : texte de la carte en colonne de 2 lettres) : feuille #g45-ag-pays (fin d'app.js, dans <head>) — téléphone en PAYSAGE
  (landscape, hauteur ≤ 520, largeur ≤ 1099) = rendu portrait (logos cachés, heure à droite).
  20261016h (« dans agenda faudrait rajouter les joueurs ? », maquette validée « oui go ») : `_agJou()` dans loadCalendrier — cartes JOUEUR 🏒 du mur
  (u.type 'joueur') → club _g45RegEquipe(note | nom) → club-schedule-season/<ABR>/now (worker host=nhl), 14 j, gameType 1 écarté ; m.joueur {nom, ph = u.logoUrl
  nhle, club} : rond = photo + 🏒, titre = joueur, ligne « club vs / @ adversaire » (placeName + commonName NON sondés, sinon ville + surnom _G45_REG_EQ),
  palier comme les équipes, consigne 📌 seulement si la note a 🏠 / ✈️, pas de cotes. Smoke (51).
  20261018x (capture : Kucherov / Celebrini / Pastrnak sans photo) : photo = u.logoUrl nhle (posée seulement par la fiche 🏒 Stats) → sinon _agJou lit
  club-stats (cache g45nhlj1_eq_ 6 h), headshot via _g45NhlJTrouver, gardé dans u.logoUrl + save() ; signature du cache Agenda + 'x' (liste refaite une fois).
  20261017p (« si j'y rajoute le type de pari, l'agenda va le lire ? ») : note d'une carte JOUEUR 🏒 = « <club> 🏠 <pari> ✈️ <pari> » → club = texte AVANT
  le 1er 🏠 / ✈️ (`_clubDe` dans _agJou ; avant : note entière en ligne club), consigne 📌 = _g45AgConsigne comme les équipes ; 🏠 seul = matchs à l'extérieur retirés.
  20261017q (« remplacer les liens Sofa / Flashscore par 🏠 type de pari / ✈️ type de pari » + « pour les joueurs, club avec une recherche », maquettes
  validées) : bloc en fin d'app.js — formulaire du mur ET « Modifier » : liens cachés (restent dans 🔗 Liens), cases #u-pdom / #u-pext (#edit-unit-pdom / -pext),
  joueur → #u-club / #edit-unit-club (recherche g45UfClubTape : clubs NHL _G45_REG_EQ, fuzzyClubSearch, g45SdbSearch ; choix règle #u-sport). TOUT dans u.note :
  `_g45UfCompose` = [club · ]libre [🏠 x] [✈️ y] (cases égales → « 🏠/✈️ x »), `_g45UfDecoupe` pour « Modifier » ; u.club en plus pour un joueur. `_g45UClub(u)`
  (u.club, sinon note avant 🏠 / ✈️ et « · ») remplace u.note partout où la note servait de CLUB (ButIdMur, MajEquipeJouee, JoueurClubLogo, ticket Cockpit,
  NHL joueur, Agenda). setUnitType = portée fermée → clic des boutons écouté. Smoke (ufLieu, 56).
  20261025b (« on n'a pas global si on veut jouer domicile + extérieur » → maquette « oui ») : formulaire du mur (ajout + Modifier) : bouton « 🌍 Même pari partout » OUI / NON (id u-ptout / edit-unit-ptout) → une case « 🌍 Pari (domicile + extérieur) » (…ppart) recopiée à chaque frappe dans 🏠 et ✈️ (cachées) ; note composée inchangée (« 🏠/✈️ x »). Modifier : OUI tout seul si les deux lieux ont le même texte. Remis à NON après un ajout. Smoke ufTout (99).
  20261017r (capture Barça « condition remplie 1,41 », « c'est ❌ », validé « oui ») : `_g45AgOdHtml` — « si cote inférieure à X » = règle de la MONTANTE :
  résultat seul < X → « ❌ Victoire seule 1,41 < 1,5 → ajoute under 3,5 » (autres jambes de la 1re option) ; ≥ X → « ✅ … → la victoire seule suffit ».
  20261017s (capture « Chargement du calendrier… » : « laissez en cache jusqu'au début du match ») : bloc en fin d'app.js — window.loadCalendrier
  (exporté à l'INIT, ≈ l. 28028 → enveloppe posée dès qu'il existe, setInterval 1 s) : liste affichée GARDÉE (cotes comprises, rien relu) tant
  qu'aucun match listé n'a commencé (window._g45AgDates posé dans loadCalendrier après le filtre lieu) et 6 h max, et que la signature (mur : nom /
  note / étoiles / palier / sport / type / club, state.lc, nb de paris h / a, ⭐ suivies) n'a pas changé ; « ↻ Actualiser » = vraie relecture ;
  lecture en cours non relancée ; mémoire de session. Smoke (agCache, 57).
  20261018i (« même mieux : liste sur 1 semaine, réactualisée 1× par jour, les matchs joués s'effacent ») : bloc 17s REFAIT — liste gardée sur l'appareil
  (IndexedDB g45/kv clé 'ag1' {sig, j, t, n0, html}, copie refaite 25 s après pour les cotes) tant que même JOUR + même signature ; cartes data-g45agt
  (début du match) retirées à la FIN du match (20261018v : data-g45agd = durée par sport, foot 2 h 10, NHL 3 h, NBA 2 h 50, NFL / MLB 3 h 35, rugby 2 h 20 ; avant 3 h pour tous) (window._g45AgPurger, chaque minute), titre de jour data-g45agj vidé retiré ; loadCalendrier limité à 7 jours.
  20261019c (capture : Kucherov affiché, pas la carte « Vancouver Canucks » du mur) : hors foot, l'Agenda ne lisait que les ⭐ suivies → `_agSuivis` ajoute les
  ÉQUIPES du mur 🏒 / 🏀 / 🏈 / ⚾ (NHL / NBA / NFL / MLB, retrouvées par nom via _g45CompetEquipes ; nom du mur gardé pour palier / consigne) ; signature du cache + 'c'. Testé node.
  20261017t (« l'agenda fait combien de matchs ? » → « oui ») : loadCalendrier lit 15 clubs de foot du mur (avant 8) et 20 avec les ⭐ suivies (avant 14).
  20261017u (« j'ai 35 équipes perso ») : plus AUCUN plafond (tous les clubs de foot du mur + ⭐ suivies), lus 6 à la fois (_agFootP, 20 s max chacun).
  20261017v (« joueur compris ») : carte JOUEUR ⚽ du mur → calendrier de son CLUB (_g45UClub ; pas de club = ignorée, avant son NOM était cherché
  comme une équipe) ; pas d'exclusion « équipe déjà vue » ; m.joueur {nom, club, ph = _g45JoueurVisLire cut/thumb sinon u.logoUrl hors logo} ;
  ourName = nom du joueur (palier / consigne 📌 de SA carte). Rendu réel NON vérifié (ESPN simulé vide en test).
  20261017w (« bet45, la limite du mur doit correspondre ») : sur bet45 (_g45MurLimite), clubs lus par l'Agenda plafonnés à _G45_MUR_MAX (15), mur d'abord puis ⭐ ; gones sans limite.
  20261017x (« on peut faire NFL et NBA ») : window._g45AgJouUs(nowTs) (fin d'app.js, appelé par loadCalendrier, 20 s max) — carte JOUEUR 🏈 / 🏀 → club
  (_g45UClub) dans _g45CompetEquipes({sp, s: nfl|nba}) (nom, court, dernier mot ≥ 4 lettres) → …/teams/<id>/schedule?season=_g45SgAnAuto&seasontype=2,
  14 jours, une lecture par club ; même carte que les joueurs NHL. Testé Chromium (ESPN simulé : Mahomes @ Broncos + consigne). ⚾ = attente sonde lanceurs.
  20261018g (« une belle page en attendant ? » → « pense à soutenir le projet… sinon carte grise », maquette validée, « Laisser pourboire ») :
  loadCalendrier pose window._g45AgAttenteHtml() pendant la lecture (bloc en fin d'app.js) : bet45 sans window._g45Soutien → carte ☕ « Pense à soutenir
  BET45 » + « ☕ Laisser un pourboire » (paypal.me, sans contrepartie) ; soutien / gones → 3 cartes grises qui brillent (.g45ag-gris). Smoke (agAtt, 59).
  20261018h — ❤️ ÉQUIPE PRÉFÉRÉE (idée d'Antoine, maquettes validées « tu peux coder », « attention à ne pas faire de doublon ») : fenotte45/reset.html,
  compte créé < 3 jours : sport + recherche TheSportsDB (worker host=tsdb puis direct) → localStorage g45_fav_attente {n, sport, logo, col} ; app.js (bloc en
  fin, après le mur de départ) `_g45FavAppliquer(st, F, plein)` : club déjà au mur (`_g45FavMeme` : nom, _G45_TSDB_ALIAS, inclus ≥ 5 lettres) → passe en 1er,
  sinon ajouté en 1er si mur pas plein (sinon alerte) ; state.fav. ❤️ sur la carte du mur (.g45-fav-c) ; bouton 🤍/❤️ par équipe dans Outils → Équipes
  (`g45FavChoisir(i)`, comptes existants : Cédric = Portugal à toucher lui-même). Page d'attente de l'Agenda (soutien / gones) : `_g45FavLogo` = logo
  qui respire + anneau aux couleurs (g45CouleursDe) qui tourne. Smoke (fav, 60). reset.html : rendu réel NON vérifié (session Supabase).
  20261016i (Santé : TheSportsDB « trop lent (12 s) » depuis 4 h ; console d'Antoine : searchteams « Club / Athletic / CD / FC Connor McDavid » en
  522 / CORS ; Arsenal = 200 en 19 s → serveur TheSportsDB surchargé) : `_g45FanChercher` (fond de carte) et `_g45BgChercher` (fond de fiche) ne
  cherchent plus d'ÉQUIPE pour une carte JOUEUR du mur (8 variantes par joueur) ; la recherche de JOUEUR (searchplayers, 1 requête) reste. Smoke (52).
  20261016j (console : « Deportivo Vancouver Canucks ») : `_g45FanVariantes(nom, sport)` n'ajoute les préfixes de foot (Deportivo, Real, Club…) que pour le foot ou un sport inconnu.
  20261016m (console : « club / athletic / cd / fc harry kane ») : `g45SdbClub` (blason) aussi — joueur du mur → null, sport passé à _g45FanVariantes.
  20261016n (« Chicago / Vancouver pas de bannière ? ») : `_g45FanChercher` (g45_fanart2_, négatif 30 j) et `_g45BgChercher` (g45bgclub1_) ne mémorisent
  plus « pas d'image » si TheSportsDB n'a donné AUCUNE réponse (panne 522 / CORS) ; négatifs déjà gardés effacés une fois (drapeau g45_fan_neg1).
  Bannières Chicago / Canucks : NON vérifiées (TheSportsDB en panne le 16/10 au matin).
  ⚠ 20261016p — RÉGRESSION de 16n (gones figé, « plus aucune touche répond », bet45 OK) : sans échec mémorisé, _g45FanCompleter renvoyait
  maj = true → g45DirectMesEquipes(true) (Suivies) se redessinait et relançait la recherche SANS FIN. Échec de panne retenu 30 min en session
  (window._g45FanPanne lu par `_g45FanLire` → '' ; window._g45BgPanne pour `_g45BgChercher`). RÈGLE : un écran qui se redessine après une
  recherche doit toujours voir un résultat « connu » ensuite. Smoke (53).
  20261016q — gones TOUJOURS figé sur le téléphone après 16p et redémarrage (bet45 OK, gones en navigation privée OK → donnée locale) :
  NETTOYAGE D'URGENCE en TÊTE d'app.js : adresse ?menage=1 → efface les clés de cache (copie de _G45_CACHE_PREFIXES + g45cm11_, g45cls5_,
  g45bgclub1_, g45nhlj1_, g45jv…, g45khl_…), sessionStorage, tendances gardées (IndexedDB kv tr_*) ; JAMAIS g45v5 ni réglages / clés ;
  stoppe app.js (throw) puis recharge sans paramètre ; alerte « 🧹 Nettoyage fait : N … » (g45_menage_fait). Testé Chromium.
  CONFIRMÉ par Antoine (16/10 ~10 h, « ça remarche » après ?menage=1 dans l'appli : ≈ 1 200 clés effacées). Clé coupable exacte NON identifiée.
  20261016s (« faudrait avoir un site en cas de panne », « oui ») — RELAIS TheSportsDB : route worker host=tsdb (DÉPLOYÉE par Claude le 16/10, copie
  de l'ancienne version gardée ; liste blanche /api/v1/json/3/<searchteams|searchplayers|lookup…|eventsnext|eventslast>.php?…) : bonne réponse gardée
  3 jours (D1 tsdb:<chemin>, vide = 1 jour) + SECOURS 30 jours (tsdb:s:<chemin>, réponses non vides) servi si TheSportsDB échoue (5xx, 10 s, illisible).
  App : enveloppe de fetch en TÊTE d'app.js (après ?menage=1) → toute adresse www.thesportsdb.com/api/v1/json/3/… passe par le worker ; worker
  injoignable / 403 / 404 → appel direct ; 5xx rendu tel quel. Le test Santé « TheSportsDB » passe donc aussi par le worker. Smoke (54).
  ?menage=1 garde maintenant les IMAGES trouvées (clés fanart / img_perso / bgclub1 / jv / tph1 / herologo / wk1 / lglogo / catimg / mqfond avec une
  adresse) : seuls les échecs de ces caches partent. Testé Chromium.
  20261016t (capture 18:37 : TheSportsDB réparé, bannière du Bayern revenue mais pas celle du Real) : « pas d'image » mémorisés pendant la
  reprise (TheSportsDB surchargé répondait « aucune équipe ») effacés une 2e fois (drapeau g45_fan_neg2 : fanart2 / bgclub1 / g45jv sans adresse
  + g45_herologo_ko_) ; worker : réponse vide gardée 1 HEURE (au lieu d'un jour), clé fraîche tsdb2:<chemin> (anciennes tsdb: abandonnées).
  Le jeton Cloudflare n'a PAS accès à D1 (7403) : contenu du cache non vérifiable d'ici.
  20261023t (captures du 23/10 : « sportdb répondait plus, c'est bon mais les images reviennent pas », mur en Bannières, Hurricanes sans fond) :
  2e panne TheSportsDB → « pas d'image » mémorisés pendant la panne effacés une fois (drapeau g45_fan_neg4, même liste que neg2) ; ET un échec
  n'est plus gardé que 3 JOURS (_g45FanLire 30 → 3 ; _g45BgChercher 7 → 3) : à la prochaine panne les bannières reviennent seules. 2 essais vm,
  smoke 92. TheSportsDB / worker injoignables depuis la session (proxy 403) : retour des images NON vérifié d'ici.
  20261023u (console d'Antoine : worker 403 « thesportsdb indisponible » sur Carolina Hurricanes ET appel direct bloqué ; Paris Saint Germain
  200 = copie du worker) — VRAIE CAUSE : TheSportsDB a DÉSACTIVÉ la clé gratuite « 3 » (403 définitif), nouvelle clé gratuite « 123 »
  (documentation thesportsdb.com/documentation). App : l'enveloppe de fetch en tête d'app.js réécrit toute adresse …/api/v1/json/3/… en
  …/json/123/… (worker et direct), RX du relais sur 123. WORKER (déployé par Claude le 23/10, copie de l'ancien source gardée en session,
  18 liaisons et cron */5 revérifiés) : route tsdb accepte 3 et 123, copies D1 gardées sous l'ancien chemin /json/3/ (pas de cache perdu),
  appel TheSportsDB en /json/123/. 3 essais du bloc worker (faux TheSportsDB), smoke 92 (tsdbw : worker et direct doivent recevoir 123).
  reset.html (fenotte45) appelle encore /json/3/ par le worker : OK (le worker traduit).
  20261023v (« Carolina revenu mais problème avec Chicago NHL, Spurs NBA », joueurs foot sans photo) : Observability = clé 123 en 200, puis
  vague de 429 (tout redemandé d'un coup, ≈ 30 / min). Piège : _g45FanChercher / _g45BgChercher essaient plusieurs variantes de nom ; une
  variante en 429 + une autre « rien » → « pas d'image » mémorisé. Maintenant une variante en erreur (!r.ok) → rien mémorisé (_err / _errB,
  panne de session 30 min comme avant). « pas d'image » effacés une fois de plus (g45_fan_neg5). Smoke 92, 2 essais vm du nettoyage.
- 🏒 20261023w (nuit 0/5, « aïe aïe aïe » ; bilan officiel au 23/10 : 26/57, −12,6 u ; championnats foot 9/12 +3,0 ; coupes d'Europe 7/16
  −4,6 ; NBA 5/10 −1,0 ; NFL 2/7 −3,1 ; NHL 3/12 −6,8 dont buts 2/8 ; stats 60 % contre book 51 % sur les buts NHL. Antoine : Oilers +6,5
  buts 48/82 = 59 %, Wild 43/88 = 49 % ; « les over NHL pas top, les victoires d'équipe il y a de quoi faire ») : tendances.mjs NHL_BUTS_PAUSE
  = true → plus de « + / − de N,5 buts » NHL dans la sélection officielle ; victoires / handicaps NHL gardés. Robot seulement. À revoir le 15/11.
  20261023x (« NFL pareil pour les over / under, bon très peu de matchs » ; NFL − de N,5 points 0/2) : NFL_PTS_PAUSE = true, même filtre
  (« de N,5 points ») ; vainqueur / handicap NFL gardés. Robot seulement. À revoir le 15/11.
  20261023y — 📊 BILANS (abonnement Claude d'Antoine fini avant le 15/11 ; « si on peut faire une sélection de tel pari alors c'est le top, mais
  dispo que sur gones pour mettre en ligne » ; maquette scratchpad maquette-bilans-attente.html, « classe par sport et leur pari et c'est
  parfait ») : app.js `_g45BilHtml` (window._g45Bil), 4e sous-bouton « 📊 Bilans » de Tendances BET45 (SOUS.bil, seulement si
  _g45SanteActive ; sinon retombe sur Sélection). Par sport (Foot : championnats buts / 2 marquent / vainqueur, coupes d'Europe buts / vainqueur /
  hors règle 🧪 ; NHL buts / victoires ; NBA points / vainqueur ; NFL total / vainqueur ; Tennis vainqueur, value 🧪, suivi BET45-book ℹ️) :
  bilan (réussite + gains à 1 € sur les paris avec cote), conseil (< 20 paris ⏳ ; gains > 0 ✅ ; sinon ❌ / ⚠️), interrupteur (PAUSE / MARCHE
  pour nba_pts, nhl_buts, nfl_pts ; TEST / OFFICIEL pour tn_tv, ce_hors). « 💾 Mettre en ligne » (confirm) → PUT données/robot_reglages.json
  { maj, pause, officiel } avec gones45_github_token. ROBOT : RR lu au départ (RRp / RRo, défauts si absent) ; marché en pause = plus jeté
  mais rangé dans J.pz (x.pz = clé), jugé avec les autres (TJ), jamais officiel ; ce_hors → coupes d'Europe hors règle en J.t ; tn_tv →
  value tennis (avec cote) en J.t. Points NBA : suivi en coulisse seulement à partir du 24/10 (avant : jetés). Smoke 93 (bil), 3 essais
  répartition robot + 2 lecture des réglages, captures PC / téléphone (scratchpad bil-pc.png, bil-tel.png).
  20261023z (« pourquoi certains ont des boutons pause, d'autres stop, d'autres rien » → « oui ») : interrupteur MARCHE / PAUSE sur CHAQUE ligne
  (clés f_buts, f_btts, f_vq, ce_buts, ce_vq, nhl_vq, nba_vq, nfl_vq, tn_vq, défaut en route) ; TEST / OFFICIEL inchangé (tn_tv, ce_hors) ; le
  suivi BET45 / book reste sans interrupteur (ce n'est pas un pari). Robot : pzCle(x) range chaque tendance comme LIGNES de l'appli, ligne en
  pause → J.pz. « officiel avant » affiché seulement pour une ligne en pause ou déjà suivie en coulisse. Smoke 93, 2 essais robot.
  20261024a (« un bouton marche / pause et un bouton test / officiel à chaque serait pas mieux » → proposé : un seul SÉLECTEUR À 3 CASES, deux
  boutons pouvant se contredire ; « pas besoin de maquette, tu peux coder et mettre en ligne ») : chaque ligne [✅ Officiel | 🧪 Test | ⏸️ Pause].
  robot_reglages.json = { maj, etat: { clé: off | test | pause } } (ancienne forme pause / officiel encore lue). Robot : etat(k), DEF_ETAT
  (points NBA jusqu'au 14/11, buts NHL, total NFL en pause ; tn_tv, ce_hors en test) ; test ou pause → J.pz avec x.st ; ce_hors / tn_tv
  officiels → J.t avec x.src 'ce' / 'tv' (comptés dans LEUR ligne) ; ce_hors / tn_tv en pause → J.pz. Appli : bilan d'une ligne = J.t + J.pz
  (+ J.ce / J.tv) ; window._g45TrTeHtml = bloc « 🧪 Paris en test » pour les testeurs (J.pz st 'test'), posé à côté des coupes d'Europe.
  Smoke 93 (bil : sélecteur, mise en ligne etat, bloc testeurs), 4 essais robot (défauts, test / pause / officiel, ancienne forme).
  20261016u (« même les joueurs ont sauté ») — VU dans Observability du worker (API telemetry/query, lisible avec le jeton) : TOUTES les demandes
  host=tsdb en 429 = TheSportsDB limite la clé gratuite par IP, celle du worker est partagée. App : 429 du worker → appel DIRECT (IP du téléphone),
  comme 403 / 404 ; worker : après un 429, plus d'appel à TheSportsDB pendant 60 s (secours si présent, sinon 429). Smoke (tsdbw : cas 429).
  20261016v (« les équipes c'est bon, pas les joueurs foot », NHL OK = photos nhle.com) : Observability = Haaland / Kane / Yamal / Mbappé +
  équipes (Real Madrid, Chicago…) redemandés en JOUEURS en boucle, tous en 429 → le téléphone aussi est limité (≈ 30 / min / IP). Enveloppe de
  fetch : appels DIRECTS en file (2,2 s d'écart) ; 429 en direct → toute demande TheSportsDB répond 429 sur place pendant 60 s
  (window._g45Tsdb429). `_g45JoueurVisChercher` : rien pour une ÉQUIPE du mur (type ≠ joueur, même nom) ni pour un texte de pari (« ou », buteur, remplaçant).
  20261016w (« hockey OK, foot manque les joueurs ») : le 429 de TheSportsDB arrive SANS CORS → erreur réseau, pas de statut → la pause de 60 s
  ne se déclenchait pas : toute erreur d'un appel direct déclenche aussi la pause ; file directe 3 s ; « pas de photo » g45jv effacés une 3e fois
  (g45_fan_neg3) ; worker : pause après 429 portée à 5 min. Observability : des recherches « D. Doué ou … buteur » / « Real Madrid » en joueur
  arrivaient encore (appareils pas encore en 16v ?).
  20261016x (« Vancouver on se demande ce que c'est », choix 1 « oui go » ; « le reste est réparé ») : bannière TheSportsDB des Canucks = recadrage
  illisible → window._G45_FOND_LOGO {vancouvercanucks} / window._g45FondLogo(nom) : carte du mur (DEUX copies du rendu, var _fl avant « if(_vis) »)
  = logo g45LogoUrlDe ENTIER au centre (même pose que le logo perso ASVEL, opacité .9). Ajouter un club = son nom _g45SgNorm dans la liste.
  20261016y (« PSG c'est moche ») : PSG ajouté à _G45_FOND_LOGO (parissaintgermain / psg / parissg) ; logo = g45LogoUrlDe sinon u.logoUrl.
  20261016z (capture « trouver l'intrus » : Arsenal = photo de joueurs parmi des blasons stylisés) : arsenal / arsenalfc ajoutés à _G45_FOND_LOGO.
  20261017a (« l'atm ») : Atlético Madrid ajouté à _G45_FOND_LOGO (atleticomadrid / atleticodemadrid / clubatleticodemadrid / atletico).
  20261017b (« la France j'aime mais bon Grizou ») : _G45_FOND_LOGO accepte une ADRESSE en valeur (prioritaire) → france = écusson ESPN
  a.espncdn.com/i/teamlogos/soccer/500/478.png (id 478 NON vérifié : image vide = à corriger).
  20261017c : Stade Toulousain ajouté (stadetoulousain / toulouse). Liste _G45_FOND_LOGO CLOSE pour l'instant (« on est bon », « la même base pour
  tout le monde ») : elle vaut pour gones ET bet45, tous les comptes (dans app.js, pas sur l'appareil).
  20261017d (« même pas le petit coq ») : ESPN 478.png = DRAPEAU → france = écusson Wikipédia SONDÉ PAR ANTOINE (pageimages de « Équipe de France de
  football ») thumb.wikimedia.org/…/Logo_Équipe_France_Football_2026.svg/500px-….png.
  20261017e (« logo national pour les pays ») : `_g45PaysLogo(nom, k)` appelé par window._g45FondLogo — carte du mur au nom d'un PAYS (`_G45_PAYS` :
  ≈ 60 pays, noms fr + en → « de / d' / du / des … ») → image de la page Wikipédia fr « Équipe <…> de football » (🏉 : « de rugby à XV »), API
  pageimages origin=* ; cache g45pays1_<f|r>_<pays> (trouvé 30 j, rien 7 j, pas de réponse = rien gardé) ; une recherche par pays et par session puis
  un render(). Carte joueur ignorée ; France foot = coq fixé (17d) ; France RUGBY prend aussi le coq foot (clé partagée, NON réglé). Images par pays
  NON vérifiées (testé Chromium avec réponse simulée : 1 requête, écusson posé).
  20261016r — DIAGNOSTIC ?diag=1 (fin d'app.js) : compte 10 s les appels de render / g45DirectMesEquipes / _g45FanCompleter…, fetch par domaine,
  mutations, minuteries, erreurs JS → alerte résumée (pas d'alerte = boucle synchrone). Rien sans le paramètre.
  20261014u (capture : « c'est pas aligné ») : boîtes de largeur FIXE (logo 110 px ×2, VS/heure 110 px), texte flex 1 1 0 + un ressort 1 1 0 après les
  logos, colonne de droite 84 px (.g45ag-col) → VS au même endroit sur toutes les cartes. Vérifié Chromium (3 cartes, consignes de longueurs différentes).
  20261008h — SONDÉ PAR ANTOINE (MLB Brewers–Dodgers) : odds[0] SANS moneyline, homeTeamOdds/awayTeamOdds sans cote, details « MIL -113 »
  (américaine du favori), overUnder 6 sans cotes over/under → `_g45AgOdEv` lit details (abréviation → camp) ; ligne seule = « publiées ».
  City @ Liverpool sans ligne : carte City SANS consigne 📌 (rien n'est cherché sans consigne). Rugby : NON vu.
  20261008i (capture Winamax Flyers–Hurricanes : Résultat 1,88, Vainqueur 1,54 ; ESPN 1,56) : NHL ESPN = VAINQUEUR (prolong. + TAB) → jambe
  « victoire » en hockey affichée « Vainqueur (prolong. comprise) » + ⚠️ « ta victoire = temps réglementaire… ». Agenda : match ⭐ avec m.sp
  affiché « @ » / « vs » selon isDom + « · 🏠 Domicile / ✈️ Extérieur » (avant : toujours « vs »).
  20261008j (« victoire OU vainqueur » → 1,56 deux fois) : hockey + consigne citant AUSSI vainqueur → jambe victoire sans chiffre (« pas de cote chez ESPN »).
  20261008k — SONDÉ PAR ANTOINE : ESPN Top 14 scoreboard = odds null ; liste The Odds API = rugbyleague_nrl et basketball_euroleague (PAS
  Top 14, Pro A, KHL). `_g45AgOaOd(clé, m)` : route /odds du worker (inchangée), h2h, région fr puis eu, cache g45agoa1_<clé>_<rég> 6 h
  (échec 30 min), médiane des books, match par noms + coup d'envoi ± 18 h (`_g45AgOaTrouver`) ; Euroleague = The Odds API seule, NRL = ESPN
  puis The Odds API ; Top 14 / Pro A / KHL → « pas de cotes gratuites pour cette compétition ». Testé Chromium (faux /odds) : 5 cas.
  20261008l (« ça donne quasi tout le foot, le problème sera le quota », validé « oui mais seulement sur gones ») : FOOT, bouton « 🇫🇷 Cotes
  books FR » sous la ligne ESPN (`_g45AgFrBtn`, GONES45 SEULEMENT via `_g45SanteActive`) → `g45AgFr(i)` : h2h région fr du championnat
  (_G45_TR_ODDSKEY / _G45_OA_LIGUES, 1 crédit), cache g45agoa1_ 6 h partagé : championnat déjà lu = affiché sans bouton, autres matchs
  du même championnat mis à jour ; `_g45AgFrHtml` (victoire / défaite de la consigne, sinon 1N2). Testé Chromium : 1 appel pour 2 matchs, 0 bouton sur bet45.
  CONFIRMÉ par Antoine (capture City @ Liverpool : ESPN 2,20 / FR 2,11, 4 books). 20261008m (« plus de détail », maquette « oui ») : `_g45AgFrHtml`
  = tableau un book par ligne (nom title sans « (FR) », 1 / Nul / 2 avec noms The Odds API), meilleure cote par colonne en vert, ⭐ colonne de la
  consigne, « Ta consigne (…) : meilleure cote X chez Y » ; pastille tricolore `_G45_AG_FR` (drapeau emoji = « FR » sous Windows) ; cache
  g45agoa1_ → g45agoa2_ (MORTS) avec od.books / hN / aN. Testé Chromium.
  20261008n (« NetBet, le book le plus éclaté », choix 1) : tableau limité aux books de #n-book (value + texte, 1er mot ≥ 3 lettres) ; aucun en
  commun → tous ; pied « N de tes books · M autres cachés ».
  20261008o (« Betclic et Unibet… mais sans garantie », « oui ») : ligne fixe « 🛡️ Winamax : pense à la garantie… » si Winamax est dans le tableau.
- 🏷️ SPORT SUR CHAQUE PARI (20261005h, « il manque peut-être le sport ? », maquette validée « Oui ») : bloc en fin d'app.js —
  `_g45ParisSport(h)` = h.sport, sinon u.sport de l'équipe du mur (h.n), sinon deviné par h.comp (`_G45_PARIS_COMP`, MotoGP avant F1) ;
  rond `_g45ParisRond(h, px)` (couleurs Agenda `_G45_PARIS_COUL`) au-dessus du logo du book dans `_g45BetRowMini` (Paris filtrés) et
  à la place de l'ancien sportIco (archive, DEUX copies) ; pastille « 🏈 NFL » `_g45ParisCompPastille` dans `_g45LigneMatch`.
- Bandeau de scores `g45BandeauMaj` : si tout tient à l'écran ET 1 à 3 matchs, UNE copie, sans défilement ; 20261013k (« MON RUBAN DEFILE
  PLUS », PC, 7 matchs tenant à l'écran) : à partir de 4 matchs, il défile toujours.
  20261013l (« PAS DE MATCH LDC ? ») : mode « Mes équipes » (`_g45BandMesEquipes`) ne lisait que le championnat de chaque équipe de foot
  (`_g45BandChemin` → espnLeagueOf) → scoreboards uefa.champions / uefa.europa / uefa.europa.conf ajoutés avec tous les noms de foot du mur.
  20261013m : sélecteur « Mes équipes » (.g45-band-src-wrap, fond .55 dans style.css) rendu OPAQUE par app.js (#g45-band-sel-fond) — les tuiles qui
  défilent passaient dessous et se lisaient à travers.
- Suivies — 20261020d (captures : chaîne télé presque invisible, « soccer » au lieu de la compétition ; Antoine : « j'adore l'image actuelle, juste un cache
  pour la TV ») : pastille 📺 fond sombre opaque rgba(8,11,20,.88) + liseré (vert gratuit / violet programme réel / blanc table), texte clair ;
  sans nom de compétition → nom du sport en français (SPORT_FR), plus jamais « soccer ». Images, voile, heure : INCHANGÉS (choix d'Antoine).
  20261020e — SONDÉ par Antoine (console) : soccer/all → `leagues` = 1 entrée vide (id / name / slug null), événement sans `league`, seul l'uid
  garde le numéro (« s:600~l:775~e:… »). Table LG_ID dans lgDuUid (g45DirectMesEquipes) : numéro → [slug, nom FR], relevée le 20/10 sur
  leagues[0].id de 25 scoreboards (775 C1, 776 C3, 20296 C4, 710 L1, 3926 L2, 700 PL, 740 Liga, 730 Serie A, 720 Bundesliga, 715, 725, 3901,
  3952 CdF, 3918, 3920, 3951, 3956, 3954, 5462, 606, 2395, 735, 3946, 770, 21231). Rend aussi le vrai slug (chaîne télé, fenêtre de match).
  Nouveau championnat suivi absent de la table → « Football » : ajouter son numéro (scoreboard du championnat, leagues[0].id).
  20261020f (capture PC : « PSG pas de logo », « Atlético trop zoomé ») : visuel PERSO (images/equipes|joueurs, blason carré) posé ENTIER
  (background-size « cover,contain », no-repeat, fond #0a0e1a) au lieu d'être étiré ; G45_FOND_BLASON {parissaintgermain, psg} : le blason ESPN
  (m.lMoi) remplace le fanart TheSportsDB (mot « PARIS »). Autres clubs : fanart inchangé.
  20261020g (« il y a une sacrée différence » avec les bannières TheSportsDB des autres clubs ; choix 2 d'Antoine) : blason ESPN du PSG retiré.
  _G45_SANS_BANNIERE {parissaintgermain, psg} → _g45FanChercher saute strTeamBanner (photo strFanart1..4) ; ancienne bannière effacée une fois
  (drapeau g45_fan_fix1). _G45_FOND_TSDB {atleticomadrid} → _g45FanCompleter cherche AUSSI la bannière malgré l'image perso, et la carte
  Suivies la prend en priorité (le mur garde l'image perso). TheSportsDB en 403 ce soir-là → rendu visible dès que TheSportsDB répond.
  20261020h (capture : PSG = photo de match, Atlético = petit blason ; « le BLASON officiel en TRÈS GRAND […] comme Roma / City, ne plus utiliser
  TheSportsDB » ; maquette ; « ça c'est le logo PSG » = blason du mur) : _G45_FOND_TSDB / _G45_SANS_BANNIERE RETIRÉS. Carte Suivies : club de
  window._G45_FOND_LOGO (liste du MUR : PSG, Atlético, Arsenal, Vancouver, France, Stade Toulousain…) → même blason que le mur (adresse de la
  liste, sinon g45LogoUrlDe, sinon m.lMoi), background-size « cover,auto 210% » (déborde haut / bas), fond = _g45CoulFond(couleur du club).
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
- MUR, PC (20261016l, « le chiffre dans le logo à droite c'est chiant », maquette validée « oui » ; paysage tél. ≥ 700 px aussi, portrait inchangé) :
  feuille #g45-murval-pc (bloc en fin d'app.js `_g45MurValPc`) — .g45-murval avec logo .g45-ecu visible (:has, pas display:none) : logo à droite
  net (.9, sans halo), montants à sa gauche en case sombre (total 24 px, 🏠 / ✈️ 14 px, opacité .35 → gris #8a94b0). Rendu des cartes (×2) INCHANGÉ.
  20261016o (« on voit pas tout d'un coup » à 412 px + « barre verte à peine visible », maquette validée « oui ») : bloc `_g45MurVue` (fin d'app.js) —
  bouton « 📋 Compact / 🖼️ Bannières » dans l'en-tête d'un sport (#g45-acc-zone, après le titre), localStorage g45_mur_vue ('c' | 'b' défaut), classe
  html.g45-mur-c / g45-mur-b : compact = cartes 80 px mini, logo 56 px, nom 16 px, paliers / note 13 px ; bannières ≥ 700 px = nom 20 px, paliers / note
  14 px. Pastille de série (span 9px border-radius 10px) : largeur du contenu, fond .28 + bord vert / rouge, 13 px blanc, « de suite » (::after).
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
  20261025s (capture « il fabule » : 3e avis ALLaM 2 7B (Groq) = ~200 « 🎯 ») : _G45_GROQ_EXCLUS + allam ; `window._g45IaCharabia(t)` (moins de 60 lettres, ou un même morceau ≥ 15 fois et > moitié du texte) appliqué dans lireOAI de `_g45MultiAI` → réponse jetée, le 3e avis passe au modèle suivant. Test 3/3, smoke 104.
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
  ⚠ DEUX projets Supabase : comptes bet45 = ofcizjaynonjtiusdwgi (supabase.js, auth-guard.js) ; Social = vbsdewuvycaekfkixynh (social.js,
  SB_URL) → compte Social SÉPARÉ du compte bet45. 20261014r (Cédric, iPhone : « Load failed » à la connexion Social) : la CSP connect-src
  d'indexfenotte.html n'autorisait PAS vbsdew… → Social n'a JAMAIS pu se connecter sur bet45 ; ajouté (https + wss). Connexion Social
  automatique avec le compte bet45 : choix A validé (« oui a ») → 20261014s : social.js `_g45SocSso(force)` (bet45 seulement : window._g45User
  ou hôte bet45.fr ; pas si g45_sso_off posé par socialLogout) envoie le jeton BET45 (localStorage sb-ofcizjaynonjtiusdwgi-auth-token) au Worker
  POST /socsso → vérifié par ofciz /auth/v1/user (+ pseudo profils) → secret SOCIAL_SERVICE_KEY (clé secrète du projet Social, AJOUTÉE par Antoine
  dans le Worker) : admin/generate_link magiclink du MÊME mail (sinon admin/users création, email_confirm, pseudo BET45) → token_hash → verifyOtp
  (magiclink puis email) = session Social. Appelé par loadSocialTab (force, 30 s mini) et _g45SocAuto (10 min). Testé vm : client 7/7, worker 5/5.
  worker.js complet donné, À REDÉPLOYER + secret À AJOUTER. NON vérifié en vrai (format de réponse generate_link de ce projet).
  Lien de récupération Supabase du projet Social = renvoie vers gones45140.github.io (Site URL) : NE PAS l'utiliser pour un pote bet45.
  CONFIRMÉ (capture Cédric 14/10 20:15) : connexion Social automatique sur bet45 = OK (Xtazion), worker /socsso + secret en place.
  Cédric : 92 paris sur gones45140.github.io (site d'Antoine) / 4 sur bet45.fr = deux mémoires séparées → bilan publié passé à 4 paris.
  20261014t (« oui ») — 🔀 FUSIONNER UNE SAUVEGARDE (bloc en fin d'app.js) : bouton #g45-btn-fusion posé par JS après « ⬆ Importer »
  (Outils → Backup & Config) → `g45FusionnerData` → `_g45FusionnerEtat(rem)` : ajoute à state.a les paris RÉGLÉS absents (id, ou signature
  date + équipe + cote + mise `_g45FusSig`), à la suite ; capital INCHANGÉ (pas de _g45BetAppliquer) ; paris en cours NON repris (comptés).
  Smoke (32). À faire par Cédric : Exporter sur gones45140.github.io, Déconnexion Social là-bas, Fusionner sur bet45.
  CONFIRMÉ par Antoine (14/10 : « c'est bon pour Cédric ») → 20261014x : bouton RETIRÉ (plus posé), g45FusionnerData() gardé (console).
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
  REVÉRIFIÉ 11/10 (console, Haaland : tir 60e x 89,5, but 65e x 88,9 ; tache dans sa surface = dégagements / duels de 1re MT) :
  coordonnées DÉJÀ dans le sens de l'attaque sur les deux mi-temps. 20261008y : actions « Out » (ballon sorti, x/y > 100) retirées dans g45ChOuvrir.
  20261008z (capture : « Foul by Erling Haaland », « Attempt missed. … », « Goal! Liverpool 0, Manchester City 1. … » en lignes à part) :
  `_g45ChNom` retire ces préfixes du nom (g45ChOuvrir) → un joueur = une ligne (testé 10/10).
- CARTE DE PARTAGE D'UN PARI (`g45PartagerPari` → `_g45CarteResultatHTML`, mon équipe à GAUCHE) — 20261009a (capture « Manchester City vs
  Liverpool 0-3 », match Liverpool 0-3 City) : score _g45ScoreTexte = DOMICILE-EXTÉRIEUR → retourné si mon équipe était à l'extérieur
  (_g45MatchMeta + _g45MemeNom, sinon h.domicile ; testé Chromium 4/4).
  20261009c (maquette validée « oui ») : joueurs du pari (h.joueurs / h.joueur, 3 max) = photo ronde + nom sous le score (`_g45CarteJoueursHtml`,
  initiales sinon) ; photos + logo de l'adversaire hors mur (espnResolveTeam → ESPN 500/<id>.png, foot) chargés par `_g45CarteComplements`
  dans g45PartagerPari (foot = _g45ClsPhotoDe, autres = TheSportsDB par sport `_g45CarteVisSport` ; _G45_VIS_SPORT + nfl/basketball/baseball),
  convertis en données intégrées (html2canvas). Photos réelles NON vérifiées (domaines bloqués depuis le cloud).
  20261009d (capture : initiales « RC » + carré « LIV ») : connect-src de la CSP (index.html ET indexfenotte.html) sans a.espncdn.com,
  upload.wikimedia.org, r2.thesportsdb.com → fetch de conversion bloqué ; ajoutés. CORS de ces 3 serveurs NON vérifié.
  CONFIRMÉ par Antoine : logo Liverpool OK. 20261009e (console : photo Cherki = thumb.wikimedia.org/…, « donnee: 0 ») : *.wikimedia.org ajouté. CONFIRMÉ (capture : photo Cherki sur la carte).
- LIGNES DE PARI, JOUEUR — 20261009f (maquette validée « cool ») : `_g45LigneMatch` écrit le joueur en blanc 14 px gras sur bande sombre ;
  enveloppe de `_g45IdF1` → `_g45IdJoueur` : carré de droite = photo ronde 44 px du 1er joueur (initiales sinon), recherche en file
  (`_g45JphFile`, 2 à la fois, mémoire de session `_g45JphMem`, pose `_g45JphPoser` sur [data-g45jph]) ; tous sports (TheSportsDB hors foot).
- LOGO DE LA COMPÉTITION SUR LES LIGNES DE PARI, PC (20261015c, aperçu en image, choix « 1 ») : bloc en fin d'app.js ; div[data-aid] ouvrant
  openBetEdit (archive ×2 + `_g45BetRowMini`) de largeur ≥ 700 px → img .g45-cl-fil (84 px, opacité .5, left 58 %, marqué data-g45cl) ; h.comp →
  `_G45_CL_MAP` → `_g45ClLogo(comp, rendre)` : NHL / NBA / NFL / MLB / WNBA = teamlogos/leagues/500/<x>.png ; foot / Top 14 / NRL = leagues[0].logos du
  scoreboard ESPN (dark d'abord), mémorisé g45_lglogo_<sport>_<slug> (même clé que le calendrier). Téléphone inchangé. Smoke (36).
  20261025r (cartes de paris NHL sans le logo de la ligue : compétition lue sur le ticket = « National Hockey League ») : _G45_CL_MAP reconnaît aussi les noms longs National Hockey League / National Basketball Association / National Football League / Major League Baseball. Test 6/6, smoke 104.
- LIGNES « Paris filtrés » (`_g45BetRowMini`) — 20261018a (capture : City gagné « mi vert mi rouge ») : fond = couleur du RÉSULTAT seule (vert / rouge /
  jaune ; avant : couleur du book ou de l'équipe mêlée) ; pari SIMPLE → logo du book à droite = bkFavicon(h.b, 38) pleine opacité (avant 28 px, .6).
  20261018b (« beaucoup trop gros le W », « logos toujours trop transparents ») : book revenu à 28 px (opaque) ; logo d'équipe et logo F1 opacité 1.
  20261018c (« à la ligne : City / score / PSG ») : `_g45LigneMatch` avec score = équipe <br> 📊 score <br> équipe (sans score : « A vs B » inchangé) ; line-clamp 2 → 4 (×3 rendus).
- Bouton ⚡ « Ouvrir le match » des lignes de pari (`g45EclairPari` / `g45EclairOuvrirCible`) — 20261009b (« le flash fonctionne pas ») :
  cherchait le pari dans state.h SEULEMENT → muet sur un pari réglé (state.a) ; cherche maintenant state.h puis state.a (testé Chromium).
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

- 🛟 SECOURS ESPN (20261017y, « si ESPN tombe en rade je suis mort » → « prépare ») : enveloppe de window.fetch (fin d'app.js) — réponses OK de
  site.api.espn.com …/(schedule|standings|scoreboard|roster|leaders|teams) copiées dans IndexedDB g45esp/r (clé = adresse, 10 min mini entre deux
  copies, < 3 Mo) ; ESPN en erreur réseau / 5xx → copie de ≤ 30 j rendue (en-tête X-G45-Secours, window._g45EspnSecours) ; core / summary / worker
  NON couverts ; test Santé SANS secours (enveloppe de g45SanteTester) ; ménage quotidien (g45esp_menage). Testé Chromium (ESPN coupé : copie rendue,
  adresse jamais vue = erreur, Santé « injoignable »). Bandeau jaune proposé (maquette) → Antoine : « mets dans Outils » → 20261017z : enveloppe de
  window._g45SanteBloc = ligne #g45-sec-ligne sous la Santé (gones seulement) : « 🛟 Secours ESPN : N réponses gardées sur cet appareil (dernière
  copie le …) » + « Secours EN SERVICE … » en orange si servi depuis < 15 min (comptage IndexedDB, 30 s mini). Testé Chromium. Smoke (espSec, 58).
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
  20261024z (Q3 Austin : « il manque clairement les meilleurs temps par secteur » ; « la carte s'arrête net… même 10 [min] ») : WORKER /f1live redéployé (TOPICS + TimingStats ; p.bs = BestSectors [temps, rang], lecture prudente ; copie avant/après gardée en session, 18 liaisons et cron */5 revérifiés). Un 1er essai avait été retiré par prudence (502 vus = /f1arch pendant la séance, pas lié). app.js : cases S1/S2/S3 = meilleur secteur du pilote EN GROS (violet rang 1, vert 2-3, blanc), secteur en cours en petit ; `_g45F1OffActif` : séance VUE active reste active 10 min après Finished (`window._g45F1Grace`), bandeau « 🏁 Séance terminée · carte encore N min » (`_g45F1OffGrace`). Format BestSectors NON sondé en direct : commande console donnée à Antoine pour la course. Smoke f1bs (98).
  20261027d (« saison foot et autre on a une chose sur les critère des 4 dernière saison on pourrait faire quoi sur la f1 » ; « SA ME SERT SURTOUT A VOIR SI je peux parier en mode cockpit » ; maquette image → « oui on code ») : bouton « 📊 Critères 4 saisons · Cockpit » sur la page Saison F1 → `g45F1Cr` (bloc en fin d'app.js). Pilote (liste = plateau de la dernière saison, par points), critère Vainqueur / Podium / Top 6 / Top 10 / Pole (= grid 1, pas de page qualifying) / Devant son coéquipier (position d'arrivée Jolpica, abandons classés par tours) / Finit (positionText chiffre) ; filtres Grand Prix | Sprint, 📍 ce circuit (prochain GP, ergast/f1/<an>.json), 🚦 parti du top 3, 🔁 après un podium (course précédente du même type). Tableau par saison (réussite, pire série de ratés, meilleure série) ; total : pire série → paliers = ratés + 1, mise max = STRATS['1'][palier-1] (✅ ≤ 5, ⚠️ ≤ dernier palier, ❌ au-delà) ; série en cours. Bloc 2 « 🏁 Jouable en Cockpit ? » : tout le plateau (5 courses mini), trié pire série puis %. Données Jolpica results.json / sprint.json paginées (limit 100 + offset, course coupée recollée par round, 300 ms entre appels) ; cache g45f1cr1_<an> (dans _G45_CACHE_PREFIXES ; saison en cours 6 h) ; choix gardé g45_f1cr_sel. Fonctions pures `_g45F1CrSeq` / `_g45F1CrStats` / `_g45F1CrPal`. Jolpica NON joignable depuis la session cloud (proxy 403) : champs repris du code existant (_g45F1JolResults). Smoke f1cr (108). IDÉE d'Antoine (même jour) : « Jouable en Cockpit ? » pour chaque équipe de chaque sport (critères 4 saisons) → maquette à faire.
  20261027e (capture d'Antoine « c ou » : il cherchait le bloc dans la carte FORMULE 1 → onglet 📊 Saisons, liste de liens formula1.com) : même bloc monté EN TÊTE de `loadF1Saisons` (une seule copie) via `_g45F1CrMonter(box)` ; boîte retenue dans BOX (sinon getElementById('g45-f1cr') de la page F1). Le bouton de la page Saison F1 reste. Smoke f1cr complété (onglet Saisons, 108).
  20261027f (capture Antonelli, vraies données OK ; « où choisit-on le circuit et l'année » ; maquette image → « oui on code ») : 📅 Saisons = puces « 4 saisons » / 2026 / 2025 / 2024 / 2023 (CR.an) ; 📍 Circuit = liste « Tous les circuits », ⭐ prochain GP en 1er, puis tous les circuits des 4 saisons triés (CR.cir = circuitId). L'ancien bouton « Ce circuit » (CR.ci) est converti en CR.cir au 1er affichage. Filtre année appliqué APRÈS le calcul du podium précédent (« après un podium » voit le dernier GP de la saison d'avant). Tableau par saison et bloc « Jouable en Cockpit ? » suivent les choix. Smoke f1cr complété (108).
- MOTOGP et CGU (09/10) : CGU motogp.com point 3 (lues par Antoine) = usage PERSONNEL seulement, « not permitted to provide, copy…
  or transmit any Content… whether for profit or free of charge » (api.motogp.pulselive.com : pas de robots.txt ; TimingPass = direct PAYANT).
  20261007h retirait tout le MotoGP de bet45 → Antoine : « ON A PLUS RIEN » → 20261007i : existant REMIS sur bet45 (choix A) ; seul reste
  `_g45MotoActive()` (= `_g45SanteActive`, faux sur bet45). DEMANDE d'Antoine : sur GONES45, direct poussé « comme la F1 » (chronos en live +
  circuit) → tout ajout de ce genre derrière `_g45MotoActive()`. Sonde livetiming-lite demandée (pendant ou juste après une séance).
- 🏍 25/10/2026 — « MotoGP indisponible » (diag seasons HTTP 403) : SONDE d'Antoine → worker ?host=motogp&path=/motogp/v1/results/seasons = 403 avec page HTML 4.01 (refus du CDN de MotoGP, pas du worker) ; appel direct impossible depuis l'appli (CSP connect-src). Bloqué par MotoGP → pas de contournement (CGU). Piste proposée : TheSportsDB ligue 4407 (eventsseason, clé 123) — à revoir mardi.
- 🏍 27/10/2026 — SONDES d'Antoine TheSportsDB 4407 (clé 123) : eventsseason.php?id=4407&s=2026 → 15 événements, tous du 28/02 (Thaïlande : sprint, Q1, Q2, FP2), strResult VIDE ; eventspastleague.php?id=4407 → 1 événement « 2026-10-25 Australia GP », strResult VIDE. → Piste ABANDONNÉE (clé gratuite tronquée, pas de résultats). MotoGP reste EN PAUSE.
- 🏍 20261027i — « ENLÈVE MOTOGP » (après les sondes TheSportsDB) : entrées RETIRÉES — tuile de Résultats, liste Compétitions (perso), tuile d'accueil _G45_ACC_SPORTS (smoke accueil : 13 → 12 tuiles), carte Direct `_g45MotoLiveCard` (return en tête, plus aucun appel 403), bouton d'épreuve d'un pari 🏍 (`_g45EpreuveBouton` → ''). GARDÉS : le sport 🏍 MotoGP pour SAISIR / afficher des paris, le code des écrans (g45MotoOpen…) intact mais plus appelé → pour remettre : enlever les 5 repères « 20261027i ». (Rappel 20261007h : tout retiré → « ON A PLUS RIEN » ; cette fois c'est la demande d'Antoine, l'API étant morte.)
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
  `object-fit:fill` (drapeau entier), 45 %. 20261008r (« ok 120 ») : carte du calendrier F1 min-height 84 → 120 px.
  20261008s (maquette validée « oui ») : lignes de pari (renderArchive ×2, `_g45BetRowMini`) d'une carte FORMULE 1 du mur → carré de droite
  = petit logo F1 (images/equipes/formule1.png recadré) au lieu de u.logoUrl (« W » Winamax) via `_g45IdF1(h, avant)` (bloc en fin d'app.js).
  Menu Plus : « Chat IA » renommé « Assistant Paris » (un ami croyait pouvoir demander des résultats : l'IA a inventé Djokovic US Open 2026).
  20261008t (captures avant / après, « c'est mieux sans lui à droite ») : PC = colonne #pc-chat-sidebar CACHÉE (feuille #g45-pc-sans-chat posée
  par app.js, style.css intact), page pleine largeur ; bouton « 💬 Assistant » (pc-only) sous Liens dans la colonne de gauche → onglet #t-chat
  (règle body #t-chat[style*="block"] car showTab pose display en ligne). 20261008u (maquette validée « très bien c'est sa place ») — ASSISTANT DANS BILAN : volet
  #g45-bilia sous #bilan-filtres-barre (enveloppe de `_g45BilBarreFiltres` → `_g45BilIaPoser`), fermé = « 💬 Demander à l'assistant », ouvert
  (sessionStorage g45_bilia) = messages + 3 questions + saisie ; `g45BilIaEnvoyer` : faits CALCULÉS `_g45BilIaFaits(filteredA())` (total, sport,
  type `_g45BilIaType`, dom/ext, book, tranche de cote, équipe, compétition, mois, série, 10 derniers ; freebet : gain m×(cote−1), mise hors ROI)
  et consigne « seulement les FAITS, sinon je n'ai pas les résultats ni l'actualité » ; même appel IA que sendChat. Contrôle smoke.js (15).
  20261008v (« cache-le sur PC et mobile, sa place reste dans Bilan ») : bouton « 💬 Assistant » de la colonne de gauche (PC) et entrée
  « Assistant Paris » du menu + (téléphone) RETIRÉS des deux index ; l'assistant n'existe plus que dans Bilan (#t-chat reste dans la page, sans accès).
  20261008w (capture FORMULE 1 → Types vide, un petit rond) : style.css a DEUX .cp (l. 75 padding des cartes, l. 240 pastille 24 px du
  choix de couleur #cprow) → « card cp » de Types réduite à un rond, lignes cachées (overflow). Feuille #g45-cp-fix (app.js) : .cp hors
  #cprow = taille normale, .card.cp = bord de carte. 20261008x (« Compo, à moins qu'il fasse un match, sert à rien, oui ») :
  enveloppe d'openClub → #itab-compo caché si `_g45CompoInutile(nom)` (🏎 🏍 🎾 🥊 🚴 🎿 ou nom F1 / MotoGP / tennis / MMA / UFC / cyclisme / biathlon).
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
- ESPN …/soccer/<lg>/teams (LISTE des équipes d'une ligue) : SONDÉ PAR ANTOINE le 15/10 = 403 via le worker (host=espn ET espnweb) et sans
  CORS en direct ; …/teams/<id>/roster (direct et worker), scoreboard (worker), core …/seasons/<an>/teams = 200. → passer par le classement
  (`_espnLoadLeagueTeams` / `_espnTeamsViaClassement`). 20261015q : Tendances → ⚽ Marqueurs, `_g45ButId` (liste fixe `_G45_BUT` : Kane, Mbappé,
  Suárez « données indisponibles pour la saison 2026 ») retombe sur le classement ; doublon mur « MBAPPE KYLIAN » / liste « Kylian Mbappé » écarté
  par le motif who dans `g45ButeursView`. Testé vm (Kane retrouvé avec /teams refusé). Autres appels à …/<lg>/teams dans app.js : NON revus.
  20261018n (« que ça sélectionne le joueur seulement s'il joue aujourd'hui ») : Tendances → ⚽ Marqueurs (`g45ButeursView`), bouton « 🗓️ Jouent aujourd'hui »
  (`g45ButAuj`, localStorage g45but_auj) : `_g45ButJour` = scoreboards ESPN ?dates=<jour> des championnats de _G45_BUT_LG + uefa.champions / europa / conf (mémoire
  10 min, matchs pas finis) → joueur gardé si son club (tid) joue ; ligne « 🗓️ HH:MM · 🏠 vs / ✈️ @ adversaire » ; Meilleurs buteurs = 10 par ligue (au lieu de 3)
  quand le filtre est allumé. Testé Chromium (ESPN simulé). NFL / NHL : PAS encore.
  20261018o (« j'ai que buteur, faut passeur et décisif ; choisis selon mes critères de confiance ») : marché ⚽ Buteur / 🅰️ Passeur / ⭐ Décisif (g45but_mk,
  `_g45ButP` : Poisson sur buts hors penalty / passes D. (goalAssists) / buts + passes par match ; Meilleurs = assistsLeaders en Passeur) + « 🎯 Mes critères »
  (g45but_crit) : proba ≥ 60 % ET cote ≥ 1,50 (ta cote saisie, clé aid_<mk> ; sinon 1 / proba → 60-67 %) ; tri par proba du marché.
  20261015r (maquette validée « oui ») — LIFTING Marqueurs (cartes : nom 18 px, « chance de marquer » en grand à droite, 4 cases buts /
  matchs / buts par match / tirs cadrés, reste sur une ligne 14 px, « Ta cote : » 15 px ; boutons 13 px blancs) et CLV (Tendances → 📏 CLV,
  `g45ClvView` : barre verte = victoire seule / jaune = combiné, logo de l'équipe suivie (S.hl / S.al, S.moi), textes 13-17 px) +
  CACHE du relevé `_g45ClvReleve(onStep, force)` : match relu seulement si son relevé a plus de 24 h (> 48 h avant), 6 h (6-48 h), 1 h
  (< 6 h) (`_g45ClvIntervalle`) ; passage complet sauté < 30 min (g45clv_der) ; crédits comptés (`_g45ClvOddsFrais`, 2 par ligue relue),
  window._g45ClvStat ; bandeau « 📦 Cotes gardées · relevé il y a … · N crédits » + « 🔄 Relever maintenant » (`g45ClvForcer`). Smoke (45).
  20261015s (capture : « voir les buteurs et CLV on voit à peine ») : boutons « ⚽ Voir les buteurs › » / « 📏 Voir le CLV › » de l'écran Tendances
  foot en blanc 14 px gras sur fond sombre opaque, liseré bleu.
- COTES EN DIRECT ESPN (SONDÉ PAR ANTOINE le 14/10 au soir, LDC, 2 lectures à 2 min d'écart) : scoreboard soccer/<lg>/scoreboard, match state 'in' →
  competitions[0].odds[0] (DraftKings) : moneyline.home|away.{open, close, current}.odds (américaine ; current = EN DIRECT : Real–Roma 3-1 76e « -1100 » →
  78e « -1400 », perdant +3500 → +5000) ; total.over|under.{open, close, current}{line « o4.5 », odds} (la ligne suit le match : o3.5 → o4.5) ;
  current « OFF » = marché suspendu / fermé (Fenerbahçe–Villa 5-0) ou current absent. drawOdds.moneyLine = 295 FIGÉ (avant-match) → nul en direct :
  moneyline.draw.current CONFIRMÉ (capture Antoine 86' : Roma 7,00 · Nul 1,51 · Real 3,90 · Buts 6,5 — bloc de la fenêtre du match affiché en vrai). Côté home/away = competitors[].homeAway (capture Antoine : « RMA @ ROMA » = Roma reçoit, 3-1).
  20261015d (aperçu validé « oui et dans suivi ») — 📈 UTILISÉ, FOOT SEULEMENT : `_g45CdLire` (scoreboard, mémoire 50 s), `_g45CdMarche` (victoire /
  vainqueur / défaite / nul / + − de X ; combiné, lay, joueur, BTS, MT, double chance, handicap = rien), `_g45CdTexte` (« 1,07 en direct · tu l'as prise
  à 3,60 ▲ bien joué » / « ta ligne n'est plus proposée » / « ⏸️ suspendue ») ; cartes Paris en cours : div .g45ec-cd ajoutée dans .g45ec-live
  (MutationObserver) ; fenêtre du match : enveloppe window._g45EspnUsOdds → « Favori avant le match » + bloc « 📈 COTES EN DIRECT ». Smoke (37).
- Tendances → Buteurs → NHL (`g45MarqueursUS`, G45_MQ) — 20261018l (« il manque passeur » ; capture : Robertson / Johnston avec le « G » des Packers) :
  3e bouton Passes (cat3 assistsLeaders, secondaire === 2 ; nom de catégorie ESPN NON sondé, repli par mot « assists ») ; mémoire `_g45MqTeams` rangée
  par ligue + numéro (avant : numéro seul → équipe NFL n°9 servie aux Dallas Stars).
  20261018p (« NFL NHL oui ») : `g45MarqueursUS` + boutons « 🗓️ Jouent aujourd'hui » (g45mq_auj, `_g45MqJour` = scoreboard ESPN de la ligue SANS date = journée /
  semaine en cours, matchs pas finis, club = teams/<id> du leader ; ligne « 🗓️ sam. 21:00 · vs X ») et « 🎯 Mes critères » (g45mq_crit : proba ≥ 60 % et cote juste
  ≥ 1,50) ; 50 leaders lus (window._g45MqTop) quand un filtre est allumé. Testé Chromium (ESPN simulé). NBA : PAS fait (autre calcul : seuils de points).
  20261018q (« NBA aussi », maquette validée « oui ») : bloc en fin d'app.js — chip 🏀 NBA dans Marqueurs (enveloppe de g45MqSport('nba') → `g45NbaMq`) : stat Points /
  Rebonds / Passes + ligne − / + (g45nba_mq), leaders core types/2 (catégorie par mot, NOMS NON SONDÉS), 30 joueurs, % RÉEL de matchs au-dessus de la ligne via
  `_g45NbaGLRecuperer` (journal, worker espnweb), 5 derniers, cote juste, Jouent aujourd'hui / Mes critères (g45mq_auj / g45mq_crit). Testé Chromium (ESPN simulé).
  20261018m (« et les noms coupés ») : nom du joueur en entier (retour à la ligne, 14 px), sigle du club dessous.
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
  Paris calculée à la main (dernier dimanche de mars / octobre 01:00 UTC ; 6 cas comparés à Intl, identiques). worker.js complet donné,
  REDÉPLOYÉ le 13/10 (avec /odds en crédits). Erreurs du SOIR (multiplex foot) : budget `_lourd` 4 → 2 PROPOSÉ, en attente de réponse.
À VOIR (en attente d'un retour d'Antoine) :
- ⚾ 20261025m — LANCEUR PARTANT dans Critères → 👤 Joueurs (« je voulais voir quand Misio était lanceur », maquette « OUI ») : SONDÉ par Antoine (Rays @ Brewers) : boxscore.players[].statistics = batting + pitching (labels IP H R ER BB K HR PC-ST ERA PC), athletes[].starter true = partant. Rôle baseball 'lp' (_G45_JOU_TABLE, starter:true, cats pitching) lu dans `_g45JouLireMatch` ; clé baseball g45_jou_v3_ (v2 baseball dans _G45_CACHE_MORTS → relire les feuilles 1 fois) ; liste = lanceurs partants « · lanceur (N départs) », frappeur choisi avant retiré, pas de « Combien » ; jFiltre : seuls ses départs comptés. Test vm (Misiorowski lp, Romero relève non), smoke 103.
- ⚾ LANCEURS MLB DANS L'AGENDA (17/10, Misiorowski) : carte JOUEUR ⚾ → afficher le match SEULEMENT s'il est lanceur partant annoncé. Sonde demandée à
  Antoine (PC) : scoreboard baseball/mlb → competitions[0].competitors[].probables[{name, athlete.displayName}] (NON vérifié). Rappel programmé le 17/10 14 h.
  Joueurs 🏈 NFL / 🏀 NBA dans l'Agenda : FAIT (20261017x).
- 🎟️ QUOTA DES COTES — FAIT 20261015m (maquette validée « l'utilisateur doit voir que SON quota ») : bloc en fin d'app.js, ligne repliable
  #g45tr-quota (enveloppe de _g45TrFiabHtml, au-dessus de la Fiabilité) : `_g45QtHtml`, `_g45QtResume` (ce qui RESTE), `g45QtLire(force)` (mémoire
  2 min), `g45QtOuvrir` ; Outils → Clés (g45CheckOddsQuota) gère aussi la réponse bet45. WORKER (déployé par Claude via l'API Cloudflare le 15/10,
  version précédente f5729eb0 gardée en copie) : /odds-quota → hors gones = {moi:{u, max}} = compteur q:odds:ip:<IP>:<jour UTC> (même clé que
  plafondAtteint), sans appel à The Odds API ; gones = {remaining, used, jour:{u,max}, mois:{u,max}}. Smoke (43).
  20261015n (« il manque un intitulé, j'ai eu peur au début : il te reste ») : ligne fermée « Il te reste x / 8 crédits aujourd'hui » (bet45) /
  « Il reste x / 20 crédits aujourd'hui (tout le monde) » (gones) ; ouverte : titre « Il te reste : » / « Il reste : » au-dessus des barres.
- 20/10 — SONDÉ PAR ANTOINE (BOS @ DET en cours, 96-99) : scoreboard basketball/nba = competitions[0].odds ABSENT pendant le match (ni moneyline,
  ni total, ni overUnder) au scoreboard. summary?event= → pickcenter = cotes de CLÔTURE seulement (BOS -125, 220.5).
  TROUVÉ (sondé par Antoine, même match, 4e QT) : core sports.core.api.espn.com/v2/sports/basketball/leagues/nba/events/<id>/competitions/<id>/odds
  → items[] : provider id 100 « DraftKings » = clôture ; provider id 200 « DraftKings - Live Odds » = EN DIRECT (overUnder 224.5, details « BOS -7.5 »,
  awayTeamOdds.moneyLine -600, .current.moneyLine.decimal 1.16 / spread / pointSpread ; homeTeamOdds idem ; current.over / under / total). Rien codé.
  24/10 — SONDÉ PAR ANTOINE (téléphone, MLB 401908042, MIL reçoit, en cours) : core baseball/leagues/mlb/events/<id>/competitions/<id>/odds = MÊME FORME
  que la NBA : provider 100 « DraftKings » (open / close / current) + provider 200 « DraftKings - Live Odds » : details « MIL -282 », overUnder 6.5,
  homeTeamOdds.current.moneyLine.decimal 1.35 / awayTeamOdds 3.06, current.over.decimal 1.85 / under 1.90, current.total.american « 6.5 » (pas de close).
  → confirme aussi la lecture de current.over / under faite pour la NBA (20261020q). MLB pas encore branchée.
  24/10 — SONDÉ PAR ANTOINE (NHL 401892565, COL reçoit, en cours) : hockey/leagues/nhl/…/odds = MÊME FORME : provider 200 « DraftKings - Live Odds »
  details « COL -580 », overUnder 6.5, home .current.moneyLine.decimal 1.17 / away 4.80 (2 issues seulement, pas de nul en direct → cote VAINQUEUR,
  prolongation comprise probablement : la jambe « victoire » temps réglementaire n'a PAS d'équivalent), current.over 1.90 / under 1.83, total « 6.5 ».
  20261024p (« branche mlb et nhl ») : table _G45_CD_US (basketball|nba points, baseball|mlb runs, hockey|nhl buts) dans _g45CdLire, cartes Paris en cours
  20261025l (SONDE d'Antoine pendant Steelers @ Saints : core …/football/leagues/nfl/events/<id>/competitions/<id>/odds → items provider 100 « DraftKings » (avant-match) + provider 200 « DraftKings - Live Odds » : overUnder 44.5, homeTeamOdds.current.moneyLine {decimal 2.03, american +103}, awayTeamOdds 1.73) : NFL BRANCHÉE (_G45_CD_US 'football|nfl' = points ; suspension « action en cours, temps mort… »). Test vm (2,03 / 1,73 / 44,5), smoke 103.
  20261025n (capture ESPN « Current drive » entourée, maquette image « oui ») : 🏈 DRIVE EN COURS dans la fenêtre du match NFL (`_renderGenericDetail` enveloppé, relu 30 s tant qu'ouvert et match 'in') — SONDÉ : scoreboard competitions[0].situation {down, distance, yardLine, possession, possessionText « PIT 47 », isRedZone, lastPlay{type.text, statYardage, start/end.yardLine}} (summary : drives.current, situation vide). `_g45NflDriveHtml(cp)` : position recalée sur possessionText (depuis l'en-but de l'équipe extérieure, à gauche), en-buts aux couleurs ESPN, 🏈, flèche dernière action, ligne jaune 1er down, « 3e & 4 à PIT 47 · dernière action : passe complétée, +1 yard ». Rendu Chromium avec les données de la sonde, smoke nflDr (104).
  20261025o (« mets un petit logo visuel pour voir qui a le ballon ») : logo ESPN (team.logo) de l'équipe en possession dans le titre et en rond blanc au-dessus du 🏈.
  20261025p (« quand cela a relu, ça a sauté… réapparu ») : la fenêtre se redessine (score) et effaçait le terrain jusqu'à la lecture suivante → dernier terrain gardé (el._g45Dr) et remis aussitôt (MutationObserver sur la fenêtre), une seule boucle par fenêtre. Test Chromium : effacé puis remis, pas de doublon.
  20261025q (« rien ne s'affiche chez BET » après un field goal ; « affiche un TD ou un field goal » ; « fais une animation » ; « TD un truc qui clignote, un truc sympa ») : sans position (après un score / avant le coup d'envoi) → terrain sans ballon « 🏈 EN ATTENTE DU COUP D'ENVOI » + dernière action ; bandeau TOUCHDOWN / FIELD GOAL / SAFETY (lastPlay.scoreValue ou type) au logo de l'équipe qui marque ; animations (NOUVELLE action seulement, lastPlay.id ; copie gardée sans animation) : ballon qui glisse, bandeau qui pulse, TD = bandeau vert ↔ jaune + en-but qui clignote + 🎉🏈 qui tombent ; field goal / punt : « de N yards ». Captures Chromium (FG, course, TD), smoke 104.
  et fenêtre du match ; NHL : lignes « (vainqueur, prolong. comprise) », pari « Victoire / Défaite » hockey SANS ligne 📈 (seul « Vainqueur ») ;
  textes « suspendue » par sport (_g45CdSusp). Smoke (cdUs, 96 contrôles). Rendu réel NON vu (ESPN bloqué depuis le cloud).
  20261020q — BRANCHÉ (demande d'Antoine « même rendu que le foot ») : `_g45CdLire('basketball', 'nba', …)` lit le scoreboard (état, équipes, score)
  puis, match 'in', le core odds (mémoire 30 s) → provider id 200 : h / a = homeTeamOdds / awayTeamOdds .current.moneyLine (sinon .moneyLine),
  L = overUnder, ov / un = current.over / under ; `_g45CdDec` accepte nombre (1-50 = décimal, sinon américain), {decimal}, {american}, {odds},
  {value} (forme exacte de over / under NON sondée → lecture prudente). C.u = 'points' : texte « + de 224,5 points », suspendue « temps mort,
  lancers… », pas de ligne Nul, fenêtre « Points ». Cartes Paris en cours (meta.sp basketball + lg nba) et fenêtre (_g45EspnUsOdds). Smoke cdNba (66).
- 📈 COTES EN DIRECT HORS FOOT (15/10) : commande console « 4 ligues » (NHL / NBA / NFL / MLB, moneyline.*.current + total.over.current)
  donnée à Antoine ; il la lancera pendant un match : MLB jeudi 19 h, NFL ce week-end, NBA mardi 21 h, NHL peut-être ce week-end. Chiffres
  présents → étendre _g45CdLire / cartes / fenêtre au sport (aujourd'hui meta.sp === 'soccer' et sport === 'soccer' seulement) ; ligne de
  total = points / runs (libellé « Buts » à adapter). Ligue Europa : même vérification proposée (uefa.europa).
- 💶 ABONNEMENT (prévu par Antoine « dès mardi » 13/10/2026) : en place = visiteur 50 paris max puis compte (auth-guard
  SEUIL_ESSAI_GRATUIT) ; compte = premium 30 j (`_g45AccesPremium`), puis bouton PayPal paypal.me/touraineantoine ; Antoine
  coche user_supporter.soutien à la main. Moyens de paiement à comparer mardi : PayPal Business, Stripe (vérifier sa liste d'activités interdites), Whop
  (concurrent « Astuces Paris Sportifs » : 9,99 / 14,99 / 19,99 €/mois ; Antoine trouve la page Whop « pas pro » → Whop seulement en moteur de paiement,
  page d'abonnement DANS bet45). À FAIRE : verrou CÔTÉ SERVEUR (RLS Supabase / worker) ; rappel à Antoine :
  vente ≠ don → compte PayPal PRO + déclaration (micro-entreprise). Ne pas récupérer de clé ni de secret pour ça.
  13/10 — DÉCIDÉ AVEC ANTOINE (rien de codé) : PAS de micro-entreprise ni de PayPal pro encore (il a lancé la création sur
  formalites.entreprises.gouv.fr — GRATUIT ; site privé payant espace-autoentrepreneur.com écarté). Tant qu'il n'y a pas de SIRET : PAS de vente
  (un « pourboire qui débloque » = une vente) → bouton « ☕ Laisser un pourboire » SANS contrepartie. PLAN : Gratuit = 25 paris / mois (après les
  30 jours offerts ; limite codée mais ÉTEINTE jusqu'au SIRET), Bilan essentiel (gains, ROI, courbe, liste), 3 équipes au mur, scores en direct /
  ruban / agenda, fiche d'équipe simple. Abonné = paris illimités, Bilan détaillé (sport / book / type / cotes / dom-ext), CLV, assistant IA du
  Bilan, équipes illimitées, fiche complète (Saisons, Compo, Séries individuelles), notifications, Tendances, Analyse IA, résumés traduits.
  Compétitions : À DÉCIDER (aujourd'hui : visiteur oui, compte > 30 j non — incohérent). Maquettes faites : guide de bienvenue 4 écrans + écran 5
  Gratuit / Abonné, pourboire (Outils → Mon compte), message « 🔒 25 paris ce mois-ci » ; « oui » de codage PAS encore donné. Vidéo explicative :
  faite par Claude (enregistrement automatique + sous-titres, Antoine ne veut pas se filmer), après le guide. Retour : les collègues de sa femme
  « ne comprennent pas le site ».
  Compétitions PROPOSÉ (réponse attendue) : libre = Équipes, Direct, Calendrier, Journées, Classement, Suivies ; abonné = Forme, Classements,
  Séries individuelles, fiche complète. Fiche d'un club ouverte depuis Compétitions (onglet Bilan vide, « 0 paris · Palier 1 ») : Antoine
  « c'est bon » pour les abonnés, ne rien changer ; compte GRATUIT (3 équipes) : club hors de ses 3 → fiche simple + cadenas sur le reste.
  Compétitions : partage VALIDÉ (« oui »), PAS encore codé (avec l'abonnement).
  Calculatrice (onglet Pari) : ABONNÉ (13/10, « calculatrice bloquer non abonné »). À REVOIR : mises « Mise 1 / Mise 2 » du Surebet en bleu
  foncé sur fond sombre (capture 13/10), à passer en blanc.
  → FAIT 20261025e (« fait le surbet ») : montants des mises en blanc gras (cres-v, les DEUX copies du calcul Surebet).
  20261025g (« devant cote 1 / cote 2 un sélecteur + ou − ; la cote lay aura à côté sa valeur normale », 2 maquettes image ; « Piwi devient OrbitX » après la fermeture du compte Piwi) : Surebet (DEUX copies) — bouton + / − par ligne (`sbSetLay`, r.lay) ; ligne LAY : `sbCote` = 1 + (1 − k/100)/(L − 1), pastille « = 1,82 » à côté de la cote (mise à jour en tapant), légende sous les lignes, résultat « Mise n LAY : mise lay € (risque €) » (mise lay = risque / (L − 1)). BK « orbitx » (logo SVG intégré redessiné d'après l'image d'Antoine : flèche verte + deux bouts blancs), dans _G45_BK_PERSO (gones seulement, 2 copies), remis en 1er dans state.b au chargement (Piwi gardé). Smoke sbLay (102), capture 412 vérifiée.
  20261025h (« c'est plutôt une flèche verte et deux bouts blancs », « ça fait un X ») : logo OrbitX redessiné en X (bouts blancs jusqu'à la flèche verte).
  20261025i (« voilà posé ») : VRAI logo images/books/orbitx.png (déposé par Antoine, recadré en rond 128 px), copié avec piwi.png dans fenotte45/images/books.
  VIDÉO de présentation (13/10, « oui ») : animation HTML enregistrée par Playwright (ESPN / bet45 bloqués depuis le cloud → exemples
  inventés, pas la vraie appli), 720 × 1280, 58 s, sans son : x-bet45/video/v.html + rec.js → bet45-presentation.mp4 (non déposée dans un dépôt).
  20261013n (« oui ») — 👋 GUIDE DE BIENVENUE + ☕ POURBOIRE, bloc en fin d'app.js, BET45 SEULEMENT (!_g45SanteActive) : `g45GuideOuvrir(i)` /
  `g45GuideFermer(club)`, 5 écrans (`_g45GuideEcrans`), affiché une fois 2,5 s après l'ouverture (localStorage g45_guide_vu ; pas si « Essai
  gratuit terminé ») ; dernier écran → g45AccClubAller('⚽'). Écran 5 = verrous ACTUELS ; plan futur derrière `_G45_ABO_PLAN` (false).
  `_g45GuideOutilsPoser` (toutes les 1,5 s) pose #g45-bloc-guide sous #g45-bloc-compte (auth-guard.js) : jours offerts restants
  (`_g45JoursOfferts`, created_at + 30 j), « ❓ Comment ça marche », « ☕ Laisser un pourboire » (paypal.me, sans contrepartie).
  Contrôle smoke.js « Guide de bienvenue + pourboire » (18 contrôles).
  20261015h (capture de Cédric : « Menu Stats » pour le bilan, alors que 🧠 Stats est un autre écran) : écran 3 du guide = « Onglet Pari → 📈 Bilan ».
  20261013o (maquette validée « OUI ») — ▶️ VIDÉO + ❓ GUIDE : `_g45AideBoutonsPoser` (bet45 seulement) : PC = #g45-aide-pc (pc-only) en tête de
  <nav class="nav"> ; téléphone = #g45-aide-mob en tête de #plus-menu. `g45VideoOuvrir` / `g45VideoFermer` : fenêtre avec <video>
  ./videos/bet45-presentation.mp4 (H.264, iPhone) puis .webm (VP9 : le Chromium de test n'a pas H.264 → erreur 4 sans lui) — fichiers
  DANS fenotte45/videos/ (2,3 Mo + 1,3 Mo). Testé Chromium 1280 + 390 (lecture readyState 4).
  20261013p (« OUI ») : 3e bouton « ☕ Laisser un pourboire » (paypal.me/touraineantoine) pleine largeur sous Vidéo / Guide (PC) et 3e ligne du menu Plus.
  20261015b (capture paysage : « elle est où la vidéo explicative sur tel ? ») : style.css (paysage) pose #plus-menu bottom:0 + max-height:100vh
  → 1re ligne « ▶️ BET45 en 1 minute » SOUS le bouton « 📱 Auto » / la barre du haut. Bloc en fin d'app.js : menu ouvert en paysage (--g45-paysage)
  → top = bas de header.topbar, max-height = reste de l'écran (!important, MutationObserver sur style + resize). Vérifié Chromium 915 × 412.
  20261015g (« bouton + ne fonctionne plus en mode portrait ») : --g45-paysage vaut 1 TOUT LE TEMPS (signal « style paysage présent ») → le calage
  s'appliquait aussi en portrait ; nav (backdrop-filter) = cadre du menu fixe → menu écrasé à 17 px. Test = vraie media query paysage, valeurs retirées
  sinon. Smoke « Menu + en portrait » (39).
  13/10 soir — DÉCISION D'ANTOINE : micro-entreprise REPORTÉE (« je vais laisser venir un peu de monde »). En attendant : appli gratuite + pourboire
  sans contrepartie ; plan d'abonnement prêt mais NON codé (sauf _G45_ABO_PLAN = false). Rappel donné : vérifier auprès de la CAF l'effet des
  revenus sur une éventuelle aide (AAH, prime d'activité…). Page PayPal.Me : photo perso remplacée par le logo + couverture BET45 (faits par Claude).
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
  20261013r (capture LDC « Aucun match joué » 2025-26 et 2024-25) : `_g45RegLogFoot` — page d'une COUPE (uefa.*, fifa., cup, coupe…) → lecture directe
  ?season=&league=<slug> SANS le garde-fou « League Phase = autre compétition » (il refusait la coupe elle-même). Testé vm 4/4.
  20261006w (« différencie pas domicile et extérieur », maquette Tous / 🏠 / 🚌 acceptée) : chaque entrée de journal porte h (1 domicile,
  0 extérieur) — ESPN atVs « vs » / « @ » (foot SONDÉ ; NFL / MLB supposé pareil), rugby cote 0 = reçoit, NRL F.h.id, KHL m.a = reçoit, NHL
  homeRoadFlag H/R (SONDÉ PAR ANTOINE, téléphone, game-log 8478402 2025-26 : « H » / « R » présents) ; `_g45RegCalc` ajoute R.d / R.e ; `_g45RegHtml` vue par _g45Reg.lieu.
  Listes g45reg1_v4_/v3_ → v5_, g45reg1_f7_ → f8_.
  20261016g (« rajouter le 2 pts » comme les paliers Winamax, maquette validée « oui ») : boutons « 1 / 2 / 3 ou plus » (_g45Reg.seuil) sous Buteurs /
  Passeurs / Pointeurs, tous sports ; `_g45RegCalc` garde R.v (valeur par match, chronologique) → `_g45RegSeuilS(S, n)` recalcule %, pire / meilleure /
  en cours (d / e aussi) sans requête ; colonne « % 2+ ». Listes g45reg1_v5_ → v6_, f8_ → f9_ (anciennes dans MORTS). Smoke (50).
  20261027g (« si je veux découvrir des petites pépites comme Adam Fox en passes » ; SONDÉ PAR ANTOINE : skater-stats-leaders …?categories=assists&limit=50 → 50 joueurs ; maquette = vrai rendu → « et tu pourras coder jouable en cockpit » = oui) : NHL, classement de la LIGUE seulement (`_g45RegPep()` = _g45Reg.pep && !eq && !lg) : boutons « 🎯 Top 10 | 🔍 Pépites (50 joueurs) » ; `_g45RegLire` limit 50, cache g45reg1_v6_<saison>_<cat>_pep (12 h), o.t10 = rang < 10 → ligne grisée (opacity .55), autres = 💎 ; colonne Paliers (pire + 1, `_g45F1CrPal` : ✅ / ⚠️ / ❌ + mise 1 ⭐) ; _g45RegK + '+pep'. Seuils, lieu, tris inchangés. Smoke pep (109).
  20261027j (« fais la NBA et NFL » → pépites ; « passeur TD sert à rien ? » ; captures Winamax yards passe / course / réception ; SONDES d'Antoine : leaders NFL / NBA 25 sans paramètre, ?limit=50 → 50 (NFL passingTouchdowns 43) ; journal NFL names QB passingYards+rushingYards, RB rushingYards+receivingYards, WR receivingYards+rushingYards, saison 2026 ; maquette maquette-yards → « OUI LES 3 ») : (1) Séries individuelles NFL : 🔍 Pépites (`_g45RegPep` accepte lg 'nfl', `_g45RegLeadersNfl(an, pep)` ?limit=50, caches _pep, o.t10) ; (2) Marqueurs NBA (`g45NbaMq`) : boutons Top 25 / 🔍 Pépites (50) (g45nba_mq.pep, `g45NbaMqP`), top 10 grisé, 💎, ligne « 🪜 pire série → paliers » ; (3) Marqueurs NFL : barre « 🏈 Touchdowns | 📏 Yards » (enveloppe de g45MqSport('nfl')) → `g45NflYd` (Passe / Course / Réception, ligne − / + de 5, % au-dessus, 5 derniers, cote juste, pire série → paliers, Jouent aujourd'hui / Mes critères, Top 25 / Pépites 50 ; état g45nfl_yd ; journal `_g45NflYdLire` (pur), cache g45nflyd1_<an>_<id> 6 h, saison régulière). Outils partagés `_g45MqPire`, `_g45MqPalHtml`. Smoke yards (111).
  20261027k (capture Séries NHL : « il manque clairement les 4 dernières années sur ce tableau en pire / meilleure série » ; maquette maquette-reg4 → « avec la mise à choisir si possible ») : NHL (ligue ET fiche d'équipe) boutons « 📅 Saison en cours | 📅 4 saisons (AAAA → AAAA) » (_g45Reg.s4, `_g45RegS4()`, _g45RegK + '+s4', caches _s4) ; `_g45RegLog4(id, saison)` = journal de la saison + 3 d'avant À LA SUITE (plus récent d'abord ; saisons finies gardées pour toujours, compact, g45reg4_<saison>_<id> dans _G45_CACHE_PREFIXES) ; fiche d'équipe en 4 saisons = PAS de filtre teamAbbrev (carrière récente du joueur). Colonne Paliers aussi en 4 saisons. Échelle de mises au choix « Mises : ⭐ … ⭐⭐⭐⭐⭐ » (g45_pal_et, `_g45PalEt`, `g45PalEtChoix`) → `_g45F1CrPal` prend STRATS[et] : vaut pour F1, Jouable en Cockpit, pépites, yards. Smoke reg4 (112).
  20261027l (« nfl » = mêmes 4 saisons) : Séries individuelles NFL (ligue et fiche d'équipe) : `_g45RegS4` accepte lg 'nfl' ; `_g45RegLog4Nfl(id, an)` = _g45RegLogNfl de an, an-1, an-2, an-3 à la suite (saison mal renvoyée → ignorée ; saisons finies g45reg4n_<an>_<id> pour toujours, dans _G45_CACHE_PREFIXES) ; libellé « 4 saisons (an-3 → an) » (saisons civiles). Lecture des saisons passées par ?season=<an> du journal common v3 : déjà utilisée par _g45RegLogNfl, NON re-sondée pour 2023-2025. Smoke reg4n (113).
  20261027m (« Draisaitl 8 matchs, il a été blessé, c'est pris en compte ? » → oui : journaux = matchs JOUÉS seulement ; « faudrait avoir la date de la série » → maquette texte « oui oui ») : `_g45RegCalc` garde R.pd = [AAMMJJ début, AAMMJJ fin] de la pire série et R.dt (date de chaque match, même ordre que v) ; `_g45RegSeuilS` recalcule pd aux seuils 2 / 3 ou plus ; Domicile / Extérieur (R.d / R.e) ont les leurs. Tableau : « JJ/MM/AA → JJ/MM/AA » en 12 px sous la pire série (tous sports des Séries). Clés de liste g45reg1_v6_ → v7_, f9_ → fa_ (anciennes sans dates ; préfixe g45reg1_ déjà nettoyé). Smoke pd (114). Antoine : en Domicile seul sur 4 saisons, Kaprizov pire série 4 (5 paliers ✅).
  20261027n (« mlb lanceur » + « nba » ; SONDE d'Antoine : leaders MLB ?limit=50 → ERA 50 | wins 50 | strikeouts 50, journal lanceur 5080761 names innings, hits, runs, earnedRuns, homeRuns, walks, strikeouts, … saison 2026 ; maquette texte → « oui ») : (1) Marqueurs MLB : barre « 🧮 Simulateur | 🔥 Strikeouts » (enveloppe de g45MqSport('mlb') ; Simulateur = `g45MlbSim` qui CACHE/MONTRE sans redessiner, sinon le bloc calc-lc emprunté au Calculateur serait détruit) → `g45MlbK` (ligne − / + de 1, % au-dessus, moyenne, 5 derniers, cote juste, pire série + dates → paliers, Saison en cours | 4 saisons, Top 25 | Pépites 50 ; état g45mlb_k ; journal `_g45MlbKLire` (pur, saison régulière), cache g45mlbk1_<an>_<id> : saisons finies pour toujours, en cours 6 h). (2) Marqueurs NBA : « 📅 Saison en cours | 4 saisons » (g45nba_mq.s4, `g45NbaMqS4` ; journaux an … an-3 fusionnés via _g45NbaGLRecuperer). (3) `_g45MqPireD` (dates JJ/MM/AA de la pire série) et `_g45MqPalHtml(pire, pd)` : dates aussi dans NBA et Yards NFL. Smoke mlbK (115).
  20261027o (capture Compétitions → NBA → Classements → Joueurs, puis capture NHL avec l'onglet « Séries individuelles » entouré → « oui ») : Compétitions → NBA : l'onglet « 🏅 Individuel » devient « 🎯 Séries individuelles » = écran g45NbaMq (Marqueurs NBA) posé dans #g45-nba-sr ; g45NbaMq lit son hôte dans window._g45NbaMqHote ('g45-nba-sr' depuis Compétitions, 'g45-mq-hote' depuis Tendances, posé par chaque appelant). Proposé, PAS fait (attente réponse) : traduire les catégories anglaises de Classements → Joueurs NBA et « saison 2027 » → « 2026-27 ». Smoke nbaSr (116).
  20261027p (« transfert sert dans aucun sport d'ailleurs ») : onglet « 🔄 Transferts » de Compétitions retiré pour TOUS les sports (filtre de `vues` ; vue mémorisée 'transferts' → 'equipes'). Code des transferts intact (plus appelé).
  20261027q (« Retirer l'onglet Suivies de Compétitions ET GARDER l'étoile dans l'onglet Équipes et c'est bon ») : onglet « ⭐ Suivies » de Compétitions retiré (même liste partout, doublon du menu ⭐ Suivies) ; vue mémorisée 'suivies' → 'equipes' ; étoile ☆ de l'onglet Équipes et g45SuiviEqRender (code) intacts.
  20261027r (« oui traduis ») : Classements → Joueurs (g45LeadersGen, tous sports US) : `_g45LdLibelle` traduit aussi par le LIBELLÉ ESPN (_G45_LD_FR_LIB : Points par match, Passes par match, Rebonds par match, Interceptions, Contres, Balles perdues, Minutes, Fautes par match, % aux tirs, % aux lancers francs, % à 3 points, Paniers à 3 points par match, Évaluation (PER), Doubles-doubles, Note…) ; ligne « saison » via _g45SgLabel (NBA « 2026-27 » au lieu de « 2027 »). Smoke ldFr (117). Le 20261027o avait remplacé l'onglet NBA « Individuel » par Séries individuelles ; cette liste reste dans Classements → Joueurs.
  20261027s (captures Ligue 1 Équipes + Journées : « coup de lifting ici » ; maquette maquette-journees → « oui, pour tout classement, pas que la Ligue 1 / foot, tout est concerné ») : `g45NrlRender` (Journées de TOUTES les compétitions + panneau NRL) = UNE journée à la fois, ◀ ▶ (window._g45JrSel, remis à zéro quand la compétition change via _g45JrSelCle), arrivée sur la journée en cours ; en-tête « Journée N » 18 px + plage de dates + matchs / joués ; cartes compactes en grille minmax(min(330px,100%)) : blason 30 px + nom 15 px de chaque côté (gagnant blanc gras, perdant #aab6d6), score 22 px (vert gagnant / rouge perdant), jour (+ heure si à venir) ; bandeau #g45-nrl-msg caché s'il ne contient que « ⏳ … ». L'ancien bouton « journée en cours en haut / calendrier » disparaît. Onglet Équipes : nom EN ENTIER 14 px blanc, « 1er · 17 pts · 8 j » + « 6V · 1N · 1D » en 13 / 12 px, blason 30 px, filigrane + couleur du club gardés, grille minmax(min(210px,100%)). Pastilles de forme de la maquette NON faites (classement ESPN sans forme, une requête par équipe). Rendu vérifié Chromium PC 1000 px / téléphone 390 px.
- 📊 TES CRITÈRES SUR 4 SAISONS (20261014a, maquette validée « ok ») — bloc en fin d'app.js, posé par renderSaisonsChart sous Global / Domicile /
  Extérieur (`window._g45CrHtml(nom)`, #g45cr), REPLIÉ par défaut (g45_cr_open). Méthode d'Antoine : il choisit une équipe pour une MONTANTE
  (cote 1,5 mini au départ : à 1,5 une victoire remet à zéro, au-dessus = bénéfice), note la consigne au mur, ajoute over / under si cote < 1,5.
  Championnat seul, saison en cours + 3 d'avant (espnClubSchedule(nom, an, lg), saisons passées compactées POUR TOUJOURS g45cr1_<lg>_<id>_<an>) ;
  boutons Lieu / Résultat / Buts + ligne / Les deux marquent ; « 📌 Reprendre ma note » = _g45AgConsigne (OU = combinés 2-3 ; « si cote < 1,5 »
  → résultat seul en combiné 1) ; par saison réussite + PIRE SÉRIE de défaites, total + paliers nécessaires (pire + 1) + série en cours.
  COTES PASSÉES : ESPN = pickcenter [] sur 2022 / 2023 (SONDÉ PAR ANTOINE) ; football-data.co.uk = « private individuals only, NOT commercial
  … automated bots/scrapers » (data.php, lu par Antoine) → NE PAS le lire ni copier ses fichiers dans un dépôt (même transformés : REFUSÉ).
  Pistes gardées : import CSV perso sur GONES45 (données sur l'appareil), enregistrer nous-mêmes les cotes ESPN d'avant-match du mur.
  Contrôle smoke.js « Saisons : critères sur 4 saisons » (22). Autres sports : plus tard si Antoine aime.
  20261018s (capture du bloc, « je vois pas » l'écart) : ligne « Écart » dans le combiné (c.ec 'g' = gagne de E ou +, 'p' = perd de E max ; c.E, échelle par sport
  _EC ; hockey = temps réglementaire) ; libCombo l'affiche. Testé Chromium (rendu du bloc).
  20261018t (« on étoffe le critère : rajoute joueur buteur / passeur / décisif ») : FOOT — ligne « Joueur » (menu = effectif actuel du club, gardiens
  exclus, tri buts + passes ; c.jo / c.jn / c.jm but | pas | dec) ; journal _g45RegLogFoot par saison du bloc, match retrouvé par DATE (± 1 jour), match
  sans le joueur = NON compté (jFiltre dans calc / enCours). D.tid ajouté. window._g45CrS = état (tests). Testé Chromium (ESPN simulé, Kane 1/2, 1/2, 2/2).
  20261018u (« faudrait meilleure série ») : calc → best (plus longue suite de réussites) ; colonne bleue « Meilleure série » + ligne 🏆 dans le total.
  20261027h — 🏁 JOUABLE EN COCKPIT ? (idée d'Antoine après la F1 20261027d ; maquette maquette-crck → « et tu pourras coder jouable en cockpit » ; « si je mets victoire et under 4.5 ça me met les meilleurs ? » → oui) : sous le tableau du bloc, classement de TOUTES les équipes du championnat (_g45CompetEquipes, classement ESPN), 4 saisons, combiné ACTIF + lieu, tri pire série puis % (5 matchs mini) ; paliers = pire + 1, mise 1 ⭐ (_g45F1CrPal) ; toucher = g45CompetOuvrir(nom, id, lg, sp, true). Critères IGNORÉS dans le classement (CLS_SANS) : joueur(s), feuille de match (tirs, mi-temps, corners, cartons, premier but, buts par MT) ; foot = championnat seul. Sports : foot (D.lg + D.tid), NHL / NFL / NBA / MLB (pas rugby). Bouton « ▶ Lancer le classement » (g45CrClsLancer), 3 équipes à la fois, compteur #g45cr-cls-prog ; S.cls[sp|lg] en mémoire (1 h par équipe) ; saisons passées dans les MÊMES caches que le bloc (g45cr1_<lg>_<id>_<an> via `chargerFt` = calendrier ESPN par n° d'équipe, worker host=espn ; g45cr1u_ via `chargerHk(nom, C0)` qui RENVOIE les données quand C0 est donné). Liste NHL / NBA… par _g45CompetEquipes NON vérifiée ici (proxy session) → message « Liste des équipes indisponible » si vide. Smoke crCls (110).
  20261014g (« ça fonctionne que sur le foot ? » → « oui » NHL) : même bloc en tête du panneau `_g45SaisonsGen` (hockey / nhl, insertAdjacentHTML après
  el.innerHTML) via `_g45CrHtml(nom, {sp, lg, id})` ; calendrier d'équipe ESPN hockey/nhl/teams/<id>/schedule?season=<an FIN>&seasontype=2 (présaison et
  séries écartées), match = [date, dom, pour, contre, ox] (ox 1 prolongation / 2 TAB lus dans status.detail) ; Victoire / Nul / Défaite / buts = TEMPS
  RÉGLEMENTAIRE (ox → min-min), Vainqueur = score final ; lignes 0,5 → 7,5 ; pas de « Les deux marquent ». Cache g45cr1_hockey_nhl_<id>_<an>. Contrôle smoke (24).
  20261014h (« ce que tu veux comme sport ») : aussi NFL, NBA, MLB (même condition dans `_g45SaisonsGen`, ctx {sp, lg, id}) : résultat = Vainqueur (score final,
  prolongation comprise) / Défaite seulement ; total de points (NFL 30,5 → 60,5, NBA 190,5 → 250,5) ou de runs (MLB 4,5 → 13,5) ; saison `_g45SgAnAuto`
  (NFL / MLB affichées « 2026 ») ; `chargerHk` généralisé (<sp>/<lg>/teams/<id>/schedule, ox seulement en hockey), cache g45cr1_<sp>_<lg>_<id>_<an>.
  Calendrier NBA NON sondé ici (même forme supposée). Contrôle smoke (25).
  20261014i (« il manque pts par équipe… enfin buts », « oui les 2 ») : lignes « Buts / Points / Runs de <équipe> » et « … de l'adversaire » (Over / Under + ligne :
  foot 0,5→3,5, NHL 0,5→5,5 temps régl., NFL 10,5→40,5, NBA 95,5→135,5, MLB 0,5→8,5) ; champs te / TL / ad / AL du combiné, pas lus par « Reprendre ma note ». Contrôle smoke (26).
  20261014j (« rugby et NRL ») : rugby à XV et NRL (toute ligue de _g45SaisonsGen) → `chargerRg` = matchs du panneau Saisons (_g45CompetEquipes +
  _g45CompetMatchs, scoreboards mensuels), phases finales (m.po) écartées, via _g45SgCalc ; Victoire / Nul / Défaite sur le score FINAL ; points du
  match XV 30,5→70,5 / NRL 25,5→60,5, équipe / adversaire 5,5→45,5 / 40,5 ; saisons _g45SgAnAuto + _g45SgLabel, lues une par une. NON vérifié sur ESPN. Contrôle smoke (27).
  20261014k (« rajouter les coupes d'Europe… comme la Ligue des champions », « pareil Challenge Cup », « oui les phases finales », « et les prochains
  matchs ») : RUGBY (Top 14 / URC / Premiership) — `_g45SaisonsGen` ajoute les matchs du club en Champions Cup (271937, m.cc 1) et Challenge Cup (272073,
  m.cc 2) (`_G45_RG_CUPS`, _g45CompetMatchs, mémoire memK|cc2) + filtre « Compétition » Toutes / Top 14 / 🏆 / 🥈 (window._g45SgRgComp, `_g45SgRgCompSet`),
  appliqué avant tout calcul ; clic d'un match de coupe → _g45SgCtx.lg de la coupe (window._g45SgCupIds) ; `_g45ProchainsHtml` mêle les prochains matchs de
  coupe (nom de compétition dessous). Bloc critères : phases finales GARDÉES, coupes m[5] 1/2, suit le filtre, cache g45cr3_. NON vérifié sur ESPN. Smoke (28).
- ▶️ VIDÉO « LA MÉTHODE MONTANTE » (20261014e, maquette validée « ok ») : bouton bleu dans la barre « 🚀 C'est quoi, le Cockpit ? » (<summary> de
  #sub-strat, posé par app.js `_g45VidCockpitPoser`, GONES45 ET BET45) → `g45VideoOuvrir(fic, titre)` (paramètres ajoutés, défaut = présentation) ;
  videos/bet45-montante.mp4 + .webm dans LES DEUX dépôts. Animation à exemple FICTIF (Arsenal, P1 5 € / P2 10 € / P3 30 €, cote 1,5 mini, 1 min 23) :
  x-bet45/video2/v.html + rec.js (Playwright) puis ffmpeg. Contrôle smoke.js (23).
  20261014f (« méthode cockpit plutôt ») : titre « La méthode COCKPIT » (vidéo, bouton, fenêtre) ; fichiers renommés videos/bet45-cockpit.mp4 / .webm.
- 🧰 OUTILS (20261014v, maquette en image validée « OUI ») : bloc en fin d'app.js. _G45_OUTILS_SEC = app (👤 Compte sur bet45 / 🩺 Général sur gones :
  santé, compte, guide…) · look 🎨 Apparence (g45-ori, Apparence, cadre « APPARENCE » dont le titre est caché) · notif 🔔 (panneau puis diagnostic,
  remis dans cet ordre) · mont 🚀 (palier-panel) · eq · donnees · cles ; `_g45OutilsClasser` enveloppé (renvoie 'app' → look / notif / mont) ;
  g45OutilsSection enveloppée → `_g45OlRetouche` (classe g45ol-on du menu, curseur + libellé sur une ligne .g45ol-row, ordre notifications).
  Feuille #g45-outils-lift : PC max 900 px centré, orientation cachée si pointer fine, menu en tuiles 14 px, textes 8-12 px → 13 px, var(--t3) → #c9d3ee.
  `renderPaliers` REDÉFINIE (tableau .g45ol-pal, P1 = input _g45MajP1) ; `renderNotifPanel` enveloppée (types en boutons .g45ol-chips, équipes .g45ol-eqs
  sur 2 colonnes ≥ 700 px, emoji du sport de u.sport). Smoke (33). Vérifié Chromium 1300 + 390 px.
  20261014w (« jeu de couleur selon palier + petit fond de chaque équipe », maquette « OUI ») : `window._G45_PAL_COUL` (P1 vert #1ed760 → P8 violet)
  sur le tableau des paliers ; #ulist (Outils → Équipes) habillé après coup par MutationObserver (`_g45UlistHabiller`) : fond = _g45ImgPersoLire →
  u.logoUrl → _g45JoueurVisLire (cache seul, opacité .18), liseré u.color, pastille « Palier N » couleur du palier, consigne sur bande sombre.
- 🧱 20261025j (« on peut ranger par sport ? » → maquette image « OUI ») : Outils → Équipes (#ulist) — après render (enveloppé en fin d'app.js), `_g45MurRanger` répartit les .urow en bandes par sport (`_g45MurSportDe` : foot, hockey, basket, baseball, NFL, rugby/NRL, F1, tennis, autres ; joueur = son u.sport) + une .g45-mur-grid par sport ; bande repliable `g45MurPlier(k)` (localStorage g45_mur_plie). data-idx inchangés, habillages (fond, palier, ❤️) intacts. Capture 1100 vérifiée, smoke murSp (103).
- PROCHAINS MATCHS d'un club de foot (`_g45AVenirLigue`, 20261014b, capture PSG « on a que les matchs de championnat ? ») : scoreboards
  60 j du championnat + amicaux + supercoupes, AJOUTÉS : uefa.champions / uefa.europa / uefa.europa.conf + coupe nationale (fra.coupe_de_france,
  esp.copa_del_rey, ger.dfb_pokal, ita.coppa_italia, ned.cup, eng.fa / eng.league_cup). Cause supposée (NON sondée) : le calendrier d'équipe
  ESPN d'une coupe ne rend que les matchs joués. Sélections nationales inchangées.
  20261014c (capture : PSG = LDC SEULE après 14b) : le scoreboard 60 j du CHAMPIONNAT ne rendait rien (matchs de L1 venus jusque-là du calendrier
  d'équipe, lu seulement hors cache) → `_g45AVenirLigue` relit aussi soccer/<lg>/teams/<id>/schedule (sans saison), 60 j.
  20261014d (« toujours pas ») : ?season=<année de début> d'abord (sans saison = saison suivante vide ?), puis sans ; diag window._g45AVenirDiag.
  20261014l (capture TÉLÉPHONE PSG : LDC seule, PC correct) : `_g45AVenirLigue` peut recevoir une COUPE d'Europe comme « championnat » (équipe résolue /
  calendrier ou table perso g45TeamsPerso mémorisés sur l'appareil) → slug uefa.champions|europa remplacé par espnLeagueOf(nom), sinon la table câblée
  `_g45EspnLeagueOfOrig` (fra.1 pour le PSG). CONFIRMÉ par Antoine (téléphone : « c est bon réparé »). Contrôle smoke (29).
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

RGPD / CGU (20261017f, remarque du beau-frère d'Antoine, maquettes validées « oui go mets les 3 en ligne ») — fenotte45 SEULEMENT :
  données = e-mail (+ pseudo) ; paris des comptes bet45 sauvegardés chez Supabase (user_state + user_state_backup), projet comptes
  ofciz… = West EU (IRLANDE, vu par Antoine), projet Potes vbsdew… = même région (dit par Antoine). (1) mentions-legales.html : section
  Données personnelles corrigée (sauvegarde en ligne, Irlande, notifications / IP chez Cloudflare, suppression du compte) + lien CGU ;
  (2) cgu.html (nouvelle : 18 ans, pas d'opérateur, indicatif, responsabilité, compte, partage, service gratuit, jeu responsable), liens
  dans login.html / accueil.html ; (3) auth-guard.js, bloc « Mon compte » : liens + bouton « 🗑️ Supprimer mon compte et mes données » →
  window._g45SupprimerCompteOuvrir (fenêtre, écrire SUPPRIMER) → window._g45SupprimerCompte : rpc g45_supprimer_compte (BET45) d'abord ;
  fonction absente → message « écris à contact@bet45.fr », RIEN effacé ; puis g45SocPartager('non') + rpc du projet Potes + données de
  l'appareil + déconnexion. SQL à installer PAR ANTOINE dans les DEUX projets : fenotte45/supprimer-compte.sql (security definer,
  auth.uid(), efface toute ligne public.* dont une colonne uuid = uid, 2 passes, puis auth.users). Testé vm 2/2 (avec / sans SQL).
  ABONNEMENT plus tard : CGV, rétractation 14 j, SIRET dans les mentions, « gratuit » à réécrire, suppression = résiliation.
BLOCAGE SFR (11/10, capture d'un ami d'Antoine) : « Navigation protégée » SFR (liste EfficientIP, depuis juin 2026) classe bet45.fr
  « malware » (vérif. red-by-sfr.fr/couverture-reseau/navigation-protegee.html) ; HTTPS → ERR_CERT_AUTHORITY_INVALID (page de blocage
  interceptée). Google Safe Browsing : aucun contenu suspect. Cause probable : telecharger/bet45.apk hébergé sur le site. Formulaire de
  requalification = Espace Client SFR (l'ami le fera). Contournement ami : DNS privé dns.google. Fait : fenotte45/mentions-legales.html
  (éditeur « Antoine T. », contact@bet45.fr = redirection créée par Antoine, hébergeur GitHub, Cloudflare/Supabase, données, cookies,
  propriété « toute copie interdite », formule officielle jeu responsable) + liens en pied d'accueil.html et bas fixe de login.html.
  20261008q — FAIT : Antoine a publié la Release GitHub « BET45 Android » (fenotte45, tag apk-v1, asset bet45.apk, sha256 = ancien fichier) ;
  _G45_APK = https://github.com/gones45140/fenotte45/releases/latest/download/bet45.apk (pas de HEAD : CORS) ; telecharger/bet45.apk SUPPRIMÉ
  de fenotte45. Nouvelle APK = nouvelle release avec un fichier nommé exactement bet45.apk. Ensuite : demande de requalification SFR par l'ami.
INSCRIPTION bet45 (11/10, « 0 création de compte possible », ami Cédric) : login.html « Première connexion ou mot de passe oublié » appelait
  resetPasswordForEmail, qui n'envoie RIEN pour une adresse inconnue → aucun nouveau compte possible depuis le 27/08. Remplacé par
  `lienPremiereConnexion` (supabase.js, fenotte45) = signInWithOtp shouldCreateUser + redirection reset.html (choix du mot de passe).
  Testé Chromium (Supabase simulé). Mails Supabase = SMTP Gmail badgone45000 (Brevo a suspendu le compte) ; avertissement « fournisseur
  personnel » de Supabase = normal. Cédric créé à la main (Add user, Auto Confirm). Captures impossibles = navigation privée Firefox (réglage). Lien « Mentions légales » de login.html DANS le cadre (maquette validée). login.html / reset.html renvoyaient vers index.html → SANS ?code= = vitrine accueil.html (« ça demande toujours la connexion ») → indexfenotte.html.
NOM DU COMPTE EN HAUT (20261011a, maquette B validée) : auth-guard.js `_g45NomCompte` — connecté → lien fixe « 👤 Connexion » caché (il
  renvoyait aussitôt dans l'appli et cachait le logo) et « 👤 <pseudo> » sous le Capital (.top-cap) ; pseudo = profils (social) sinon
  user_metadata.pseudo sinon début du mail ; toucher = showTab('t-outils') + bloc « Mon compte ». Testé Chromium (Supabase simulé).
VITRINE (11/10, « la page revient trop souvent en rafraîchissant ») : index.html de fenotte45 envoyait TOUJOURS sur accueil.html sans ?code= ;
  maintenant session Supabase (localStorage sb-…-auth-token) ou appli déjà utilisée (g45v5__fen) → indexfenotte.html (testé Chromium 3/3).
ACCUEIL bet45 « CHOISIS TON CLUB » (20261011b, maquette validée « Parfait ») : bloc en fin d'app.js, enveloppe de `_g45AccRegrouper` →
  `_g45ClubTuiles` (bet45 seulement, `_g45ClubBet45`) : sport d'équipe ou tennis sans VRAI club (`_g45ClubSansVrai` : cartes « catégorie »
  _G45_ACC_NOMS seules, ou aucune) → « Choisis ton club › » (tennis : joueur), image de la carte catégorie retirée ; `g45AccClub(v)` = fenêtre
  de la démarche ; `g45AccClubAller(v)` → Outils, g45OutilsSection('eq'), #u-sport réglé, curseur dans #u-search (foot : CLUB_DB = FOOT
  SEULEMENT) ou #u-name. Exemples `_G45_CLUB_EX`. Contrôle ajouté au test « Accueil par sport ». fenotte45 : images/equipes/rugby.png
  (logo CJF Rugby Fleury, SANS droits — Antoine) et basket.png (photo 123RF avec filigrane) SUPPRIMÉS.
  20261011c (capture : « Utiliser le mot de passe enregistré ? » au bouton bleu) : plus de focus auto (case encadrée jaune 4 s) ;
  `_g45SansMdp` : input[type=password] (clés d'API d'Outils) → autocomplete new-password, u-name / u-search… → off. Effet sur Chrome Android NON vérifié.
  11/10 : images/equipes/ladodgers.png (logo MLB sur fond blanc, « carré » dans la tuile Baseball) SUPPRIMÉ de fenotte45 (« pareil »).
  20261011d (toujours visible : mémoire du téléphone) : `_g45ClubTuiles` remplace aussi toute image presque CARRÉE d'une tuile (logo) par l'emoji du sport (bet45 seulement).
  20261014y (mur de Cédric : « F1 pas le logo F1, Dodgers pas d'image ») : LOGOS / CLUB_DB (DEUX copies) donnaient à « LA Dodgers »
  api-sports baseball/teams/19.png = blason des MIAMI MARLINS → logo ESPN mlb/500/lad.png ; u.logoUrl mémorisé corrigé une fois
  (g45_fix_lad1) ; alias _G45_TSDB_ALIAS ladodgers / laangels → « Los Angeles … » (visuel TheSportsDB) + échec g45_fanart2_ladodgers effacé ;
  tuile F1 sans carte FORMULE 1 au mur = emoji seul → img: images/equipes/formule1.png dans _G45_ACC_SPORTS.
  20261014z (« d'autres vont abuser », choix « 15 ») — MUR LIMITÉ À 15 SUR BET45 (bloc en fin d'app.js) : `_G45_MUR_MAX` = 15, `_g45MurLimite()`
  (= !_g45SanteActive : gones sans limite), toutes les entrées comptent (12 PRESETS par défaut compris → un nouveau compte n'a que 3 places,
  supprimer des presets libère) ; enveloppes window.addUnit / window.g45BbMur → `g45MurPleinMsg()` « 🧱 Ton mur est plein (N / 15) » ;
  mur déjà au-delà = gardé ; compteur #g45-mur-compte au-dessus de #ulist. Abonnement plus tard : gratuit 3 / abonné 15. Smoke (34).
  Antoine sur bet45 : limité aussi (« puni là-bas », voulu).
  20261015a (« une équipe par sport, célèbre, retirer du foot, beau mur » ; « enlève Lyon, mets Bayern, Inter, Arsenal » ; « rajoute chez Cédric
  une équipe par mur où c'est pas rempli ») — MUR DE DÉPART BET45 (bloc en fin d'app.js) : PRESETS (DEUX copies) INCHANGÉS (gones) ; sur bet45, une
  fois (drapeau g45_mur2) `_g45Mur2Appliquer(state, off)` : compte NEUF (aucun pari, mur = presets) → `_G45_MUR2` = PSG, Real Madrid, Bayern Munich,
  Inter Milan, Arsenal, Los Angeles Lakers, Colorado Avalanche, LA Dodgers, Kansas City Chiefs, Stade Toulousain, Penrith Panthers (11, 4 places
  libres), presets retirés notés dans g45_presets_off ; compte EXISTANT → équipe de _G45_MUR2 ajoutée pour chaque sport sans équipe (hors foot),
  jamais une équipe supprimée (g45_presets_off), jamais au-delà de 15. Smoke (35).
- 📅 20261025f (« on pourrait rajouter bénéf mois en cours en haut ? » → maquette « OUI » ; « d'ailleurs sous bénéf mettre la date du 1er pari ») : Mur, 3e case après Bankroll / Bénéfice (#g45-mois-kpi, `_g45MoisKpi`, calcul `_g45MoisCalc(A, d)`) = nom du mois, bénéfice des paris réglés du mois (h.date, hors isPending, même formule que render), « N paris · X % ✅ » ; grille auto-fit 150 px, écran étroit → 3e case pleine largeur. Sous Bénéfice : « depuis le JJ/MM/AAAA » (#g45-ben-dep, `_g45PremierPari`, plus ancienne date de state.a + state.h). render enveloppé en fin d'app.js. Captures 412 / 1100 vérifiées, smoke mois (101).
BILAN, barre d'info sous la courbe (20261011e, capture : « Global … · Winamax … · Betclic… » coupé) : style.css a .cib-val en flex-shrink:0 →
  feuille #g45-cib-ligne (app.js) : .chart-info-bar flex-wrap, .cib-val flex 1 1 220px + retour à la ligne (sous la date si longue). Testé Chromium 412 px.
BILAN « Répartition par type » (20261011f, maquette validée « c'est mieux oui ») : renderChartTypeDonut REDÉFINIE en fin d'app.js (gagne sur
  les DEUX copies) : rond = 8 types les plus joués (`_G45_TYPE_MAX`) + « Autres » gris ; légende Chart.js retirée ; pastilles avec nombre ;
  bouton « Voir les N autres types » (window._g45TypeTout). 20261011g (maquette validée « ok ») : renderChartTypeBen REDÉFINIE aussi :
  canvas #chart-type-ben caché, boîte #g45-typeben = 5 meilleurs / 5 pires en lignes (nom entier 14 px, barre), reste dépliable (_g45TypeBenTout).
BILAN, courbes « Évolution bankroll » (#cg, GC) et « Bankroll totale » (#chart-bankroll, _advCharts.bk) — 20261011h (validé « ok ») : enveloppes
  de renderGlobalChart / renderAdvancedCharts : boutons 1J · 1S · 1M · Tout (`_g45PerChips`, PARTAGÉS : setBilanPeriode / window._bilanPeriode,
  tout le Bilan suit) ; `_g45CourbePropre` : pointRadius 0 (rond au toucher), dates AAAA-MM-JJ → JJ/MM. Testé Chromium (Chart simulé).
  20261011i (capture « 11/10 · 6 paris … +128.47€ · Betclic ») : infobulle de Bankroll totale = book de sorted[index] (N-ième PARI ≠ journée)
  → book retiré (`_g45CourbePropre`). Lignes de pari F1 avec joueurs (« Vainqueur GP » + pilotes) : l'enveloppe _g45IdF1 → _g45IdJoueur gardait
  les initiales « VP » à la place du logo F1 → carte F1 = logo F1 prioritaire.
LIGNES DE PARI EN PORTRAIT (20261011j, « portrait ça coupe, rapprocher à gauche ? ») : `_g45BetRowMini` date en 2 versions (.g45-dl
  complète / .g45-dc JJ/MM) ; feuille #g45-row-portrait (< 600 px) : date courte, colonne 40 px, texte à 50 px du bord droit quand il y a la
  photo de joueur ([data-g45jph], sélecteur :has). Paysage / PC inchangés. Testé Chromium 412 px.
  20261011k (idée d'Antoine, aperçu validé « je te fais confiance ») : portrait = UNE colonne à gauche (.g45-rg : date en haut, .g45-ricones = rond du sport + logo du book côte à côte dessous).
  20261011l (capture : logo F1 caché sous le bandeau des pilotes) : _g45IdF1 pose data-g45f1, même place réservée (44 px) en portrait. CONFIRMÉ « c'est bien » pour le reste.
FICHE D'ÉQUIPE (20261012a, maquette validée « oui », captures Rams) : feuille #g45-club-lisible = % de réussite du rond (#ip-bilan) en blanc 22 px
  (avant couleur du club, illisible) ; onglet Archive refait par l'enveloppe d'openClub → `_g45ClubArchive(nom)` = lignes `_g45BetRowMini`
  (club qui reçoit à gauche, score, sport, book), jours « Dimanche 4/10 » + gain NET (l'ancien affichait le gain BRUT m×cote et une clé mois/jour).
  20261012b (capture Graphs) : `_g45ClubCourbe` (même enveloppe, 200 ms après) — AC.courbe : ligne éclaircie _g45CoulClaire(c, 0.4), axe JJ/MM à plat
  (étiquettes brutes « 2026-09-22 02:20 vs … P2||-20.00€ » avant), infobulle sans « || », window._gcClub = AC.courbe (barre « Touche un point » était muette).
CLASSEMENT DE LA FENÊTRE DE MATCH (`_g45FillStandings`, 20261012c, capture Rams–Bills « manque les pts ou % ») : NFL / NBA / MLB → J = G + N + P,
  dernière colonne « % V » (nul = ½), tri % puis Diff ; hockey → tri points puis Diff ; foot / rugby inchangés (rang ESPN). Testé vm.
BANDEAU DE PRÉVENTION (20261012d, demande d'Antoine d'après la bande jaune d'un site de paris : « faut tout mettre ») : `_g45PrevPoser` (fin
  d'app.js) — bet45 SEULEMENT (`_g45SanteActive` faux) : bande jaune #f7dc4a, 1re ligne pleine largeur DANS header.topbar (sticky), texte officiel
  (dangereux… / joueurs-info-service.fr 09 74 75 13 13) + images/gouvernement.png (fenotte45, découpé de la capture d'Antoine) ; cachée en paysage
  téléphone. Formule de Potes (social.js) et mentions légales inchangées. Compte X @Bet45_fr créé le 12/10 (bannière + logo faits par Claude).
SAISONS D'UN CLUB DE FOOT (loadTeamSaisons, 20261013a, maquette validée « oui ») : boutons Global / Domicile / Extérieur (_statFilter) posés UNE fois
  sous « Filtrer par compétition » (retirés de chaque saison) ; pastilles BTS / CS / WIN / LOSE / 1N / N2 en 14 px blanc, choisie en bleu + ✓.
TENDANCES (20261013b, capture « Viking FK ou nul » vs Bayern 61 % / bookmaker 13 %) : tendance dont le modèle dépasse 2,2 × la proba du marché
  (marge retirée, note « Ecart ecarte ») RETIRÉE de la liste (avant : gardée dans « Taux élevés sans écart calculable »).
TENDANCES (20261013c, maquettes validées « oui ») : (1) choix de la compétition dans chaque groupe allumé (`_g45TrLiguesHtml`, `g45TrLig(gi, slug|'*')`,
  slugs éteints localStorage g45tr_lsoff, filtrés dans g45TrRun) ; (2) COUPES D'EUROPE (cross) : cote présente → gardée seulement si |modèle − marché| ≤ 12 pts,
  badge « ✅ stats et bookmakers d'accord » (m.accord) ; sans cote → « ⚠️ pas de cote pour vérifier » (m.croSans) ; (3) FIABILITÉ : tendances AFFICHÉES notées
  (`_g45TrSuivNoter`, g45suivtend1, 400 max / 120 j, score exact exclu) puis jugées sur le score final (`_g45TrSuivVerifier`, scoreboard du jour, 6 lectures
  par ouverture, abandon après 10 j) → bloc #g45tr-fiab `_g45TrFiabHtml` (tranches 40/50/60/70 %, vert / jaune / rouge vs proba annoncée). Testé vm 9/9 + rendu.
  À FAIRE ENSUITE (accord d'Antoine) : Tendances hors foot — hockey FAIT (20261013i), NBA + NFL FAIT (20261013j), MLB en mars (reprise). RUGBY : laissé de côté le 13/10 (pas de cote ESPN / The Odds API pour le Top 14, pas de ligne, lecture mois par mois) — à reproposer seulement si une source de cotes gratuite apparaît.
TENDANCES (20261013s, capture Winamax : Viking 2-0 Bayern à la mi-temps alors que 13b avait CACHÉ « Viking ou nul » ; maquette validée « oui fait le ») :
  plus rien n'est caché pour désaccord — m.desac (écart > 2,2 × marché, ou coupe d'Europe avec stats > bookmakers de plus de 12 pts ; stats < bookmakers = toujours
  retiré) → bloc à part « ⚠️ STATS ET BOOKMAKERS EN DÉSACCORD » en bas de `_g45TrRender` (cadre orange, 📊 Stats % / 🏦 Bookmakers % côte à côte, un par match,
  plus gros écart d'abord, 10 max), jamais dans Values / Taux élevés ; suivi g45suivtend1 avec d:1 + f (proba bookmakers) → `_g45TrFiabHtml` : ligne
  « ⚠️ En désaccord : x / n réussies » à part. Contrôle smoke.js (19).
TENDANCES (20261013d, « ESPN les propose pas les cotes ? ») : `_g45TrOddsEv` lit aussi la cote Over / Under de la ligne principale ESPN
  (total.over|under, r.ov / r.un / r.ouL) ; `_g45TrBuild` la met dans pr['o<L>'] / pr['u<L>'] (L = 1,5 / 2,5 / 3,5) si The Odds API n'a rien.
  BTS : ESPN n'a PAS de cote (seulement 1N2 + ligne de buts). Testé Chromium (Lens–Sporting simulé : fair 52 %, cote 1,83).
CRÉDITS THE ODDS API (20261013e, 13/10 : plafond du jour du worker atteint, « 500 en rien de temps ») : `_g45TrOddsApi(slug, marches)` — Tendances
  = 'totals' SEUL et seulement si ESPN n'a pas la cote Over/Under du match ; CLV = 'h2h,totals' (défaut) ; « btts » RETIRÉ de l'appel par compétition
  (doc The Odds API, capture d'Antoine : marché SUPPLÉMENTAIRE, seulement via /events/{id}/odds) ; cache 3 h (avant 15 min), clé g45trOdds2_<clé>|<marchés>
  (g45trOdds_ → MORTS). À FAIRE : sonde d'Antoine demain (/odds?…&markets=h2h,totals,btts : refusé ou non ?) puis décider BTS match par match (1 crédit, 3 max / analyse).
  13/10 — WORKER /odds (choix 2 d'Antoine, fichier complet donné, À REDÉPLOYER) : PLAFONDS.odds [8 / personne, 20 / jour, 400 / mois] compté en
  CRÉDITS (marchés × régions, `compter(…, poids)`) au lieu des appels ; appel venu de gones45140.github.io (`origineGones`, Origin / Referer) =
  SANS limite par personne, plafonds communs gardés. Testé vm 5/5. REDÉPLOYÉ par Antoine le 13/10 (ce fichier contient aussi le correctif
  du 10/10 : heure de Paris de runRappelCron sans Intl → déployé aussi).
  20261013f — SONDÉ PAR ANTOINE (Lens–Sporting, ESPN uefa.champions) : total.over open o2.5 « -180 » → close o3.5 « +140 » (overUnder 3.5) ;
  /odds markets=…,btts → 422 INVALID_MARKET (BTS seulement par match, REFUSÉ par Antoine : « on laisse »). 13e coupait The Odds API dès
  qu'ESPN avait une cote Over/Under → plus de cote 2,5 ; maintenant The Odds API sautée seulement si la ligne ESPN = 2,5.
  20261013g — SONDÉ PAR ANTOINE : ESPN « Lens » / « Sporting CP » vs The Odds API « RC Lens » / « Sporting Lisbon » (Over 2,5 1,59) → match
  jamais retrouvé. `_g45TrFindEv` : 2e passage MOT PAR MOT (mot ≥ 4 lettres commun aux deux équipes, mots courants real/united/city… écartés,
  candidat UNIQUE seulement). Testé vm 7/7. CONFIRMÉ par Antoine (Lens–Sporting + de 2,5 buts : cote 1,58 affichée).
  20261013h (« en fond 1er et 2e match on pourrait faire quoi » → choix « LOGO COMPETITION ») : carte Tendances sans photo de club en cache
  (`_g45ImgPersoLire` / `_g45FanLire`, aucune recherche lancée) → logo de la compétition (scoreboard leagues[0].logos, rel « dark » d'abord,
  0 requête ; fixtures.lgl → deco.lgl) en grand au centre, opacité .2, contain. Photo du club : proposée, NON retenue. CONFIRMÉ « c'est bien ».
  20261013i (maquettes validées : onglets par sport « fait une maquette », hockey « ok pour l'instant sans cote ») — 🏒 TENDANCES HOCKEY : bloc en
  fin d'app.js. Onglets ⚽ Football / 🏒 Hockey sous le titre (`g45TrSport`, _G45_TR.sp, localStorage g45tr_sp ; résultats rangés à part resF / resH) ;
  enveloppes de loadTendancesTab (foot = écran d'avant + onglets ; hockey = écran propre : NHL seule, Jour / Cote mini / Proba mini, fiabilité,
  « Analyser les matchs NHL »), g45TrRun (hockey → scoreboard hockey/nhl du jour, présaison écartée, calendriers `_g45CompetEquipes` +
  `_g45CompetMatchs` saison `_g45CompetAnneeAuto('nhl')` + précédente, cache 12 h) et _g45TrCompLbl ('nhl' → 🏒 NHL). `_g45TrHkCote(ms, id, dom, 40)`
  (40 derniers du BON côté : w, l, ot = m.ox, o55, o65) ; `_g45TrHkBuild` : Vainqueur dom / ext (score final, prolong. + TAB, normalisé), + de 5,5,
  - de 6,5 ; prolongation dans les faits des cartes Vainqueur (≈ 20-30 %, jamais ≥ 50 %). SANS The Odds API (0 crédit) : SONDÉ PAR ANTOINE
  13-14/10, ESPN NHL = 0 cote sur 5 matchs ; si ESPN en publie : moneyline → fair 2 issues, total ligne 5,5 / 6,5. Fiabilité : types 1 / 2 / o55 /
  u65, verifier lit hockey/nhl si sl === 'nhl', `_g45TrFiabHtml` filtré par onglet. Contrôle smoke.js « Tendances hockey » (16 contrôles). CONFIRMÉ « parfait ».
  20261013j (« OK NBA ET NFL » ; MLB écartée jusqu'en mars : playoffs seulement) — onglets 🏀 NBA / 🏈 NFL (`_G45_TR_US` : path, lg, tab, lbl ;
  onglets en grille 2 × 2 sur téléphone ; résultats _G45_TR['res_' + sp]). SONDÉ PAR ANTOINE : ESPN NFL (scoreboard ?dates=20261018) = 12 matchs à
  venir, 12 avec cotes DraftKings {details « JAX -3 », overUnder 42.5, spread -3, moneyline.home|away.close.odds, home/awayTeamOdds.favorite} ;
  matchs déjà joués = cotes retirées ; NBA : 0 match à venir le 13/10 (format supposé identique). `_g45TrUsLignes(e)` (total + favori/écart lus
  dans details), `_g45TrUsListe` (40 derniers du bon côté), `_g45TrUsBuild` : Vainqueur, + / - de L points (ligne ESPN), Handicap <favori> -L
  (cote pointSpread NON vérifiée) ; sans ligne = Vainqueur seul. NFL = 7 prochains jours (un scoreboard par jour), date dans la carte.
  Fiabilité : clés ov42.5 / un42.5 / hc1:3 / hc2:3, verifier par ligue (nhl / nba / nfl). Contrôle smoke.js « Tendances NBA / NFL » (17).
TENDANCES (20261014m, « il faudrait les stats et book % comme en bas sur chaque pari », maquette validée « oui ») : `_g45TrRender` → card(x, showGap, sansCases) :
  pastille « Bookmaker (marge retirée) » RETIRÉE, remplacée en bas de CHAQUE carte (foot, hockey, NBA, NFL) par les cases .g45tr-cases 📊 Stats (m.p, bleu) /
  🏦 Bookmakers (m.fair sinon m.accord, jaune ; absent → « — pas de cote » gris) ; bloc « en désaccord » : card(x,false,true), ses cases d'origine gardées. Smoke (30).
  20261014n (« cote à vérifier · 51 % estimée en haut à droite, on peut l'enlever ? », maquette « Oui ») : coin haut droit des cartes = « @x COTE MARCHÉ »
  (+ espérance + heure) si cote, sinon l'HEURE seule en pastille 13 px ; le % reste dans la case 📊 Stats. Smoke (trCases).
  20261015i (« publier les bilans tendances sur X : il faut que tout le monde ait la même », maquette validée, « oui go solution 2 à 10 h ») —
  📒 TENDANCES OFFICIELLES : robot GitHub Actions .github/workflows/tendances.yml (crons 8 h ET 9 h UTC = 10 h Paris été / hiver ; le script ne
  travaille qu'à partir de 10 h et une fois par jour, « Run workflow » = FORCE) → .github/scripts/tendances.mjs : ouvre le VRAI site gones dans
  Chromium (Playwright), réglages officiels cote mini 1,50 / proba mini 50 % / aujourd'hui / groupes par défaut, onglets foot, hockey, nba, nfl ;
  prend EXACTEMENT les tendances affichées (enveloppe de _g45TrSuivNoter), match pas encore commencé, une fois par (id, type) ; juge les matchs finis
  (scoreboard du jour + veille, _g45TrSuivJuge de la page) ; ESPN servi par CURL (Akamai refuse un navigateur sur IP de datacenter, cf. relay.mjs) ;
  écrit données/tendances_officielles.json {maj, dernier, reglages, t:[{id, sl, t, h, a, m, k, p, c, f, d, r, s, n}]} (données/ exclu de pages.yml).
  Testé ici avec faux ESPN (FAUX_ESPN / FAUX_INIT / SITE / CHROMIUM : variables d'essai). ACCÈS ESPN DEPUIS GITHUB NON vérifié par un vrai passage.
  App (bloc en fin d'app.js) : enveloppe de _g45TrFiabHtml → `_g45TrOffHtml` (OFFICIEL, filtres Toutes / D'accord / Désaccord `g45TrOffF`, ✅ Réussite
  = toutes les jugées, 💶 Gain à 1 € = seulement avec cote (`_g45TrOffCalc`), courbe SVG, liste 5 + `g45TrOffTout`), lu sur raw.githubusercontent.com
  (mémoire 10 min). Smoke (40).
  20261015j (Cédric : « beaucoup de tendances à 1,2 même en cochant 1,5 mini ») : `jouable` de _g45TrRender ne testait que 1/p (cote déduite des stats) →
  cote du marché connue (m.cote > 1) = elle doit être ≥ cote mini ; sinon 1/p comme avant. Vaut aussi pour le robot officiel. Smoke (41).
  20261015l (« Pas de nul » Gent–AGF, bookmakers 77 % ≈ 1,30, sans cote, affiché avec cote mini 1,50) : `jouable` — sans cote mais avec m.fair (ou
  m.accord) → 1 / % des bookmakers comparé à la cote mini ; sinon 1/p. Passage officiel du 15/10 refait une 2e fois (aucun match commencé).
  20261021m (JP / Bruno, groupe « Bets 4 us » : « choisir que les cotes > 2 », paliers 1,05–1,50 / 1,50–2 / 2–2,5 / 2,5–3 / 3 et + ; Antoine
  garde « 1,50 et + » « c'est pour moi ») : filtre « Cote mini » → « Cote » en fourchettes, _g45TrCoteChips (les DEUX barres de filtres),
  g45TrMin(mini, maxi) (_G45_TR.max, 0 = sans plafond), _g45TrRender : dans(c) = c ≥ mini et c < maxi (jouable + values). Défaut inchangé
  1,50 et + ; robot officiel inchangé (max non posé). 5 essais vm, smoke 74.
  20261015k (« une fois demandées, elles devraient rester visibles jusqu'au match ») : bloc en fin d'app.js — enveloppe de g45TrRun : liste rangée
  dans IndexedDB (_g45BgIdb, magasin kv, clé 'tr_<sport>') avec signature `_g45TrGardeSig` (jour visé, Aujourd'hui/Demain, groupes, g45tr_lsoff) ;
  enveloppe de loadTendancesTab : sans résultats → reprise si même signature, matchs commencés retirés (`_g45TrGardeFiltre`), une fois par sport
  et par chargement (↺ Relancer = vraie analyse). Testé Chromium (rechargement). Smoke (42).
  20261015o (« DraftKings paie ≈ 5 % de plus que Winamax », maquette validée « OUI » : « approximatif book ARJEL, enlever 5 %, en laissant la cote
  DRAFT ») : bloc en fin d'app.js — enveloppes de _g45TrBuild / _g45TrHkBuild / _g45TrUsBuild → `_g45TrCoteFr` : m.coteDk = cote d'origine, m.cote =
  × 0,95 (`_G45_TR_FR`, ≈ books FR ANJ, ESTIMÉE), espérance recalculée ; coin des cartes « ≈ @x · BOOKS FR (ANJ) · estimée · DK y ». Filtres cote mini /
  jouable, tri, historique officiel (c = ≈ FR, cd = DK ; mention sous le titre) utilisent la cote ≈ FR (1,50 FR = 1,58 DK). Cotes The Odds API : même
  correction (approximation). m.fair inchangé. Passage officiel du 15/10 refait une 3e fois (aucun match commencé). Smoke (44).
  20261015p (Antoine : DK 3,15 → Winamax 2,95 = − 6,3 % ; « un poil en dessous, c'est bon ») : _G45_TR_FR 0,95 → 0,94 (− 6 % ; 1,50 FR ≈ 1,60 DK) ;
  passage officiel du 15/10 refait une 4e fois (aucun match commencé).
  20261017g (« on sait pas ce qui était les tendances passées » → « un calendrier », maquette validée « oui go ») : liste de `_g45TrOffHtml` (triée par
  notation, ⏳ du jour d'abord) REMPLACÉE par un CALENDRIER du mois (jour de notation x.t ; 🟩 gain à 1 € +, 🟥 −, gris sans cote, ⏳ rien de jugé ;
  « réussies / jugées » + gain) ; `g45TrOffJour(k)` = liste du jour dessous, `g45TrOffMois(±1)` ; défaut = dernier jour jugé ; filtres appliqués. Smoke (trOff).
  20261017h (« trier par championnat » → « un truc comme dans Bilan avec les filtres », vrai visuel validé « oui go ») : barre « 🔎 Filtres » repliable
  (O.fOuv, `g45TrOffFltOuvrir`) au-dessus des tuiles : Sport (ft / hk / bk / fb d'après sl), Championnat (sl, _g45TrCompLbl), Type (k : vic 1|2, dc 1N|2N,
  ov, un, bts, hc, aut), Cote (sans / 1,50-1,79 / 1,80-2,19 / 2,20+), Proba stats (50-59 / 60-69 / 70+), Avis (acc / des = ancien O.f), Période (7 / 30 j) ;
  `g45TrOffFlt(cat, v)` (re-toucher = enlever), `g45TrOffFltRaz` ; nombres par bouton calculés avec les AUTRES filtres ; gardés localStorage g45tr_off_flt. Smoke (trOff).
  20261017i (« mensuel + garder au début du mois suivant le bilan du mois », « lifting c'est moche », « il manque beaucoup d'info sur cette courbe »,
  « avec des logos de club ou championnat » ; vrai visuel validé « OUI ») : `_g45TrOffHtml` refait — tout compté sur le MOIS affiché (O.mois, ◀ ▶ dans
  l'en-tête, défaut = mois en cours) ; du 1er au 7 du mois en cours, carte « 🏁 BILAN DE <mois d'avant> » (%, gain, ROI, meilleur championnat ≥ 5 jugées,
  « Voir <mois> › ») ; 3 tuiles (rond de réussite, gain à 1 €, en attente) ; calendrier (logos des championnats sur PC, % seul sur téléphone < 600 px) ;
  liste du jour rangée par CHAMPIONNAT (logo + bilan, ceux déjà joués d'abord), un match = une carte (logos des clubs, score ou « à venir · heure »),
  ses paris dessous avec liseré vert / rouge ; courbe du mois par JOUR (€ à gauche, dates, gain du jour, Plus haut / Plus bas / Fin, point = ouvre le jour).
  Logos : robot (.github/scripts/tendances.mjs) → x.hl / x.al = team.logo du scoreboard ESPN, J.lg[sl] = logo de ligue (dark d'abord) ; tendance sans hl
  relue une fois au passage de 10 h ('' = essayé) ; repli app : g45LogoUrlDe(nom), ESPN leagues/500/<nhl|nba|nfl>.png, g45_lglogo_soccer_<sl>, sinon initiales.
  Testé Chromium (vraies données, 1000 / 412 px, date simulée 03/11 pour la carte). Smoke (trOff).
  20261017j (capture : logo Ligue 1 blanc invisible) : pastille des logos de championnat de `_g45TrOffHtml` en gris #5a6788 (clubs : blanc inchangé).
  20261017k (« ça fait un vide noir au milieu », maquette validée « oui ») : liste du jour de `_g45TrOffHtml`, PC ≥ 700 px = une ligne par match
  (.g45tro-mc : équipes + score à gauche 400 px .g45tro-mh, paris à droite .g45tro-mb / .g45tro-mp) ; téléphone inchangé.
  20261017l (dessin d'Antoine : « heure · équipe · score · équipe, un truc aligné » + « logo du championnat pour combler le vide, bien visible ») : PC = en-tête
  .g45tro-mh2 (50 %, heure + fini / à venir / en cours, équipe qui reçoit collée au score à droite, score 70 px centré, visiteur à gauche ; .g45tro-mh caché) ;
  logo du championnat .g45tro-wm (lgUrl(sl)) opaque dans la zone des paris (left 58 %, 72 px max). Téléphone inchangé.
  20261017m (« on a pas de stats ? », maquette validée « oui ») : sous la courbe de `_g45TrOffHtml`, bloc « 📊 Statistiques · <mois> » (mois + filtres,
  calcJ) : Par championnat, Par type de pari (k → nom, « buts » / « pts » si ligne ≥ 10), Annoncé contre réel (tranches de x.p, trait blanc = proba moyenne
  annoncée), Stats et bookmakers (x.d) ; .g45tro-st 2 colonnes ≥ 700 px, nom sur sa ligne < 600 px. Smoke (trOff).
  20261017n (« dans les tendances on a des stats, aucune dans l'historique », maquette validée « oui ») : chaque pari de la liste du jour = pastilles
  📊 x.p % (bleu) / 🏦 x.f % (jaune, « — » sans) ; robot : x.fa = faits de la carte (m.faits, 4 max, sans balises) + x.nm = m.n, gardés à partir du
  passage du 18/10 ; ligne avec fa = « ▾ pourquoi » → `g45TrOffDet(id|k)` (O.det) déplie la liste (+ « Échantillon réduit » si nm < 14). Logo de
  championnat .g45tro-wm left 46 %, z-index 0 ; téléphone : nom du pari sur sa ligne (.g45tro-pn), pastilles / cote / résultat dessous.
  20261018k (capture filtres Cote 1,50-2,19 + Proba 60 %+ + D'accord : « la demande de 10 h doit être celle-là ») : robot tendances.mjs REGLAGES
  {min 1.5, pmin 0.6, coteConnue, accord} → sans cote et désaccord NON notés à partir du passage du 18/10 ; historique d'avant inchangé (mention sous le titre).
  20/10 (capture Bears–Patriots : « - de 48,5 / 49,5 / 50,5 », « doublon voir triple dose ») : la ligne ESPN bougeait d'un jour à l'autre → même pari
  re-noté chaque matin. Robot : FAMILLE = type sans le chiffre (un48.5 → un, hc1:7.5 → hc1:) ; famille déjà notée un jour précédent pour ce match = pas
  reprise ; doublons existants retirés (1er noté gardé : Jaguars–Texans un41.5, Bears–Patriots un49.5 / un50.5 enlevés à la main le 20/10). app.js inchangé.
  17/10 (« au pire on met 8h ? » : passage du 17/10 lancé par GitHub à 13 h 51) : robot dès 8 h à Paris (parisH() < 8), crons 6 / 7 / 8 / 9 h UTC (rattrapage des retards).
  20261020i (captures matchup-tennis.fr « on a pas moyen de faire pareil ou mieux », maquette validée « oui Tendances, ATP + WTA et pourquoi pas
  le rajouter ici » [fenêtre d'un match Résultats → Tennis] ; « la place tennis est plutôt là » = à côté de Football / Hockey / NBA / NFL) :
  🎾 ANALYSE TENNIS — bloc en fin d'app.js. SONDES d'Antoine : Sackmann tennis_atp 2024-2026 = 404 (source morte) ; ESPN core
  leagues/<atp|wta>/athletes/<id>/eventlog?limit=200 = saison en cours (1 page), seasons/<AAAA>/athletes/<id>/eventlog = saison passée
  (« ?season= » IGNORÉ) ; competition.$ref = competitors {id, name, winner} + notes {type « Round 1 - Court 7 », text « X bt Y 2-6 6-2 7-5 »} ;
  event = name + venue.indoor, PAS de surface (table nom → surface _g45TnSurf, gazon puis terre avant « salle ») ; statistics = titres / gains
  seulement (pas de stats de service, pas de style). Elo et cote de la maquette RETIRÉS (historique de tous les adversaires / crédits Odds API).
  _g45TnSaison (IndexedDB kv : tn1_<lg>_<id>_<an> passé = toujours, en cours 6 h ; tnev1_ tournois), _g45TnMatch (qualifs, doubles, w/o
  exclus), _g45TnCalc (pur : 10 derniers, surface 12 mois, tournoi = n° d'événement ESPN avant « - », GC / 1000, salle / plein air, H2H,
  bilan année × surface), g45TnAnalyser(boîte, {lg, a, b, tour, ek}) : onglets Facteurs clés / Bilan (➕ 2 saisons de plus) / Face-à-face / Forme,
  2 saisons par défaut, dédoublonnage par n° de match. Tendances perso : bouton #g45tr-ong-tennis (drapeau localStorage g45tr_tennis, PAS
  _G45_TR.sp) → matchs du jour (scoreboard ATP + WTA, simples à venir / en cours) ; fenêtre de match : enveloppe _g45EspnTennisDetail
  (simples) → bouton « 📊 Analyse BET45 ». Smoke (tennis, 63) + 26 essais vm.
  20261020j (« ça dit pas qui BET45 voit gagner ? ») : _g45TnAvis(A, B, rangA, rangB) — moyenne pondérée des parts : rang ESPN curatedRank
  (1/√rang) 0,30 · surface 12 mois 0,25 · forme 0,20 · H2H 0,10 lissé · catégorie / tournoi / salle 0,05 ; % comptés si ≥ 3 matchs des deux côtés ;
  confiance ≥ 15 pts forte, ≥ 7 moyenne, sinon « match serré ». Encadré « 🔮 BET45 voit gagner » au-dessus des onglets. 5 essais vm.
  20261020k (~20 captures de matchup-tennis.fr, 2e maquette « OK maquette ») : VERSION COMPLÈTE. SONDES d'Antoine : competition = PAS de durée,
  PAS de stats (competitor sans statistics), odds ESPN tennis VIDES (count 0, Dzumhur – Prizmic) ; athletes/<id> = age, hand Right/Left, debutYear
  (pas le revers). BUG 20261020i corrigé : « salle » lu sur e.venue (n'existe pas) → venue du MATCH (competition.venue.indoor) ou
  competitions[0].venue de l'event. Clés passées en tn2_ / tnev2_ (pays ajouté). Ajouts : profil (âge, N°, main), « En clair » (_g45TnClair :
  3 plus gros écarts), catégories ATP 250 / 500 / 1000 / GC / WTA (_g45TnCat(nom, lg), tables de noms), pays + continent (_g45TnPays,
  « Ville, Pays » d'ESPN, état US « CA » = USA), facteur pays (0,05 dans l'avis), repos, matchs 7 j / 30 j, Forme « voir 5 de plus » + historique
  sur la surface, Bilan résumé de l'année + « Toute la carrière » (depuis debutYear, 15 saisons max), Tournée (pays / continent / tournoi),
  Stats annexes _g45TnAnnexes (pur : 1er set, sets secs, après 1er set gagné / perdu, jeux, +X,5 jeux / set et / match, handicap, tie-breaks,
  3 sets hors GC, set décisif ; abandons exclus ; filtre surface / 52 semaines / tout). NON FAISABLE : style, Elo, vitesse du court, stats de
  service, minutes, météo, favori / outsider. 50 essais vm, smoke 63.
  20/10 soir — COTES TENNIS : ESPN core competitions/<id>/odds = 0 sur TOUS les matchs à venir ATP + WTA du jour (Bruxelles 250, Bâle / Vienne 500 ;
  commande console d'Antoine). Sources gratuites autorisées : The Odds API seulement (gros tournois) ; tennis-data.co.uk = cotes PASSÉES et site
  jumeau de football-data.co.uk (interdit) ; scraping refusé (§ 6). Proposé : robot officiel « combiné » (confiance forte + proba ≥ 60 %, « sans cote »,
  + cote The Odds API sur les gros tournois). À re-sonder pendant le Masters de Paris.
  20261020l (« OUI on est d'accord » = combiné ; leur site s'appuie sur la cote Pinnacle « marché + style » : notre avis, lui, est INDÉPENDANT
  des cotes) : 🤖 TENNIS OFFICIEL. app.js _g45TnRobot(R, max 24, 15 min) : simples ATP / WTA du jour à venir → avis (2 saisons) → noté si
  confiance FORTE et proba ≥ 60 % ; cote The Odds API en Grand Chelem seulement (codes de g45TennisOdds ; moyenne des books, proba sans marge
  Pinnacle sinon moyenne) → si cote : ≥ 1,50 et d'accord (proba ≥ 50 %) sinon pas noté ; sans cote = c null (filtre « Sans cote »). k '1' / '2' =
  joueur home / away d'ESPN, tn: 1, fa = phrase « En clair ». _g45TnPlat(scoreboard tennis) : tournoi → un event par match, score = sets gagnés
  (historique + Sélection : direct et « gagnant si ça reste »). Historique : spDe atp / wta → 'tn' (Sport « 🎾 Tennis »), LGN ATP / WTA, spIco 🎾.
  Robot tendances.mjs : appel après les 4 sports ; jugement tennis = competitor.winner d'ESPN (abandon compris), s = sets. Smoke tnRobot (64).
  Piwi (« scrapping sur piwi risqué ? ») : NON — CGU + compte joueur d'Antoine fermé en cas de robot (§ 6).
  20261020m — 🎾 COTES TheRundown (proposé par Antoine ; compte GRATUIT créé par lui : 0 $, 20 000 points / jour, 200 000 / mois, BetMGM +
  FanDuel + DraftKings, avant-match, 5 min de retard, 1 req / s ; les bookmakers ne se CHOISISSENT PAS en gratuit). SONDÉ par Antoine (console sur
  therundown.io) : 36 sports (2 NFL, 3 MLB, 4 NBA, 6 NHL, 7 UFC, 10 MLS, 11 EPL, 12 FRA1, 13 GER1, 14 ESP1, 15 ITA1, 16 UEFACHAMP, 33 Europa,
  38 ATP, 39 WTA, 41 F1…) ; /api/v2/sports/{id}/events/{AAAA-MM-JJ}?market_ids=1, en-tête X-TheRundown-Key → teams[{name, is_home}],
  markets[market_id 1 moneyline].participants[].lines[0].prices{livre: {price AMÉRICAIN}} ; 26 matchs ATP / 27 WTA le 20/10 (petits tournois
  compris). WORKER (déployé par Claude, copie gardée, 18 liaisons + cron */5 vérifiés) : route /rundown?sport=&date= (secret RUNDOWN_KEY mis
  par Antoine) → { m: [{ id, t, st, h, a, ch, ca, n }] } cote européenne MOYENNE par joueur, gardée 12 h (« ça consomme de ouf » : sondes = 4 934 points pour 4 demandes, ~1 200 / demande ; plafond 200 000 / MOIS ≈ 6 600 / jour ;
  le robot seul = 2 demandes / jour) (clé D1 rd1:sport:date).
  App : _g45TnCoteRd(lg, t, nomA, nomB) (rapprochement par nom de famille sans accents) ; _g45TnRobot prend TheRundown d'abord, The Odds API
  (Grands Chelems) en secours ; c = cote × 0,94 (_G45_TR_FR, comme les autres sports), cd = cote d'origine, f = proba sans marge → filtres
  cote ≥ 1,50 et d'accord. Smoke tnRobot (cote trouvée / trop basse). À FAIRE : cote + écart BET45 / marché dans l'analyse (maquette) ;
  autres sports via TheRundown après avoir vu la consommation réelle.
  20261020n (« 250 ET MOINDRE ON LAISSE TOMBER ») : _g45TnGrand(cat) = pas a250 / w2 (WTA 250) / eq (Coupe Davis…) ; WTA séparé en w5 (liste de
  noms de WTA 500 : Brisbane, Adélaïde, Abu Dhabi, Linz, Charleston, Stuttgart, Strasbourg, Berlin, Queen's, Bad Homburg, Eastbourne, Washington,
  Séoul, Tokyo Pan Pacific, Ningbo, Mérida, San Diego, Monterrey, Guadalajara, Zhengzhou — calendrier habituel, à corriger si besoin) et w2.
  Robot _g45TnRobot et liste « 🎾 Tennis » de Tendances perso : 500, 1000, GC, Finals seulement (petits comptés, note « non affichés ») ;
  analyse dans Résultats → Tennis : tous les matchs. Clé de saison tn2_ → tn3_ (catégorie WTA). 11 essais vm.
  Foot sur TheRundown (« vu ce que coûte le tennis ») : PAS MAINTENANT — estimé 5 000 à 8 000 points / jour avec le tennis vs 6 600 / jour pour
  tenir 200 000 / mois ; décider après une semaine de consommation réelle du robot tennis.
  20261020o (maquette « Analyser les matchs » + « Robot limité à ATP 500 ; tennis analyser à partir de BET45 on peut descendre à 250 mais on
  garde la limite de 8 pour tout le monde sauf pour moi sur gones » + « ok ») : 🎾 ANALYSER LES MATCHS dans Tendances perso → Tennis.
  _g45TnListe(jour) : simples ATP + WTA du jour / du lendemain, 250 COMPRIS (seuls Coupe Davis / United Cup… écartés) ; g45TnLancer : tri
  par importance (GC, Finals, 1000, 500, 250 — RANG) puis heure, 8 matchs au plus sur BET45 (sans limite si _g45SanteActive = gones), avis
  BET45 (2 saisons, stats ESPN SEULES : TheRundown jamais appelé, réservé au robot) ; résultats filtrés à l'affichage (Proba mini 50 / 60 / 70,
  Confiance toutes / moyenne et forte / forte ; localStorage g45tn_jour / g45tn_pmin / g45tn_conf), classés par proba, « En clair » + « 📊 Analyse
  détaillée » ; gardés pour la journée (IndexedDB kv tnrun1). Liste « Tous les matchs du jour » dessous (250 compris). Robot : inchangé (500 et +).
  20261020r (« tennisabstract.com peut pas nous aider malgré leur bordel ? » ; captures de la méthode matchup-tennis : Elo par surface) : ELO.
  SONDÉ PAR ANTOINE (console sur tennisabstract.com/reports/atp_elo_ratings.html) : plus grand tableau 560 lignes, colonnes « Elo Rank | Player | Age |
  Elo | | hElo Rank | hElo | cElo Rank | cElo | gElo Rank | gElo | | Peak Elo | Peak Month | | ATP Rank | Log diff » (Sinner 2296.9 / 2234.3 / 2186.8 /
  2100.5). Robot : .github/scripts/elo.mjs (étape « Elo tennis » de tendances.yml, avant l'analyse, continue-on-error) — curl ATP + WTA (wta_elo_ratings
  .html, forme supposée identique), colonnes repérées par l'EN-TÊTE, au plus tous les 6 jours → données/elo_tennis.json { maj, atp / wta : { nom normalisé :
  [nom, elo, dur, terre, gazon] } } ; < 50 joueurs lus = ancien gardé. App : _g45TnEloCharger (raw, une fois par session), _g45TnEloDe(lg, nom, sf)
  (dur et salle = hElo, terre = cElo, gazon = gElo, repli Elo général) ; avis : Elo 0,35 (proba Elo 1/(1+10^((B−A)/400))), classement 0,10 au lieu
  de 0,30 quand l'Elo existe ; « En clair » : « meilleur Elo dur (2234 contre 2047) » ; Facteurs clés : section NIVEAU « 🎯 ELO DUR (Tennis Abstract) ».
  20261021n (Bruno, groupe « Bets 4 us », maquette maquette-tennis-bruno + « oui code tout, on analysera si pas d'accord ») : _g45TnCalc → sf2
  (surface sur 61 jours, PAS de repli 12 mois : < 3 matchs = facteur non compté + phrase jaune) et prec (dernier tournoi avant celui du match,
  m.ek ≠ ctx.ek ; tour = m.rd « Final » / « Semifinal » / « Quarterfinal » SONDÉS par Antoine le 21/10 : core notes[0].type = « Round 1 -
  Centre Court », scoreboard round.displayName = Qualifying 1st Round / Qualifying Final / Round 1 / Round 2 / Quarterfinal / Semifinal / Final) ; contrecoup = ≤ 10 j ET (titre, ou finale / 1/2 en gc / m1000 / fin) ; premier = aucun autre titre dans les saisons lues. Avis :
  surface 0,25 sur sf2, contrecoup 0,10 (0,35 / 0,65 contre celui qui le subit). En clair : « ⚠️ son adversaire sort d'un titre (…, il y a
  N j) » en jaune. Facteurs clés : ligne « (2 MOIS) », bloc 🏁 TOURNOI PRÉCÉDENT, Elo en salle « DUR (pas d'Elo salle) » (dur et salle déjà
  séparés partout ailleurs). 8 + 2 essais vm, smoke 74.
  20261021o (Bruno : « coefficienter les paramètres, la forme deux fois plus que la surface », « chaque surface un réglage différent » ;
  maquette maquette-coefs + onglets surface, « OK ET OUI ») : _g45TnAvis(A, B, rkA, rkB, W) — W = { elo, rang, surf, forme, prec, h2h, fat,
  aut } 0-10 (poids = /20 ; aut = cat / tour / lieu / pays chacun) ; sans W = standard INCHANGÉ (robot, sélection, Compétitions 🔮) ;
  _G45_TN_STD = { 7, 2, 5, 4, 2, 2, 0, 1 } ; fat (fatigue, matchs 7 j, le plus frais favorisé) seulement en perso. Analyse (dessiner) :
  bouton « ⚖️ Mes coefficients » → panneau (BET45 standard / Les miens, onglets Dur / Salle / Terre / Gazon, curseurs + part en %, ↺ standard),
  localStorage g45tn_coefs { on, dur, salle, terre, gazon } ; réglage de la surface du match appliqué, ligne jaune « avec tes coefficients ·
  BET45 standard : X % ». À FAIRE (session à part) : 🧪 test sur la saison passée (rejouer l'avis, % de bons vainqueurs ; Elo actuel = biais).
  5 essais vm, smoke 75 (tnCoef).
  20261022a (capture d'Antoine à 0 h 01 : Sélection du jour vide « arrive vers 8 h » alors que les NBA de la nuit, choisies la veille, n'étaient
  pas jouées) : _g45TrSelHtml / liste() — sans note du jour et avant 15 h → notes de LA VEILLE (S.hier), en-tête jaune « Choisie hier à HH:MM
  (en attendant celle de 8 h) ». Smoke 76 (selHier, vérifié aussi en TZ Asia/Tokyo pour la branche < 15 h).
  20261023s (capture d'Antoine à 0 h 40 : Falcons – 49ers dans la sélection du jeudi, « la NFL c'est dimanche… ») : le robot note un match dès
  qu'il le voit (NFL plusieurs jours avant) et la sélection prenait tout ce qui était NOTÉ ce jour-là. liste() / duJour(D) : sélection du jour D =
  matchs JOUÉS de D 8 h à D+1 8 h, notés ce jour-là ou avant (notés D : tout ce qui se joue avant D+1 8 h) → un match noté tôt apparaît le jour
  où il se joue. Repli « veille » : quand RIEN n'est noté aujourd'hui (et non plus « liste vide »). 5 essais vm ; smoke selHier recalé (match de
  la nuit à 3 h au lieu de « dans 1 h »), 92 OK.
  20261021p : robot .github/workflows/backtest-tennis.yml + scripts/backtest_tennis.mjs (test de l'avis tennis sur 2025, lancé à la main,
  écrit données/backtest_tennis.json) — 1er passage lancé le 21/10 à 23 h 36.
  RÉSULTATS (passage du 21/10, 7 min, 180 joueurs, 1 577 matchs 2025, appris janv-juin / vérifié juil-déc) : standard 65 % de bons
  vainqueurs (dur 63,7, terre 67,5, gazon 71,5) ; réglages « optimisés » SANS gain à la vérification (dur 62 contre 63,3) → standard gardé.
  Seuls : Elo 67 % (Elo actuel = biais), niveau/tournoi/salle/pays 63, forme 60,5, face-à-face 60, surface 2 mois 60, classement 56, fatigue
  51 (aucun effet), contrecoup 33 % (= le joueur qui sort d'un titre / d'une finale GAGNE 67 % du match suivant, 122 cas). Sans Elo ni
  classement : 60,5 %. SALLE : 0 match reconnu (ESPN ne donne pas venue.indoor) → bug.
  20261022b (« oui ») : contrecoup retiré de l'avis standard (_G45_TN_STD.prec 0, ww('prec', 0), plus dans « En clair », note du bloc 🏁
  « pour info : 67 % ») ; tournois en salle reconnus par le nom (RE_SALLE en fin d'app.js : Paris, Bâle, Vienne, Stockholm, Anvers, Metz,
  Finals, Next Gen, Rotterdam, Marseille, Montpellier, Dallas, Sofia, Linz, Ostrava, WTA Finals, Cluj, Lyon WTA « Open 6e Sens », Almaty…),
  enveloppes _g45TnSurf / _g45TnSaison (mémoire tn4_ corrigée à la lecture) / _g45TnCalc (ctx.ind). Robot tendances.mjs (« NBA mets juste pas les pts ») : du 1/10 au
  14/11, NBA gardée dans la sélection officielle SANS les marchés « + / - de X points » (nuit du 21/10 : 1 gagné sur 5, saison reprise 2 jours avant).
  + (« un rajout de 3 % : 239,5 + 3 % = 246,68, ça passe sur beaucoup plus de matchs », choix A) : g45TrRun NBA, GONES45 seulement
  (_g45SanteActive) : marché en plus « - de X points », X = ligne ESPN × 1,03 arrondie au ,5 inférieur (≥ ligne + 1), sans cote (ESPN = ligne
  principale seulement) → filtres habituels (cote mini jugée sur 1 / proba) ; le robot ne le note pas (cote inconnue + NBA sans points).
  20261022c (« octobre ne sera pas gardé en visuel sur bet45… mettre période test, mais pas dans le bilan annuel » ; « moi, Bruno, JP, Cédric
  doivent voir le test » → choix 2) : _G45_TR_TEST [1/10/2026 ; 1/11/2026[, _g45TrEnTest(t), _g45TrTestVoit() (gones45 ou window._g45Soutien) ;
  Historique officiel : notes d'octobre retirées de `tous` pour les non-testeurs ; bandeau gris « 🧪 Période de test » sur le mois ;
  _g45TrOffCalc enveloppé (fin d'app.js) : octobre écarté de TOUS les totaux sauf le mois de test lui-même affiché (window._g45TrTestOk posé
  par calcJ) → pas de « Bilan d'octobre » du 1er au 7/11. Sélection du jour inchangée. Cédric : statut soutien à cocher par Antoine. Smoke 78.
  20261022d (« 6 décembre 2027 je veux voir 1er janvier 2027 » → maquette maquette-bilans-mois « oui ») : Historique officiel, bouton
  « 📅 Bilans par mois » replié (O.bilOuv), années (O.bilAn, g45TrOffBilAn), total de l'année (réussite, gain à 1 €, ROI, meilleur mois ≥ 10
  jugées), une ligne par mois (réussite + barre, gain, paris, « en cours »), toucher = g45TrOffAller(mois) ; filtres appliqués (L) ; octobre
  2026 = ligne grise « Période de test » pour les testeurs, jamais comptée. Smoke 79 (bilMois). Smoke 77 (salle).
  20261022e/f (recueil de JP, 15 critères) : sondes robot — fichiers Jeff Sackmann tennis_atp / tennis_wta = 404 (retirés) ; Match Charting
  Project encore en ligne (H ~580 matchs 2025, dernier mai 2026 ; F ~565, dernier sept. 2026) → pas de « style » automatique ; liste de
  styles à remplir à la main par JP (fichier styles_*_a_remplir.xlsx, top 100 Elo ATP / WTA ; ATP rempli par Antoine le 22/10). Test 2025 des
  critères de JP (backtest_tennis.mjs, ex) : joueur local 52 % (251) NON ; le plus jeune (≥ 3 ans) 55 % (964), +1 point ; < 23 ans contre
  > 30 ans 50 % (70) ; meilleur bilan au même tour 60 % (1 273), +0,7 ; finale 58 % (41 cas, trop peu). Salle reconnue : 156 matchs, 70 %.
  20261022g (« oui ») : _g45TnAvis + âge (A.age / B.age, ≥ 3 ans, 0,15) + bilan au tour du match (A.tourBil, ≥ 3 de chaque côté, 0,10) ;
  _G45_TN_STD age 3 / tour 2, curseurs dans ⚖️ ; _g45TnCalc (enveloppe fin d'app.js) : R.rdCour = ctx.rd (bouton data-rd = scoreboard
  c.round.displayName ; robot m.c.round) sinon tour d'après le dernier joué dans ce tournoi (m.ek = ctx.ek), R.tourBil ; âge = _g45TnProfil
  (analyse, avis Compétitions, robot). Facteurs clés : « 🧱 BILAN EN QUARTS… » et « 🎂 Âge ». Smoke 80 (tnTour) + 4 essais vm.
  20261022h : styles de jeu tennis remplis à la main (Antoine + JP, 9 corrections confirmées par Gemini) → données/styles_tennis.json
  { atp / wta : { nomEnLettres : [nom, style] } } ; backtest_tennis.mjs : duels de styles (réel / prévu par l'avis / écart).
  RÉSULTATS (719 matchs à 2 styles) : Polyvalent > prévu contre tous (contre contreur 77 % / 59 % prévu, 47 matchs ; contre attaquant 60 / 52,
  119 ; contre gros serveur 62 / 54, 32) ; attaquant contre contreur sur dur 60,5 / 51,6 (76). Ajout à l'avis (20261022j) : poly +0,7 à +1
  point à la vérif ; attaquant / contreur sur dur +0,1 (non retenu). ⚠ biais possible : grands joueurs souvent classés « Polyvalent ».
  20261022k (« oui ») : _g45TnStyleCharger / _g45TnStyleDe (raw données/styles_tennis.json, une fois par session), poserElo pose aussi
  CA.style / CB.style (3 appelants) ; _g45TnAvis : bonus Polyvalent 0,15 (sty 3 dans _G45_TN_STD, curseur ⚖️) ; Facteurs clés : ligne
  « 🎨 Style » (vert = polyvalent face à un autre style). Smoke 82 (tnStyle) + 3 essais vm.
  20261022l (« 88 % en faire une estimation de cote ») : « cote BET45 » = 100 / pc à côté du % (encadré 🔮 de l'analyse et résultats
  « Analyser les matchs »). Comparaison d'Antoine : Medvedev 88 % (bookmaker 1,05 ≈ 95 %), Fritz 77 % (1,16 ≈ 86 %) → l'avis TASSE les gros
  favoris (moyenne de facteurs) ; backtest_tennis.mjs : CALIBRAGE (avis X % → réel %, tranches de 5 %).
  RÉSULTAT (22/10, 1 577 matchs) : 50-55 → 52 % ; 55-60 → 67 ; 60-65 → 71 ; 65-70 → 78 ; 70-75 → 82 ; 75-80 → 91 (32) ; 80+ → 100 (6).
  20261022s (« oui ») : window._g45TnReel(pc) = % réel estimé (table réduite d'un tiers pour le biais Elo, plafond 97) → « ≈ X % réel · cote
  BET45 » (= 100 / réel) dans l'analyse et les résultats ; le filtre « Cote BET45 » utilise ce % corrigé (proba mini et confiance restent sur l'avis).
  20261022v (« ça se touche un peu trop », « oui ») : ligne 🔮 des résultats = blocs flex séparés (gap 16 px, retour à la ligne entre blocs),
  « cote BET45 » en pastille jaune texte noir ; idem dans l’encadré de l’analyse (marge 12 px).
  20261022w (« 0,30 en cote de diff c'est énorme » ; Nakashima book 1,43 / BET45 1,72 → maquette « BET45 face au book » → « oui ») :
  window._g45TnBk(pR, cG, cX) → { f proba book sans marge, mg marge, ec écart en points BET45 − book, vG / vX gain espéré % } ; ✅ d'accord si
  |ec| < 6, sinon ⚠️ « le book y croit plus / moins » ; 💎 value si cote × % réel BET45 ≥ 1,05 (sur l'un OU l'autre joueur).
  Résultats Tendances 🎾 : avisMatch lit _g45TnCoteRd (même réponse worker /rundown que le robot, 12 h → aucun point TheRundown en plus) → x.bk
  { ca, cb } ; ligne _g45TnBkLigne sous la ligne 🔮 (anciens résultats en mémoire sans bk : rien) ; filtre « 💎 Value seulement » (g45tn_val).
  Analyse détaillée : o.bk lu en tâche de fond (aujourd'hui puis demain, l'heure n'est pas connue), tableau « 🏦 BET45 face au book ».
  Smoke tnBk (85 contrôles).
  20261022x (capture téléphone Gojo – Altmaier : colonne « Écart » coupée) : tableau « BET45 face au book » = nom de famille seul, titres courts
  (BET45 / Book / Sans marge / Écart), % à la ligne, marges 3 px → tient en 300 px (vérifié Chromium 360 px).
  20261022y (Gojo – Altmaier : BET45 67 % / book 48 %, Altmaier gagne 6-3 6-4 ; « oui » au suivi) : _g45TnRobot pousse chaque désaccord
  ≥ 10 points (% réel BET45 contre book sans marge, toute confiance) dans window._g45TnDz → tendances.mjs le garde dans J.dz (un match une
  fois, pas affiché) et le juge avec les tendances (TJ = J.t + J.dz ; r = 1 si le choix BET45 a gagné). Bilan prévu vers le 22/11.
  Bruno (« le lieu ; un duel de deux compatriotes ») : backtest_tennis.mjs → res.lieuCompat : local / localFav / localOut / compat /
  compatLocal = réel CONTRE prévu par l'avis (le 52 % brut du local ne tenait pas compte du niveau). ex.cp (1 compatriotes, 2 chez eux).
  RÉSULTAT (2025, 1 577 matchs ; en moyenne le favori de l'avis gagne + 6,2 points de plus que prévu) : local 251 matchs réel 52,2 / prévu 51,8 ;
  local favori 147 → + 6,3 (= la moyenne) ; local outsider 104 → − 8,1 (≈ la moyenne) ⇒ jouer chez soi n'apporte RIEN. Compatriotes 70 →
  + 2,5 (≈ 4 points de surprises en plus que d'habitude, trop peu de matchs pour conclure) ; compatriotes chez eux 15 (trop peu). Rien changé dans l'avis.
- 🎾 20261025d (sonde d'Antoine : Río Ladies Open, Queretaro, Curitiba, Valle d'Aosta = « WTA 250 » ; « Grand Prix Auvergne-Rhône-Alpes » = « ATP 250 » ; Oliynykova – Hontama pas pariable en France ; choix B « grisés + bandeau, Pinnacle les propose peut-être ») : `_g45TnCat` — WTA 250 et ATP 250 = LISTES de noms ; tournoi inconnu = 'w1' (WTA 125 / ITF) ou 'ch' (Challenger). `_g45TnPetit`, `_G45_TN_PETIT_TXT` ; liste du jour : bandeau sous l'en-tête du tournoi + cartes grisées ; résultats d'analyse : bandeau + carte grisée. Robot (`_g45TnGrand`) : w1 / ch exclus comme les 250. Test node 15/15 sur la sonde, smoke 100.
- 🚴 20261022z — PROFIL D'ÉTAPE (capture É21 Paris « ça on pourrait l'améliorer ? », maquette maquette-profil-etape « oui ») : _g45RcProfileHTML
  appelle _g45RcSVG2 (l'ancien _g45RcSVG reste, plus appelé) : échelle ≥ 600 m (base 0 m sous 600 m ; pas 100/200/250/500/1000), lignes
  d'altitude, km tous les 25 / 10 / 5 km, couleurs = pente moyenne sur 500 m (_g45RcPente, _g45RcAltAt interpolé), doigt / souris → km,
  altitude, pente (g45RcProfDoigt, window._g45RcPr[id], touch-action pan-y) ; pastilles _g45RcProfStatsHtml (type d'étape : plate si D+/km < 8
  et point haut < 600 ; vallonnée < 15 et < 1000 ; haute montagne si point haut ≥ 1500 et D+ ≥ 2500 ; sinon moyenne montagne), D+ (pas 200 m),
  point haut. Légende 10 px (page déjà agrandie). Smoke rcProf (86).
  20261023a (capture PC : profil géant, « pas tout compris pourquoi la barre jaune se déplace ») : SVG max-width 760 px centré ; texte « km ·
  altitude · pente » écrit à côté du curseur (#id-v) ; ligne d'aide « Barre jaune = curseur : glisse le doigt (ou la souris)… ».
- 🎾 20261023b (« rajoute le drapeau du pays du lieu du tournoi ») : résultats Tendances tennis, étiquette tournoi + « · 🇫🇷 France »
  (avisMatch renvoie pf / py de _g45TnPays ; anciens résultats en mémoire : rien jusqu'au prochain ▶ Analyser).
- 🎾 20261023c (« tu es sûr que le réglage tennis est bon ? je trouve tellement énormes les écarts » → « oui ») : correction « % réel » EN PAUSE
  (window._G45_TN_REEL_PAUSE = true : _g45TnReel(pc) renvoie l'avis brut, texte « ≈ X % réel » masqué ; _g45TnReel(pc, true) = corrigé). Raisons :
  backtest 2025 mesuré avec l'Elo d'AUJOURD'HUI (fuite du futur), échantillon = joueurs connus, books très justes en tennis. Robot : J.dz reçoit
  TOUS les matchs avec cote TheRundown (p brut, pr corrigé, f book sans marge, ec écart) → bilan (Brier / % de réussite) vers le 10/11. Smoke tnReel (87).
  20261023d (« mets confiance … % · cote estimée, ça choquerait moins » → « oui et mets en ligne ») : carte = « 🔮 X · confiance 55 % (faible) » +
  pastille « cote estimée 1,82 » ; analyse « cote estimée », tableau colonne « Estimée » ; confiance faible → pas de 💎 value (carte, tableau, filtre).
  20261023e (capture d'un autre site « Bilan par surface & période » → « oui ») : onglet 🌍 Tournée, bloc « 📅 Bilan par surface et période »
  au-dessus du bilan par pays (_g45TnPer(sf, t, ct) : terre Europe / Amérique du Sud / autres, gazon, dur janvier-février, printemps américain
  (mars-avril), été américain (juillet → 14 sept.), automne (salle & Asie), autres ; _g45TnPerBilan, _g45TnPerHtml ; ligne du match ◀ ICI).
  Pas dans l'avis : backtest_tennis.mjs ex.qA / qB → X.per (≥ 5 matchs de chaque côté dans la tournée). Vitesse des courts : fichier
  vitesse_tournois_a_corriger.xlsx (64 ATP / 44 WTA, ⚡ / ⚖️ / 🐢 proposés de mémoire) envoyé à Antoine pour correction. Smoke tnPer (88).
  20261023f (lien d'Antoine tennisabstract.com/reports/atp_surface_speed.html ; SONDÉ en console : tableau 6, 63 lignes « Date ; Tournament ;
  Surface ; Ace% ; Surface Speed », ex. Montpellier 1.49, Almaty 1.05 ; select d'années 1991 → 2023) : le fichier Excel à corriger devient
  INUTILE. elo.mjs lireVitesse → données/vitesse_tennis.json { atp / wta : { nomNorm: [nom, vitesse, surface, date] } } (6 jours, le plus récent
  par tournoi ; tendances.yml l'enregistre). App : _g45TnVitCharger / _g45TnVitDe(lg, nom, adr) (ville, sinon nom contenant le nom TA sans
  « masters », alias french open → roland garros) / _g45TnVitCl (⚡ ≥ 1,15, 🐢 ≤ 0,90) / _g45TnVitHtml : onglet Tournée, « ⚡ Vitesse du court »
  + bilan de chaque joueur sur courts rapides / moyens / lents (A.tous, m.tr). S.o garde bid et tn. Pas dans l'avis (test 2025 à faire).
  Smoke tnVit (89).
  ROBOT 22/10 soir : vitesse ATP = 62 tournois lus ; WTA = 0 (wta_surface_speed.html n'existe pas, à trouver par Antoine).
  Test « tournées » 2025 : seul 60,8 % (1 080) ; ajouté au standard 64,9 → 65,4 % au mieux (poids 2) = presque du bruit → AFFICHAGE SEULEMENT.
  20261023g (capture atp_elo_ratings : « c'est quoi la différence de logarithme ? » → « oui ») : elo.mjs garde r[5] rang Elo, r[6] rang ATP / WTA,
  r[7] Log diff (= ln rang Elo − ln rang ATP ; Djokovic 4e Elo / 12e ATP = −1,10 ; Cobolli 27e / 6e = +1,50). App _g45TnEloRang / _g45TnEloRangHtml :
  Facteurs clés, sous la barre Elo, si |écart| ≥ 0,5 : « 📈 X : meilleur que son classement ATP » ou « 📉 classement ATP flatteur ». Smoke tnRang (90).
  Test cotes 2025 : backtest_tennis.mjs écrit données/backtest_tennis_matchs.json (avis BET45 par match, sans cote) ; fichiers tennis-data 2025
  téléchargés À LA MAIN par Antoine (usage particulier), croisés dans la session (scratchpad), JAMAIS dans le dépôt.
  20261023h (capture mcp_leaders_tactics_men_last52, « ok ») : elo.mjs lireTactique → données/tactique_tennis.json (RallyAgg, ReturnAgg, SnV,
  filet ; ATP men / WTA women, 52 semaines, 6 jours) pour CONTRÔLER styles_tennis.json (liste des différences envoyée à Antoine), pas dans l'avis.
  20261023i (stats de service ; « moi peu, Bruno et JP adorent » les jeux / tie-breaks) : SONDÉ par Antoine — leaders.cgi = page vide, les
  données viennent de jsmatches/leadersource.js (2,6 Mo, var matchmx = matchs du point de vue d'un joueur, format Sackmann : 26 minutes,
  27-35 stats du joueur, 36-44 de l'adversaire ; contrôle Zverev – Medvedev OA 2024 cohérent). elo.mjs lireService → données/service_tennis.json
  (52 semaines, par joueur et surface : tg jeux de service gagnés, br jeux de retour gagnés, ac / df %, sp / rp pts gagnés, tb tie-breaks par
  match, jx jeux par set). WTA : nom de fichier supposé, essayé (leadersource_wta.js…). Affichage : maquette à faire (Stats annexes).
  Fichiers SONDÉS par Antoine : ATP leadersource.js (top 50), leadersource51.js, leadersource_chall.js ; WTA leadersource_wta.js, leadersource51_wta.js.
  CROISEMENT COTES 2025 (fichiers tennis-data téléchargés à la main par Antoine, session seulement) : 1 123 matchs ; réussite BET45 66,3 % / favori
  book 67,9 % ; Brier BET45 0,216 / book 0,200 / mélange 0,203 ; jouer le choix BET45 = −2,2 % (1,01-1,40 −2,8 ; 1,40-1,80 −5,2 ; 1,80-2,50 +2,9 ;
  2,50+ +5,1 sur 55) ; value ≥ 2,50 = −13 % (BET45 surestime les outsiders) ; value 1,50-2,50 = +5 % (238 à 328 paris, pas prouvé). Test encore
  flatteur (Elo d'aujourd'hui). ⇒ en tennis BET45 NE BAT PAS le book.
  20261023h (« oui et oui et de 1,5 à + ? ») : 💎 value seulement si cote du book entre 1,50 et 2,50 (_g45TnValCote), libellé « à confirmer »
  (ligne, tableau, filtre). Bloc « 🎾 Service / retour » en haut de 📐 Stats annexes (_g45TnSvCharger / _g45TnSvDe / _g45TnSvSim / _g45TnSvHtml :
  tenue de A = tg(A) − (br(B) − moyenne 21 % ATP / 32 % WTA), set rejoué jeu par jeu, tie-break 50 % ± écart, 3 sets gagnants en GC ATP) →
  au moins 1 tie-break, jeux attendus, + de 20,5 / 22,5 jeux, set gagné par l'outsider. Smoke tnSv (91), tnBk recalé.
  20261023i (« value entre 1,5 et 2,5 en estimation du jour ? » → test « OUI ») : _g45TnRobot pousse les 💎 (≥ + 5 %, cote book 1,50-2,50, confiance
  pas faible, un côté ou l'autre) dans window._g45TnTv → tendances.mjs J.tv (à part, jugé avec TJ). App : _g45TnTvHtml en haut de l'Historique
  des Tendances, TESTEURS seulement (_g45TrTestVoit) : bilan à la cote FR estimée + 12 derniers ; jamais dans les totaux. Bilan le 10/11. Smoke tnTv (92).
  ROBOT 22/10 20 h : service ATP 165 joueurs (50 + 50 + 68 Challengers), WTA 100 ; tactiques 0 (https refusé depuis GitHub → http ajouté) ;
  Elo r[5..7] OK (Vacherot 26e Elo / 32e ATP). Bloc Service / retour vu par Antoine (Collignon – Lehecka) : « jeux attendus » ~ 2 de trop (calage proposé).
  20261023j (capture « Vacherot 27 ans · N°3 ») : curatedRank ESPN = TÊTE DE SÉRIE, pas le classement → poserElo pose A.rkTa = rang ATP / WTA de
  Tennis Abstract ; _g45TnAvis l'utilise pour le facteur « rang » ; profil « N°32 ATP » (sinon « tête de série 3 »).
  20261023k (Lehecka bat Collignon 6-4 6-2 alors que l'estimation disait 25,6 jeux / 53 % de tie-break) : robot calibrage_service.mjs +
  workflow calibrage-service.yml (à la main) → données/calibrage_service.json : ATP 2 290 matchs, avant 27,1 jeux prévus / 25,4 réels, tie-break
  47 / 39 % ; meilleur d 0,06 k 1,2 → 26,3 jeux, tie-break 38 / 39 % ; WTA 1 410 matchs, avant 23,7 / 22,3, TB 30 / 25 ; meilleur d 0,08 k 1,5 → 22,9,
  TB 25 / 25. Appliqué dans _g45TnSvHtml (+ off 0,9 ATP / 0,6 WTA retiré aux jeux dans _g45TnSvSim). Collignon – Lehecka : 23,8 jeux, TB 41 %.
  Cotes 2025 (session) : gros tournois favori 69 % à 1,41 de médiane, −4,6 % ; outsiders −9,5 % (5 et + : −21 %).
  Styles : RallyAgg (MCP) inutilisable (Sinner « patient ») ; aces → 7 joueurs à vérifier envoyés à Antoine (Michelsen, Samsonova, Boulter notés
  gros serveurs avec peu d'aces ; Auger-Aliassime, Korda, Nakashima, Coleman Wong > 13 % d'aces non notés).
- ⚽ 20261023l — COUPES D'EUROPE (« les stats foot qu'on sort c'est surtout en championnat, très peu en coupe d'Europe » ; octobre : C4 4/13,
  C3 8/17, championnats 11/16 ; « Barça – Viking on rigole sur les stats » ; « prendre le coeff du club, global et 2 dernières saisons » ;
  « trouver de combien est l'écart et en tirer une conclusion »). Robot coupes_europe.mjs (workflow coupes-europe.yml, à la main) :
  kassiesa.net trank2023-2027 (SONDÉ par Antoine : « # | | club | pays | 5 saisons | Total | Part » ; uefa.com interdit) + ESPN jour par jour
  (mardi-jeudi ; la plage ?dates=A-B → 400 ; réponses gzip → --compressed) → données/coupes_europe.json, 719 matchs avec les 2 coefficients.
  Écart 2 saisons : gros club gagne 45 / 48 / 66 / 72 / 67 % (< 1,5 / 1,5-2,5 / 2,5-4 / 4-7 / 7+ fois) ; buts ≈ 3,1 partout ; − 3,5 ≈ 62 %,
  + 2,5 ≈ 61 %, BTTS ≈ 56 % QUEL QUE SOIT L'ÉCART. tendances.mjs : match uefa.* → marché de buts (u35, o25, btts) officiel seulement si cote ×
  taux réel des coupes d'Europe ≥ 1,05 ; résultat (1, 2, 1N, 2N) et autres (o15…) → J.ce (🧪 test) ; x.pe = taux, x.ecu = écart (si clubs
  reconnus). App : _g45TrCeHtml, bloc testeurs dans l'Historique. Essai : Lyon (« Olympique Lyonnais ») et Bournemouth (jamais en coupe
  d'Europe) non reconnus, Bayern – Bruges 48 % dans sa tranche → tableau trop grossier pour le vainqueur. À FAIRE : + de 1,5 / − de 2,5 dans
  coupes_europe.mjs ; un vrai modèle de vainqueur (écart exact, Elo de club ?) avant de remettre les résultats en officiel.
  20261023n (« Barça – PSG ou Arsenal – Bayern il n'y a pas lieu d'enlever ; Bruges – Lens, Lille – Gala c'est quasi le même niveau ») :
  tendances.mjs ceAvis → paris sur le VAINQUEUR gardés aux règles habituelles si MÊME STANDING = écart de coefficient 5 saisons < 2,5 fois
  (coefficient = max(total, part du pays)) : Barça – PSG 1,2, Arsenal – Bayern 1,2, Lille – Galatasaray 1,3, Villa – Sporting 1,0 ; Bruges – Lens
  4,5 (Lens 12,5 → 16,7 par la part France : peu d'Europe) → test ; club absent (Viking, Bournemouth) → test. Robot seulement (app inchangée).
  20261023q (« gros club contre plus petit, est-ce que la stat du gros club passe ? » → tableau 515 matchs, « oui/oui ») : ceAvis, marchés de
  buts OFFICIELS seulement si le club au plus gros coefficient 5 saisons est reconnu, SA stat de championnat (fait « Club : … (NN%) », à domicile
  ou à l'extérieur selon son côté) ≥ 70 % et cote ≥ 1,55 (u35) · 1,65 (o25) · 1,80 (btts) ; sinon J.ce (x.sg = stat du gros club, affichée
  « (gros club : NN %) » dans le bloc 🧪). Correction : ceClub lit d'abord trank{saison+1} (= saison en cours : 2027 pour octobre 2026), puis
  les années d'avant (Palace, Bournemouth, Hoffenheim étaient « inconnus »). Rejeu des 22 matchs notés : 1 officiel (Hoffenheim – Lyon u35,
  Lyon 100 %, 1,57) ; 5 cas limites vm OK ; smoke 92. Reste mal lu : Lillestrøm (clé « lillestr m »), Brighton, Rennes, Trabzonspor (absents).
  20261023r (« y en a au moins ? » → oui, gros club ≥ 70 % dans ~1 match sur 2 ; c'est la cote qui bloque ; « 1,6, voir ce que ça donne ») :
  cote mini + de 2,5 buts 1,65 → 1,60. Rejeu des 22 : 2 officiels (+ Bournemouth – Milan o25, Milan 75 %, 1,61). À revoir au bilan J.ce.
- 🎫 20261023m (capture ticket Pinnacle McDavid « Total Assists », « rajoute ticket Pinnacle, il ne le lit pas ») : _g45TicketIa, consigne
  PINNACLE (carte bleu-gris, « ID: … » + date-heure du PARI, pastille verte « En cours », ligne « 2026-10-22 Propositions sur le joueur – NHL » =
  date du match + compétition, cote orange « @ 1.492 », « Mise / Risque / Gain EUR » où Gain = BÉNÉFICE NET) ; pinnacle ajouté à la liste des
  bookmakers sûrs ; garde-fou : Pinnacle et gains < mise → gains + mise. Texte de la zone de collage : « … Betsson, Pinnacle… ».
  20261023n (« il n'a pas su lire la mise et le site », sur téléphone) : le bandeau après lecture écrit ce que l'IA a lu (site / mise / cote) et
  pourquoi un champ manque (« absent de tes bookmakers → ajoute-le dans Bank » : n-book ne propose que state.b) ; consigne Pinnacle : mise = nombre
  après « Mise », bookmaker = Pinnacle si « ID: » + « Cotes décimales » + « Risque » ; secours : mise = risque, ou gains ÷ cote ; « pinnacle » dans
  la réponse → bookmaker Pinnacle.
  20261023o : 1er essai = IA en échec → secours Tesseract a pris « 1D:3142973174 2026-10-22 » pour l'équipe (Cockpit) ; au 2e essai l'IA a lu le
  ticket Pinnacle (« c'est passé, hors adversaire, normal le ticket ne le met pas »). Garde-fou : équipe / adversaire ressemblant à « ID: », un long
  numéro ou une date → vidés.
  20261023p (« on a le joueur, on connaît son équipe, on l'a dans l'Agenda : qu'il propose le match », ticket McDavid sans équipe) :
  window._g45TicketMatch(o, cockpit), appelé 400 ms après le remplissage. Équipe = o.equipe, sinon carte joueur du mur (state.u type 'joueur',
  nom de famille) → _g45UClub. Ligue : NHL / NBA / NFL / MLB selon le sport, foot = compétition du ticket (C1, C3, C4, L1, L2, PL, Liga, Serie A,
  Bundesliga, Eredivisie, Liga Portugal, MLS) + espnLeagueOf. Scoreboard ESPN du jour du ticket et du lendemain, tous les mots-racines du ticket
  (_g45TkRacines) dans le nom ESPN, match non terminé ; UN seul trouvé → confirm « 🔎 Match trouvé … Remplir l'adversaire, l'heure et le lieu ? »
  → simple : n-team (si vide), n-analysis, n-date, n-heure, n-comp, lieu ; cockpit : c-target, c-date, c-heure, c-comp, c-lieu. 4 essais vm, smoke 92.
  20261022m (tennis « Tous les matchs du jour » avec 70 % coché mais un 53 % affiché) : titre « (sans filtre) » ; dans l'analyse, ligne grise
  « ℹ️ Sous tes filtres de Tendances (53 % < 70 %) » quand l'avis est sous g45tn_pmin / g45tn_conf.
  20261022o (« nouveau à faire dans filtre : cote BET45 », « et on aura des matchs ») : filtre tennis « Cote BET45 » (g45tn_cote = « min-max »,
  Toutes / 1,50 et + / 1,05–1,50 / 1,50–2 / 2–2,5 / 2,5–3 / 3 et +) sur 1 / x.p dans resultatsHtml ; choisir une fourchette remet proba mini
  50 % et confiance Toutes (70 % = cote ≤ 1,43 ; forte = ≤ 1,54 ; moyenne = ≤ 1,75).
  20261022p (« faudrait séparer les 2 non ? », « OUI ») : _g45TnEcran — espace puis bandeau « 📋 Tous les matchs du jour (sans filtre) · N
  matchs » FERMÉ au départ (window._g45TnJourOuv, g45TnJourOuvrir), #g45tn-jour rempli quand même (caché), nombre posé par _g45TnJour.
  Données Sackmann = usage NON COMMERCIAL (à revoir le jour de l'abonnement). 9 essais (vm + lecteur), smoke 66.
  20261020s (« ok mais on peut pas améliorer compétition/tennis aussi ? » + « LES PHOTOS DES JOUEURS TOUJOURS DISPO OU SI PAS DE PHOTO drapeau du
  pays du joueur », maquette maquette-tennis-res validée « oui ») : bloc « COMPÉTITIONS → TENNIS PLUS LISIBLE » en fin d'app.js. Remplace
  _g45RenderTennisRes (appelle lui-même _g45TenPhotos, l'ancienne enveloppe est écrasée) et _g45EspnTennisRow (aussi pour le tableau par tour) :
  heure à gauche (direct : 🔴 + sets en rouge ; terminé : sets), photo ronde 38 px ou GRAND drapeau (_g45TenAvatar modifié : drapeau à la place des
  initiales, petit drapeau du coin .g45-tfl seulement avec photo, _g45TenPhotos le rend visible), N° ESPN + Elo de la surface sous le nom, en-tête
  tournoi drapeau du pays + niveau (_g45TnCat / _g45TnCatL) + surface (_g45TnSfL), doubles repliés (g45TnDblTgl) sauf filtre Doubles, filtres
  Tous / ATP / WTA / Doubles ('dbl'), Grands Chelems seulement si un Majeur a des matchs ce jour-là. 🔮 g45TnResAvis : _g45TnAvisMatch (avisMatch
  exposé, stats ESPN seules) au toucher, simples pre / in ; 8 nouveaux avis / jour sur BET45 (localStorage g45tn_av8), sans limite si
  _g45SanteActive ; reprend les avis d'« Analyser les matchs » ; 2e toucher = fenêtre du match. Barre ◀ date ▶ agrandie (enveloppe g45TennisResults).
  Smoke tnRes (67).
  Question d'Antoine (capture « Rechercher un joueur », bloc vide) : searchTennisPlayer = recherche web Tavily + résumé IA (Groq) des stats de la
  saison ; le résumé revient vide → proposé de le remplacer par les vraies données ESPN (_g45TnSaison / _g45TnCalc + Elo), maquette à faire.
  20261020t (maquette maquette-tennis-joueur « oui », « retire Benoît Paire il est plus bon à rien ») : bloc « RECHERCHER UN JOUEUR AVEC LES VRAIES
  DONNÉES ESPN » en fin d'app.js : loadTennisSaisons / searchTennisPlayer remplacés (plus de Tavily ni d'IA). Boutons = 10 meilleurs Elo ATP / WTA
  (elo_tennis.json), saisons année, -1, -2. Nom → id : g45tnid1_<nom> (localStorage, dans _G45_CACHE_PREFIXES), sinon ESPN search/v2 (NON SONDÉ pour
  le tennis : contenu avec s:850 ou « tennis » et ~a:<id>), sinon scoreboards ATP / WTA du jour. Saison _g45TnSaison, calcul pur _g45TjCalc (bilan,
  surfaces, forme 10), Elo + rang Elo, âge / main, photo ou grand drapeau, liens Tennis Abstract / fiche ESPN / Sofascore. Smoke tnJoueur (68).
  À VÉRIFIER sur PC (Antoine sur téléphone) : la recherche ESPN trouve-t-elle un joueur hors des matchs du jour (ex. « Arthur Fils ») ?
  20261020u (« classement par surface ? », maquette maquette-tennis-surface « oui et ok ») : bloc « CLASSEMENT PAR SURFACE » en fin d'app.js,
  enveloppe loadTennisSaisons (cadre replié « 🏆 Classement par surface » avant #tennis-player-result). Calcul pur _g45TcListe(J, lg, sf) :
  Elo général / dur / terre / gazon, rang général, d = places gagnées. ATP / WTA, 30 + « voir plus », toucher = g45TjChoisir. Pas de pays dans le
  fichier Elo → photo ou initiales. Smoke tnJoueur complété (68). Publié avec 20261020t (« ok »).
  20261020v (capture d'Antoine : fiche Arthur Fils OK — la recherche ESPN search/v2 TROUVE bien un joueur hors des matchs du jour ; « on
  pourrait avoir un global / terre battue / dur / … ») : boutons 🌍 Global / Dur / Terre battue / Gazon / Salle sur la fiche (g45TjSf, données
  gardées dans _g45TjEtat.d, seules les surfaces jouées) ; score des défaites du point de vue du joueur (« 5-7 4-6 ») ; « bat Bye » : les Bye
  retirés de _g45TnSaison (enveloppe _sansBye : fiche, analyse, robot, mémoire tn3_ comprise) et de _g45TjCalc. Elo absent sur la capture :
  données/elo_tennis.json PAS ENCORE CRÉÉ (1er passage du robot le matin, 8 h) → boutons de secours (10 noms ATP / WTA sans Paire) en attendant.
  21/10 (« on a mis 8 h et les tendances n'arrivent pas avant 11 h 30 ») : runs GitHub lus — les crons '0 6/7/8/9' partaient avec 3 à 5 h de
  retard (20/10 : 10 h 47, 12 h 32, 13 h 07, 14 h 07 UTC ; 18/10 : 11 h 56 UTC). tendances.yml : cron '13,43 3-9 * * *' (retard ≈ 3 h d'après Antoine) (minutes décalées, essai
  toutes les 30 min). Si encore en retard : le worker (cron */5, fiable) pourrait lancer le robot par l'API GitHub (workflow_dispatch) — il
  faudrait un jeton GitHub (droit Actions) mis en SECRET du worker par Antoine.
  21/10 (« il reste la solution du worker… pas bête ça ») : PRÉPARÉ (déploiement sur « OK ») — worker : lancerRobotTendances(env) dans
  scheduled (*/5) : si env.GH_ROBOT, entre 8 h 00 et 8 h 59 à Paris (parisMaintenant, sans Intl, heure d'été calculée), une fois par jour
  (D1 robtend:<jour>, 2 jours), POST api.github.com/…/actions/workflows/tendances.yml/dispatches { ref: main, inputs: { force: '0' } }.
  tendances.yml : entrée force (défaut '1' pour le bouton), FORCE = inputs.force. Antoine : jeton fine-grained (dépôt gones45 seul, Actions
  lecture-écriture) → secret GH_ROBOT du worker fd-proxy (tableau de bord Cloudflare, jamais dans le code ni la conversation).
  « ok » : PUBLIÉ (tendances.yml sur main + worker déployé, 18 liaisons, cron */5 vérifiés). Le worker avait DÉJÀ un secret GITHUB_TOKEN
  (route /github-simu, écrit données/simulations/) : jeton = GH_ROBOT sinon GITHUB_TOKEN — s'il a le droit Actions, aucune clé à créer.
  Résultat écrit en D1 robtend:<jour> (« ok » ou « http 403 ») + console.log ; vérifier dans la liste des runs (événement workflow_dispatch
  vers 6 h UTC). PIÈGE : « (*/5) » dans un commentaire /* */ le FERME (refus Cloudflare 10021) alors que node --check passait.
  21/10 matin : le worker a lancé le robot à 6 h 00 UTC (8 h 00 Paris, workflow_dispatch, GITHUB_TOKEN suffit) ✅. MAIS 0 tendance
  affichée (foot / hockey / NBA / NFL / tennis) alors que la veille à 12 h 47 : 10 / 10 / 4 / 4 — cause à confirmer (cotes pas encore
  publiées à 8 h ?). Elo : « atp : 0 joueurs lus » en 70 ms (curl en échec).
  20261021a (« ok pour elo ») : elo.mjs essaie www / sans www, https / http et écrit l'erreur de curl. SCORE TENNIS — SONDÉ PAR ANTOINE
  (eventlog Arthur Fils) : « (21) Arthur Fils (FRA) bt Ignacio Buse (PER) 6-7 (4-7) 7-6 (7-3) 7-5 », « … 7-6 (7-2) 6-3 », « 4-6 6-4 7-6 (9-7) » :
  _g45TnScore lit « (a-b) » avec espace → « 6-7(4) 7-6(3) 7-5 » (points du perdant du tie-break) ; avant : seulement « 7-5 » ou vide (jeux /
  tie-breaks de l'analyse faussés). Mémoire tn3_ → tn4_ (toutes les saisons relues une fois). Smoke tnScore (69).
  Vu en console d'Antoine : ESPN search/v2 ne contient PAS d'uid s:850 pour « arthur fils » (la fiche passe quand même : contenu « tennis »
  ou repli scoreboard) ; TheSportsDB en 403 (worker host=tsdb ET direct) → photos absentes, grand drapeau affiché.
  21/10 — CAUSE du « 0 affichées » (Sélection du jour vide, capture d'Antoine) : RÉGRESSION 20261020c (Tendances en boutons) — l'écran s'ouvre
  sur BET45 → Sélection, la liste perso n'est plus dessinée, _g45TrSuivNoter (appelé par le rendu perso) jamais appelé → le robot ne voit rien.
  tendances.mjs : localStorage g45tr_vue = 'perso' (addInitScript + avant la boucle). Robot relancé à la main (force 1) le 21/10 ~9 h 30.
  Elo : fichier créé au 2e passage (559 ATP, 515 WTA ; Fils 2019,7 / dur 1961,3).
  20261021b (« pourrait mettre le score en direct », Tendances → Tennis « Tous les matchs du jour », « oui ») : _g45TnListe garde sa / sb (jeux
  par set, linescores) ; « 🔴 6-4 3-2 · 2e set » (_g45TnScoreLv) au lieu de « en cours », meneur du set en cours en gras (_g45TnNomsLv) ;
  minuteur 60 s (lvArmer) qui ne change QUE les textes [data-g45tnlv] / [data-g45tnn] (analyse ouverte conservée), « Terminé » quand le
  match quitte la liste (les matchs finis n'y sont pas), arrêt sans direct ni match dans l'heure. Smoke tnLv (70).
  + (« mettre le drapeau du joueur et le nom WTA · BNB Ningbo Open · WTA 500 · 🟦 Dur de la couleur de la surface ») : joueur() garde f
  (drapeau ESPN), drapeau 20×14 devant chaque nom ; en-tête du tournoi en couleur de la surface (SF.c : dur bleu, terre orange, salle ciel, gazon vert).
  20261021c (« aucune précision des stats ? » sur la Sélection ; « AU TOUCHER que cela nous sorte une carte comme celle-ci » ; « le cache est trop
  grand et cache la belle image de fond sur PC » ; « le logo au fond est centré au milieu, fais en sorte qu'on le voie sans cache » ; maquette
  maquette-sel-detail v2 « oui ») : la carte de Tendances perso (`var card` dans _g45TrRender, 1 copie) devient la fonction globale _g45TrCarte
  (bloc « CARTE DE TENDANCE, LOGO DU CENTRE LIBRE » en fin d'app.js ; dans le rendu : var card=_g45TrCarte). PC : colonne gauche 40 % (match,
  pari, accord, faits 📈, échantillon), colonne droite étroite (cote / heure, cases Stats / Bookmakers empilées), milieu libre ; ≤ 760 px :
  logo de la compétition en haut au centre (.g45trc-av), texte dessous ; textes 12-16 px. Sélection du jour : toucher = g45TrSelOuvrir(id|k)
  (S.ouv) → detail(x) = _g45TrCarte avec x.fa / x.nm du robot ; blasons, couleurs (g45CoulPaire) et logo de la compétition (dark) lus sur le
  scoreboard ESPN du jour, gardés par compétition (S.deco, {} si échec : pas de boucle). Smoke trSel complété (70). Captures carte-pc / carte-tel vérifiées.
  20261021d — 📊 CRITÈRES SUR 4 SAISONS, AJOUTS (« on va rajouter des trucs » : sélection proposée + duo / trio buteur, double chance buteur,
  nombre de tirs, tirs par équipe ; maquette maquette-criteres « oui ») — tout DANS le bloc des critères (_g45CrHtml), norm(c) pour les défauts :
  ⚽ Joueurs (foot) : jusqu'à 3 (jo / jo2 / jo3, g45CrJoueur(id, slot)), Buteur / Doublé / Triplé / Passeur / Décisif ; 2-3 joueurs : jx = cha
  (chacun) / un (au moins un = double chance) / c15 c25 c35 (buts cumulés) ; matchs comptés = TOUS ont joué. 🎯 Feuille de match (foot) —
  SONDÉ PAR ANTOINE (summary 401876432 PSG à Strasbourg : boxscore.teams[].statistics totalShots, shotsOnTarget, wonCorners, yellowCards,
  redCards ; header competitors[].linescores = [1re MT, 2e MT] ; keyEvents scoringPlay + team) : _g45CrFeuille(j) → ligne compacte
  localStorage g45crf1_<event> (pour toujours) ; ids des matchs g45crid1_<lg>_<club>_<an> (espnClubSchedule) ; fCharger : 4 lectures en
  parallèle, « ⏳ Feuilles de match f / n » ; critères tirs match / équipe / adversaire (O/U), cadrés (équipe / match), mi-temps (mène / nul /
  but en 1re MT), marque en premier, corners / cartons (équipe / match). 🔁 Match précédent (tous sports) : m.pr posé par filtrer (match
  d'avant dans la saison, score final). Matchs sans donnée = non comptés. Smoke crPlus (71). Capture crit-pc vérifiée.
  « la coupe d'Europe est-elle rajoutable ? » — SONDÉ PAR ANTOINE : soccer/uefa.champions/teams/160/schedule?season=2025 = 17 matchs (PSG),
  uefa.europa = 0. 20261021e (« oui ») : ligne « Compétition : 🏆 Championnat / 🌍 Coupe d'Europe / Les deux » (S.comp L / E / T, foot) ;
  euCharger : espnClubSchedule(nom, an, uefa.champions / uefa.europa / uefa.europa.conf) → sa.eu = [date, dom, pour, contre, 0, 1, id, slug],
  saison passée g45cr1e_<lg>_<club>_<an> ; msDe(sa) = liste selon la compétition (Les deux = triée par date) ; feuilles de match d'Europe
  lues sur leur compétition (slug) ; joueurs = journal du championnat seulement (avertissement affiché). + « cette sélection de critères doit
  passer en premium » : verrou _g45AccesPremium() !== true → 🔒 « réservé premium » + _g45BlocPremium (gones45 sans compte = ouvert).
  20261024b (ticket Brisbane Roar – Perth Glory « Mi-temps · Nombre de buts · Plus de 1 » @1,52 : « on n'a pas le critère mi-temps ? » ; « ce
  n'est pas 0,5, c'est 1 ») : onglet ⚽ Buts (foot), 2 lignes « Buts en 1re mi-temps (match) » / « Buts en 2e mi-temps (match) » Over / Under /
  Aucun + ligne 0,5 → 3,5 de 0,5 en 0,5 (c.m1 / M1L, c.m2 / M2L, défaut 1). 1re MT = linescores de la feuille de match (fVal hh + ha), 2e MT =
  score final − pause. Ligne RONDE égalée = remboursé → match écarté par jFiltre (ni gagné ni perdu), phrase d'aide affichée. fBesoin inclut
  m1 / m2 (lecture des feuilles), compteur de l'onglet Buts, résumé « Buts 1re MT Over 1 ». Smoke crPlus + 9 essais (93).
  20261024c (« en ligne ronde, c'est vrai qu'on a un vrai manque partout ») : TOUTES les lignes over / under des critères de 0,5 en 0,5 (lignes()
  buts du match tous sports, selEq équipe / adversaire, selN feuille de match : tirs, cadrés, corners, cartons). okOU(dir, v, L) : pile la ligne
  = critère REMBOURSÉ → ignoré (comme une sélection annulée dans un combiné) ; nbRemb(c, m) = [actifs, remboursés] → si tout est remboursé,
  match non compté (jFiltre). Remplace l'exclusion par critère de 24b. Phrase d'aide dans l'onglet Buts dès qu'une ligne ronde est choisie.
  Smoke crPlus + 6 essais (combiné Over 4 + Victoire / Défaite sur un 3-1). Lignes asiatiques ,25 / ,75 (captures Asianconnect) : à décider.
  20261024d (« oui ajoute-les », captures Asianconnect « plus de 1,75 buts @1,83 », « Belgrano +0,25 @1,91 ») : critères FOOT — lignes ,25 / ,75
  (buts du match, équipe, adversaire, mi-temps) + nouveau « Handicap asiatique de <club> » (onglet Résultat, −3 → +3 de 0,25, c.ha / HAL ;
  gf − ga + H > 0 gagné, = 0 remboursé). eclater(c) coupe chaque ligne en quart en deux lignes voisines à moitié de poids ; valeur(c, m) =
  { n, ok } (moitié remboursée → n 0,5) ; calc additionne (« 12,5/20 », nbV) ; série : réussite si ok ≥ n/2 ; enCours idem. Le test « tout
  remboursé » passe de jFiltre à valeur. Smoke crPlus + 10 essais (3-1 et 1-1). Paris : 24e.
- 💶 20261024e (« dans les paris, on n'a rien lol » ; « oui, pas besoin de maquette, code et mets en ligne ») : RÈGLEMENT ½✅ moitié gagné /
  ↩️ remboursé / ½❌ moitié perdu. Carte « en cours » (data-g45ec) : 3e bouton « ½ ↩️ » (pas pour un lay) → window.g45BetAutre(id) (fenêtre :
  3 gros boutons avec le gain, Annuler) → g45BetRegler(id, ar). Un pari ne connaît que win true / false (> 200 lectures) : ramené à un pari
  ordinaire à l'argent EXACT partout — hw : win, cote (c + 1) / 2 ; v : win, cote 1 ; hl : perdu, mise / 2 ; gardés ar, coteO, mO, débrief
  préfixé (« ½✅ Moitié gagné (cote 1,83, mise 10 €) »). Argent par _g45BetAppliquer (effet « en cours » retiré, effet réglé appliqué). Réussite
  % : hw et v = gagné, hl = perdu (dit à Antoine). Montante : hw palier 1, v inchangé, hl + 1. Smoke betAr (94) : 100 → 114,15 → 124,15 →
  129,15. Capture scratchpad ar-tel.png. ✏️ Modifier le pari : inchangé (Gagné / Perdu seulement).
- 🚀 20261024f (captures : ticket Colorado – Tampa « Mise 5 € », Cockpit ouvert par « prochain match » avec Mise 30 alors que le simulateur
  montrait « P1 ◀ 5 € ») : updMise calculait la mise AVANT que c-comp / c-lieu soient posés (comp vide → repli u.l = dernier palier joué
  ailleurs, P3 = 30 €) ; renderCrash, appelé après, avait le bon palier. Bloc en FIN d'app.js : renderCrash enveloppé → _g45MiseRecalc()
  (STRATS[u.s][_g45Pal(u, c-comp, lieu) − 1]) ; aussi au change de c-comp / c-lieu. Mise tapée ou remplie par le lecteur de tickets (tout
  input / change sur #c-mise → _g45Man) = gardée jusqu'au prochain updMise (choix d'équipe). Smoke miseCk (95).
  20261024g (capture : ticket lu « Winamax · mise 5 · cote 2,2 », puis « 🔎 Match trouvé → OK » : « dès que j'appuie OK il me met Piwi ») :
  g45LieuChange redessine tout le formulaire (render) et ne gardait que c-unit → bookmaker = 1re option (Piwi), autres champs perdus, mise
  remise au palier. Enveloppe en FIN d'app.js : relève tous les input / select / textarea #c-… (sauf c-unit, c-lieu, fichier ; c-mise
  seulement si _g45Man) avant, les repose après, garde le nouveau lieu, renderCrash. Smoke miseCk étendu (bet365, adversaire, mise 5 gardés).
- 📡 20261024h (onglet Live de la fiche équipe : « Milwaukee Bucks — Pas de match en cours ni récent » en plein Bucks – Bulls, « c'est le cas pour
  toutes les équipes, foot compris ») — SONDÉ PAR ANTOINE : espnResolveTeam('Milwaukee Bucks') = league nba, puis
  sports/soccer/nba/teams/15/schedule → 400 ; Arsenal → match récent (post) + résumé OK (le foot marche quand un match existe). Correction :
  _espnMatchLiveData choisit le sport ESPN selon la ligue (nba / wnba basketball, nhl hockey, nfl football, mlb baseball, sinon soccer) pour
  le calendrier et le résumé, renvoie sport ; loadEspnMatchLive : sport ≠ soccer → en-tête score + courbe _g45WpBloc (relue chaque minute),
  sans pression / stats / compos de foot. 2 essais vm (faux ESPN), smoke 95. Courbe trop grosse sur PC (viewBox 384 étiré) : 24i.
  20261024i (« OUI ») : _g45WpCourbe → svg max-width 760 px, centré (textes ≈ 24 px sur PC) ; téléphone inchangé. Capture scratchpad wp-pc.png, smoke 95.
  20261024j (Live des Bucks OK après 24h ; « faudrait une courbe fine comme dans Bilan, et oui enlève le bouton Sofa ») : traits de la courbe
  stroke-width 2 + vector-effect non-scaling-stroke (2 px à l'écran) ; loadEspnMatchLive « Pas de match en cours ni récent » sans bouton Sofascore.
  20261024k (« c'est nettement plus lisible » ; « 26.6 - 3RD » → « OUI EN FR ») : _g45EtatFr(shortDetail, sport) dans l'en-tête de la courbe :
  « 2:52 · 3e QT », « 26,6 s · 3e QT », « 5:10 · 2e P » (hockey), « 5e manche (haut) », Mi-temps, Fin du 3e QT, Terminé (prol.). 10 essais node, smoke 95.
  20261024l — 3 retours d'Antoine en direct (nuit du 23 au 24/10) : (1) « le piège à c… : 0 h 05, j'ai plus le match dans NBA direct » —
  g45LoadLeagueMatches : avant 10 h la veille est aussi chargée ; jour ouvert = celui d'un match EN COURS, sinon aujourd'hui, sinon le 1er jour
  à venir (2 essais Chromium, faux ESPN). (2) « tout jaune la ligne » : deux courbes dans la page (fenêtre du match + onglet Live) avec les mêmes
  id de clipPath (g45wpH / g45wpB) → id unique par courbe (_g45WpCourbe.n). (3) « écris moins gros le nom des équipes » : « ↑ … favoris » 12,5 → 9,5.
  20261024m (capture 03:29, Colorado Avalanche : onglet Live = résumés vidéo NHL « alors qu'il y a un match en direct ») : loadTeamLive (DEUX
  copies, les deux corrigées) — 🏒 / ⚾ / 🏀 : d'abord _espnMatchLiveData ; match en cours ou fini depuis < 12 h → loadEspnMatchLive (score +
  courbe) ; sinon loadVideoHighlights comme avant. 3 essais Chromium (en cours → direct, fini il y a 20 h → vidéos, rien → vidéos), smoke 95.
  CONFIRMÉ par Antoine (03:33, Colorado – Tampa 2:0 en direct). 20261024n : en-tête « EN DIRECT · 8:33 - 1st » → _g45EtatFr (« 8:33 · 1er P »).
  Courbe absente en début de match (moins de 2 points ESPN). Bandeau défilant du haut encore en anglais (« 8:35 - 2nd ») : non touché.
  20261024o (« et on n'a pas le détail et tout le reste comme en NHL ») : loadEspnMatchLive hors foot → sous le score, _renderGenericDetail(zone
  .g45-live-det data-open="1" (sinon l'actualisation s'arrête), sport, ligue, match) = même fenêtre que Compétitions ; repli : courbe seule. Smoke 95.
  20261024q (bandeau défilant « 8:35 - 2nd » → « oui ») : _g45BandTuile → _g45BandEtatFr(ev, shortDetail) : sport lu dans ev.uid (s:40 / 70 / 20 / 1,
  sinon foot) puis _g45EtatFr (« 8:35 · 2e P », « 26,6 s · 3e QT », HT → Mi-temps, minutes du foot inchangées). 5 essais node, smoke 96.
- 📡 20261024x (capture 14:17 : Manchester City, onglet Live = « Terminé 3-2 Ipswich » pendant Aston Villa – City) : le calendrier d'équipe ESPN foot ne liste que les matchs joués → `_espnMatchLiveData` ajoute le scoreboard du jour de la ligue (+ C1 / C3 / C4 au foot), match de l'équipe repéré par son id ESPN. Test vm 5/5, smoke 97.
- 📡 20261024y (« il donne pas le graphique avec les cotes ? » → maquette → « avec courbe ») : onglet Live foot EN DIRECT → `window._g45CdlLancer` (près de _g45CdLire) : bloc 📈 COTES EN DIRECT DraftKings (1 / N / 2, buts) + courbe des chances (équipe de la fiche, trait vert ; nul pointillé) calculée des cotes (marge retirée), relue toutes les 45 s tant que le bloc est affiché, points gardés en sessionStorage g45_cdh_<id> (200 max). Largeur du dessin = largeur réelle (textes 13 px sur téléphone). Test Chromium (3 points, cote OFF ignorée), smoke 97.
- 🎾 20261024r (Oliynykova – Hontama : « meilleur sur dur ces 2 derniers mois (33 % contre 0 %) » ; Flashscore montre 2 victoires de Hontama
  les 28-29/09 = QUALIFS, absentes d'ESPN qui n'a que les tableaux principaux ; « rajoute surtout qu'on ne tient pas compte des petits
  tournois ou qualifs ») : _g45TnClair, phrase surface 2 mois → « (1 sur 3 contre 0 sur 3 · tableaux principaux seulement, sans qualifs ni
  petits tournois) ». Calcul de l'avis inchangé. 1 essai Chromium, smoke 96.
- 🎫 20261024s (ticket Winamax « Perdu » San Antonio – Houston du 24/10 → « Match trouvé : Dallas – Spurs 25/10 » ; « ça ne va chercher que le futur
  match, pourtant la couleur rouge ou verte indique gagné ou perdu ») : consigne IA + champ "etat" (en_cours / gagne / perdu / rembourse) ;
  _g45TicketMatch : ticket terminé (etat) OU date du ticket passée → jours = veille + jour du ticket, matchs FINIS (post / in) ; sinon comme
  avant (jour + lendemain, pas les finis). 4 essais vm (tm2.js : à venir, perdu hier soir, date passée, en cours), smoke 96.
- 🎫 20261024v (ticket Haaland « Aston Villa – Manchester City » : compétition vide, date « à vérifier ») : `_g45TicketMatch` — racine « manch » couvrait aussi Manchester United (même journée PL → 2 matchs → rien proposé). Plusieurs matchs → on garde celui dont la racine est EXACTEMENT celle du ticket. Test node 4/4.
- 🎫 20261024w (« si on remplit le ticket buteur et après un autre ticket, le nom du buteur reste ») : `_g45TicketRemplir` et `_g45TicketRemplirCockpit` vident d'abord n-/c-joueur, n-/c-joueur-match et les joueurs ajoutés (-joueurs-extra). Smoke tkJ (97 contrôles).
- 🎫 20261025a (capture : pari Celebrini « Sharks de San José vs Bruins de Boston » gagné, sans score) : `_g45ScoreTexte` NHL ne trouvait l'équipe que par le nom EXACT de NHL_TEAMS ; noms français du ticket → rien. `_g45NhlInfoDe(nom)` : nom exact, sinon SURNOM du club (dernier mot) dans le nom, Utah = mammoth / utah. Utilisé pour la recherche, md et la relecture md. Test node 9/9, smoke 98.
- 🎫 20261025c (capture : ticket Winamax MyMatch Edmonton – Toronto → « Edmonton Oilers n'est pas une équipe de ton mur », carte joueur Nugent-Hopkins club Edmonton présente) : `_g45TicketRemplirCockpit` — équipe absente du mur → carte JOUEUR dont le club (_g45UClub, racines) est l'équipe lue ; plusieurs → nom de famille cité dans type / joueur ; c-joueur rempli. Smoke tkClub (100).
- 🚀 20261024t (ticket Spurs 5 € recollé alors que la montante est passée au P2 = 10 € : « on devrait être averti, seulement pour le Cockpit, que
  la mise ne correspond pas au palier ») : bloc 24f, avert() → bandeau jaune #g45-mise-av sous #c-mise « ⚠️ Mise 5 € ≠ palier P2 de ta montante
  (10 €) » (STRATS[u.s][palier − 1], compétition + lieu) ; mis à jour à chaque renderCrash, saisie de la mise, changement d'équipe / compétition /
  lieu ; retiré quand la mise = palier. Pari Simple non concerné. Smoke miseCk étendu (96).
  Smoke crPlus complété (Europe 1/2, Les deux 2/3, verrou).
  + (captures bet45 d'Antoine, compte au-delà des 30 jours : « Tendances disparaît, devrait rester à gauche et montrer cette page comme sur
  Pari / Tendances ») : indexfenotte.html n'avait PAS de bouton Tendances dans le menu (gones45 oui) → ajouté après Agenda, même onclick ;
  le cadenas vient de loadTendancesTab. (smoke.js sur indexfenotte.html : 69 échecs AVANT et APRÈS, la garde d'accès bloque sans compte.)
  20261021f (« on commence à être envahi, faire des onglets, pareil pour le panneau Saison » ; « il faudrait rajouter ce que l'on a fait plus
  haut » = feuille de match ; filtre Compétition du panneau Saison DÉJÀ là, liste des matchs déjà dessous ; maquette maquette-onglets « oui ») :
  CRITÈRES : Lieu / Compétition en haut, puis onglets 🏁 Résultat (résultat + écart) · ⚽ Buts (match / équipe / adversaire + les deux marquent)
  · 👤 Joueurs · 🎯 Feuille · 🔁 Contexte, pastille = nb de critères ; découpage par repères q0…q7 de la chaîne h ; onglet localStorage g45_cr_tab
  (g45CrTab) ; « aucun match compté » au lieu de « 0/0 · NaN % ». PANNEAU SAISON (_g45CursHtml) : Match entier / 1re MT puis onglets ⚽ Buts ·
  ⚖️ Handicap · 🥇 1er but · 🎯 Tirs (match, équipe, adversaire, cadrés équipe / match) · 🚩 Corners / cartons (équipe / match) ; e.tab dans
  g45_curseurs (g45CursTab, g45CursW) ; tirs / corners / cartons = feuille g45crf1_<espnId> (_g45CrFeuille, summary
  soccer/<m.competition.code>), lue à l'ouverture de l'onglet (_g45CursFeuilles, 4 à la fois, essayée une fois par session, un redessin à la
  fin) ; match entier seulement ; PAS de « dans le calcul » pour ces cartes. Smoke : tests critères recalés sur l'onglet Buts, cursTi (72).
  20261021g (« le temps d'une recherche faire comme le screen 2 [page d'attente Agenda] mais avec BET45 » → maquette maquette-chargeur « OUI »,
  BET45 aussi sur gones45 ; « quand j'arrive dans Saison ce panneau [critères] est déjà ouvert, il devrait être fermé ; pareil pour le screen 2
  [curseurs de la saison NHL] ») : _g45Chargeur(texte) (logo BET45 qui respire, anneau rouge / blanc) à la place des petits spinners plein
  panneau (6 remplacés par motif + Saisons tous sports avec #sg-prog) ; critères : ouvert / fermé en mémoire par équipe (S.ov, S.ovTous pour
  les tests) au lieu de localStorage g45_cr_open ; curseurs foot (_g45CursHtml) et autres sports (_g45SgCursHtml) enveloppés : bandeau
  « 📈 Curseurs de la saison ▸ Ouvrir » fermé à l'arrivée (_g45CursOuv, g45CursOuvrir ; window._g45CursToujours pour les tests). Smoke ferme (73).
  20261021h (« pareil » sur le bloc pastilles / forme récente / stats sélectionnées / dom-ext / buts par match / stats clés / par compétition,
  « oui » aux onglets) : loadTeamSaisons, repères _s0…_s6 de la chaîne html → bandeau « 📊 Statistiques de la saison » fermé à l'arrivée
  (window._g45StOuv[nom], g45StOuvrir) + onglets 🔥 Forme · ✅ Mes stats (pastilles + stats sélectionnées) · 🏠 Dom / Ext · ⚽ Buts (buts par
  match + stats clés) · 🏆 Compétitions (localStorage g45_st_tab, g45StTab) ; redessin par _g45CursReconstruire('#g45st-ouv'). Liste des
  matchs inchangée. Smoke 73 (pas de contrôle dédié : rendu de loadTeamSaisons non simulé).
  20261021l (« STATS SAISON pas refermable sur le sport US ») : _g45SaisonsGen (NHL, NBA, NFL, MLB, rugby…), repères _q0…_q6 → même
  bandeau « 📊 Statistiques de la saison » fermé à l'arrivée (window._g45StOuv['g|sport|équipe'], g45StOuvrir) + onglets 🔥 Forme · ✅ Mes
  stats (pastilles + stats sélectionnées) · 🏠 Dom / Ext · ⚽ Buts ou 🎯 Points (par match + stats clés), onglet partagé g45_st_tab. Filtres
  Global / Dom / Ext, repos, temps réglementaire LAISSÉS visibles hors bandeau (ils changent le combiné et la liste). Smoke 74.
  + (« le fond est caché par les bandes de cache, c'est dommage sur PC », liste des matchs de Saisons) : ligne du match (grille domicile / score
  / extérieur) limitée à 640 px et centrée hors téléphone (g45Etroit) → fond du club visible sur les côtés.
  + (« petite coquille : sous la saison 2025/2026 on a le classement actuel ») : loadStandings(nom, id, matchs, saison) demande football-data
  /v4/competitions/<code>/standings?season=<année de début> (les DEUX copies de _loadStd passent la saison) ; réponse d'une autre saison
  (season.startDate) ou refus → « Non disponible ». À VÉRIFIER : l'offre gratuite de football-data accepte-t-elle ?season= pour la saison passée ?
  20261021i (maquette maquette-classement + « on l'a déjà dans Compétitions [Forme] mais un coup de feeling est bienvenu, après on regarde
  les sports US ») : bloc « CLASSEMENT + BUTEURS DE SAISONS RELOOKÉS » en fin d'app.js — renderStandingsTable = _g45StdRelook (résumé de ta
  position, zones 4 / 5-6 / 3 derniers + légende, Diff = goalDifference, ≤ 900 px centré) ; renderScorersList (2 copies) = _g45ScRelook
  (🥇🥈🥉, tri ⚽ / 🅰️ / décisif window._g45ScTri + g45ScTri, colonne décisif) ; Compétitions → Forme : tableau PC agrandi, bandes sombres,
  bande verte / rouge, ≤ 1000 px centré (cartes téléphone inchangées). « Lyon seulement » de la maquette pas fait : la liste du club existe
  déjà juste au-dessus. Smoke 73 ; capture cls-pc vérifiée.
  20261021j (capture : fiche Carolina Hurricanes → Saisons montrait les prochains matchs et le filtre Europa de LYON, « sûrement j'étais trop
  vite ») : course entre deux loadTeamSaisons asynchrones (le plus lent écrit en dernier dans #ip-saisons). Enveloppe la plus externe : à la
  fin, si _currentTeam a changé depuis le début → relance UNE fois pour l'équipe actuelle ; marqueurs des enveloppes (_g45Eb…) recopiés
  (le smoke KBO les vérifie). Smoke 73.
  20261021k (captures NHL Carolina / Colorado : « manque le +1,5 pointeur et autre », « curseur saison on n'a pas les joueurs ? si on veut équipe
  gagne ET X marque / passeur / décisif », « Les plus réguliers : une fois ouvert j'arrive pas à le refermer ») : filtre joueur hors foot
  (_g45JouBarre) → boutons « 1 ou plus / 2 ou plus (+1,5) / 3 ou plus » (_g45JouF.min, _g45JouMin), pastille ×N seulement si ≥ seuil ;
  compteur du combiné des Saisons (✅ x/n) : match compté seulement si le joueur atteint le seuil (_g45JouOk) + libellé (_g45JouLib) ;
  Les plus réguliers : « ▴ Replier » (_g45RegHtml enveloppée, g45RegReplier, _g45Reg.replie, _g45RegBloc voit une mémoire vide quand
  replié). Joueurs dans les CRITÈRES SUR 4 SAISONS hors foot : pas fait (foot seulement). Smoke jouMin (74).
  _g45TnPerso pose les 3 blocs de l'écran. Smoke tnRun (65) ; tests tnRobot / tnRun calés sur « maintenant + quelques minutes » (le soir UTC,
  « + 2 h » tombait le lendemain).
  20261020c (croquis d'Antoine « Tendances = 4 boutons », maquette cliquable validée « oui, BET45 → Sélection du jour par défaut ») : ONGLET EN BOUTONS —
  bloc « TENDANCES EN BOUTONS » en fin d'app.js (enveloppe la plus externe de loadTendancesTab). Barre #g45tr-nav : 📒 Tendances BET45 · 🔍 Tendances perso ·
  ⚽ Tendances buteurs · 📏 CLV ; dans BET45 : ⭐ Sélection du jour (_g45TrSelHtml, forcée ouverte) · 📅 Historique (calendrier + liste du jour) ·
  📈 Graphique / Stats (bilan du mois d'avant, tuiles, courbe, statistiques). Mémoire localStorage g45tr_vue (bet/perso/but/clv) + g45tr_sous (sel/his/gra).
  Rien de réécrit : CSS selon #t-tend[data-g45v] (bet-sel / bet-his / bet-gra / perso / but / clv) ; repères .g45tro-his / .g45tro-gra posés dans
  _g45TrOffHtml (enveloppé pour le titre « 📅 Historique BET45 » / « 📈 Graphique / Stats BET45 »). Perso : filtres à gauche, « Analyser » à droite
  (.g45tr-prow, nœuds déplacés, mêmes id ; dessous sur téléphone), boutons Voir buteurs / CLV et historique cachés. Buteurs / CLV : bouton « ← Tendances »
  caché ; MutationObserver repose la barre en tête quand ces écrans réécrivent #t-tend. Point de la courbe touché en Graphique → passe sur Historique.
  Smoke : hockey / désaccord passent g45tr_vue = perso ; nouveau contrôle trVues (62).
  20261018y (« j'avais pas appuyé sur Analyser, ça sortait pas les matchs du jour », maquette validée « oui ») : 📒 SÉLECTION DU JOUR — bloc #g45tr-sel (fin d'app.js)
  sous la barre des sous-onglets de #t-tend (MutationObserver + enveloppe de loadTendancesTab ; comptes premium seulement) : tendances du robot notées
  AUJOURD'HUI (x.n date locale), par championnat, cote / 📊 / 🏦, direct ESPN ?dates= (window._g45TrSel.lv, 1 min) → gagnant si ça reste / provisoire ;
  0 crédit ; repliable (g45tr_sel_ferme) ; vide → « arrive vers 8 h » (avant 15 h) sinon « aucun pari ». `_g45TrSelHtml`. Smoke (trSel, 61).
  20261018j (« je pari du 1,5 mini, 1,99 ne me gêne pas, mais je peux pas faire plusieurs sélections ») : filtres de `_g45TrOffHtml` Sport / Championnat /
  Type / Cote / Proba à CHOIX MULTIPLES (F[cat] = « c1,c2 », helper a(cat, v)) ; « Tous » vide la ligne ; Avis et Période = un seul choix.
  20261018d (capture téléphone en PAYSAGE, « à droite le bordel » : pastilles sur le nom du pari, logo NHL / NFL dessus) : 700-1199 px → nom du pari
  sur sa ligne, pastilles dessous, logo du championnat .g45tro-wm caché ; ≥ 1200 px inchangé.
  20261018e (« en mode portrait il manque l'heure du match ») : en-tête téléphone .g45tro-mh = score / direct / « à venir » + « 🕒 HH:MM » dessous.
  20261018f (« pourquoi pas de score pour le foot » : matchs de la veille au soir « à venir » jusqu'au robot de 10 h) : lvMaj couvre les tendances
  non jugées commencées depuis < 36 h, scoreboard ?dates= (jour = coup d'envoi − 6 h UTC), fini lu une fois ; sans info après le coup d'envoi → « résultat en attente ».
  20261017o (« à quelle heure les matchs se mettent avec le résultat, voir mettre le live », maquette validée « oui ») : DIRECT dans l'historique —
  `lvMaj` (window._g45TrOffLvMaj) : tendance non jugée commencée depuis < 5 h → scoreboard ESPN du championnat (site.api, sans date, relu chaque minute
  tant que #g45tr-off existe, 50 s mini par ligue) → O.lv[id] {st in|post, h, a, s, c = shortDetail, HT → mi-temps}. En cours : score rouge + minute,
  pari « ✅ gagnant si ça reste » / « ⏳ pas encore » (_g45TrSuivJuge) ; fini : score « provisoire », ✅ / ❌ provisoire. Sur l'appareil seulement :
  réussite, gain, calendrier et stats = robot de 10 h. ESPN = pas de quota (lecture depuis chaque appareil). Smoke (trLive, 55).
  Écarts entre Antoine et Cédric (14/10) : réglages par appareil (compétitions, jour, cote / proba mini), heure d'analyse, quota The Odds API (bet45 = 8 crédits / personne / jour).
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


## Anciens en-tête et § 8 de CLAUDE.md (mot pour mot, avant le découpage du 20/10/2026)

Lis ce fichier EN ENTIER avant toute action. Il remplace des semaines d'historique
que tu n'as pas. Mis à jour le 14/10/2026 (version déployée : 20261019c, même app.js sur gones45 et fenotte45).

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
- 20261022i (capture critères 4 saisons Rams « manque joueur », maquette maquette-criteres-joueurs-us « oui ») : onglet 👤 Joueurs des critères
  pour NFL / NHL / MLB / rugby (_g45CrHtml, bloc après q3) : index _g45JouCle (g45_jou_v2_, celui de « Analyser les joueurs » de Saisons)
  complété pour les matchs manquants (usCharger → _g45JouConstruire sur ces matchs, fusion, enregistrement ; bouton « 📥 Lire les feuilles
  de match des 4 saisons ») ; usVal(pid, m) : m[6] = n° de match (chargerHk / chargerRg, clés g45cr1_ → g45cr1u_, g45cr3_ → g45cr3u_),
  absent de idx.pres = non compté (rugby à XV : présence inconnue → compté) ; rôles _G45_JOU_TABLE, « Combien » c.jmin 1 / 2 / 3, 2-3
  joueurs chacun / au moins un. ⚠ NFL : un joueur sans aucune stat dans le match n'apparaît pas dans pres → match non compté. Smoke 81 (crUs).
- 20261022m (Sélection du jour sur PC : « grand vide noir au milieu » ; « le texte de droite au centre avec logo des clubs et à droite logo du
  championnat », maquette maquette-selection-logos « oui code tout ») : _g45TrSelHtml, carte en grille (.g45sel-c) — texte à gauche ·
  blasons des 2 clubs + heure / score + « ▾ détail » au centre (.g45sel-m) · logo du championnat à droite (.g45sel-l) ; ≤ 700 px : blasons +
  heure au-dessus, logo du championnat 40 px à droite. Logos : x.hl / x.al / J.lg du robot, sinon decoDe (lecture du scoreboard séparée de
  detail(x, juste)) ; pas de logo → initiales. Smoke selHier complété ; captures PC / téléphone vérifiées.
  20261022n (dessin d'Antoine sur la capture : « BES » à gauche du logo, « PAL » à droite, bloc au centre) : grille minmax(0,1fr) auto
  minmax(0,1fr) → bloc vraiment centré, nom du club à côté de son blason (.g45sel-n, 150 px, masqué sous 1000 px). Capture PC vérifiée.
- 20261022q (capture Saisons Lyon : « dans le calcul » décoché mais Over 0.5 / Éq O0.5 / H0 toujours affichés ; pastilles BTS · CS · WIN…
  dans « Mes stats » « pas sûr que ça soit sa place » → « OUI » aux deux) : _g45CursCles ne renvoie plus les lignes décochées (hors) →
  masquées partout (étiquettes, Stats sélectionnées, compteur, Cockpit), fin de la règle du 24/09 ; pastilles sorties du bandeau
  « Statistiques de la saison » → carte « ✅ Autres paris » juste au-dessus (foot loadTeamSaisons _stPil ; sports US _g45SaisonsGen _sgPil) ;
  « Mes stats » = Stats sélectionnées seules. Smoke 82.
- 20261022r (capture curseurs Rams « on rajoute quoi » → « rajoute », « tout ») : _g45SgCursHtml en onglets (repères pT / pH, g45_sgc_tab,
  g45SgCursTab) : 🏈 Points · ⚖️ Écart · ⏱️ Quart-temps / Périodes (m.lp / m.lc : 1er QT plus / moins de X (chips, e.qtL), gagne le 1er QT,
  marque au 1er QT, mène à la mi-temps, mène ET gagne, remontée, gagne la 2e mi-temps) · 🔁 Contexte (après victoire / défaite, à domicile
  après un déplacement, après bye ≥ 10 j (NFL) / ≥ 4 j, back-to-back NBA / NHL). Nouveaux onglets = stats seulement. Smoke 83 (sgQt).
  20261022s : 🎯 TD / FG (NFL) — SONDÉ PAR ANTOINE (summary 401872657 : scoringPlays[] type.abbreviation TD / FG, period.number, team.abbreviation) ;
  _g45TdFeuille (pur) → localStorage g45nfltd1_<event> = [TD dom, TD ext, FG dom, FG ext, 1er 'h'/'a', type du 1er], _g45TdFeuilles (4 à la fois,
  une fois par session, puis redessin) ; onglet : TD du match / de l'équipe, FG du match / de l'équipe (lignes au choix, e.tdM / tdE / fgM / fgE),
  marque en premier, 1er score TD / FG. Smoke 84 (sgTd).
  20261022u (« oui ») : bouton « ＋ Saison passée » des curseurs US (e.prev, g45SgPrev) : _g45SaisonsGen charge an − 1 (_g45CompetMatchs, mémoire
  _g45SgMem, une fois, redessin), _g45SgCalc + même filtre de lieu, séries écartées si la liste n'en a pas → TOUS les onglets des curseurs
  (« N matchs (dont M de la saison passée) ») ; Stats sélectionnées, compteur du combiné et liste des matchs restent sur la saison affichée.
