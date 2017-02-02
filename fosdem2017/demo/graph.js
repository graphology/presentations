var Graph = require('graphology');

var graph = new Graph();
graph.addNode('Hello');
graph.addNode('World');
graph.addEdge('Hello', 'World');

module.exports = graph;
