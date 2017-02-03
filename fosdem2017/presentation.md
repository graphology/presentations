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

* In JavaScript, unlike other languages, there is no *go-to* graph library.
* In python, for instance, you have networkx
* In C, you have the Boost library
* ...

---

## JavaScript State of the art

* Cytoscape.js
* Sigma.js

Todo: list the libraries & their caveats, add links

---

## What is the problem?

* Graph data structures are often tied to a rendering library.
* It is hard to use them on the server (hello, node.js)
* More generally, most library are not generic enough and targets really specific use cases.
* This means we are bound to implement popular algorithms each time (HITS, shortest paths etc.) again, and again, and again...

---

## SNA Algorithms

Todo: Alexis, fill this up.

---

## Are we doomed?

---

Well, we certainly hope not.

---

## The graphology specifications

Todo: put a screenshot.

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

## Objectives

* Graph analysis (compute metrics & indices...)
* Graph handling (build graphs from data, modify an already existing graph...)
* Graph rendering (interactive graph visualization in the browser...)
* ...

---

## What we won't do

* Handle graph data that does not fit in RAM.

---

### A specification, not a library (1/2)

Why don't we just create & publish a library?

Graphs are complex beasts and there is no *perfect* way to implement them.

The reference implementation is built to handle well *most* cases.

But someone will always be able to implement it in a way that fits a certain use case better.

---

### A specification, not a library (2/2)

So, with a specification, anyone remain free to implement them the way they see fit.

Without losing the benefit of the standard library and without having to tediously rewrite all the needed algorithms.

---

```js
import Graph from 'my-custom-graphology-implementation';
import {connectedComponents} from 'graphology-components';

const graph = new Graph(...);

// Still works!
const components = connectedComponents(graph);
```

---

## Concepts

* A node is represented by a key and can be described by attributes.
* An edge is represented by a key (that may be provided or generated) and can also be represented by attributes.
* That's it. That'a graph, no?

Todo: check the documentation about concepts to see if we missed something.

---

## Demo

Todo: show some code + Alexis' demo

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

## Default graph type (1/4)

By default, the graph is mixed, accept self-loops but does not accept parallel edges.

```js
var graph = new Graph();
// Same as:
var graph = new Graph(null, {
  type: 'mixed',
  multi: false
});
```

---

## Default graph type (2/4)

This means that the API is unified and will not be semantically different when you use a simple directed graph or a multi mixed graph.

With `networkx`, for instance, this is the contrary since each graph type will have a slightly different API.

Todo: find an example in networkx

---

## Default graph type (3/4)

However, the user still remains free to indicate the graph's type as a kind of performance hint.

```js
import {MultiDirectedGraph} from 'graphology';

// In this case, the implementation is able to optimize
// for this particular type of graph.
var graph = new MultiDirectedGraph();
```

---

## Default graph type (4/4)

This also means that, even if the API is unified, the graph object should be able to correctly inform the user when he does something wrong or inconsistent.

```js
var graph = new Graph();
graph.addNodesFrom(['John', 'Jack']);
graph.addEdge('John', 'Jack');

graph.addEdge('John', 'Jack');
// This will throw an error explaining to the user that
// this edge already exists in the graph but that he can use
// a `MultiGraph` if it's really what they intended to do.
```

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

**Solution**: the graph is able to generate edge ids on its own, and you can even customize how it will do it.

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
