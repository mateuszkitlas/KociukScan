import React from 'react';
import { File } from '../../common/book';
import { State } from './state';

export const renderFile = (s: State) => (f: File) => {
  const deleteFile: React.MouseEventHandler<HTMLDivElement> = (_event) => {
    s.deleteFile(f.hash);
  }
  return (
    <div className="file" key={f.hash}>
      <img src={`/tmp/${f.hash}.png`} alt={""}/>
      <div className="button" onClick={deleteFile}>delete</div>
    </div>
  )
}