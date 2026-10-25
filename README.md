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
- **Cohérence études et métiers** (`dist/education.js`) : accès à l'école, au collège, au lycée et au supérieur selon le pays, le foyer et le sexe, avec les statistiques affichées dans chaque décision ; vouloir ou non continuer ; filières ; 24 formations (écoles d'ingénieurs, médecine, apprentissage, bootcamp, école de la deuxième chance…) avec admission, coût, durée, rythme et financement. Un métier exige désormais une scolarité et un domaine d'études, ou de l'expérience, ou une passion développée.
- **Passions** (`dist/passions.js`) : 43 passions (boxe, football, musique, dessin, cuisine, programmation…), à pratiquer avec du temps et de l'argent. Elles montent en niveau et ouvrent 132 métiers, de « boxeur semi-professionnel » à « légende de la boxe ».
- **Imprévus** (`dist/fate.js`) : loto, héritage, accident de la route, infarctus, cancer, maladies tropicales, catastrophes, licenciement… avec des probabilités qui dépendent du pays (soins, routes, risques naturels), de ce qu'on possède (voiture, logement, assurance) et de l'âge. Séquelles, handicaps, soins ou non. Un rythme est imposé : jamais deux de suite, au plus 9 par vie.
- **Choix intimes et luttes** (`dist/life-choices.js`) : envie d'une relation, attirance, en parler ou non ; mariage imposé, école arrêtée, reprise de l'affaire familiale, service militaire, salaire non payé, discrimination, corruption, expulsion, héritage disputé… On accepte, on résiste, on négocie, on temporise ou on fuit, et la famille accepte ou non.
- **Noms cohérents** (`dist/names.js`) : environ 55 ensembles culturels couvrent les 197 pays (parents, amis, partenaires, enfants).
- **Moins de répétitions** : plafonds par décision et par vie, délais minimaux.
- **Suites des choix** (`dist/threads.js`) : un animal recueilli (espèce, couleur, nom) grandit, tombe malade, meurt ; un premier amour dure ou s'arrête ; un·e ami·e de la cour, un échange à l'étranger, une équipe de quartier, un·e enseignant·e ou un petit boulot d'été ont des suites quelques années plus tard. Chaque choix écrit une phrase précise dans le journal.
- **Débuts variés** (`dist/variants.js`) : 24 naissances, 4 premières sorties, 7 rentrées, 5 éveils de passion et 4 adolescences différentes, selon le pays, le foyer et le milieu.
- **Causes de décès** : chaque mort a une cause plausible (âge, pays, soins, santé).
- Écran « Ma vie » : le personnage à gauche, les focus en haut au centre, les événements au centre (`dist/layout-ui.js`).

## Architecture

Les couches se superposent dans l'ordre de `dist/index.html` : `engine` → `world` → `depth` → `time` → `checks` → `occupations` → `society` → `standing` → `lineage` → `names` → `education` → `fate` → `passions` → `life-choices` → `milestones` → `achievements` pour la logique, puis `app` → `depth-ui` → `time-ui` → `play-ui` → `society-ui` → `layout-ui` pour l'interface. Chaque couche enveloppe les fonctions de la précédente.

Les valeurs de pays, de salaires et de répartitions sont des hypothèses de jeu, pas des statistiques officielles.
