import { offset } from "./offset.mjs";
import { IconProps, useBackgroundImage } from "./icon.js";

export const Dragger = ({
  icon,
  filterX,
  filterY,
  onMouseUp,
  zoom,
  ...css
}: {
  left: number;
  top: number;
  width: number;
  height: number;
  icon: IconProps;
  filterX: (x: number) => boolean;
  filterY: (y: number) => boolean;
  onMouseUp: (xy: { x: number; y: number }) => void;
  zoom: number;
}) => {
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
        backgroundImage: useBackgroundImage({ ...icon, color: "#000" }),
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
