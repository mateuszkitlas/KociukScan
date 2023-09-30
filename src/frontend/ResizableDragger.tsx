import {
  FaArrowsAlt,
  FaLongArrowAltDown,
  FaLongArrowAltLeft,
  FaLongArrowAltRight,
  FaLongArrowAltUp,
} from "react-icons/fa/index.js";
import { Dragger } from "./Dragger.js";

interface Boundaries {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}
interface Props {
  zoom: number;
  resize: boolean;
  boundaries: Boundaries;
  cropSize: number;
  set: (_: Partial<{ x: number; y: number; width: number; height: number }>) => void;
  width: number;
  height: number;
  x: number;
  y: number;
}

export const ResizableDragger = (props: Props) => {
  const { zoom, cropSize, set, width, height } = props;
  const { minX, maxX, minY, maxY } = props.boundaries;
  const rawHeight = maxY - minY;
  const rawWidth = maxX - minX;

  const resize = [
    <Dragger
      key="right"
      {...{
        left: props.x + width - cropSize,
        top: props.y + cropSize,
        width: cropSize,
        height: height - 2 * cropSize,
        svg: FaLongArrowAltRight,
        filterX: x => props.x + cropSize * 2 < x && x + cropSize < rawWidth,
        filterY: () => false,
        onMouseUp: ({ x }) => set({ width: x - props.x + cropSize }),
        zoom,
      }}
    />,
    <Dragger
      key="left"
      {...{
        left: props.x,
        top: props.y + cropSize,
        width: cropSize,
        height: height - 2 * cropSize,
        svg: FaLongArrowAltLeft,
        filterX: x => 0 < x && x < props.x + width - 3 * cropSize,
        filterY: () => false,
        onMouseUp: ({ x }) => set({ width: width - x + props.x, x }),
        zoom,
      }}
    />,
    <Dragger
      key="down"
      {...{
        left: props.x + cropSize,
        top: props.y + height - cropSize,
        width: width - 2 * cropSize,
        height: cropSize,
        svg: FaLongArrowAltDown,
        filterX: () => false,
        filterY: y => props.y + cropSize * 2 < y && y + cropSize < rawHeight,
        onMouseUp: ({ y }) => set({ height: y - props.y + cropSize }),
        zoom,
      }}
    />,
    <Dragger
      key="up"
      {...{
        left: props.x + cropSize,
        top: props.y,
        width: width - 2 * cropSize,
        height: cropSize,
        svg: FaLongArrowAltUp,
        filterX: () => false,
        filterY: y => 0 < y && y < props.y + height - 3 * cropSize,
        onMouseUp: ({ y }) => set({ height: height - y + props.y, y }),
        zoom,
      }}
    />,
  ];

  return (
    <div>
      <Dragger
        key="crop"
        {...{
          left: props.x,
          top: props.y,
          width: width,
          height: height,
          svg: FaArrowsAlt,
          filterX: x => 0 < x && x + props.width < rawWidth,
          filterY: y => 0 < y && y + props.height < rawHeight,
          onMouseUp: set,
          zoom,
        }}
      />
      {...props.resize ? resize : []}
    </div>
  );
};
