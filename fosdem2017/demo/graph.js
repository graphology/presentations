var Graph = require('graphology');

var graph = new Graph(null, {multi: true});
graph.addNode('Hello');
graph.addNode('World');
graph.addNode('Alone');
graph.addEdge('Hello', 'World');

module.exports = graph;
