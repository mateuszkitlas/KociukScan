import React from 'react';
import { Page } from './types';
import { State, PageNr } from './state';
import { FaTrash, FaCopy } from 'react-icons/fa';
import md5 from "md5"
import { ModalYesNo } from './modal';
import { sidebarWidth } from './page';
import { ImageMiniature } from './Image';
import { zoomByDpi } from './logic';
import { hashToPng } from './utils';


interface P {
  s: State;
  page: Page;
}
interface S {
  showDelete: boolean;
}
export class MiniPage extends React.Component<P, S> {
  constructor(props: P) {
    super(props);
    this.state = { showDelete: false };
  }
  render = () => {
    const page = this.props.page;
    const s = this.props.s;
    const currentPage = { hash: page.hash, duplicated: page.duplicated };
    const duplicate: React.MouseEventHandler<HTMLDivElement> = async e => {
      e.stopPropagation();
      const duplicated = md5(Date.now().toString());
      const newPage = { ...page, duplicated };
      s.setRS(rs => {
        const pageNr = rs.book.pages.findIndex(PageNr.eq(page))
        return {
          ...rs,
          currentPage: { ...currentPage, duplicated },
          book: {
            ...rs.book,
            pages: [
              ...rs.book.pages.slice(0, pageNr + 1),
              newPage,
              ...rs.book.pages.slice(pageNr + 1),
            ]
          }
        }
      });
    }
    return (
      <div className={`page ${s.isCurrentPage(currentPage) ? "current" : ""}`}>
        <ImageMiniature
          original={{
            src: hashToPng(page.hash),
            scale: zoomByDpi(page.original.dpi),
            contrast: s.rs.book.color.contrast,
            rotate: page.rotate,
            width: page.original.width,
            height: page.original.height,
          }}
          crop={{
            width: s.rs.book.width,
            height: s.rs.book.height,
            x: page.x,
            y: page.y,
          }}
          width={100}
          height={100}
          onClick={() => s.setRS(rs => ({ ...rs, currentPage }))}
        >
          <div className="button" onClick={duplicate} title="duplicate"><FaCopy /></div>
          <div className="button" onClick={() => this.setState({ showDelete: true })} title="delete"><FaTrash /></div>
          <div className="button">{s.rs.book.pages.findIndex(p => p === page) + 1}</div>
          <ModalYesNo
            show={this.state.showDelete}
            onYes={() => {
              s.setRS(rs => ({ ...rs, currentPage: { hash: page.hash, currentPage } }));
              s.deletePage(page);
              this.setState({ showDelete: false });
            }}
            onNo={() => this.setState({ showDelete: false })}
            message="Are you sure?"
          ></ModalYesNo>
        </ImageMiniature>
      </div>
    )
  }
}

