import React from 'react';
import { PageNr, State } from './state';
import { Page } from "./types"
import { marginX, marginY, zoomByDpi } from "./logic"
import { loadPNG } from './scanner';
import { FaArrowsAlt, FaLongArrowAltDown, FaLongArrowAltLeft, FaLongArrowAltRight, FaLongArrowAltUp } from 'react-icons/fa';

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
  const dragable = (
    useX: (x: number) => boolean,
    useY: (y: number) => boolean,
    action: (xy: { x: number, y: number }) => void
  ) => {
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
        const x = e.pageX - offsetX - sidebarWidth;
        const y = e.pageY - offsetY - toolbarHeight;
        if (useX(x)) { el.style.left = `${x}px`; }
        if (useY(y)) { el.style.top = `${y}px`; }
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
  
  const style = {
    position: "absolute" as const,
    left: page.x,
    top: page.y,
    width: s.rs.book.width,
    height: s.rs.book.height,
  }
  const add = dragable(
    x => -cropSize < x,
    y => -cropSize < y,
    xy => s.setPage({ ...page, ...xy })
  );

  const styleRight = {
    position: "absolute" as const,
    left: page.x + s.rs.book.width - cropSize,
    top: page.y + cropSize,
    width: cropSize,
    height: s.rs.book.height - 2 * cropSize,
  }
  const addRight = dragable(
    x => page.x + cropSize * 2 < x,
    () => false,
    ({x}) => s.setBook({ ...s.rs.book, width: x - page.x + cropSize })
  );
  const styleLeft = {
    position: "absolute" as const,
    left: page.x,
    top: page.y + cropSize,
    width: cropSize,
    height: s.rs.book.height - 2 * cropSize,
  }
  const addLeft = dragable(
    x => x < page.x + s.rs.book.width - 3 * cropSize,
    () => false,
    ({x}) => s.setBook({
      ...s.rs.book,
      width: (s.rs.book.width - x) + page.x,
      pages: s.rs.book.pages.map(p => PageNr.eq(page)(p) ? { ...page, x } : p),
    })
  );

  const styleDown = {
    position: "absolute" as const,
    left: page.x + cropSize,
    top: page.y + s.rs.book.height - cropSize,
    width: s.rs.book.width - 2 * cropSize,
    height: cropSize,
  }
  const addDown = dragable(
    () => false,
    y => page.y + cropSize*2 < y,
    ({y}) => s.setBook({ ...s.rs.book, height: y - page.y + cropSize })
  );
  const styleUp = {
    position: "absolute" as const,
    left: page.x + cropSize,
    top: page.y,
    width: s.rs.book.width - 2 * cropSize,
    height: cropSize,
  }
  const addUp = dragable(
    () => false,
    y => y < page.y + s.rs.book.height - 3 * cropSize,
    ({y}) => s.setBook({
      ...s.rs.book,
      height: (s.rs.book.height - y) + page.y,
      pages: s.rs.book.pages.map(p => PageNr.eq(page)(p) ? { ...page, y } : p),
    })
  );
  
  const arrowStyle = ({ width, height }: { width: number, height: number }) => ({
    marginTop: height/2 - cropSize/4,
    marginLeft: width/2 - cropSize/4,
    height: cropSize/2,
    width: cropSize/2,
    color: "#000",
  })
  
  const resize = [
    <div draggable={false} style={styleRight} key="cropRight" onMouseDown={addRight}>
      <FaLongArrowAltRight style={arrowStyle(styleRight)}/>
    </div>,
    <div draggable={false} style={styleLeft} key="cropLeft" onMouseDown={addLeft}>
      <FaLongArrowAltLeft style={arrowStyle(styleLeft)}/>
    </div>,
    <div draggable={false} style={styleDown} key="cropDown" onMouseDown={addDown}>
      <FaLongArrowAltDown style={arrowStyle(styleDown)}/>
    </div>,
    <div draggable={false} style={styleUp} key="cropUp" onMouseDown={addUp}>
      <FaLongArrowAltUp style={arrowStyle(styleUp)}/>
    </div>
  ]

  return [
    <div draggable={false} style={style} key="crop" onMouseDown={add}>
      <FaArrowsAlt style={arrowStyle(style)}/>
    </div>,
    ...(s.rs.allowPageResize ? resize : []),
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
