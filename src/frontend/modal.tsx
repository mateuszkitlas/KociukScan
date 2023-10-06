import React from "react";
import { FaTimesCircle } from "react-icons/fa/index.js";
import { mouse } from "./react.mjs";
import { Btn } from "./btn.js";

export const Modal = (props: React.HTMLProps<HTMLDivElement>) => {
  return (
    <div>
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
    </div>
  );
};

interface Common {
  children: React.ReactNode;
  onClose: () => void;
}
export const ModalWithClose = (props: Common & { title: string }) => (
  <Modal>
    <div
      style={{
        display: "block",
        fontSize: 20,
        backgroundColor: "#445",
        padding: 5,
        margin: "-10px -10px 10px -10px",
        borderRadius: "5px 5px 0 0",
      }}
    >
      {props.title}
      <div onClick={mouse(props.onClose)} style={{ float: "right" }}>
        <FaTimesCircle />
      </div>
    </div>
    <div style={{ width: "100%", display: "block", textAlign: "left" }}>{props.children}</div>
  </Modal>
);

export const ModalYesNo = (props: Common & { onYes: () => void }) => (
  <Modal>
    <div
      style={{
        display: "block",
        margin: "20px auto",
        textAlign: "center",
      }}
    >
      {props.children}
    </div>
    <div
      style={{
        display: "block",
        margin: "0 auto",
        textAlign: "center",
      }}
    >
      <Btn
        onClick={() => {
          props.onYes();
          props.onClose();
        }}
        children="Yes"
      />
      <Btn onClick={props.onClose} children="No" />
    </div>
  </Modal>
);
