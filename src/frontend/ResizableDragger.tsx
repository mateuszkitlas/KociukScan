import { satisfies } from "../native/utils.mjs";
import { Dragger } from "./Dragger.js";
import { IconName } from "./icon.js";

export const ResizableDragger = (props: {
  zoom: number;
  resize: boolean;
  boundaries: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  };
  cropSize: number;
  set: (_: Partial<{ x: number; y: number; width: number; height: number }>) => void;
  width: number;
  height: number;
  x: number;
  y: number;
}) => {
  const { zoom, cropSize, set, width, height } = props;
  const { minX, maxX, minY, maxY } = props.boundaries;
  const rawHeight = maxY - minY;
  const rawWidth = maxX - minX;
  const args = { zoom, filterX: () => false, filterY: () => false };
  const argsR = (deltaLeft: number, deltaTop: number) => ({
    left: props.x + deltaLeft,
    top: props.y + deltaTop,
  });
  const forX = (kind: "t" | "b" | "l" | "r") => kind === "l" || kind === "r";
  const z = (kind: "t" | "b" | "l" | "r") => ({
    ...args,
    width: forX(kind) ? cropSize : width - 2 * cropSize,
    height: forX(kind) ? height - 2 * cropSize : cropSize,
    icon: {
      name: satisfies<IconName>("chevron-down"),
      transform: `rotate(${{ t: 180, b: 0, l: 90, r: 270 }[kind]}deg)`,
    },
  });

  return (
    <>
      <Dragger
        {...{
          ...args,
          ...argsR(0, 0),
          width,
          height,
          icon: { name: "chrome-close" },
          filterX: x => 0 < x && x + props.width < rawWidth,
          filterY: y => 0 < y && y + props.height < rawHeight,
          onMouseUp: set,
        }}
      />
      {props.resize && (
        <>
          <Dragger
            {...{
              ...z("r"),
              ...argsR(width - cropSize, cropSize),
              filterX: x => props.x + cropSize * 2 < x && x + cropSize < rawWidth,
              onMouseUp: ({ x }) => set({ width: x - props.x + cropSize }),
            }}
          />
          <Dragger
            {...{
              ...z("l"),
              ...argsR(0, cropSize),
              filterX: x => 0 < x && x < props.x + width - 3 * cropSize,
              onMouseUp: ({ x }) => set({ width: width - x + props.x, x }),
            }}
          />
          <Dragger
            {...{
              ...z("t"),
              ...argsR(cropSize, height - cropSize),
              filterY: y => props.y + cropSize * 2 < y && y + cropSize < rawHeight,
              onMouseUp: ({ y }) => set({ height: y - props.y + cropSize }),
            }}
          />
          <Dragger
            {...{
              ...z("b"),
              ...argsR(cropSize, 0),
              filterY: y => 0 < y && y < props.y + height - 3 * cropSize,
              onMouseUp: ({ y }) => set({ height: height - y + props.y, y }),
            }}
          />
        </>
      )}
    </>
  );
};
