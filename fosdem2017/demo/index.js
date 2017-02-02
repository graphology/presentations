const React = require('react'),
      blessed = require('blessed'),
      {render} = require('react-blessed');

let graph = require('./graph.js');

// App component
function App() {

  let nodeRows = graph.nodes().map(node => {
    return [node];
  });

  nodeRows = [['Key', 'Weight']]
    .concat(nodeRows);

  let edgeRows = graph.edges().map(edge => {
    return graph.extremities(edge)
  });

  edgeRows = [['Source', 'Target']]
    .concat(edgeRows);

  return (
    <element>
      <box top="left"
           width="100%"
           height="10%"
           border={{type: 'line'}}
           style={{border: {fg: 'blue'}}}>
        <text top={0}>
          Order of the graph: {graph.order}
        </text>
        <text top={1}>
          Size of the graph: {graph.size}
        </text>
      </box>
      <text top="10%">
        Nodes:
      </text>
      <listtable top="15%"
             width="100%"
             height="40%"
             scrollable={true}
             scrollbar={true}
             mouse={true}
             border={{type: 'line'}}
             style={{border: {fg: 'blue'}}}
             rows={nodeRows} />
      <text top="55%">
        Edges:
      </text>
      <listtable top="60%"
             width="100%"
             height="40%"
             scrollable={true}
             scrollbar={true}
             mouse={true}
             border={{type: 'line'}}
             style={{border: {fg: 'blue'}}}
             rows={edgeRows} />
    </element>
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
