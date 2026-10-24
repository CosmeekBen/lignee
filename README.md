# Lignées

Une vie au hasard, des choix qui traversent les générations. Simulation de vie en texte, en français, qui tourne dans le navigateur (JavaScript pur, aucune dépendance).

## Lancer

```
npm start        # sert dist/ sur http://localhost:8765
npm test         # tous les tests (logique, génération, interface)
npm run build    # HTML autonome dans build/lignees.html
```

## Ce que contient le jeu

- 197 pays, naissance pondérée par la natalité, simulation déterministe à partir d'un seed.
- Tests au D20 (avantage, désavantage, critiques) avec une probabilité affichée.
- 410 métiers dans 41 domaines, du plus précaire à la direction d'une multinationale, d'un laboratoire d'IA ou d'un pays.
- Parcours politique complet, réseaux criminels (entrée, ascension, sortie), nationalités et naturalisation.
- **Repères** : votre position en % face au monde, à votre pays, à votre âge et à votre métier (`dist/standing.js`).
- **Capital de lignée** : ce que chaque génération transmet (réseau, nom, études, patrimoine, mandats ; stigmates aussi). Une famille très pauvre part de presque rien, ses descendants s'élèvent (`dist/lineage.js`).
- Écran « Ma vie » : le personnage à gauche, les focus en haut au centre, les événements au centre (`dist/layout-ui.js`).

## Architecture

Les couches se superposent dans l'ordre de `dist/index.html` : `engine` → `world` → `depth` → `time` → `checks` → `occupations` → `society` → `standing` → `lineage` pour la logique, puis `app` → `depth-ui` → `time-ui` → `play-ui` → `society-ui` → `layout-ui` pour l'interface. Chaque couche enveloppe les fonctions de la précédente.

Les valeurs de pays, de salaires et de répartitions sont des hypothèses de jeu, pas des statistiques officielles.
