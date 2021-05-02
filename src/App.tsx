import React from 'react';
import './App.css';
import { MiniPage } from './MiniPage';
import { PageNr, StateContext, StateProvider } from './state';
import { buttons } from './toolbar';
import { page, sidebarWidth } from './page';

const AppProvided = () => {
  const s = React.useContext(StateContext);
  s.initMiniatures();
  return (
    <div id="App">
      <div id="wrapper" key="wrapper">
        {page(s)}
        <div id="pages" key="pages" style={{ width: sidebarWidth - 10 }}>
          {s.rs.book.pages.map(page => <MiniPage key={PageNr.key(page)} page={page} s={s}/>)}
        </div>
      </div>
      <div id="toolbar" key="toolbar" style={{transform: "scale(1)"}}>
        {buttons(s)}
      </div>
    </div>
  )
};

const App = () => (<StateProvider><AppProvided /></StateProvider>);

export default App;
