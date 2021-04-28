import React from 'react';
import './App.css';
import { renderFile } from './book';
import { StateContext, StateProvider } from './state';
import { buttons } from './toolbar';
import { page } from './page';

const AppProvided = () => {
  const s = React.useContext(StateContext);
  s.initMiniatures();
  return (
    <div id="App">
      <div id="toolbar" key="toolbar">
        {buttons(s)}
      </div>
      <div id="wrapper" key="wrapper">
        <div id="pages" key="pages">
          {s.rs.book.pages.map(renderFile(s))}
        </div>
        {page(s)}
      </div>
    </div>
  )
};

const App = () => (<StateProvider><AppProvided /></StateProvider>);

export default App;
