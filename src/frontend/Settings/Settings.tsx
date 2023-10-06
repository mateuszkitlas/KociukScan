import { FaFileDownload, FaFileUpload, FaImage, FaSearch, FaTrash } from "react-icons/fa/index.js";
import { SettingsModal } from "../../native/state.mjs";
import { exportBook, importBook } from "../exportBook.mjs";
import { invoke } from "../utils.mjs";
import { SetState, StatePair } from "../state.mjs";
import { Btn } from "../btn.js";

const Devices = (props: { devices: string[]; current?: string; set: SetState }) => (
  <>
    `(${props.devices.length}):`
    <ul>
      {props.devices.map(device => (
        <li key={device}>
          {device}
          {device === props.current ? "(current)" : <Btn onClick={() => props.set({ device })} children="use" />}
        </li>
      ))}
    </ul>
  </>
);

export const Settings = ({ set, state, modal }: StatePair & { modal: SettingsModal }) => {
  return (
    <ul>
      <li>
        Scanning devices
        {modal.devices === undefined ? (
          <Btn
            sm
            onClick={async () => {
              set({ modal: { ...modal, devices: null } });
              set({ modal: { ...modal, devices: await invoke("listDevices") } });
            }}
          >
            <FaSearch /> Detect
          </Btn>
        ) : modal.devices === null ? (
          <Btn sm>
            <FaSearch /> Detecting...
          </Btn>
        ) : (
          <Devices devices={modal.devices} current={state.device} set={set} />
        )}
      </li>
      <li>
        DPI
        <select
          className="sm"
          onChange={e => set(rs => ({ book: { ...rs.book, dpi: parseFloat(e.target.value) } }))}
          value={state.book.dpi}
        >
          {[150, 200, 300].map(v => (
            <option value={v} key={v} children={v} />
          ))}
        </select>
        <br />
        The higher DPI, the better quality of picture, but it is also more time consuming.
      </li>
      <li>
        Project
        <Btn sm onClick={() => set({ modal: { ...modal, modal: { kind: "deleteProject" } } })}>
          <FaTrash /> Delete
        </Btn>
        <Btn sm onClick={() => exportBook()} key="export" title="Save">
          <FaFileDownload /> Save
        </Btn>
        <Btn sm onClick={() => importBook()} key="import" title="Load">
          <FaFileUpload /> Load
        </Btn>
      </li>
      <li>
        Raw images{" "}
        <Btn sm onClick={() => set({ modal: { ...modal, modal: { kind: "importPages" } } })} title="Import">
          <FaImage /> Import
        </Btn>
      </li>
    </ul>
  );
};
