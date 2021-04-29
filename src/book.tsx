import React from 'react';
import { Page } from './types';
import { State, PageNr } from './state';
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
  const show: React.MouseEventHandler<HTMLDivElement> = e => {
    e.preventDefault();
    s.setRS(rs => ({ ...rs, currentPage }));
  }
  const key = (n: string) => n + page.hash + page.duplicated;
  
  const miniature = s.rs.miniatures
    ? s.rs.miniatures.get(JSON.stringify(PageNr.get(page)))
    : undefined;
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
      <div className="button" onClick={duplicate} key={key("duplicate")} title="duplicate"><FaCopy /></div>
      <div className="button" onClick={del} key={key("del")} title="delete"><FaTrash /></div>
    </div>
  )
}