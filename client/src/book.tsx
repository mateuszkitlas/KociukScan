import React from 'react';
import { File } from '../../common/book';

export const renderFile = (f: File) => (
  <div className="file" key={f.hash}>
    <img src={f.path} alt={""}/>
  </div>
)