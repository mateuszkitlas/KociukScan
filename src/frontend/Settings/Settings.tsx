import { SettingsModal } from "../../native/state.mjs";
import { SetState, StatePair } from "../state.mjs";
import { Btn } from "../btn.js";
import { Select } from "../Select.js";

const Devices = (props: { devices: string[]; current?: string; set: SetState }) => (
  <>
    `(${props.devices.length}):`
    <ul>
      {props.devices.map(device => (
        <li key={device}>
          {device}
          {device === props.current ? (
            "(current)"
          ) : (
            <Btn onClick={() => props.set({ device })} children="use" />
          )}
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
        <Select
          options={[150, 200, 300]}
          onChange={dpi => set(rs => ({ book: { ...rs.book, dpi } }))}
          value={state.book.dpi}
          onKey={v => v}
          onRender={v => <>{v} DPI</>}
        />
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
