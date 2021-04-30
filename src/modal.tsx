import React from 'react';
import './App.css';

export const Modal = (props: React.HTMLProps<HTMLDivElement>) => {
  return <div>
    <div
      style={{
        position: "fixed",
        width: "100%",
        height: "100%",
        backgroundColor: "#000",
        opacity: 0.5,
        top: 0,
      }}
      key="modal-background"
    ></div>
    <div
      style={{
        position: "fixed",
        width: "100%",
        height: "100%",
        top: 0,
      }}
      key="modal-foreground"
    >
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%)",
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

export const ModalYesNo = (props: Props) => props.show
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
      <div className="button" onClick={props.onYes}>Yes</div>
      <div className="button" onClick={props.onNo}>No</div>
    </div>
  </Modal>
  : null;

export interface Props {
  message: string;
  onYes: () => void;
  onNo: () => void;
  show: boolean;
};

