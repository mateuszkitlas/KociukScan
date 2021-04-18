import React from 'react';
import { File } from '../../common/book';

export const renderFile = (f: File) => (
  <div className="file">
    <img src={f.path} alt={""}/>
  </div>
)