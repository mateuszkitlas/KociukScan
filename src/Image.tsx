import React from 'react';

export const getPixelsByAngle = (x: number, y: number, width: number, height: number, angle: number) => {
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

interface PropsImage {
  rotate: number;
  contrast: number;
  src: string;
  width: number;
  height: number;
  scale: number;
  x?: number;
  y?: number;
}

export const Image = ({ rotate, contrast, src: png, width, height, scale, x, y }: PropsImage) => {
  const newPoints = getPixelsByAngle(
    width*(1-scale)/2,
    height*(1-scale)/2,
    width*scale,
    height*scale,
    rotate
  )
  const marginLeft = -Math.min(...newPoints.map(x => x.x)) + (x || 0);
  const marginTop = -Math.min(...newPoints.map(x => x.y)) + (y || 0);
  return <img
    src={png}
    alt=""
    style={{
      transform: `rotate(${rotate}deg) scale(${scale})`,
      filter: `contrast(${contrast})`,
      userSelect: "none",
      marginLeft,
      marginTop,
      boxSizing: "border-box",
    }}
    draggable={false}
  />
}

interface PropsImageMiniature {
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
  }
  width: number;
  height: number;
  children: React.ReactNode;
  onClick: () => void;
}
export const ImageMiniature = (props: PropsImageMiniature) => {
  const scale = Math.min(props.width/props.crop.width, props.height/props.crop.height);
  return <div
    style={{ width: props.width, height: props.height, overflow: "hidden" }}
    onClick={e => { e.stopPropagation(); props.onClick() }}
  >
    <div style={{ transform: `scale(${scale})` }}>
      <div
        style={{
          width: props.crop.width,
          height: props.crop.height,
          marginLeft: -props.width*(1-scale)/2,
          marginTop: -props.height*(1-scale)/2,
        }}
      >
        <Image
          {...props.original}
          x={-props.crop.x}
          y={-props.crop.y}/>
      </div>
    </div>
    {props.children}
  </div>
}
