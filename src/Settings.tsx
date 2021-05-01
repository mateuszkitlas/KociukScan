import React from 'react';
import { State, emptyRawState } from './state';
import { ModalWithClose, ModalYesNo } from './modal';
import { FaCog, FaFileDownload, FaFileUpload } from 'react-icons/fa';
import { list } from 'scanner-to-buffer';
import { exportBook, importBook } from './exportBook';
import { DPI } from './types';


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
    this.props.s.setRS(_ => emptyRawState);
    this.setState({ deleteProject: false })
  }

  renderDevices = (d: string[]) => [
    `(${d.length}):`,
    <ul>
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
          ? <div className="button" onClick={this.detect}>detect</div>
          : this.state.devices === null
            ? <div className="button inactive">detecting...</div>
            : this.renderDevices(this.state.devices)}
      </li>
      <li>
        DPI
        <select
          onChange={e => {
            const dpi = parseFloat(e.target.value) as DPI;
            s.setBook({ ...s.rs.book, dpi });
          }}
          value={s.rs.book.dpi}
          key={`dpi`}
        >{[75, 100, 200, 300].map(v => <option value={v} key={v}>{v}</option>)}
        </select><br/>
        The higher DPI, the better quality of picture, but it's also more time consuming.
      </li>
      <li>
        <div
          className="button"
          onClick={e => {e.stopPropagation(); this.setState({ deleteProject: true });}}
        >Delete whole project</div><br/>
      </li>
      <li>
        <div
          className="button"
          onClick={() => exportBook(s)}
          key="export"
          title="Save"
        ><FaFileDownload/> Save
        </div>
        <div
          className="button"
          onClick={() => importBook(s)}
          key="import"
          title="Load"
        ><FaFileUpload/> Load
        </div>
      </li>
    </ul>
  }

  render = () =>
    <div
      className="button"
      onClick={() => this.setState({ show: true })}
      title="Settings"
    >
      <FaCog/>
      {this.state.show
      ? <ModalWithClose onClose={() => this.setState({ show: false })}>{this.renderModal()}</ModalWithClose>
      : null}
      <ModalYesNo
        show={!!this.state.deleteProject}
        message="Are you sure?"
        onYes={this.deleteProject}
        onNo={() => this.setState({ deleteProject: false })}
      ></ModalYesNo>
    </div>
}
