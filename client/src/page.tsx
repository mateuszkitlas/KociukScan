import React from 'react';
import { State } from './state';
import { imgPath } from "./image";
import { Book, Page } from "../../common/book"

const sidebarWidth = 156;
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

const crop = (book: Book, page: Page) => {
  let offsetX = page.x + sidebarWidth;
  let offsetY = page.y + toolbarHeight;
  const style = {
    position: "absolute" as const,
    left: offsetX,
    top: offsetY,
    width: book.width,
    height: book.height,
  }
  const move: React.MouseEventHandler<HTMLDivElement> = e => {
    const el = e.target as HTMLDivElement;
    el.style.left = `${e.pageX-offsetX}px`
    el.style.top = `${e.pageY-offsetY}px`
  }
  const add: React.MouseEventHandler<HTMLDivElement> = e => {
    const el = e.target as HTMLDivElement;
    offsetX=e.clientX-el.getBoundingClientRect().left
    offsetY=e.clientY-el.getBoundingClientRect().top
    el.addEventListener('mousemove', move as any)
  }
  const remove: React.MouseEventHandler<HTMLDivElement> = e =>{
    const el = e.target;
    el.removeEventListener('mousemove', move as any);
  }
  return (
    <div style={style} key="crop" onMouseDown={add} onMouseUp={remove}></div>
  )
}

const somePage = (s: State) => (page: Page) => {
  const newPoints = getPixelsByAngle(0, 0, 637, 877, page.rotate)
  const minX = Math.min(...newPoints.map(x => x.x));
  const minY = Math.min(...newPoints.map(x => x.y));
  return [
    <img
      src={imgPath(page, false)}
      alt=""
      style={{transform: `rotate(${page.rotate}deg)`, marginLeft: -minX, marginTop: -minY}}
      key={`page-${page.hash}`}
    />,
    crop(s.rs.book, page)
  ];
}

const nonePage = (s: State) => {
  return undefined;
}

export const page = (s: State) => {
  const file = s.getPage(s.rs.pageHash);
  return file ? somePage(s)(file) : nonePage(s);
}
