import React from 'react';
import { File } from '../../common/book';

export const imgPath = (f: File) => `/tmp/${f.hash}.png`;

export const image = (f: File) => (<img src={imgPath(f)} alt={""}/>)
