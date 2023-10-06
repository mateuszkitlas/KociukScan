import { ReactNode } from "react";
import { FaUndo, FaRedo, FaFilePdf, FaCopy, FaTrash, FaEdit, FaCog } from "react-icons/fa/index.js";
import { ScanningButtons } from "./ScanningButtons.js";
import { invoke } from "./utils.mjs";
import { satisfies } from "../native/utils.mjs";
import { StatePair } from "./state.mjs";
import { Btn } from "./btn.js";

const PageButtons = ({ state, set }: StatePair) => {
  const pageIdx = state.cPageIdx;
  const page = state.cPageFull;
  if (!page || pageIdx === undefined) return null;
  return (
    <>
      <Btn onClick={() => set.pages.duplicate(page.id)} title="Duplicate" children={<FaCopy />} />
      <Btn onClick={() => set({ modal: { kind: "deletePage", pageIdx } })} title="Delete" children={<FaTrash />} />
      <Btn
        onClick={() => set({ modal: { kind: "reScanPage", pageIdx } })}
        title="Scan this page again"
        children={<FaEdit />}
      />
      {satisfies<[number, ReactNode, string][]>([
        // eslint-disable-next-line react/jsx-key
        [-0.5, <FaUndo />, "left "],
        // eslint-disable-next-line react/jsx-key
        [0.5, <FaRedo />, "right "],
        [90, "90º", "right "],
        [180, "180º", ""],
      ]).map(([deg, ch, desc]) => (
        <Btn
          onClick={() => set.current.rotate(deg)}
          key={deg}
          title={`Rotate ${desc}by ${deg < 0 ? -deg : deg}º`}
          children={ch}
        />
      ))}
      <input
        onChange={e => set.book.color({ contrast: parseFloat(e.target.value) })}
        key="contrast-book"
        title="Contrast"
        type="range"
        min="1"
        max="2"
        step="0.05"
        value={state.book.color.contrast}
        style={{
          position: "relative",
          top: 11,
          WebkitAppearance: "none",
          backgroundColor: "#445",
          padding: 5,
          borderRadius: 5,
          margin: "0 5px 0 5px",
        }}
      ></input>
      <label key="allowPageResize">
        <input
          className="button"
          type="checkbox"
          checked={state.allowPageResize}
          onChange={e => set({ allowPageResize: e.target.checked })}
        />
        resize
      </label>
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
    <Btn onClick={state.kind === "nothing" ? invoke.cb("pdf") : undefined} title="Generate PDF">
      <FaFilePdf />
      {state.kind === "generating pdf" ? f(state.processedPages, state.book.pages.length, state.startedAt) : undefined}
    </Btn>
  );
};

export const Buttons = (props: StatePair) => (
  <>
    <ScanningButtons {...props} />
    <Download {...props} />
    <PageButtons {...props} />
    <Btn onClick={() => props.set({ modal: { kind: "settings" } })} title="Settings" children={<FaCog />} />
  </>
);
