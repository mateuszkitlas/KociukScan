import React from 'react';
import { File } from '../../common/book';
import { image } from './image';
import { State } from './state';

export const renderFile = (s: State) => (f: File) => {
  const deleteFile: React.MouseEventHandler<HTMLDivElement> = (event) => {
    event.stopPropagation();
    s.deleteFile(f.hash);
  }
  const show: React.MouseEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault();
    s.setRS({ ...s.rs, fileHash: f.hash });
  }
  return (
    <div className={`file ${f.hash === s.rs.fileHash ? "current" : ""}`} key={f.hash} onClick={show}>
      {image(f)}
      <div className="button" onClick={deleteFile}>delete</div>
    </div>
  )
}