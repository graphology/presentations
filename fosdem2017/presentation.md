# [Graphology](https://github.com/graphology)

### Designing a graph library for JavaScript

---

## Speakers

#### Alexis Jacomy ([@jacomyal](https://github.com/jacomyal))

*CTO of Matlo*

~

#### Guillaume Plique ([@Yomguithereal](https://github.com/Yomguithereal))

*Developer at SciencesPo's médialab*

---

## Observation

* In JavaScript, unlike most other languages, there is no obvious graph library to use.
* In python, for instance, you have [networkx](http://networkx.github.io/) etc.
* In C++, you have the [Boost](http://www.boost.org/doc/libs/1_63_0/libs/graph/doc/) library etc.
* Repeat with your favorite language...

---

## JavaScript State of the art

* [Cytoscape.js](http://js.cytoscape.org/) (tied to rendering)
* [Sigma.js](http://sigmajs.org/) (tied to rendering)

Todo: list the libraries & their caveats, add links

---

## What is the problem?

* Graph data structures are often tied to a rendering library.
* It is hard to use them on the server (hello, node.js)
* More generally, most library are not generic enough and targets really specific use cases.
* This means we are bound to implement popular SNA algorithms each time again, and again, and again...

---

## SNA Algorithms

* "Standard" Gephi SNA workflow:
  1. Compute **metrics**, map to node sizes
  2. Search for **communities**, map to node colors
  3. Run some **layout algorithm**
  4. ...and here is a network map!

---

## SNA Algorithms

* Metrics (Pagerank, HITS, centralities, ...)?
  - **No standard implementation** for quite standard algorithms

---

## SNA Algorithms

* Community detection?
  - Some [rogue](https://github.com/upphiminn/jLouvain) [implementations](https://github.com/haljin/js-louvain)
  - Some graph rendering libs [have their own](https://www.npmjs.com/package/ngraph.louvain)

---

## SNA Algorithms

* Force directed layouts?
  - Again, some [rogue implementations](http://getspringy.com/)
  - **Most** graph rendering libs [have](https://github.com/anvaka/ngraph.forcelayout) [their](https://github.com/d3/d3-force) [own](https://github.com/jacomyal/sigma.js/tree/master/plugins/sigma.layout.forceAtlas2)
  - Source algorithms are various

---

## Are we doomed?

---

Well, we certainly hope not.

---

<!-- .slide: data-background-image="./img/frontpage.png"-->

---

## Graphology

An Open Source specification for a robust & multipurpose `Graph` object in JavaScript.

A reference implementation.

A standard library of common algorithms.

---

## Multipurpose

* The graph can be **directed**, **undirected** or **mixed**.
* The graph can be **simple** or **multiple** (parallel edges).
* The graph will or will not accept **self-loops**.

---

## Use cases

* Graph analysis (compute metrics & indices...)
* Graph handling (build graphs from data, modify an already existing graph...)
* Data model for graph rendering (interactive graph visualization in the browser...)
* ...

---

## What we won't do

* Handle graph data that does not fit in RAM.

---

## A specification
## not a library

```js
import Graph from 'my-custom-graphology-implementation';
import {connectedComponents} from 'graphology-components';

const graph = new Graph(...);

// Still works!
const components = connectedComponents(graph);
```

Note: Why don't we just create & publish a library?

Graphs are complex beasts and there is no *perfect* way to implement them.

The reference implementation is built to handle well *most* cases.

But someone will always be able to implement it in a way that fits a certain use case better.

So, with a specification, anyone remain free to implement them the way they see fit (a C++ backed implementation for node.js, why not?).

Without losing the benefit of the standard library and without having to tediously rewrite all the needed algorithms.

---

## Concepts

* A node is represented by a key and can be described by attributes.
* An edge is represented by a key (that may be provided or generated) and can also be represented by attributes.
* That's it. That'a graph, no?

Todo: check the documentation about concepts to see if we missed something.

---

### Current state of the standard library

* [graphology-assertions](https://github.com/graphology/graphology-assertions#readme)
* [graphology-centrality](https://github.com/graphology/graphology-centrality#readme)
* [graphology-components](https://github.com/graphology/graphology-components#readme)
* [graphology-generators](https://github.com/graphology/graphology-generators#readme)
* [graphology-hits](https://github.com/graphology/graphology-hits#readme)
* [graphology-layout](https://github.com/graphology/graphology-layout#readme)
* [graphology-operators](https://github.com/graphology/graphology-operators#readme)
* [graphology-utils](https://github.com/graphology/graphology-utils#readme)

---

## API Design

What were the issue we encountered when designing the specifications & what decisions were taken to solve them?

Note: no particular order to the issues presented.

---

## #notjava

No class for nodes & edges. Only the `Graph` is a class on its own.

```js
// Nope
const node = new Node('John');

// Nope
const nodeInstance = graph.addNode('John');

// Node is just a key & some optional data
graph.addNode('John', {age: 34});
```

This is more idiomatic to JavaScript, saves up some memory and makes the graph the only object able to answer question about its structure.

---

## Default graph type

By default, the graph is mixed, accept self-loops but does not accept parallel edges.

```js
var graph = new Graph();
// Same as:
var graph = new Graph(null, {
  type: 'mixed',
  multi: false
});
```

Note: This means that the API is unified and will not be semantically different when you use a simple directed graph or a multi mixed graph.

With `networkx`, for instance, this is the contrary since each graph type will have a slightly different API.

---

## Typed constructors

However, the user still remains free to indicate the graph's type as a kind of performance hint.

```js
import {MultiDirectedGraph} from 'graphology';

// In this case, the implementation is able to optimize
// for this particular type of graph.
var graph = new MultiDirectedGraph();
```

---

## Useful error messages & hints

```js
var graph = new Graph();
graph.addNodesFrom(['John', 'Jack']);
graph.addEdge('John', 'Jack');

graph.addEdge('John', 'Jack');
// This will throw an error explaining to the user that
// this edge already exists in the graph but that he can use
// a `MultiGraph` if it's really what they intended to do.
```

Note: This also means that, even if the API is unified, the graph object should be able to correctly inform the user when he does something wrong or inconsistent.

---

## Edges & their keys (1/4)

An edge must have a key because this is the way the graph knows them & store them.

It's the only way to be able to target precise edges in a multi-graph, for instance, where the `{source,target}` combo is not enough.

---

## Edges & their keys (2/4)

**Problem**: we learned the hard way with sigma.js that it is very tedious to ask your users to generate keys for their edges.

Even more when the use case does not require it.

```js
// At the beginning the API to add an edge had to take a key:
graph.addEdge(key, source, target, [attributes]);

// Need to do silly things like this:
let i = 0;
edgesData.forEach(data => {
  graph.addEdge(i++, data.source, data.target);
});
```

---

## Edges & their keys (3/4)

**Solution**: the graph is able to generate edge keys on its own, and you can even customize it.

```js
// At the beginning, we added an explicit way to add
// an edge without a key
graph.addEdgeWithoutKey(source, target, [attributes]);

// But this was bonkers because people seldom needed keys
// so we reversed the logic:

// 1: key will be generated
graph.addEdge(source, target, [attributes]);

// 2: key is explicitly provided
graph.addEdgeWithKey(key, source, target, [attributes]);
```

---

## Edges & their keys (4/4)

**Fun fact**: currently, the reference implementation generates v4 uuids for the edges (you can only go so far with incremental ids...).

With a twist: ids are encoded in `base62` so you can easily copy-paste them and save up some space.

```python
# 110ec58a-a0f2-4ac4-8393-c866d813b8d1
# versus:
# 1vCowaraOzD5wzfJ9Avc0g
```

---

### To throw or not to throw? (1/2)

What should we do when, for instance, the user attempts to insert an already existing node into the graph?

```js
// Solution n°1: treat the graph like any data structure
graph.addNode('already-there'); // No-op
// Same than with a `Set`
set.add('already-there'); // No-op

// Solution n°2: throw and explain the node already exists
graph.addNode('already-there');
>>> Error
```

---

### To throw or not to throw? (2/2)

So we went for solution n°2 because when you add the question of attributes to the equation, it becomes really complex:

```js
graph.addNode('already-there', {hello: 'world'});
// What should we do? Ignore the data? Merge the data?
```

This felt too magical so we went with a combination of errors and `#.merge*` methods, *à la Cypher* to make this kind of behavior explicit:

```js
graph.mergeNode('already-there', {hello: 'world'});
```

---

### What is a key? (1/2)

What should we allow as a key? Only strings? Should we accept references like with an ES6 `Map`?

```js
// Stages of grief:
//   1) Let's allow references.
//   2) Let's build a GraphMap object.
//   3) Let's drop the f*** references, strings rulez
```

---

### What is a key? (2/2)

So we just dropped the idea of references as keys and went with JavaScript `Object`'s semantics for the following reasons:

1. It feels more like JavaScript.
2. It does not impose a burden on libraries and users to use ES6 maps and consider the fact that you could need to handle references as keys.
3. References are not straightforwardly serializable anyway! (*And graphs just love being serialized*)

---

### Events, attributes & iteration (1/6)

As the `Graph` object could be potentially be used with interactive rendering libraries, we need it to be eventful.

What's more, we need to have fine-grained events at the nodes & edges' level so we can know, for instance, when an attribute is updated.

---

### Events, attributes & iteration (2/6)

For example:

* When rendering, the fact that you know a node's color attribute was changed enables you to perform clever incremental rendering in some cases.
* When keeping indices, it becomes easy to synchronize your index even if you graph gets mutated.

---

### Events, attributes & iteration (3/6)

However, this simple fact means that we cannot let the user handle the attributes impolitely.

We need to have getters & setters (**#notjavabutalittlebitjavanevertheless**...).

Because we are not magically going to know what was mutated.

```js
// Really? Are you that insane?
setInterval(function() {
  haveYouChangedOhMyGraph();
}, 10);
```

---

### Events, attributes & iteration (4/6)

```js
// Want an attribute or attributes?
graph.getNodeAttribute(node, name);
graph.getNodeAttributes(node);

// Same for the edge, surprise!
graph.getEdgeAttribute(edge, name);

// Or if you despise keys
graph.getEdgeAttribute(source, target, name);

// Want to set an attribute?
graph.setNodeAttribute(node, name, value);
```

---

### Events, attributes & iteration (5/6)

But this doesn't mean we have to be stupid about it

```js
graph.addNode('John', {counter: 12});

// Nobody should have to write this to increment a counter
graph.setNodeAttribute(
  'John',
  'counter',
  graph.getNodeAttribute('John', 'counter') + 1
);

// #OOFP
graph.updateNodeAttribute('John', 'counter', x => x + 1);
```

---

### Events, attributes & iteration (6/6)

As a pleasant side effect, this also mean that iterations semantics are simpler since you will never be provided with attribute data. Only keys.

```js
graph.addNode('John', {age: 34});
graph.addNode('Suzy', {age: 35});

graph.nodes();
// Will output
['John', 'Suzy']
// And not something strange like
[{key: 'John', attributes: {age: 34}}, ...]
// nor
[['John', {age: 34}], ...]
```

---

### Labels & weights & ... ? (1/2)

Some libraries tend to give a special meaning to certain attributes because they are important in *theory*.

But why create new semantics for something which is exactly the same as attributes?

Most utilities in the standard library acknowledge this fact by hitting some attribute names by convention but let you customize the name if you need.

What's more, graphs often tend to foster completely different terminologies for the same things (nodes, vertices etc.)

---

### Labels & weights & ... ? (2/2)

An example:

```js
import hits from 'graphology-hits';

hits.assign(graph, {
  attributes: {
    weight: 'thisIsHowICallMyWeightsDontJudgeMe'
  }
});
```

---

## The reference implementation

---

### Constant time vs. memory

Since we can't know about our potential users' goals, we cannot aggressively optimize the reference implementation for a single use case.

Most common read operations should therefore run in constant time.

This obviously means some memory overhead.

---

### The actual data structure

Two ES6 `Map` objects to store nodes & edges (faster on recent engines & keeps order information).

Lazy indexation of neighborhoods (inintuitively, a multigraph might be faster for some use cases because you don't need to ensure the structure is coherent).

---

### Node map

<Key, information>

Information stored about the nodes:

* Degrees
* Attribute data
* Lazy neighbors by type

---

Neigbhors are stored as a map whose keys are neighbors' keys and values are `Set` objects of the related edges' keys.

To save memory, the sets of edges are not duplicated between two nodes. This means that the set of out edges from A to B is the same as the set of in edges from B to A.

---

```js
{
  A: {
    out: {
      B: Set{A->B},
      C: ...
    }
  },
  B: {
    in: {
      A: Set{A->B} // Same reference as above
    }
  }
}
```

---

### Edge map

<Key, information>

Information stored about the edges:

* Source
* Target
* Directedness
* Attribute data

---

I am sure someone can find better. #halp

---

### Last issue: the case of undirected edges

How to store undirected edges?

In the current implementation, undirected edges are stored using the given direction (`undirectedIn` & `undirectedOut`) but this does not affect the semantices of the API.

This means that two equivalent graphs may have a different memory representation because an implicit direction is kept.

---

### But is this really an issue?

Should we sort the source & target keys?

Should we hash the source & target keys?

---

Please do read the [code](https://github.com/graphology/graphology) for precisions, it is Open Source after all...

---

## Future roadmap

---

### Sigma.js

* Sigma as a rendering engine with *graphology* as a model
  - More specific functional scope
  - Less technical debt about SNA / layout algorithms

---

### Sigma.js

* Move from the "some guy's pet project" workflow:
  - More strict and efficient workflow (PRs, review, etc...)
  - An actual transparent roadmap
  - Move the project to a Github organisation (@Yomguithereal is way more invested in maintaining sigma than @jacomyal at the moment)

---

## Hypergraphs?

---

## Immutable version?

Easy to write using [`immutable-js`](https://facebook.github.io/immutable-js) or [`mori`](https://github.com/swannodette/mori).

---

## TypeScript & friends

It would be nice to have `TypeScript` or/and `flow` definitions.

---

## Thank you!

This is all but a *Work in Progress*.
