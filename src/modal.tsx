import React from 'react';
import { FaTimesCircle } from 'react-icons/fa';
import './App.css';

export const Modal = (props: React.HTMLProps<HTMLDivElement>) => {
  return <div>
    <div
      style={{
        position: "fixed",
        width: "100%",
        height: 1600,
        backgroundColor: "#000",
        opacity: 0.5,
        top: 0,
        left: 0,
      }}
      key="modal-background"
    ></div>
    <div
      style={{
        position: "fixed",
        width: "100%",
        height: 1600,
        top: 0,
        left: 0,
      }}
      key="modal-foreground"
    >
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%) scale(1)",
          backgroundColor: "#334",
          borderRadius: 5,
          padding: 10,
        }}
      >
        {props.children}
      </div>
    </div>
  </div>
};

export const ModalWithClose = (props: ModalWithClose.Props) =>
  <Modal>
    <div style={{ width: 500, display: "block", textAlign: "right" }}>
      <div className="button" onClick={e => { e.stopPropagation(); props.onClose()}}>
        <FaTimesCircle/>
      </div>
    </div>
    <div style={{ width: "100%", display: "block", textAlign: "left" }}>
      {props.children}
    </div>
  </Modal>;
export namespace ModalWithClose {
  export interface Props {
    children: React.ReactNode;
    onClose: () => void;
  }
}

export const ModalYesNo = (props: ModalYesNo.Props) => props.show
  ? <Modal>
    <div
      style={{
        display: "block",
        margin: "20px auto",
        textAlign: "center",
      }}
    >{props.message}</div>
    <div
      style={{
        display: "block",
        margin: "0 auto"
      }}
    >
      <div className="button" onClick={e => {e.stopPropagation(); props.onYes()}}>Yes</div>
      <div className="button" onClick={e => {e.stopPropagation(); props.onNo()}}>No</div>
    </div>
  </Modal>
  : null;

export namespace ModalYesNo {
  export interface Props {
    message: string;
    onYes: () => void;
    onNo: () => void;
    show: boolean;
  }
};
