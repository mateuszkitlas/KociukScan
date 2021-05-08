import React from 'react';
import './App.css';
import { MiniPage } from './MiniPage';
import { PageNr, State, StateContext, StateProvider } from './state';
import { buttons } from './toolbar';
import { page } from './page';
import { mainPageSize, offset } from './offset';

class X extends React.Component<{ s: State }, { dnd?: boolean }> {
  constructor(props: { s: State }) {
    super(props)
    this.state = {};
  }
  render = () => {
    const s = this.props.s;
    return <div>
      <div id="wrapper" key="wrapper">
        {page(s)}
        <div id="pages" key="pages" style={{ width: offset.x, height: mainPageSize().height }}>
          {s.rs.book.pages.map(page => <MiniPage key={PageNr.key(page)} page={page} s={s}/>)}
        </div>
      </div>
      <div id="toolbar" key="toolbar" style={{ transform: "scale(1)", paddingLeft: 5 }}>
        {buttons(s)}
      </div>
      {s.rs.modals.map(m => m.node)}
    </div>
  }
}

const AppProvided = () => <div id="App"><X s={React.useContext(StateContext)}/></div>
const App = () => (<StateProvider><AppProvided /></StateProvider>);

export default App;
