import React from 'react';
import './App.css';
import { MiniPage } from './book';
import { PageNr, StateContext, StateProvider } from './state';
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
        {page(s)}
        <div id="pages" key="pages">
          {s.rs.book.pages.map(page => <MiniPage key={PageNr.key(page)} page={page} s={s}/>)}
        </div>
      </div>
    </div>
  )
};

const App = () => (<StateProvider><AppProvided /></StateProvider>);

export default App;
