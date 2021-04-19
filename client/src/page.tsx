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

const somePage = (s: State) => (f: File) => {
  const page = f.pages[0];
  const rotate = (deg: number): React.MouseEventHandler<HTMLDivElement> => (_event) => {
    s.setPage(f.hash, { ...page, rotate: page.rotate + deg });
  }
  return (
    <div>
      <div className="button" onClick={rotate(1)}>rotate left 1'</div>
      <div className="button" onClick={rotate(-1)}>rotate right 1'</div>
      <img
        src={imgPath(f)}
        alt=""
        style={{transform: `rotate(${page.rotate}deg)` }}
      />
    </div>
  );
}

const noPage = (s: State) => {
  return <span>scan something</span>;
}

export const page = (s: State) => {
  const file = s.getFile(s.rs.fileHash);
  return file ? somePage(s)(file) : noPage(s);
}
