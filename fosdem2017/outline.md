# Outline

* Constat: il ya des librairies de graph dans tous les langages (networkx, Boost etc.) mais pas vraiment dans le JavaScript.
  - Faire un bref état de l'art des librairies de graph en JS.
  - Le problème du lien fort entre le modèle de graph et les librairies de rendu => difficile à utiliser de manière générique notamment côté serveur (montrer le cas de sigma.js & cytoscape). Mène à devoir recoder tout un écosystème de code pour les graphs (hits, pagerank) et c'est dommage.
  - Topo sur le SNA et les algos etc. les uses cases typiques (Alexis)
    1. Détection de communauté: Une implémentation douteuse de Louvain
    2. Force directed layouts: D3, sigma, Vivagraph... Toutes les implémentations sont affiliées à une lib de rendu (peu d'interopérabilité)
    3. Métriques (PageRank, Centrality, ...): Pas d'implémentation standard, quelques modules "rogues" qui traînent sur NPM
* Notre solution: une spécification de référence pour un objet de graph polyvalent en JS (pas une librairie).
  - Expliquer le pourquoi du choix: les graphs sont des complex beasts et il n'y a pas UNE meilleure manière de faire et ça dépend surtout de l'usage voulu. Donc là on permet à n'importe qui d'implémenter et de garder le bénéfice de tout le code consommant ce standard.
  - Le scope de cette spécification: analyse de graph, graph dirigés, non-dirigés, mixtes, simple ou parallèle, doit tenir en RAM, possible de l'utiliser pour du rendu.
* Montrer du code avec un exemple bateau pour avoir une idée de l'API (Alexis)
  1. Ajouter des noeuds / arcs
  2. Parcourir les données (pour créer une vue "table" des noeuds et des arcs)
  3. Importer un graphe JSON exporté depuis Gephi (les Misérables)
  4. Propager une valeur (genre un Erdös-number ou similaire)
* Montrer vite fait l'état actuel de la librairie standard et le fait que si qqun implémente les specs, tout ça il peut les utiliser sans heurts.
* Le design de l'API, et les choix:
  - #notjava: pas de classes pour les nodes & arcs.
  - Graph mixed par défaut, les sous-types comme performance hints (avec des messages le plus parlant pour l'utilisateur)
  - Les ids des arcs (chiant avec, auto-génération customizable et méthodes explicites quand on le connait)
  - Les throws et la notion de merge (comparaison avec structures classiques et networkx par exemple).
  - La possibilité de références comme clé et les idiomatismes JS + sérialisation.
  - Eventful pour les index et la possibilité de rendu incrémental => les attributes et les getter/setter + les iterateurs sur seulement des clés pour performance et forcer l'utilisateur (plus simple de concevoir ce sur quoi on itère).
* Technique de l'implémentation de référence:
  - On veut du temps constant sur la majorité de opérations => surcoût en RAM évidemment. Présenter la sparse matrix et le mode de stockage des voisins/stats (avec non duplication des sets) Map et Set ES6 rappel. Avoir du feedback là-dessus parce que bon...
  - Question du stockage des liens undirected (qui ont de fait une direction en interne).
* Roadmap pour le futur:
  - Sigma.js, la refonte et le "problème" de lier les informations de rendu au données du graphe, augmenter les performances (développer) (Alexis)
    1. Comme dit précédemment, sigma ne sera plus qu'un moteur de rendu avec un contrôleur d'interactions
    2. Un code plus moderne et plus simple à tester
    3. Guillaume est aujourd'hui le mainteneur de sigma en pratique, donc on migre sur une orga et on adopte un mode de fonctionnement plus communautaire (1 responsables, tout fonctionne par PR, on adopte une vraie politique de contribution)
  - Continuer la lib standard, Louvain, gexf, graphml centralities, shortest paths etc.
  - Les Hypergraphes
  - Une version immutable (basée sur immutable-js ou mori)
  - Les déclarations Typescript
