import React from 'react';
import { State } from './state';
import { imgPath } from "./image";
import { Page } from "../../common/book"
/*
const CanvasFile = (f: File) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const image=new Image();
  image.src = imgPath(f);
  const $page = document.getElementById("#page");
  const width = $page?.offsetWidth;
  const height = $page?.offsetHeight;
  
  const draw = () => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d')!;
      context.drawImage(image, 0, 0, width || 1, height || 1);
      console.log(canvas.width,canvas.height);
    }
  };
  React.useEffect(draw);
  
  return <canvas ref={canvasRef}/>
}*/

const sidebarWidth = 156;
const toolbarHeight = 60;

const somePage = (s: State) => (page: Page) => {
  const crop = {
    position: "absolute" as const,
    left: page.x + sidebarWidth,
    top: page.y + toolbarHeight,
    width: s.rs.book.width,
    height: s.rs.book.height,
  }
  return [
    <img
      src={imgPath(page)}
      alt=""
      style={{transform: `rotate(${page.rotate}deg)` }}
      key={`page-${page.hash}`}
    />,
    <div style={crop} key="crop"></div>
  ];
}

const nonePage = (s: State) => {
  return <span>scan something</span>;
}

export const page = (s: State) => {
  const file = s.getPage(s.rs.pageHash);
  return file ? somePage(s)(file) : nonePage(s);
}
