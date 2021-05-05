import React from 'react';
import './App.css';
import { State } from './state';
import { sleep } from './utils';
import { FaPaw, FaStop } from 'react-icons/fa';
import { ProcessedPageOpts } from './logic';
import { scanX } from './scanner';
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
  scan = async () => {
    const s = this.props.s;
    try {
      return await scanX(ProcessedPageOpts.fromLast(s.rs));
    } catch (err) {
      this.setState({ showError: err.message });
    }
  }
  render = () => {
    const s = this.props.s;
    const one: B = async _e => {
      s.setRS(rs => ({ ...rs, kind: "scanning one" }));
      const page = await this.scan();
      if (page) {
        s.setRS(rs => ({ ...rs, kind: "nothing", book: { ...rs.book, pages: [...rs.book.pages, page] } }));
      } else {
        s.setRS(rs => ({ ...rs, kind: "nothing" }));
      }
    }
    const many: B = async _e => {
      s.setRS(rs => ({ ...rs, kind: "scanning many" }));
      const doScan = async () => (await s.getRS()).kind === "scanning many"
      while(await doScan()) {
        const page = await this.scan();
        if(page && (await doScan())) {
          const context = new AudioContext();
          const o = context.createOscillator();
          o.type = "sine";
          o.connect(context.destination);
          o.start();
          setTimeout(() => o.stop(), 400);
          await sleep((await s.getRS()).book.delay);
          s.setRS(rs => ({ ...rs, book: { ...rs.book, pages: [...rs.book.pages, page] } }));
        } else {
          s.setRS(rs => ({ ...rs, kind: "nothing" }));
        }
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
    this.state.showError
      ? <ModalWithClose onClose={() => this.setState({ showError: undefined })}>
        {this.state.showError}
      </ModalWithClose>
      : null
  ]}
}
