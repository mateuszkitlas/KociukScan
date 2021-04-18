import React from 'react';
import './App.css';
import { renderFile } from './book';
import { httpRequest } from './utils';
import { State, StateContext, StateProvider } from './state';

const scanOnePage: ((s: State) => React.MouseEventHandler<HTMLDivElement>) = (s: State) => async (_event) => {
  await httpRequest({ kind: "scan" });
}

const AppProvided = () => {
  const s = React.useContext(StateContext);
  return (
    <div id="App">
      <div id="topbar">
        <input type="text" name={s.rs.book.title}/>
        <div className="button" onClick={scanOnePage(s)}>scan one page</div>
        <div className="button">
          scan many pages with delay
        </div>
      </div>
      <div id="wrapper">
        <div>
          <div id="files">{s.rs.book.files.map(renderFile)}</div>
          <div id="file">
            file
          </div>
        </div>
      </div>
    </div>
  )
};

const App = () => (<StateProvider><AppProvided /></StateProvider>);

export default App;
