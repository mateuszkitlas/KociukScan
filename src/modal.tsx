import React from "react";
import { FaTimesCircle } from "react-icons/fa";
import "./App.css";

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
          top: 300,
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
  </div>;
};

export const ModalWithClose = (props: ModalWithClose.Props) =>
  <Modal>
    <div style={{
      display: "block",
      fontSize: 20,
      backgroundColor: "#445",
      padding: 5,
      margin: "-10px -10px 10px -10px",
      borderRadius: "5px 5px 0 0",
    }}>
      {props.title}
      <div onClick={e => { e.stopPropagation(); props.onClose();}} style={{ float: "right" }}>
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
    title: string;
  }
}

export const ModalYesNo = (props: ModalYesNo.Props) =>
  <Modal>
    <div
      style={{
        display: "block",
        margin: "20px auto",
        textAlign: "center",
      }}
    >{props.children}</div>
    <div
      style={{
        display: "block",
        margin: "0 auto",
        textAlign: "center",
      }}
    >
      <div className="button" onClick={e => {e.stopPropagation(); props.onYes();}}>Yes</div>
      <div className="button" onClick={e => {e.stopPropagation(); props.onNo();}}>No</div>
    </div>
  </Modal>;

export namespace ModalYesNo {
  export interface Props {
    children: React.ReactNode;
    onYes: () => void;
    onNo: () => void;
  }
}
