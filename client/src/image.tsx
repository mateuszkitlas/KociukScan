import React from 'react';
import { File } from '../../common/book';

export const image = (f: File) => (<img src={`/tmp/${f.hash}.png`} alt={""}/>)
