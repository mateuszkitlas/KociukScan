import { useEffect, useRef, useState } from "react";
import { FileDrop } from "react-file-drop";
import { arrayBufferToBuffer, toError } from "../native/utils.mjs";
import { isPdf, pdfToPngs } from "./pdfImport.mjs";
import { StatePair } from "./state.mjs";

/** Drop zone and file picker that adds images, or every page of a PDF, as pages. */
export const ImportPages = ({ state, set }: StatePair) => {
  const [status, setStatus] = useState<string>();
  const [busy, setBusy] = useState(false);
  const cancelled = useRef(false);
  useEffect(
    () => () => {
      cancelled.current = true;
    },
    [],
  );

  const addPages = async (pngs: ArrayBuffer[]) => {
    const pages = await set.invoke("scanFromFiles", pngs.map(arrayBufferToBuffer));
    set.pages(prev => [...prev, ...pages]);
    return pages.length;
  };

  const addFiles = async (list: FileList) => {
    if (busy) return;
    const files = Array.from(list);
    setBusy(true);
    let added = 0;
    try {
      const images = files.filter(f => !isPdf(f));
      if (images.length) {
        setStatus(`Importing ${images.length} image(s)…`);
        added += await addPages(await Promise.all(images.map(f => f.arrayBuffer())));
      }
      for (const pdf of files.filter(isPdf)) {
        for await (const { number, count, png } of pdfToPngs(
          await pdf.arrayBuffer(),
          state.book.dpi,
        )) {
          if (cancelled.current) return;
          setStatus(`${pdf.name}: page ${number} of ${count}`);
          added += await addPages([png]);
        }
      }
      if (!cancelled.current) setStatus(`Imported ${added} page(s).`);
    } catch (e) {
      if (cancelled.current) return;
      setStatus(undefined);
      set({ modal: { kind: "error", message: toError(e).message } });
    } finally {
      if (!cancelled.current) setBusy(false);
    }
  };

  return (
    <>
      <FileDrop onDrop={files => files && addFiles(files)}>
        <div
          style={{
            width: 490,
            height: 250,
            border: "5px dashed #fff",
            borderRadius: 15,
            paddingTop: 240,
            textAlign: "center",
            fontSize: 30,
          }}
        >
          {busy ? status : "Drop images or a PDF here"}
        </div>
      </FileDrop>
      <div style={{ marginTop: 10 }}>
        <input
          type="file"
          multiple
          accept="image/*,application/pdf,.pdf"
          disabled={busy}
          onChange={e => e.target.files && addFiles(e.target.files)}
        />
        {!busy && status}
      </div>
    </>
  );
};
