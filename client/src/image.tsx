import React from 'react';
import { Page } from '../../common/book';

export const imgPath = (p: Page, miniature: boolean) => `/tmp/${p.hash}${miniature ? "-miniature" : ""}.png`;
