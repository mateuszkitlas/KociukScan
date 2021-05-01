import React from 'react';
import { State, emptyRawState } from './state';
import { ModalWithClose, ModalYesNo } from './modal';
import { FaCog, FaFileDownload, FaFileUpload } from 'react-icons/fa';
import { list } from 'scanner-to-buffer';
import { exportBook, importBook } from './exportBook';

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
  renderDevices = (d: string[]) => <div>Detected devices ({d.length}):<br/>{d.map(this.renderDevice)}</div>
  renderDevice = (device: string) => <li key={device}>
      {device}
      { device === this.props.s.rs.device
        ? "(current)"
        : <div className="button" onClick={() => this.props.s.setRS(rs => ({ ...rs, device }))}>use</div>
      }
    </li>
  render = () => {
    const s = this.props.s;
    return <div
      className="button"
      onClick={() => this.setState({ show: true })}
      title="Settings"
    >
      <FaCog/>
      {this.state.show
      ? <ModalWithClose onClose={() => this.setState({ show: false })}>
        {this.state.devices === undefined
        ? <div className="button" onClick={this.detect}>Detect scanning devices</div>
        : this.state.devices === null
          ? <div className="button inactive">Detecting scanning devices...</div>
          : this.renderDevices(this.state.devices)
        }
        <div
          className="button"
          onClick={e => {e.stopPropagation(); this.setState({ deleteProject: true });}}
        >Delete whole project</div>
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
      </ModalWithClose>
      : null}
      <ModalYesNo
        show={!!this.state.deleteProject}
        message="Are you sure?"
        onYes={this.deleteProject}
        onNo={() => this.setState({ deleteProject: false })}
      ></ModalYesNo>
    </div>
  }
}

