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
            const page = await set.invoke("scanOne");
            set.pages(pages => [...pages, page]);
          }}
          title="Scan"
          icon="camera"
        />
      ) : (
        <Btn onClick={() => set.invoke("scanAbort")} title="Stop" icon="stop" />
      )}
      <Btn
        onClick={state.kind === "nothing" ? () => set.invoke("scanMany") : undefined}
        title="Scan many pages"
        icon="play"
      >
        <Btn onClick={setDelay(-1)} title="-1 second" children="-" />
        {state.book.delay}sec
        <Btn onClick={setDelay(1)} title="+1 second" children="+" />
      </Btn>
    </>
  );
};
