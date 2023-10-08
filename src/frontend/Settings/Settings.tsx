import { SettingsModal } from "../../native/state.mjs";
import { exportBook, importBook } from "../exportBook.mjs";
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
              set({ modal: { ...modal, devices: await set.invoke("listDevices") } });
            }}
            icon="search"
            children="Detect"
          />
        ) : modal.devices === null ? (
          <Btn sm icon="search" children="Detecting..." />
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
        <Btn
          sm
          icon="trash"
          children="Delete"
          onClick={() => set({ modal: { ...modal, modal: { kind: "deleteProject" } } })}
        />
        <Btn sm icon="save" children="Save" onClick={() => exportBook()} />
        <Btn sm icon="folder-opened" onClick={() => importBook()} key="import" children="Load" />
      </li>
      <li>
        Raw images{" "}
        <Btn
          sm
          icon="chrome-restore"
          onClick={() => set({ modal: { ...modal, modal: { kind: "importPages" } } })}
          children="Import"
        />
      </li>
    </ul>
  );
};
