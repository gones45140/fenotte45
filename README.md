# FENOTTE45 - Dashboard Responsive 📊

Dashboard professionnel de gestion de bankroll et statistiques de paris sportifs avec graphiques temps réel.

## 🎯 Fonctionnalités

### 📊 Tableau de Bord Principal
- **4 Cartes Stats** - Capital, Bénéfice, Winrate, ROI
- **Indicateur de Risque** - Visualisation du % de bankroll utilisé
- **Mise à Jour Temps Réel** - Auto-refresh toutes les 30 secondes

### 📈 4 Graphiques Interactifs
1. **Évolution du Profit** (Line Chart)
   - Suivi cumulé des gains/pertes
   - Points interactifs avec tooltips
   - Courbe lissée pour meilleure lisibilité

2. **Répartition Bookmakers** (Doughnut Chart)
   - Performance de chaque bookmaker
   - Identification des meilleurs/pires performers
   - Légende interactive

3. **Performance Unités** (Horizontal Bar Chart)
   - Winrate par équipe/unité
   - Code couleur (vert/jaune/rouge)
   - Comparaison rapide

4. **ROI par Type** (Radar Chart)
   - Vue 360° des types de paris
   - Visualisation scientifique
   - Identification des meilleurs types

### 📋 Tableaux
- **Unités Actives** - Paris, Winrate, Profit
- **Bookmakers** - Solde actuel et profit total

### 🎛️ Contrôles
- 🔽 **Charger Données Démo** - 8 paris d'exemple pour tester
- 🔄 **Actualiser** - Force mise à jour manuelle
- 💾 **Exporter** - Sauvegarde JSON du portefeuille

## 📱 Responsive Design

### Breakpoints
```
📱 Mobile (320px - 767px)     → 1 colonne
📱 Tablette (768px - 1023px)  → 2 colonnes
💻 Desktop (1024px - 1399px)  → 2-4 colonnes
🖥️ Grand Desktop (1400px+)    → 4 colonnes
```

### Caractéristiques
- ✅ Touch-friendly sur mobile
- ✅ Graphiques adaptatifs
- ✅ Navigation fluide
- ✅ Scrollbar personnalisée

## 🚀 Utilisation

### Installation
```bash
# 1. Cloner le repository
git clone https://github.com/gones45140/fenotte45.git

# 2. Ouvrir dans le navigateur
open index.html
```

### Premiers Pas
1. **Ouvrir la page** → `index.html`
2. **Cliquer "Charger Données Démo"** → 8 paris d'exemple
3. **Explorer les graphiques** → Cliquer/hover pour détails
4. **Exporter vos données** → Format JSON

### Intégration Données Réelles

```javascript
// Dans app.js, remplacer loadDemoData() par vos données
appState.bets = [
    {
        id: 1,
        unit: 'OL',
        target: 'OL vs PSG',
        type: 'Victoire',
        bookmaker: 'winamax',
        mise: 10,
        cote: 2.5,
        result: true,
        date: new Date()
    }
    // ... plus de paris
];
```

## 📊 Structure des Données

### État (appState)
```javascript
{
    bookmakers: {
        'winamax': 500,
        'bet365': 300,
        'betclic': 200
    },
    units: [
        { name: 'OL', level: 1, color: '#1e40af' },
        { name: 'PSG', level: 2, color: '#da0812' }
    ],
    bets: [
        {
            id: 1,
            unit: 'OL',
            target: 'OL vs PSG',
            type: 'Victoire',
            bookmaker: 'winamax',
            mise: 10,
            cote: 2.5,
            result: true,
            date: new Date()
        }
    ]
}
```

## 🎨 Palette Couleurs

```css
--bg-dark: #0f172a
--accent-cyan: #22d3ee
--accent-blue: #1e40af
--accent-red: #da0812
--accent-green: #22c55e
--accent-yellow: #eab308
```

## 🔧 Technologies

- **HTML5** - Structure sémantique
- **CSS3** - Responsive design, animations
- **JavaScript (ES6+)** - Logique applicative
- **Chart.js 4.4** - Graphiques interactifs
- **Font Awesome 6.4** - Icônes

## 📈 Calculs & Métriques

### Statistiques
- **Capital Total** - Somme de tous les bookmakers
- **Bénéfice** - Profit total (positif/négatif)
- **Winrate** - % de paris gagnants
- **ROI** - (Profit / Mises Totales) × 100
- **Risque Bankroll** - % de capital utilisé

### Niveaux de Risque
```
🟢 OPTIMAL      : 0-20% utilisé
🟡 MODÉRÉ       : 20-30% utilisé
🟡 PRUDENT      : 30-50% utilisé
🔴 CRITIQUE     : 50%+ utilisé
```

## 🔒 Stockage Local

Les données sont stockées automatiquement dans `localStorage`:
- Clé: `fenotte45_state`
- Format: JSON
- Persistance: Jusqu'à suppression manuelle

## 🐛 Dépannage

### Les graphiques ne s'affichent pas
- Vérifier la console (F12)
- Reload la page
- Cliquer "Charger Données Démo"

### Les données ne se sauvegardent pas
- Vérifier que localStorage est activé
- Vérifier l'espace disponible (généralement 5-10MB)

### Performance lente
- Fermer d'autres onglets/apps
- Limiter le nombre de paris (max 1000 recommandé)

## 📝 Fichiers

```
fenotte45/
├── index.html          # Structure principale
├── styles.css          # Styles responsives
├── app.js             # Logique JavaScript
└── README.md          # Documentation
```

## 📞 Support & Améliorations

Pour toute question ou suggestion:
- 📧 Email: touraine.antoine@orange.fr
- 🐙 GitHub: https://github.com/gones45140/fenotte45

## 📜 Licence

Projet personnel - Tous droits réservés © 2026

---

**Dernière mise à jour:** 14/05/2026
**Version:** 1.0.0 - Release Initiale
