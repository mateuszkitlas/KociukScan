import { ReactNode } from "react";
import { Btn } from "./btn.js";

export const Modal = (props: {
  buttons?: { name: string; onClick: () => void }[];
  children: ReactNode;
  title?: string;
  onClose?: () => void;
}) => (
  <div className="dialog">
    <div className="title">
      <div className="left" children={props.title}></div>
      <div className="right">{props.onClose && <Btn icon="chrome-close" onClick={props.onClose} />}</div>
    </div>
    <div className="children" children={props.children} />
    <div className="buttons">{props.buttons?.map(b => <div key={b.name} onClick={b.onClick} children={b.name} />)}</div>
  </div>
);

export const ModalYesNo = (props: { children: ReactNode; title?: string; onClose: () => void; onYes: () => void }) => (
  <Modal
    children={props.children}
    buttons={[
      {
        name: "Yes",
        onClick: () => {
          props.onYes();
          props.onClose();
        },
      },
      { name: "No", onClick: props.onClose },
    ]}
  />
);
