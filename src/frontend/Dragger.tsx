import { reactSvgComponentToMarkupString } from "./utils.mjs";
import { IconType } from "react-icons";
import { offset } from "./offset.mjs";

interface Props {
  left: number;
  top: number;
  width: number;
  height: number;
  svg: IconType;
  filterX: (x: number) => boolean;
  filterY: (y: number) => boolean;
  onMouseUp: (xy: { x: number; y: number }) => void;
  zoom: number;
}
export const Dragger = ({ svg, filterX, filterY, onMouseUp, zoom, ...css }: Props) => {
  let offsetX = 0;
  let offsetY = 0;
  return (
    <div
      draggable={false}
      style={{
        position: "absolute",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        left: css.left * zoom,
        top: css.top * zoom,
        width: css.width * zoom,
        height: css.height * zoom,
        backgroundImage: reactSvgComponentToMarkupString(svg),
        border: "1px dashed #000",
        outline: "1px dashed #fff",
      }}
      onMouseDown={e => {
        e.stopPropagation();
        const el = e.target as HTMLDivElement;
        offsetX = e.clientX - el.getBoundingClientRect().left;
        offsetY = e.clientY - el.getBoundingClientRect().top;
        document.onmousemove = function (e) {
          e.stopPropagation();
          const x = e.pageX - offsetX - offset.x;
          const y = e.pageY - offsetY - offset.y;
          if (filterX(x / zoom)) {
            el.style.left = `${x}px`;
          }
          if (filterY(y / zoom)) {
            el.style.top = `${y}px`;
          }
          el.onmouseup = function (e) {
            e.stopPropagation();
            document.onmousemove = null;
            onMouseUp({ x: parseInt(el.style.left) / zoom, y: parseInt(el.style.top) / zoom });
          };
        };
      }}
    ></div>
  );
};
