import { ScanningButtons } from "./ScanningButtons.js";
import { StatePair } from "./state.mjs";
import { Btn } from "./btn.js";
import { Icon } from "./icon.js";
import { mouse } from "./react.mjs";
import { satisfies } from "../native/utils.mjs";

const RotateBtn = (props: { set: StatePair["set"]; deg: number; txt: string; transform: string }) => (
  <div
    title={`Rotate ${180 === props.deg ? "" : props.deg < 0 ? "left " : "right "}by ${props.txt}º`}
    onClick={mouse(() => props.set.current.rotate(props.deg))}
    className="hoverable button"
  >
    <Icon name="rotate" transform={props.transform} />
    <div
      style={{
        display: "inline-block",
        marginLeft: -12,
        fontSize: 7,
        position: "relative",
        top: -5,
        userSelect: "none",
      }}
    >
      {props.txt}
    </div>
  </div>
);

const PageButtons = ({ state, set }: StatePair) => {
  const pageIdx = state.cPageIdx;
  const page = state.cPageFull;
  if (!page || pageIdx === undefined) return null;
  return (
    <>
      <Btn onClick={() => set.pages.duplicate(page.id)} title="Duplicate" icon="file-symlink-file" />
      <Btn onClick={() => set({ modal: { kind: "deletePage", pageIdx } })} title="Delete" icon="trash" />
      <Btn onClick={() => set({ modal: { kind: "reScanPage", pageIdx } })} title="Scan this page again" icon="edit" />
      {satisfies<[number, string, string][]>([
        [-0.5, ".5", "scaleX(-1) rotate(260deg)"],
        [0.5, ".5", "rotate(260deg)"],
        [90, "90", ""],
        [180, "180", "rotate(90deg)"],
      ]).map(([deg, txt, transform]) => (
        <RotateBtn {...{ set, txt, deg, transform }} key={deg} />
      ))}
    </>
  );
};

const Download = ({ state, set }: StatePair) => {
  const f = (processed: number, all: number, startedAt: number) => {
    const elapsed = (Date.now() - startedAt) / 1000;
    const v = Math.round((elapsed / processed) * 10) / 10;
    if (elapsed > 0 && processed > 0) {
      const seconds = Math.round(((all - processed) / processed) * elapsed);
      const rMin = Math.floor(seconds / 60);
      const rSec = seconds % 60;
      const rSec2 = rSec < 10 ? `0${rSec}` : rSec;
      return `${processed}/${all} ${rMin}:${rSec2} (${v}s per page)`;
    } else {
      return `${processed}/${all}`;
    }
  };
  return (
    <Btn onClick={state.kind === "nothing" ? () => set.invoke("pdf") : undefined} title="Generate PDF" icon="file-pdf">
      {state.kind === "generating pdf" ? f(state.processedPages, state.book.pages.length, state.startedAt) : undefined}
    </Btn>
  );
};

export const Buttons = (props: StatePair) => (
  <div id="toolbar">
    <ScanningButtons {...props} />
    <Download {...props} />
    <PageButtons {...props} />
    <Btn onClick={() => props.set({ modal: { kind: "settings" } })} title="Settings" icon="gear" />
  </div>
);
