import React from 'react';

const getPixelsByAngle = (x: number, y: number, width: number, height: number, angle: number) => {
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

interface Props {
  rotate: number;
  scale: number;
  contrast: number;
  png: string;
  width: number;
  height: number;
}

export const Image = ({ rotate, scale, contrast, png, width, height }: Props) => {
  const newPoints = getPixelsByAngle(
    width*(1-scale)/2,
    height*(1-scale)/2,
    width*scale,
    height*scale,
    rotate
  )
  const marginLeft = -Math.min(...newPoints.map(x => x.x));
  const marginTop = -Math.min(...newPoints.map(x => x.y));
  return <img
    src={'data:image/png;base64,' + png}
    alt=""
    style={{
      transform: `rotate(${rotate}deg) scale(${scale})`,
      filter: `contrast(${contrast})`,
      userSelect: "none",
      marginLeft,
      marginTop,
    }}
    draggable={false}
  />
}