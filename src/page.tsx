import React from 'react';
import { PageNr, State } from './state';
import { Color, Page } from "./types"
import { zoomByDpi } from "./logic"
import { FaArrowsAlt, FaLongArrowAltDown, FaLongArrowAltLeft, FaLongArrowAltRight, FaLongArrowAltUp } from 'react-icons/fa';
import { hashToPng } from './utils';
import { getPixelsByAngle, Image } from './Image';
import { Dragger } from './Dragger';

export const sidebarWidth = 142;

const cropSize = 40;

const crop = (s: State, page: Page) => {
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
  const maxX = Math.max(...newPoints.map(x => x.x));
  const maxY = Math.max(...newPoints.map(x => x.y));
  const rawHeight = maxY-minY;
  const rawWidth = maxX-minX;

  const resize = [
    <Dragger key="right" {...{
      left: page.x + s.rs.book.width - cropSize,
      top: page.y + cropSize,
      width: cropSize,
      height: s.rs.book.height - 2 * cropSize,
      svg: FaLongArrowAltRight,
      filterX: x => page.x + cropSize * 2 < x && x + cropSize < rawWidth,
      filterY: () => false,
      onMouseUp: ({x}) => s.setBook({ ...s.rs.book, width: x - page.x + cropSize }),
    }}/>,
    <Dragger key="left" {...{
      left: page.x,
      top: page.y + cropSize,
      width: cropSize,
      height: s.rs.book.height - 2 * cropSize,
      svg: FaLongArrowAltLeft,
      filterX: x => 0 < x && x < page.x + s.rs.book.width - 3 * cropSize,
      filterY: () => false,
      onMouseUp: ({x}) => s.setBook({
        ...s.rs.book,
        width: (s.rs.book.width - x) + page.x,
        pages: s.rs.book.pages.map(p => PageNr.eq(page)(p) ? { ...page, x } : p),
      }),
    }}/>,
    <Dragger key="down"{...{
      left: page.x + cropSize,
      top: page.y + s.rs.book.height - cropSize,
      width: s.rs.book.width - 2 * cropSize,
      height: cropSize,
      svg: FaLongArrowAltDown,
      filterX: () => false,
      filterY: y => page.y + cropSize*2 < y && y + cropSize < rawHeight,
      onMouseUp: ({y}) => s.setBook({ ...s.rs.book, height: y - page.y + cropSize }),
    }}/>,
    <Dragger key="up" {...{
      left: page.x + cropSize,
      top: page.y,
      width: s.rs.book.width - 2 * cropSize,
      height: cropSize,
      svg: FaLongArrowAltUp,
      filterX: () => false,
      filterY: y => 0 < y && y < page.y + s.rs.book.height - 3 * cropSize,
      onMouseUp: ({y}) => s.setBook({
        ...s.rs.book,
        height: (s.rs.book.height - y) + page.y,
        pages: s.rs.book.pages.map(p => PageNr.eq(page)(p) ? { ...page, y } : p),
      }),
    }}/>
  ]

  return [
    <Dragger key="crop" {...{
      left: page.x,
      top: page.y,
      width: s.rs.book.width,
      height: s.rs.book.height,
      svg: FaArrowsAlt,
      filterX: () => true,
      filterY: () => true,
      onMouseUp: (xy) => s.setPage({ ...page, ...xy })
      }} />,
    ...(s.rs.allowPageResize ? resize : []),
  ]
}

const somePage = (s: State) => (page: Page) => {
  const scale = zoomByDpi(page.original.dpi);
  return <div id="page" key="page" style={{ left: sidebarWidth }}>
    <Image
      src={hashToPng(page.hash)}
      scale={scale}
      contrast={Color.merge(page, s.rs.book).contrast}
      rotate={page.rotate}
      width={page.original.width}
      height={page.original.height}
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
