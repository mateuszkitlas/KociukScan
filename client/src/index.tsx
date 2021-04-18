import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { Book } from '../../common/book';

const book: Book = {
  title: "Wonder Valley",
  fspath: "dscdsc",
  delay: 5,
  files: [
    {
      path: "/home/mati/Desktop/125879401_1667328080106074_1718013829788408924_n.jpg",
      pages: [
        { crop: { start: { x: 0, y: 0}, end: { x: 100, y: 100 } }, rotate: 0, orientation: "left", nr: 1 }
      ]
    },
    {
      path: "aaaaff",
      pages: [
        { crop: { start: { x: 0, y: 0}, end: { x: 100, y: 100 } }, rotate: 0, orientation: "left", nr: 2 }
      ]
    }
  ],
};

ReactDOM.render(
  <React.StrictMode>
    {App(book)}
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
