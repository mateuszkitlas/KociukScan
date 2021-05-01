import React from 'react';
import { State } from './state';
import { ModalWithClose } from './modal';
import { FaCog } from 'react-icons/fa';
import { list } from 'scanner-to-buffer';

interface P {
  s: State;
}
interface S {
  show: boolean;
  devices?: string[] | null;
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
  renderDevices = (d: string[]) => <div>Detected devices ({d.length}):<br/>{d.map(this.renderDevice)}</div>
  renderDevice = (device: string) => <li key={device}>
      {device}
      { device === this.props.s.rs.device
        ? "(current)"
        : <div className="button" onClick={() => this.props.s.setRS(rs => ({ ...rs, device }))}>use</div>
      }
    </li>
  render = () => {
    return <div
      className="button"
      onClick={() => this.setState({ show: true })}
      title="Settings"
    >
      <FaCog/>
      {this.state.show
      ? <ModalWithClose onClose={() => this.setState({ show: false })}>
        <div style={{width: "100%", display: "block"}}>
          {
            this.state.devices === undefined
            ? <div className="button" onClick={this.detect}>Detect scanning devices</div>
            : this.state.devices === null
              ? <div className="button inactive">Detecting scanning devices...</div>
              : this.renderDevices(this.state.devices)
            }
        </div>
      </ModalWithClose>
      : null}
    </div>
  }
}

