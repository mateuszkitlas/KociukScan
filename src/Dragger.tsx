import React from 'react';
import { reactSvgComponentToMarkupString } from './utils';
import { IconType } from 'react-icons';

export const sidebarWidth = 142;
const toolbarHeight = 60;

interface Props {
  left: number;
  top: number;
  width: number;
  height: number;
  svg: IconType;
  filterX: (x: number) => boolean;
  filterY: (y: number) => boolean;
  onMouseUp: (xy: { x: number; y: number }) => void; 
}
export const Dragger = ({ svg, filterX, filterY, onMouseUp, ...css }: Props) => {
  let offsetX = 0;
  let offsetY = 0;
  return <div
    draggable={false}
    style={{
      position: "absolute",
      backgroundRepeat: "no-repeat",
      backgroundPosition: "center",
      ...css,
      backgroundImage: reactSvgComponentToMarkupString(svg),
    }}
    onMouseDown={e => {
      e.stopPropagation();
      const el = e.target as HTMLDivElement;
      offsetX=e.clientX-el.getBoundingClientRect().left;
      offsetY=e.clientY-el.getBoundingClientRect().top;
      document.onmousemove = function(e) {
        e.stopPropagation();
        const x = e.pageX - offsetX - sidebarWidth;
        const y = e.pageY - offsetY - toolbarHeight;
        if (filterX(x)) { el.style.left = `${x}px`; }
        if (filterY(y)) { el.style.top = `${y}px`; }
        el.onmouseup = function (e) {
          e.stopPropagation();
          document.onmousemove = null;
          onMouseUp({x: parseInt(el.style.left), y: parseInt(el.style.top)});
        }
      }
    }}
  ></div>
}
