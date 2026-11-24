import { StatePair } from "./state.mjs";
import { Btn } from "./btn.js";

export const ScanningButtons = (props: StatePair) => {
  const { set, state } = props;
  const setDelay = (delta: number) => () =>
    set.book(book => (book.delay + delta >= 0 ? { delay: book.delay + delta } : {}));
  return (
    <>
      {state.kind === "nothing" ? (
        <Btn
          onClick={async () => {
            set({ kind: "scanning one" });
            try {
              const page = await set.invoke("scanOne", state.device);
              set.pages(pages => [...pages, page]);
            } finally {
              set({ kind: "nothing" });
            }
          }}
          title="Scan"
          icon="camera"
        />
      ) : (
        <Btn onClick={() => set.invoke("scanAbort")} title="Stop" icon="stop" />
      )}
      <Btn
        onClick={
          state.kind === "nothing"
            ? async () => {
                set({ kind: "scanning many" });
                try {
                  await set.invoke("scanMany", state.device);
                } finally {
                  set({ kind: "nothing" });
                }
              }
            : undefined
        }
        title="Scan many pages"
        icon="play"
      />
      <Btn
        onClick={setDelay(-1)}
        title="-1 second"
        icon={{ transform: "rotate(180deg)", name: "debug-brakepoint-stackframe" }}
        children={`${state.book.delay}sec`}
      />
      <Btn onClick={setDelay(1)} title="+1 second" icon="debug-brakepoint-stackframe" />
    </>
  );
};
