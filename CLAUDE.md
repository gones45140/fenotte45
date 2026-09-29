# CLAUDE.md — GONES45 / BET45

Lis ce fichier EN ENTIER avant toute action. Il remplace des semaines d'historique
que tu n'as pas. Mis à jour le 29/09/2026 (version déployée : 20260929r, même app.js sur gones45 et fenotte45).

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
