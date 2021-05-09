import React from "react";
import { State, emptyRawState } from "./state";
import { ModalWithClose, ModalYesNo } from "./modal";
import { FaCog, FaFileDownload, FaFileUpload, FaImage, FaSearch, FaTrash } from "react-icons/fa";
import { list } from "scanner-to-buffer";
import { exportBook, importBook } from "./exportBook";
import { DPI } from "./types";
import { importPages } from "./importPages";

interface P {
  s: State;
}
interface S {
  show: boolean;
  devices?: string[] | null;
  deleteProject?: boolean;
}

export class Settings extends React.Component<P, S> {
  constructor(props: P) {
    super(props);
    this.state = { show: false };
  }
  detect = async () => {
    this.setState({ devices: null });
    const devices = await list();
    this.setState({ devices });
  }
  deleteProject = () => {
    this.props.s.setRS(() => emptyRawState);
    this.setState({ deleteProject: false });
  }

  renderDevices = (d: string[]) => [
    `(${d.length}):`,
    <ul key="devices">
      {d.map(device =>
        <li key={device}>
          {device}
          { device === this.props.s.rs.device
            ? "(current)"
            : <div className="button" onClick={() => this.props.s.setRS(rs => ({ ...rs, device }))}>use</div>
          }
        </li>)}
    </ul>
  ]

  renderModal = () => {
    const s = this.props.s;
    return <ul>
      <li>
        Scanning devices
        {this.state.devices === undefined
          ? <div className="button sm" onClick={this.detect}><FaSearch/> Detect</div>
          : this.state.devices === null
            ? <div className="button sm inactive"><FaSearch/> Detecting...</div>
            : this.renderDevices(this.state.devices)}
      </li>
      <li>
        DPI
        <select
          className="sm"
          onChange={e => {
            const dpi = parseFloat(e.target.value) as DPI;
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
          onClick={e => {e.stopPropagation(); this.setState({ deleteProject: true });}}
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
          onClick={() => importPages(s)}
          key="import"
          title="Load"
        ><FaImage/> Import
        </div>
      </li>
    </ul>;
  }

  render = () =>
    <div
      className="button"
      onClick={() => this.setState({ show: true })}
      title="Settings"
    >
      <FaCog/>
      {this.state.show
        ? <ModalWithClose title="Settings" onClose={() => this.setState({ show: false })}>{this.renderModal()}</ModalWithClose>
        : null}
      {this.state.deleteProject
        ? <ModalYesNo
          onYes={this.deleteProject}
          onNo={() => this.setState({ deleteProject: false })}
        >Are you sure?
        </ModalYesNo>
        : null}
    </div>
}
