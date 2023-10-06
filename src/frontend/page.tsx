import { Color, Page } from "../native/types.mjs";
import { getPixelsByAngle, Image } from "./Image.js";
import { scaleByPage } from "../native/logic.mjs";
import { ResizableDragger } from "./ResizableDragger.js";
import { mainPageSize, offset } from "./offset.mjs";
import { StatePair } from "./state.mjs";
import { idToPng, pick } from "../native/utils.mjs";

const MoveResize = ({ page, set, state }: StatePair & { page: Page.Full }) => {
  const boundaries = getPixelsByAngle(
    0,
    0,
    page.original.width * scaleByPage(page),
    page.original.height * scaleByPage(page),
    page.props.rotate,
  );
  const rawWidth = boundaries.maxX - boundaries.minX;
  const rawHeight = boundaries.maxY - boundaries.minY;
  const windowWH = mainPageSize();
  const zoom = Math.min(windowWH.height / rawHeight, windowWH.width / rawWidth);
  return (
    <>
      <Image
        src={idToPng(state.tmpPath, page.id)}
        scale={scaleByPage(page) * zoom}
        contrast={Color.merge(page, state.book).contrast}
        rotate={page.props.rotate}
        {...page.original}
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

export const PageElt = (props: StatePair & { page?: Page.Full }) => (
  <div id="page" style={{ left: offset.x }}>
    {props.page ? <MoveResize {...props} page={props.page} /> : null}
  </div>
);
