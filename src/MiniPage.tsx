import React from 'react';
import { Page } from './types';
import { State, PageNr } from './state';
import { FaTrash, FaCopy } from 'react-icons/fa';
import md5 from "md5"
import { ModalYesNo } from './modal';
import { ImageMiniature } from './Image';
import { hashToPng } from './utils';
import { scaleByPage } from './logic';

export const MiniPage = (props: { s: State; page: Page }) => {
  const page = props.page;
  const s = props.s;
  const properties = Page.properties(s.rs.book, page);
  const currentPage = { hash: page.hash, duplicated: page.duplicated };
  return (
    <div className={`page ${s.isCurrentPage(currentPage) ? "current" : ""}`}>
      <ImageMiniature
        original={{
          src: hashToPng(page.hash),
          scale: scaleByPage(page),
          contrast: s.rs.book.color.contrast,
          rotate: properties.rotate,
          width: page.original.width,
          height: page.original.height,
        }}
        crop={{
          width: s.rs.book.width,
          height: s.rs.book.height,
          x: properties.x,
          y: properties.y,
        }}
        width={100}
        height={100}
        onClick={() => s.setRS(rs => ({ ...rs, currentPage }))}
      >
        <div style={{ position: 'absolute', right: 0, width: 40 }}>
          <div style={{
            backgroundColor: page.properties ? "#445" : "#F00",
            borderRadius: "50%",
            width: 32,
            height: 24,
            textAlign: "center",
            paddingTop: 6,
          }}>{s.rs.book.pages.findIndex(p => p === page) + 1}</div>
        </div>
      </ImageMiniature>
    </div>
  )
};
