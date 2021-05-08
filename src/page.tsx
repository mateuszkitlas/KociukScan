import React from 'react';
import { PageNr, State } from './state';
import { Color, Page } from "./types"
import { FaArrowsAlt, FaLongArrowAltDown, FaLongArrowAltLeft, FaLongArrowAltRight, FaLongArrowAltUp } from 'react-icons/fa';
import { hashToPng } from './utils';
import { getPixelsByAngle, Image } from './Image';
import { Dragger, sidebarWidth } from './Dragger';
import { scaleByPage } from './logic';

const cropSize = 40;

const crop = (s: State, page: Page) => {
  const properties = Page.properties(s.rs.book, page);
  const zoom = s.rs.zoom;
  const newPoints = getPixelsByAngle(
    0,
    0,
    page.original.width * scaleByPage(page),
    page.original.height * scaleByPage(page),
    properties.rotate
  )
  const minX = Math.min(...newPoints.map(x => x.x));
  const minY = Math.min(...newPoints.map(x => x.y));
  const maxX = Math.max(...newPoints.map(x => x.x));
  const maxY = Math.max(...newPoints.map(x => x.y));
  const rawHeight = maxY-minY;
  const rawWidth = maxX-minX;

  const resize = [
    <Dragger key="right" {...{
      left: properties.x + s.rs.book.width - cropSize,
      top: properties.y + cropSize,
      width: cropSize,
      height: s.rs.book.height - 2 * cropSize,
      svg: FaLongArrowAltRight,
      filterX: x => properties.x + cropSize * 2 < x && x + cropSize < rawWidth,
      filterY: () => false,
      onMouseUp: ({x}) => s.setBook({ ...s.rs.book, width: x - properties.x + cropSize }),
      zoom,
    }}/>,
    <Dragger key="left" {...{
      left: properties.x,
      top: properties.y + cropSize,
      width: cropSize,
      height: s.rs.book.height - 2 * cropSize,
      svg: FaLongArrowAltLeft,
      filterX: x => 0 < x && x < properties.x + s.rs.book.width - 3 * cropSize,
      filterY: () => false,
      onMouseUp: ({x}) => s.setBook({
        ...s.rs.book,
        width: (s.rs.book.width - x) + properties.x,
        pages: s.rs.book.pages.map(p => PageNr.eq(page)(p) ? { ...page, properties: { ...properties, x } } : p),
      }),
      zoom,
    }}/>,
    <Dragger key="down"{...{
      left: properties.x + cropSize,
      top: properties.y + s.rs.book.height - cropSize,
      width: s.rs.book.width - 2 * cropSize,
      height: cropSize,
      svg: FaLongArrowAltDown,
      filterX: () => false,
      filterY: y => properties.y + cropSize*2 < y && y + cropSize < rawHeight,
      onMouseUp: ({y}) => s.setBook({ ...s.rs.book, height: y - properties.y + cropSize }),
      zoom,
    }}/>,
    <Dragger key="up" {...{
      left: properties.x + cropSize,
      top: properties.y,
      width: s.rs.book.width - 2 * cropSize,
      height: cropSize,
      svg: FaLongArrowAltUp,
      filterX: () => false,
      filterY: y => 0 < y && y < properties.y + s.rs.book.height - 3 * cropSize,
      onMouseUp: ({y}) => s.setBook({
        ...s.rs.book,
        height: (s.rs.book.height - y) + properties.y,
        pages: s.rs.book.pages.map(p => PageNr.eq(page)(p) ? { ...page, properties: { ...properties, y } } : p),
      }),
      zoom,
    }}/>
  ]

  return [
    <Dragger key="crop" {...{
      left: properties.x,
      top: properties.y,
      width: s.rs.book.width,
      height: s.rs.book.height,
      svg: FaArrowsAlt,
      filterX: () => true,
      filterY: () => true,
      onMouseUp: (xy) => s.setPage({ ...page, properties: { ...properties, ...xy } }),
      zoom,
      }} />,
    ...(s.rs.allowPageResize ? resize : []),
  ]
}

const somePage = (s: State) => (page: Page) => {
  const properties = Page.properties(s.rs.book, page);
  return <div
    id="page"
    key="page"
    style={{ left: sidebarWidth }}
  >
    <Image
      src={hashToPng(page.hash)}
      scale={scaleByPage(page) * s.rs.zoom}
      contrast={Color.merge(page, s.rs.book).contrast}
      rotate={properties.rotate}
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
