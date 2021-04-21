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

function getPixelsByAngle(x: number, y: number, width: number, height: number, angle: number) {
  var radians = angle * Math.PI / 180;
  return [
     //upper left
     [x + width/2 + width/-2 * Math.cos(radians) - height/-2 * Math.sin(radians), y + height/2 + width/-2 * Math.sin(radians) + height/-2 * Math.cos(radians)],
     //upper right
     [x + width/2 + width/2 * Math.cos(radians) - height/-2 * Math.sin(radians), y + height/2 + width/2 * Math.sin(radians) + height/-2 * Math.cos(radians)],
     //bottom right
     [x + width/2 + width/2 * Math.cos(radians) - height/2 * Math.sin(radians), y + height/2 + width/2 * Math.sin(radians) + height/2 * Math.cos(radians)],
     //bottom left
     [x + width/2 + width/-2 * Math.cos(radians) - height/2 * Math.sin(radians), y + height/2 + width/-2 * Math.sin(radians) + height/2 * Math.cos(radians)],
  ];
}

const somePage = (s: State) => (page: Page) => {
  const crop = {
    position: "absolute" as const,
    left: page.x + sidebarWidth,
    top: page.y + toolbarHeight,
    width: s.rs.book.width,
    height: s.rs.book.height,
  }
  const mx = Math.min(...getPixelsByAngle(0,0, 637, 877, page.rotate).map(x => x[0]));
  const my = Math.min(...getPixelsByAngle(0,0, 637, 877, page.rotate).map(x => x[1]));
  return [
    <img
      src={imgPath(page)}
      alt=""
      style={{transform: `rotate(${page.rotate}deg)`, marginLeft: -mx, marginTop: -my}}
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
