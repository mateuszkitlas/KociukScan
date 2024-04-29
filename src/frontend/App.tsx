import { useEffect } from "react";
import { MiniPage } from "./MiniPage.js";
import { Buttons } from "./toolbar.js";
import { CurrentPage } from "./page.js";
import { useMainPageSize, offset } from "./offset.mjs";
import { Modal, ModalYesNo } from "./modal.js";
import { Settings } from "./Settings/Settings.js";
import { FileDrop } from "react-file-drop";
import { arrayBufferToBuffer } from "../native/utils.mjs";
import { InitProps } from "./utils.mjs";
import { registerRendererEndpoints } from "./endpoints.js";
import { StatePair, useKociukState } from "./state.mjs";

const Stx = ({ state, set }: StatePair) => {
  const statePair = { state, set };
  const addFiles = async (fl: FileList) => {
    const newPages = await set.invoke(
      "scanFromFiles",
      (await Promise.all(Array.from(fl).map(f => f.arrayBuffer()))).map(arrayBufferToBuffer),
    );
    set.pages(pages => [...pages, ...newPages]);
  };

  switch (state.modal?.kind) {
    case undefined:
      return null;
    case "deletePage": {
      const idx = state.modal.pageIdx;
      return (
        <ModalYesNo
          onYes={() => {
            set.pages.del(idx);
            set({ cPageIdx: undefined, modal: undefined });
          }}
          onClose={() => set({ modal: undefined })}
          children="Are you sure?"
        />
      );
    }
    case "error":
      return (
        <Modal
          title="Error"
          onClose={() => set({ modal: undefined })}
          children={state.modal.message}
        />
      );
    case "reScanPage": {
      const index = state.modal.pageIdx;
      return (
        <ModalYesNo
          onYes={async () => {
            set({ kind: "scanning one", modal: undefined });
            const page = await set.invoke("scanOne");
            set.pages(pages => pages.with(index, page));
          }}
          onClose={() => set({ modal: undefined })}
          children="Are you sure you want to scan this page again?"
        />
      );
    }
    case "settings": {
      const modal = state.modal;
      const closeModalModal = () => set({ modal: { ...modal, modal: undefined } });
      switch (modal.modal?.kind) {
        case "deleteProject":
          return (
            <ModalYesNo
              onYes={() => set(rs => ({ book: { ...rs.book, pages: [] } }))}
              onClose={closeModalModal}
              children="Are you sure?"
            />
          );
        case "importPages":
          return (
            <Modal onClose={closeModalModal} title="Import pages">
              <FileDrop onDrop={files => files && addFiles(files)}>
                <div
                  style={{
                    width: 490,
                    height: 250,
                    border: "5px dashed #fff",
                    borderRadius: 15,
                    paddingTop: 240,
                    textAlign: "center",
                    fontSize: 30,
                  }}
                >
                  Drop images here
                </div>
              </FileDrop>
            </Modal>
          );
        case undefined:
          return (
            <Modal title="Settings" onClose={() => set({ modal: undefined })}>
              <Settings {...statePair} modal={modal} />
            </Modal>
          );
      }
    }
  }
};

export const App = (props: InitProps) => {
  const [state, set] = useKociukState(props);
  const statePair = { state, set };
  useEffect(() => registerRendererEndpoints(set), [set]);
  useEffect(() => void set.invoke("setBook", state.book), [state.book, set]);
  useEffect(() => {
    const pressed: Record<string, boolean> = {};
    const onKeyDown = async ({ code, shiftKey, ctrlKey }: KeyboardEvent) => {
      if (pressed[code]) return;
      pressed[code] = true;
      switch (`${code}${shiftKey ? "+" : "-"}`) {
        case "ArrowDown-":
          return set.current.nextPrevPage(1);
        case "ArrowUp-":
          return set.current.nextPrevPage(-1);
        case "ArrowLeft-":
          return set.current.rotate(-0.25);
        case "ArrowRight-":
          return set.current.rotate(0.25);
        case "ArrowDown+":
          return set.current.move(0, ctrlKey ? 5 : 1);
        case "ArrowUp+":
          return set.current.move(0, ctrlKey ? -5 : -1);
        case "ArrowLeft+":
          return set.current.move(ctrlKey ? -5 : -1, 0);
        case "ArrowRight+":
          return set.current.move(ctrlKey ? 5 : 1, 0);
        case "KeyD-":
          return state.cPageIdx !== undefined && set.pages.duplicate(state.cPageIdx);
        case "Delete-":
          return set(rs =>
            rs.cPageIdx === undefined
              ? {}
              : { modal: { kind: "deletePage", pageIdx: rs.cPageIdx } },
          );
      }
    };
    const onKeyUp = ({ code }: KeyboardEvent) => {
      pressed[code] = false;
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [set, state.cPageIdx]);

  return (
    <>
      <Buttons {...statePair} />
      <div style={{ width: offset.x, height: useMainPageSize().height, overflowY: "scroll" }}>
        {state.fullPages.map(p => (
          <MiniPage key={`${p.id}-${p.idx}`} page={p} {...statePair} />
        ))}
      </div>
      <CurrentPage page={state.cPageFull} {...statePair} />
      <Stx {...statePair} />
    </>
  );
};
