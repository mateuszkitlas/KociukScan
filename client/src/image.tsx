import React from 'react';
import { Page } from '../../common/book';

export const imgPath = (p: Page) => `/tmp/${p.hash}.png`;

export const image = (p: Page) => (<img src={imgPath(p)} alt={""} key={p.hash}/>)
