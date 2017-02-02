const React = require('react');
const blessed = require('blessed');
const { render } = require('react-blessed');

let graph = require('./graph.js');

// App component
function App() {
  return (
    <element>
      <box
        top="left"
        width="100%"
        height="10%"
        border={{ type: 'line' }}
        style={{ border: { fg: 'blue' } }}
      >
        <text
          top={ 0 }
          left={ 1 }
        >
          Order of the graph: { graph.order }
        </text>
        <text
          top={ 1 }
          left={ 1 }
        >
          Size of the graph: { graph.size }
        </text>
      </box>

      <text top="14%">
        Nodes (todo):
      </text>
      <box
        top="15%"
        width="100%"
        height="40%"
        border={{ type: 'line' }}
        style={{ border: { fg: 'blue' } }}
      />

      <text top="59%">
        Edges (todo):
      </text>
      <box
        top="60%"
        width="100%"
        height="40%"
        border={{ type: 'line' }}
        style={{ border: { fg: 'blue' } }}
      />
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
