const React = require('react'),
      blessed = require('blessed'),
      {render} = require('react-blessed');

let graph = require('./graph.js');

// App component
function App() {
  return (
    <box top="center"
         left="center"
         width="50%"
         height="50%"
         border={{type: 'line'}}
         style={{border: {fg: 'blue'}}}>
      <text top={0}>
        Number of nodes: {graph.order}
      </text>
      <text top={1}>
        Number of edges: {graph.size}
      </text>
      <text top={2}>
        Nodes: {graph.nodes().join(', ')}
      </text>
      <text top={3}>
        Edges: {graph.edges().map(edge => graph.extremities(edge).join('=>')).join(', ')}
      </text>
    </box>
  );
}

// Creating our screen
const screen = blessed.screen({
  autoPadding: true,
  smartCSR: true,
  title: 'graphology demo'
});

// Adding a way to quit the program
screen.key(['escape', 'q', 'C-c'], function(ch, key) {
  return process.exit(0);
});

// Rendering the React app using our screen
function renderApp() {
  render(<App />, screen);
}

if (module.hot) {
  module.hot.accept();

  module.hot.accept('./graph.js', () => {
    graph = require('./graph.js');
    renderApp();
  });
}

renderApp();
