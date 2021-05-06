import React from 'react';
import { FileDrop } from 'react-file-drop'
import { ModalWithClose } from './modal'
import { scanFromFile } from './scanner';
import { State } from './state'
import { ProcessedPageOpts } from "./logic";

export const importPages = async (s: State) => {
  const addFiles = async (fl: FileList) => {
    const newPages = await Promise.all(Array.from(fl).map(async f =>
        scanFromFile(
          await f.arrayBuffer(),
          ProcessedPageOpts.fromLast(s.rs)
        )
      )
    );
    s.setRS(rs => ({ ...rs, book: { ...rs.book, pages: [...rs.book.pages, ...newPages] } }));
  }

  s.addModal((key, dispose) => {
    return (<ModalWithClose key={key} onClose={dispose}>
      <FileDrop
        onDrop={(files) => files && addFiles(files)}
      ><div style={{
        width: 490,
        height: 250,
        border: "5px dashed #fff",
        borderRadius: 15,
        paddingTop: 240,
        textAlign: "center",
        fontSize: 30
      }}>Drop images here</div>
      </FileDrop>
    </ModalWithClose>
    )
  });
}