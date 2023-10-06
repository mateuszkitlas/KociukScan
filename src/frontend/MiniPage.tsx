import { Page } from "../native/types.mjs";
import { ImageMiniature } from "./Image.js";
import { scaleByPage } from "../native/logic.mjs";
import { StatePair } from "./state.mjs";
import { className } from "./react.mjs";
import { idToPng } from "../native/utils.mjs";

export const MiniPage = ({ page, state, set, idx }: StatePair & { page: Page.Full; idx: number }) => {
  const { book } = state;
  return (
    <div {...className("page", { current: page.id === state.cPageFull?.id })}>
      <ImageMiniature
        original={{
          src: idToPng(state.tmpPath, page.id),
          scale: scaleByPage(page),
          contrast: book.color.contrast,
          rotate: page.props.rotate,
          width: page.original.width,
          height: page.original.height,
        }}
        crop={{
          width: book.width,
          height: book.height,
          x: page.props.x,
          y: page.props.y,
        }}
        width={100}
        height={100}
        onClick={() => set({ cPageIdx: idx })}
      >
        <div
          style={{ position: "absolute", right: 0, width: 40 }}
          children={
            <div
              style={{
                backgroundColor: page.props ? "#445" : "#F00",
                borderRadius: "50%",
                width: 32,
                height: 24,
                textAlign: "center",
                paddingTop: 6,
              }}
              children={idx + 1}
            />
          }
        />
      </ImageMiniature>
    </div>
  );
};
