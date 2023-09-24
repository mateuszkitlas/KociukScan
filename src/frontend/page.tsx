import { State, PageNr } from "../native/state";
import { Book, Color, Page } from "../native/types";
import { hashToPng } from "./utils";
import { getPixelsByAngle, Image } from "./Image";
import { scaleByPage } from "../native/logic";
import { ResizeableDragger } from "./ResizeableDragger";
import { mainPageSize, offset } from "./offset";

const f = (book: Book, page: Page) => {
  const properties = Page.properties(book, page);
  const newPoints = getPixelsByAngle(
    0,
    0,
    page.original.width * scaleByPage(page),
    page.original.height * scaleByPage(page),
    properties.rotate
  );
  return {
    minX: Math.min(...newPoints.map(x => x.x)),
    minY: Math.min(...newPoints.map(x => x.y)),
    maxX: Math.max(...newPoints.map(x => x.x)),
    maxY: Math.max(...newPoints.map(x => x.y)),
  };
};

export const MoveResize = (props: { s: State, page: Page }) => {
  const properties = Page.properties(props.s.rs.book, props.page);
  const boundries = f(props.s.rs.book, props.page);
  const rawWidth = boundries.maxX - boundries.minX;
  const rawHeight = boundries.maxY - boundries.minY;
  const windowWH = mainPageSize();
  const zoom = Math.min(windowWH.height/rawHeight, windowWH.width/rawWidth);
  return <div>
    <Image
      key="image"
      src={hashToPng(props.s.rs.tmpPath ?? "unknown", props.page.hash)}
      scale={scaleByPage(props.page) * zoom}
      contrast={Color.merge(props.page, props.s.rs.book).contrast}
      rotate={properties.rotate}
      width={props.page.original.width}
      height={props.page.original.height}
    />
    <ResizeableDragger
      zoom={zoom}
      resize={props.s.rs.allowPageResize}
      boundries={boundries}
      cropSize={40}
      set={o => props.s.setRS(rs => ({
        ...rs,
        book: {
          ...rs.book,
          width: o.width ?? rs.book.width,
          height: o.height ?? rs.book.height,
          pages: rs.book.pages.map(p =>
            PageNr.eq(p)(props.page)
              ? {
                ...props.page,
                properties: {
                  ...properties,
                  x: o.x ?? properties.x,
                  y: o.y ?? properties.y,
                }
              }
              : p
          ),
        }
      }))}
      width={props.s.rs.book.width}
      height={props.s.rs.book.height}
      x={properties.x}
      y={properties.y}
    />
  </div>;
};

export const PageElt = (props: { s: State }) => {
  const page = props.s.getPage(props.s.rs.currentPage);
  return (
    <div
      id="page"
      key="page"
      style={{ left: offset.x }}
    >
      {page
        ? <MoveResize s={props.s} page={page}/>
        : null}
    </div>
  );
};
