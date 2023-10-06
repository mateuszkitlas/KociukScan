import { mouse } from "./react.mjs";

export const getPixelsByAngle = (x: number, y: number, width: number, height: number, angle: number) => {
  const radians = (angle * Math.PI) / 180;
  const sin = Math.sin(radians);
  const cos = Math.cos(radians);
  const w2 = width / 2;
  const h2 = height / 2;
  const f = (a: number, b: number) => ({
    x: x + w2 - w2 * cos * a + h2 * sin * b,
    y: y + h2 - w2 * sin * a - h2 * cos * b,
  });
  const z = [f(1, 1), f(-1, 1), f(-1, -1), f(1, -1)]; // [tl, tr, br, bl]
  return {
    minX: Math.min(...z.map(x => x.x)),
    minY: Math.min(...z.map(x => x.y)),
    maxX: Math.max(...z.map(x => x.x)),
    maxY: Math.max(...z.map(x => x.y)),
  };
};

export const Image = (props: {
  rotate: number;
  contrast: number;
  src: string;
  width: number;
  height: number;
  scale: number;
  x?: number;
  y?: number;
}) => {
  const p = getPixelsByAngle(
    (props.width * (1 - props.scale)) / 2,
    (props.height * (1 - props.scale)) / 2,
    props.width * props.scale,
    props.height * props.scale,
    props.rotate,
  );
  return (
    <img
      src={props.src}
      alt=""
      style={{
        transform: `rotate(${props.rotate}deg) scale(${props.scale})`,
        filter: `contrast(${props.contrast})`,
        userSelect: "none",
        marginLeft: -p.minX + (props.x ?? 0),
        marginTop: -p.minY + (props.y ?? 0),
        boxSizing: "border-box",
      }}
      draggable={false}
    />
  );
};

export const ImageMiniature = (props: {
  original: {
    rotate: number;
    contrast: number;
    src: string;
    width: number;
    height: number;
    scale: number;
  };
  crop: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  width: number;
  height: number;
  children: React.ReactNode;
  onClick: () => void;
}) => {
  const scale = Math.min(props.width / props.crop.width, props.height / props.crop.height);
  return (
    <div onClick={mouse(props.onClick)}>
      <div style={{ width: props.crop.width * scale, height: props.crop.height * scale, overflow: "hidden" }}>
        <div style={{ transform: `scale(${scale})` }}>
          <div
            style={{
              width: props.crop.width,
              height: props.crop.height,
              marginLeft: -(props.crop.width * (1 - scale)) / 2,
              marginTop: (-props.crop.height * (1 - scale)) / 2,
            }}
            children={<Image {...props.original} x={-props.crop.x} y={-props.crop.y} />}
          />
        </div>
      </div>
      <div
        style={{
          marginTop: -props.crop.height * scale,
          transform: "scale(1)",
          width: props.width,
          height: props.height,
        }}
        children={props.children}
      />
    </div>
  );
};
