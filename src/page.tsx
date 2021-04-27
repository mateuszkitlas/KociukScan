import React from 'react';
import { State } from './state';
import { Page } from "./types"
import { marginX, marginY, zoomByDpi } from "./logic"
import { loadPNG } from './scanner';

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

const dragable = (useX: boolean, useY: boolean, action: (xy: { x: number, y: number }) => void) => {
  let offsetX = 0;
  let offsetY = 0;
  
  const add: React.MouseEventHandler<HTMLDivElement> = e => {
    e.stopPropagation();
    const el = e.target as HTMLDivElement;
    offsetX=e.clientX-el.getBoundingClientRect().left;
    offsetY=e.clientY-el.getBoundingClientRect().top;
    el.onmousemove = function(e) {
      e.stopPropagation();
      const el = e.target as HTMLDivElement;
      if (useX) { el.style.left = `${e.pageX - offsetX - sidebarWidth}px`; }
      if (useY) { el.style.top = `${e.pageY - offsetY - toolbarHeight}px`; }
      el.onmouseup = function (e) {
        e.stopPropagation();
        const el = e.target as HTMLDivElement;
        el.onmousemove = null;
        action({x: parseInt(el.style.left), y: parseInt(el.style.top)});
      }
    }
  }
  return add;
}

const crop = (s: State, page: Page) => {
  const style = {
    position: "absolute" as const,
    left: page.x,
    top: page.y,
    width: s.rs.book.width,
    height: s.rs.book.height,
  }
  const add = dragable(true, true, xy => s.setPage({ ...page, ...xy }));

  const styleW = {
    position: "absolute" as const,
    left: page.x + s.rs.book.width - cropSize,
    top: page.y,
    width: cropSize,
    height: s.rs.book.height - cropSize - 2,
  }
  const addW = dragable(true, false, ({x}) => s.setBook({ ...s.rs.book, width: x - page.x + cropSize }));

  const styleH = {
    position: "absolute" as const,
    left: page.x,
    top: page.y + s.rs.book.height - cropSize,
    width: s.rs.book.width - cropSize - 2,
    height: cropSize,
  }
  const addH = dragable(false, true, ({y}) => s.setBook({ ...s.rs.book, height: y - page.y + cropSize }));

  const styleWH = {
    position: "absolute" as const,
    left: page.x + s.rs.book.width - cropSize,
    top: page.y + s.rs.book.height - cropSize,
    width: cropSize,
    height: cropSize,
  }
  const addWH = dragable(true, true, ({x, y}) => s.setBook({ ...s.rs.book, width: x - page.x + cropSize, height: y - page.y + cropSize }));

  return [
    <div draggable={false} style={style} key="crop" onMouseDown={add}></div>,
    <div draggable={false} style={styleW} key="cropW" onMouseDown={addW}></div>,
    <div draggable={false} style={styleH} key="cropH" onMouseDown={addH}></div>,
    <div draggable={false} style={styleWH} key="cropWH" onMouseDown={addWH}></div>,
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
  return <div id="page" key="page">
    <img
      src={'data:image/png;base64,' + loadPNG(page.hash)}
      alt=""
      style={{
        transform: `rotate(${page.rotate}deg) scale(${zoom})`,
        marginLeft: -minX + marginX(page.original.dpi),
        marginTop: -minY + marginY(page.original.dpi),
        userSelect: "none",
      }}
      draggable={false}
      key={`page-${page.hash}`}
    />
    {crop(s, page)}
  </div>;
}

const nonePage = (s: State) => {
  return undefined;
}

export const page = (s: State) => {
  const file = s.getPage(s.rs.currentPage);
  return file ? somePage(s)(file) : nonePage(s);
}
