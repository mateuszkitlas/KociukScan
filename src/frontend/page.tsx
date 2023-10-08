import { Color, Page } from "../native/types.mjs";
import { getPixelsByAngle, Image } from "./Image.js";
import { scaleByPage } from "../native/logic.mjs";
import { ResizableDragger } from "./ResizableDragger.js";
import { useMainPageSize, offset } from "./offset.mjs";
import { StatePair } from "./state.mjs";
import { calcScale, idToPng, pick } from "../native/utils.mjs";
import { className } from "./react.mjs";

const MoveResize = ({ page, set, state }: StatePair & { page: Page.Full }) => {
  const sbp = scaleByPage(page);
  const boundaries = getPixelsByAngle(0, 0, page.original.width * sbp, page.original.height * sbp, page.props.rotate);
  const zoom = calcScale(useMainPageSize(), {
    width: boundaries.maxX - boundaries.minX,
    height: boundaries.maxY - boundaries.minY,
  });

  return (
    <>
      <Image
        src={idToPng(state.tmpPath, page.id)}
        scale={sbp * zoom}
        contrast={Color.merge(page, state.book).contrast}
        rotate={page.props.rotate}
        {...page.original}
        x={0}
        y={0}
      />
      <ResizableDragger
        zoom={zoom}
        resize={state.allowPageResize}
        boundaries={boundaries}
        cropSize={40}
        set={o => {
          set.book(pick(o, ["height", "width"]));
          set.pages.mod({ ...page, props: { ...page.props, ...pick(o, ["x", "y"]) } });
        }}
        {...pick(state.book, ["width", "height"])}
        {...pick(page.props, ["x", "y"])}
      />
    </>
  );
};

export const CurrentPage = (props: StatePair & { page?: Page.Full }) => (
  <div {...className("current-page")} style={{ left: offset.x, top: offset.y }}>
    {props.page ? <MoveResize {...props} page={props.page} /> : null}
  </div>
);
