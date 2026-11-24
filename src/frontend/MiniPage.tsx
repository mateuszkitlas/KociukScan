import { Page } from "../native/types.mjs";
import { Image } from "./Image.js";
import { scaleByPage } from "../native/logic.mjs";
import { StatePair } from "./state.mjs";
import { calcScale, idToPng } from "../native/utils.mjs";
import { className, mouse } from "./react.mjs";

export const MiniPage = (props: StatePair & { page: Page.Full }) => {
  const { page } = props;
  const { book } = props.state;

  const scale = calcScale({ width: 100, height: 100 }, book);
  return (
    <div
      onClick={mouse(() => props.set({ cPageIdx: page.idx }))}
      {...className("page", { current: page.current })}
    >
      <div style={{ width: book.width * scale, height: book.height * scale, overflow: "hidden" }}>
        <div style={{ transform: `scale(${scale})` }}>
          <div
            style={{
              width: book.width,
              height: book.height,
              marginLeft: (-book.width * (1 - scale)) / 2,
              marginTop: (-book.height * (1 - scale)) / 2,
            }}
            children={
              <Image
                src={idToPng(props.state.tmpPath, page.id)}
                scale={scaleByPage(page)}
                contrast={book.color.contrast}
                rotate={page.props.rotate}
                width={page.original.width}
                height={page.original.height}
                x={-page.props.x}
                y={-page.props.y}
              />
            }
          />
        </div>
      </div>
      <div className="anchor">
        <div {...className("circle", { touched: page.touched })}>
          <div className="number" children={page.idx + 1} />
        </div>
      </div>
    </div>
  );
};
