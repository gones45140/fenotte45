# CLAUDE.md — GONES45 / BET45

Lis ce fichier EN ENTIER avant toute action. Il remplace des semaines d'historique
que tu n'as pas. Mis à jour le 01/10/2026 (version déployée : 20261002k, même app.js sur gones45 et fenotte45).

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
  filtre joueur NBA avec ligne : `_g45NbaPFBarre` / `_g45NbaPFCoul` / `_g45NbaPFLigne`.
- Moteur des curseurs de marchés : `_g45MarcheEval`.
- Onglet Compo : `loadTeamCompo` (DEUX copies) ; sports US → `_g45CompoEffectif` ;
  NBA → `_g45NbaTableau` (vues Saison / 10 / 5 / Match).
- Fenêtre de match : `_renderGenericDetail` ; stats d'équipe US `_g45UsTeamStats`
  (couleurs via `g45CoulPaire` + `_g45CoulTexte`) ; feuille des joueurs NBA `_g45NbaFeuilleHtml`.
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
- PWA gones45 : index.html déclare manifest.json (icônes locales icon-192/512.png,
  display standalone). fenotte45 : manifeste PAS encore déclaré dans indexfenotte.html.
- Fenêtre de match hors foot (`_renderGenericDetail`) : ligne stade + ville sous le score
  (gameInfo.venue, repli comp.venue), comme la fenêtre foot.
- Saisons (`_g45SaisonsGen`) : « Points par match » et « Stats clés » calculés sur `sf`
  (issu de `liste`, filtrée lieu/repos/phase) et non plus sur `st` (toute la saison).
  Filtre phase `_g45SgPhase` ('tout'|'reg'|'po') sur `m.po`.
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
KBO : CONFIRMÉ « c'est bon » par Antoine (01/10, worker host=mykbo déployé) ; états
  « en cours » / annulé d'un match toujours NON vus.
RÉGLÉ (worker, 01/10) : cron « exceededCpu » (cpuTimeMs 10) à CHAQUE passage — vu par Antoine dans Observability.
  Correction livrée (fichier worker complet) : calendriers COMPACTS clé scht: {ts, e:[{id, d}]} (`schedPoser` /
  `schedLire`) au lieu de décoder le calendrier ESPN complet 2 × N + 4 fois par passage ; runRappelCron sort avant Intl
  hors 6-11 h UTC. CONFIRMÉ par Antoine (Observability 01/10) : dernier cron rouge vers 14:47, ensuite */5 en « info ».
À VOIR (en attente d'un retour d'Antoine) :
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
