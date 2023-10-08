import { ReactNode } from "react";
import { ScanningButtons } from "./ScanningButtons.js";
import { satisfies } from "../native/utils.mjs";
import { StatePair } from "./state.mjs";
import { Btn } from "./btn.js";
import { Icon } from "./icon.js";

const PageButtons = ({ state, set }: StatePair) => {
  const pageIdx = state.cPageIdx;
  const page = state.cPageFull;
  if (!page || pageIdx === undefined) return null;
  return (
    <>
      <Btn onClick={() => set.pages.duplicate(page.id)} title="Duplicate" icon="file-symlink-file" />
      <Btn onClick={() => set({ modal: { kind: "deletePage", pageIdx } })} title="Delete" icon="trash" />
      <Btn onClick={() => set({ modal: { kind: "reScanPage", pageIdx } })} title="Scan this page again" icon="edit" />
      {satisfies<[number, ReactNode, string][]>([
        // eslint-disable-next-line react/jsx-key
        [-0.5, <Icon name="refresh" transform="scaleX(-1) rotate(90deg)" />, "left "],
        // eslint-disable-next-line react/jsx-key
        [0.5, <Icon name="refresh" transform="rotate(90deg)" />, "right "],
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
        title="Contrast"
        type="range"
        min="1"
        max="2"
        step="0.05"
        value={state.book.color.contrast}
        style={{
          position: "relative",
          WebkitAppearance: "none",
          padding: 5,
          borderRadius: 5,
          margin: "0 5px 0 5px",
        }}
      />
      <label>
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
