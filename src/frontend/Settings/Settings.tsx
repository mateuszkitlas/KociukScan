import { FaFileDownload, FaFileUpload, FaImage, FaSearch, FaTrash } from "react-icons/fa";
import { list } from "scanner-to-buffer";
import { SettingsModal, State } from "../../native/state";
import { exportBook, importBook } from "../exportBook";

const renderDevices = (d: string[], s: State) => [
  `(${d.length}):`,
  <ul key="devices">
    {d.map(device =>
      <li key={device}>
        {device}
        { device === s.rs.device
          ? "(current)"
          : <div className="button" onClick={() => s.setRS(rs => ({ ...rs, device }))}>use</div>
        }
      </li>)}
  </ul>
];

const detect = async (s: State, modal: SettingsModal) => {
  s.setRS(rs => ({ ...rs, modal: { ...modal, devices: null } }));
  const devices = await list();
  s.setRS(rs => ({ ...rs, modal: { ...modal, devices } }));
};

export const Settings = (props: { modal: SettingsModal, s: State }) => {
  const { s, modal } = props;
  return <ul>
    <li>
      Scanning devices
      {modal.devices === undefined
        ? <div className="button sm" onClick={() => detect(s, modal)}><FaSearch/> Detect</div>
        : modal.devices === null
          ? <div className="button sm inactive"><FaSearch/> Detecting...</div>
          : renderDevices(modal.devices, s)}
    </li>
    <li>
      DPI
      <select
        className="sm"
        onChange={e => {
          const dpi = parseFloat(e.target.value);
          s.setBook({ ...s.rs.book, dpi });
        }}
        value={s.rs.book.dpi}
        key={"dpi"}
      >{[150, 200, 300].map(v => <option value={v} key={v}>{v}</option>)}
      </select><br/>
      The higher DPI, the better quality of picture, but it is also more time consuming.
    </li>
    <li>
      Project
      <div
        className="button sm"
        onClick={() => s.setRS(rs => ({ ...rs, modal: { ...modal, modal: { kind: "deleteProject" } } }))}
      ><FaTrash/> Delete</div>
      <div
        className="button sm"
        onClick={() => exportBook(s)}
        key="export"
        title="Save"
      ><FaFileDownload/> Save</div>
      <div
        className="button sm"
        onClick={() => importBook(s)}
        key="import"
        title="Load"
      ><FaFileUpload/> Load</div>
    </li>
    <li>
      Raw images <div
        className="button sm"
        onClick={() => s.setRS(rs => ({ ...rs, modal: { ...modal, modal: { kind: "importPages" } } }))}
        key="import"
        title="Import"
      ><FaImage/> Import
      </div>
    </li>
  </ul>;
};
