import React from 'react';
import { State } from './state';
import { imgPath } from "./image";
import { File } from "../../common/book"
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

const somePage = (s: State) => (f: File) => {
  const page = f.pages[0];
  const crop = {
    position: "absolute" as const,
    left: page.x + sidebarWidth,
    top: page.y + toolbarHeight,
    width: s.rs.book.width,
    height: s.rs.book.height,
  }
  return [
    <img
      src={imgPath(f)}
      alt=""
      style={{transform: `rotate(${page.rotate}deg)` }}
    />,
    <div style={crop}></div>
  ];
}

const nonePage = (s: State) => {
  return <span>scan something</span>;
}

export const page = (s: State) => {
  const file = s.getFile(s.rs.fileHash);
  return file ? somePage(s)(file) : nonePage(s);
}
