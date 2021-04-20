import React from 'react';
import { Page } from '../../common/book';
import { image } from './image';
import { State } from './state';

export const renderFile = (s: State) => (p: Page) => {
  const deleteFile: React.MouseEventHandler<HTMLDivElement> = (event) => {
    event.stopPropagation();
    s.deletePage(p.hash);
  }
  const show: React.MouseEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault();
    s.setRS({ ...s.rs, pageHash: p.hash });
  }
  return (
    <div className={`file ${p.hash === s.rs.pageHash ? "current" : ""}`} key={p.hash} onClick={show}>
      {image(p)}
      <div className="button" onClick={deleteFile} key="delete">delete</div>
    </div>
  )
}