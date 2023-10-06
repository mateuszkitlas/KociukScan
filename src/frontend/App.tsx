import { useEffect } from "react";
import { MiniPage } from "./MiniPage.js";
import { Buttons } from "./toolbar.js";
import { PageElt } from "./page.js";
import { mainPageSize, offset } from "./offset.mjs";
import { ModalWithClose, ModalYesNo } from "./modal.js";
import { Settings } from "./Settings/Settings.js";
import { FileDrop } from "react-file-drop";
import { arrayBufferToBuffer } from "../native/utils.mjs";
import { invoke, InitProps } from "./utils.mjs";
import { registerRendererEndpoints } from "./endpoints.js";
import { useKociukState } from "./state.mjs";

export const App = (props: InitProps) => {
  const [state, set] = useKociukState(props);
  const statePair = { state, set };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => void registerRendererEndpoints(set), []);

  const addFiles = async (fl: FileList) => {
    const newPages = await Promise.all(
      Array.from(fl).map(async f => invoke("scanFromFile", arrayBufferToBuffer(await f.arrayBuffer()))),
    );
    set.pages(pages => [...pages, ...newPages]);
  };

  useEffect(() => void invoke("setBook", state.book), [state.book]);

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
          return set(rs => (rs.cPageIdx === undefined ? {} : { modal: { kind: "deletePage", pageIdx: rs.cPageIdx } }));
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
    <div id="App">
      <div id="wrapper" key="wrapper">
        <PageElt page={state.cPageFull} {...statePair} />
        <div id="pages" key="pages" style={{ width: offset.x, height: mainPageSize().height }}>
          {state.fullPages.map((page, idx) => (
            <MiniPage key={page.id + idx} page={page} {...statePair} idx={idx} />
          ))}
        </div>
      </div>
      <div id="toolbar" key="toolbar" style={{ transform: "scale(1)", paddingLeft: 5 }}>
        <Buttons {...statePair} />
      </div>

      {(() => {
        switch (state.modal?.kind) {
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
              <ModalWithClose title="Error" onClose={() => set({ modal: undefined })} children={state.modal.message} />
            );
          case "reScanPage": {
            const index = state.modal.pageIdx;
            return (
              <ModalYesNo
                onYes={async () => {
                  set({ kind: "scanning one", modal: undefined });
                  const page = await invoke("scanOne");
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
                  <ModalWithClose onClose={closeModalModal} title="Import pages">
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
                  </ModalWithClose>
                );
              case undefined:
                return (
                  <ModalWithClose title="Settings" onClose={() => set({ modal: undefined })}>
                    <Settings {...statePair} modal={modal} />
                  </ModalWithClose>
                );
            }
          }
        }
      })()}
    </div>
  );
};
