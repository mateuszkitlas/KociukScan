import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";
// @ts-expect-error the worker module ships without type declarations
import * as pdfWorker from "pdfjs-dist/legacy/build/pdf.worker.mjs";

// Run pdf.js in this thread (its "fake worker") instead of loading a separate worker
// script, which the page's file:// origin and CSP make awkward.
(globalThis as { pdfjsWorker?: unknown }).pdfjsWorker = pdfWorker;

export const isPdf = (file: File) =>
  file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

const canvasToPng = (canvas: HTMLCanvasElement) =>
  new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(b => (b ? resolve(b) : reject(new Error("Could not encode page"))), "image/png"),
  );

/** Renders each page of a PDF at the given DPI and yields it as a PNG. */
export async function* pdfToPngs(data: ArrayBuffer, dpi: number) {
  const doc = await pdfjs.getDocument({ data: new Uint8Array(data), isEvalSupported: false })
    .promise;
  try {
    for (let number = 1; number <= doc.numPages; number++) {
      const page = await doc.getPage(number);
      const viewport = page.getViewport({ scale: dpi / 72 });
      const canvas = document.createElement("canvas");
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Canvas 2D context is not available");
      context.fillStyle = "white";
      context.fillRect(0, 0, canvas.width, canvas.height);
      await page.render({ canvasContext: context, viewport }).promise;
      page.cleanup();
      const png = await (await canvasToPng(canvas)).arrayBuffer();
      canvas.width = canvas.height = 0;
      yield { number, count: doc.numPages, png };
    }
  } finally {
    await doc.destroy();
  }
}
