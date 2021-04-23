import React from 'react';
import { State } from './state';
import { imgPath } from "./image";
import { Page } from "../../common/book"
import { marginX, marginY, zoomByDpi } from "./logic"

const sidebarWidth = 170;
const toolbarHeight = 60;

const getPixelsByAngle = (x: number, y: number, width: number, height: number, angle: number) => {
  const radians = angle * Math.PI / 180;
  return [
    //upper left
    {
      x: x + width/2 + width/-2 * Math.cos(radians) - height/-2 * Math.sin(radians),
      y: y + height/2 + width/-2 * Math.sin(radians) + height/-2 * Math.cos(radians)
    },
    //upper right
    {
      x: x + width/2 + width/2 * Math.cos(radians) - height/-2 * Math.sin(radians),
      y: y + height/2 + width/2 * Math.sin(radians) + height/-2 * Math.cos(radians)
    },
    //bottom right
    {
      x: x + width/2 + width/2 * Math.cos(radians) - height/2 * Math.sin(radians),
      y: y + height/2 + width/2 * Math.sin(radians) + height/2 * Math.cos(radians)
    },
    //bottom left
    {
      x: x + width/2 + width/-2 * Math.cos(radians) - height/2 * Math.sin(radians),
      y: y + height/2 + width/-2 * Math.sin(radians) + height/2 * Math.cos(radians)
    },
  ];
}

const cropSize = 40;

const crop = (s: State, page: Page) => {
  const style = {
    position: "absolute" as const,
    left: page.x,
    top: page.y,
    width: s.rs.book.width,
    height: s.rs.book.height,
  }
  let offsetX = 0;
  let offsetY = 0;
  const move: React.MouseEventHandler<HTMLDivElement> = e => {
    e.stopPropagation();
    const el = e.target as HTMLDivElement;
    el.style.left = `${e.pageX - offsetX - sidebarWidth}px`
    el.style.top = `${e.pageY - offsetY - toolbarHeight}px`
  }
  const add: React.MouseEventHandler<HTMLDivElement> = e => {
    e.stopPropagation();
    const el = e.target as HTMLDivElement;
    offsetX=e.clientX-el.getBoundingClientRect().left;
    offsetY=e.clientY-el.getBoundingClientRect().top;
    el.addEventListener('mousemove', move as any);
  }
  const remove: React.MouseEventHandler<HTMLDivElement> = e =>{
    e.stopPropagation();
    const el = e.target as HTMLDivElement;
    el.removeEventListener('mousemove', move as any);
    s.setPage({
      ...page,
      x: parseInt(el.style.left),
      y: parseInt(el.style.top),

    });
  }
  
  const styleW = {
    position: "absolute" as const,
    left: page.x + s.rs.book.width - cropSize,
    top: page.y,
    width: cropSize,
    height: s.rs.book.height,
    backgroundColor: "transparent"
  }
  let offsetW = 0;
  const moveW: React.MouseEventHandler<HTMLDivElement> = e => {
    e.stopPropagation();
    const el = e.target as HTMLDivElement;
    el.style.left = `${e.pageX - offsetW - sidebarWidth}px`
  }
  const addW: React.MouseEventHandler<HTMLDivElement> = e => {
    e.stopPropagation();
    const el = e.target as HTMLDivElement;
    offsetW=e.clientX-el.getBoundingClientRect().left;
    el.addEventListener('mousemove', moveW as any);
  }
  const removeW: React.MouseEventHandler<HTMLDivElement> = e =>{
    e.stopPropagation();
    const el = e.target as HTMLDivElement;
    el.removeEventListener('mousemove', moveW as any);
    s.setBook({ ...s.rs.book, width: parseInt(el.style.left) - page.x + cropSize });
  }
  
  const styleH ={
    position: "absolute" as const,
    left: page.x,
    top: page.y + s.rs.book.height - cropSize,
    width: s.rs.book.width,
    height: cropSize,
    backgroundColor: "transparent"
  }
  let offsetH = 0;
  const moveH: React.MouseEventHandler<HTMLDivElement> = e => {
    e.stopPropagation();
    const el = e.target as HTMLDivElement;
    el.style.top = `${e.pageY - offsetH - toolbarHeight}px`
  }
  const addH: React.MouseEventHandler<HTMLDivElement> = e => {
    e.stopPropagation();
    const el = e.target as HTMLDivElement;
    offsetH=e.clientY-el.getBoundingClientRect().top;
    el.addEventListener('mousemove', moveH as any);
  }
  const removeH: React.MouseEventHandler<HTMLDivElement> = e =>{
    e.stopPropagation();
    const el = e.target as HTMLDivElement;
    el.removeEventListener('mousemove', moveH as any);
    s.setBook({ ...s.rs.book, height: parseInt(el.style.top) - page.y + cropSize });
  }
  
  return [
    <div style={style} key="crop" onMouseDown={add} onMouseUp={remove} onMouseLeave={remove}></div>,
    <div style={styleW} key="cropW" onMouseDown={addW} onMouseUp={removeW} onMouseLeave={removeW}></div>,
    <div style={styleH} key="cropH" onMouseDown={addH} onMouseUp={removeH} onMouseLeave={removeH}></div>
  ]
}

const somePage = (s: State) => (page: Page) => {
  const zoom = zoomByDpi(page.original.dpi);
  const newPoints = getPixelsByAngle(
    0,
    0,
    page.original.width*zoom,
    page.original.height*zoom,
    page.rotate
  )
  const minX = Math.min(...newPoints.map(x => x.x));
  const minY = Math.min(...newPoints.map(x => x.y));
  return [
    <img
      src={imgPath(page, false)}
      alt=""
      style={{
        transform: `rotate(${page.rotate}deg) scale(${zoom})`,
        marginLeft: -minX + marginX(page.original.dpi),
        marginTop: -minY + marginY(page.original.dpi),
        userSelect: "none",
      }}
      key={`page-${page.hash}`}
    />,
    crop(s, page)
  ];
}

const nonePage = (s: State) => {
  return undefined;
}

export const page = (s: State) => {
  const file = s.getPage(s.rs.pageHash);
  return file ? somePage(s)(file) : nonePage(s);
}
