import React from 'react';
import './App.css';
import { State } from './state';
import { sleep } from './utils';
import { FaPaw, FaStop, FaFileUpload, FaFileDownload } from 'react-icons/fa';
import { ProcessedPageOpts } from './logic';
import { scanX } from './scanner';
import { exportBook, importBook } from './exportBook';
import { ModalWithClose } from './modal';


interface P {
  s: State;
}
interface S {
  showError?: string;
}
type B = React.MouseEventHandler<HTMLDivElement>;
export class ScanningButtons extends React.Component<P, S> {
  constructor(props: P) {
    super(props);
    this.state = {};
  }
  scanIf = async (kind: State["rs"]["kind"], setActive: (b: boolean) => boolean) => {
    const s = this.props.s;
    try {
      const page = await scanX(ProcessedPageOpts.fromLast(s.rs));
      await s.createMiniature(page);
      const rs = await s.getRS();
      if (setActive(rs.kind === kind)) {
        return s.setRS(rs => ({ ...rs, book: { ...rs.book, pages: [...rs.book.pages, page] } }));
      }
    } catch (err) {
      this.setState({ showError: err.message });
    }
  }
  render = () => {
    const s = this.props.s;
    const one: B = async _e => {
      s.setRS(rs => ({ ...rs, kind: "scanning one" }));
      await this.scanIf("scanning one", active => active);
      s.setRS(rs => ({ ...rs, kind: "nothing" }));
    }
    const many: B = async _e => {
      s.setRS(rs => ({ ...rs, kind: "scanning many" }));
      let active = true;
      while(active) {
        /* eslint-disable no-loop-func
        */ await this.scanIf("scanning many", activeNew => active = activeNew);
        const context = new AudioContext();
        const o = context.createOscillator();
        o.type = "sine";
        o.connect(context.destination);
        o.start();
        setTimeout(() => o.stop(), 400);
        await sleep((await s.getRS()).book.delay);
      }
    }
    const stop: B = _e => {
      s.setRS(rs => ({ ...rs, kind: "nothing" }));
    }
    
    const setDelay = (delta: number): B => e => {
      e.stopPropagation();
      if (s.rs.book.delay + delta >= 0) {
        s.setBook({ ...s.rs.book, delay: s.rs.book.delay + delta });
      }
    }
    
  
  return [
    ["scanning one", "scanning many"].includes(s.rs.kind)
      ? <div className="button" onClick={stop} key="stop" title="Stop"><FaStop /></div>
      : s.rs.kind === "generating pdf"
      ? <div className="button inactive" key="one" title="Scan"><FaPaw /></div>
      : <div className="button" onClick={one} key="one" title="Scan"><FaPaw /></div>,
    <div
      className={`button ${s.rs.kind === "nothing" ? "" : "inactive"}`}
      onClick={s.rs.kind === "nothing" ? many : undefined}
      key="scan*"
      title="Scan many pages"
    >
      <FaPaw />
      <div className="button" onClick={setDelay(-1)} key="-" title="-1 second" >-</div>
      {s.rs.book.delay}sec
      <div className="button" onClick={setDelay(1)} key="+" title="+1 second" >+</div>
    </div>,
    <div
      className="button"
      onClick={() => exportBook(s)}
      key="export"
      title="Save"
    >
      <FaFileDownload/>
    </div>,
    <div
      className="button"
      onClick={() => importBook(s)}
      key="import"
      title="Load"
    >
      <FaFileUpload/>
    </div>,
    this.state.showError
      ? <ModalWithClose onClose={() => this.setState({ showError: undefined })}>
        {this.state.showError}
      </ModalWithClose>
      : null
  ]}
}
