import React from 'react';
import './App.css';
import { renderFile } from './book';
import { State, StateContext, StateProvider } from './state';
import { buttons } from './toolbar';
import { page } from './page';

const changeTitle: ((s: State) => React.ChangeEventHandler<HTMLInputElement>) = (s: State) => (e) => {
  s.setBook({ ...s.rs.book, title: e.target.value });
}

const changeDelay: ((s: State) => React.ChangeEventHandler<HTMLInputElement>) = (s: State) => (e) => {
  const delay = parseInt(e.target.value);
  if (0 <= delay && delay < 20) {
    s.setBook({ ...s.rs.book, delay });
  }
}

const AppProvided = () => {
  const s = React.useContext(StateContext);
  return (
    <div id="App">
      <div id="toolbar" key="toolbar">
        <input key="title" type="text" value={s.rs.book.title} onChange={changeTitle(s)}/>
        {buttons(s)}
        <input key="delay" type="number" value={s.rs.book.delay} onChange={changeDelay(s)}/>
      </div>
      <div id="wrapper" key="wrapper">
        <div id="files" key="files">
          {s.rs.book.pages.map(renderFile(s))}
        </div>
        <div id="page" key="page">{page(s)}</div>
      </div>
    </div>
  )
};

const App = () => (<StateProvider><AppProvided /></StateProvider>);

export default App;
