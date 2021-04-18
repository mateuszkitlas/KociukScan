import React from 'react';
import './App.css';
import { renderFile } from './book';
import { Book } from '../../common/book';

const App = (book: Book) => (
  <div id="App">
    <div id="topbar">
      <input type="text" name={book.title}/>
      <div className="button">scan one page</div>
      <div className="button">
        scan many pages with delay
      </div>
    </div>
    <div id="wrapper">
      <div>
        <div id="files">
          {book.files.map(renderFile)}
        </div>
        <div id="file">
          file
        </div>
      </div>
    </div>
  </div>
);

export default App;
