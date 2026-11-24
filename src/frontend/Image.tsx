export const getPixelsByAngle = (
  x: number,
  y: number,
  width: number,
  height: number,
  angle: number,
) => {
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
  x: number;
  y: number;
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
        marginLeft: -p.minX + props.x,
        marginTop: -p.minY + props.y,
        boxSizing: "border-box",
      }}
      draggable={false}
    />
  );
};
