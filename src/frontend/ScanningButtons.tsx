import { FaPaw, FaStop } from "react-icons/fa/index.js";
import { invoke } from "./utils.mjs";
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
            const page = await invoke("scanOne");
            set.pages(pages => [...pages, page]);
          }}
          title="Scan"
          children={<FaPaw />}
        />
      ) : (
        <Btn onClick={invoke.cb("scanAbort")} title="Stop" children={<FaStop />} />
      )}
      <Btn onClick={state.kind === "nothing" ? invoke.cb("scanMany") : undefined} title="Scan many pages">
        <FaPaw />
        <Btn onClick={setDelay(-1)} title="-1 second" children="-" />
        {state.book.delay}sec
        <Btn onClick={setDelay(1)} title="+1 second" children="+" />
      </Btn>
    </>
  );
};
