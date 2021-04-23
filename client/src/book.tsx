import React from 'react';
import { Page } from '../../common/book';
import { imgPath } from './image';
import { State } from './state';
import { FaTrash, FaCopy } from 'react-icons/fa';

export const renderFile = (s: State) => (p: Page) => {
  const deleteFile: React.MouseEventHandler<HTMLDivElement> = e => {
    e.stopPropagation();
    s.setRS(rs => ({ ...rs, pageHash: p.hash }));
    const res = window.confirm("Are you sure?");
    if (res) {
      s.deletePage(p.hash);
    }
  }
  const show: React.MouseEventHandler<HTMLDivElement> = e => {
    e.preventDefault();
    s.setRS(rs => ({ ...rs, pageHash: p.hash }));
  }
  return (
    <div
      className={`page ${p.hash === s.rs.pageHash ? "current" : ""}`}
      key={p.hash}
      onClick={show}
      style={{
        backgroundImage: `url("${imgPath(p, true)}")`,
        backgroundRepeat: "no-repeat",
      }}
    >
      
      <div className="button" onClick={deleteFile} key="delete"><FaCopy /></div>
      <div className="button" onClick={deleteFile} key="delete"><FaTrash /></div>
    </div>
  )
}