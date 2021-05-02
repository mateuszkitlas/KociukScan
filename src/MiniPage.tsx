import React from 'react';
import { Page } from './types';
import { State, PageNr } from './state';
import { FaTrash, FaCopy } from 'react-icons/fa';
import md5 from "md5"
import { ModalYesNo } from './modal';
import { sidebarWidth } from './page';


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
      await s.createMiniature(newPage);
    }
    const miniature = s.rs.miniatures
      ? s.rs.miniatures.get(JSON.stringify(PageNr.get(page)))
      : undefined;
    return (
      <div
        className={`page ${s.isCurrentPage(page) ? "current" : ""}`}
        onClick={() => s.setRS(rs => ({ ...rs, currentPage }))}
        style={{
          backgroundRepeat: "no-repeat",
          backgroundImage: miniature ? `url("data:image/png;base64,${miniature}")` : undefined,
          width: sidebarWidth - 10,
          backgroundSize: "contain",
          height: sidebarWidth - 40,
        }}
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
      </div>
    )
  }
}

