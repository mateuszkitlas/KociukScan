import React from 'react';
import './App.css';

function App() {
  return (
    <div id="App">
      <div id="topbar">
        <input type="text" name="Wonder Valley"/>
        <div className="button">scan one page</div>
        <div className="button">
          scan many pages with delay
        </div>
      </div>
      <div id="wrapper">
        <div>
          <div id="files">asxasx
          </div>
          <div id="file">
            file
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
