import React from "react";
import "./App.css";
import { State } from "./state";
import { sleep } from "./utils";
import { FaPaw, FaStop } from "react-icons/fa";
import { scan } from "./scanner";

const beep = () => {
  const context = new AudioContext();
  const o = context.createOscillator();
  o.type = "sine";
  o.connect(context.destination);
  o.start();
  setTimeout(() => o.stop(), 300);
};

interface P {
  s: State;
}
type B = React.MouseEventHandler<HTMLDivElement>;
export class ScanningButtons extends React.Component<P> {
  constructor(props: P) {
    super(props);
    this.state = {};
  }
  render = () => {
    const s = this.props.s;
    const one: B = async () => {
      s.setRS(rs => ({ ...rs, kind: "scanning one" }));
      const pageGetter = await scan(s);
      if (pageGetter) {
        const page = await pageGetter();
        s.setRS(rs => ({ ...rs, kind: "nothing", book: { ...rs.book, pages: [...rs.book.pages, page] } }));
      } else {
        s.setRS(rs => ({ ...rs, kind: "nothing" }));
      }
    };
    const many: B = async () => {
      s.setRS(rs => ({ ...rs, kind: "scanning many" }));
      const doScan = async () => (await s.getRS()).kind === "scanning many";
      while(await doScan()) {
        const pageGetter = await scan(s);
        if (pageGetter && (await doScan())) {
          beep();
          const processPage = async () => {
            const page = await pageGetter();
            s.setRS(rs => ({ ...rs, book: { ...rs.book, pages: [...rs.book.pages, page] } }));
          };
          processPage(); // TODO
          await sleep((await s.getRS()).book.delay);
        } else {
          s.setRS(rs => ({ ...rs, kind: "nothing" }));
        }
      }
    };
    const stop: B = () => {
      s.setRS(rs => ({ ...rs, kind: "nothing" }));
    };
    
    const setDelay = (delta: number): B => e => {
      e.stopPropagation();
      if (s.rs.book.delay + delta >= 0) {
        s.setBook({ ...s.rs.book, delay: s.rs.book.delay + delta });
      }
    };

    return [
      s.rs.kind === "nothing"
        ? <div className="button" onClick={one} key="one" title="Scan"><FaPaw /></div>
        : <div className="button" onClick={stop} key="stop" title="Stop"><FaStop /></div>,
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
    ];}
}
