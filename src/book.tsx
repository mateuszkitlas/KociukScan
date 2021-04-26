import React from 'react';
import { Page } from './types';
import { State, eqPage } from './state';
import { FaTrash, FaCopy } from 'react-icons/fa';
import md5 from "md5"

export const renderFile = (s: State) => (page: Page) => {
  const currentPage = { hash: page.hash, duplicated: page.duplicated };
  
  const del: React.MouseEventHandler<HTMLDivElement> = e => {
    e.stopPropagation();
    s.setRS(rs => ({ ...rs, currentPage: { hash: page.hash, currentPage } }));
    const res = window.confirm("Are you sure?");
    if (res) {
      s.deletePage(page);
    }
  }
  const duplicate: React.MouseEventHandler<HTMLDivElement> = e => {
    e.stopPropagation();
    const duplicated = md5(Date.now().toString());
    s.setRS(rs => {
      const pageNr = rs.book.pages.findIndex(eqPage)
      return {
        ...rs,
        currentPage: { ...currentPage, duplicated },
        book: {
          ...rs.book,
          pages: [
            ...rs.book.pages.slice(0, pageNr),
            page,
            { ...page, duplicated },
            ...rs.book.pages.slice(pageNr + 1),
          ]
        }
      }
    });
  }
  const show: React.MouseEventHandler<HTMLDivElement> = e => {
    e.preventDefault();
    s.setRS(rs => ({ ...rs, currentPage }));
  }
  const key = (n: string) => n + page.hash + page.duplicated;
  
  const miniature = (s.rs.miniatures || {})[page.hash];
  const style = {
    backgroundRepeat: "no-repeat",
    backgroundImage: miniature ? `url("data:image/png;base64,${miniature}")` : undefined,
  } as const;
  
  return (
    <div
      className={`page ${s.isCurrentPage(page) ? "current" : ""}`}
      key={key("div")}
      onClick={show}
      style={style}
    >
      <div className="button" onClick={duplicate} key={key("duplicate")}><FaCopy /></div>
      <div className="button" onClick={del} key={key("del")}><FaTrash /></div>
    </div>
  )
}