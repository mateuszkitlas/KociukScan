import { dialog } from "electron";

export const exportBook = async () => {
  const filename = dialog.showSaveDialogSync({
    defaultPath: "book.zip",
    filters: [{ extensions: ["zip", "ZIP"], name: "zip" }],
  });
  if (filename) {
    /*const zip = new AdmZip();
    zip.addFile("book.json", Buffer.from(JSON.stringify(s.rs.book), "utf8"));
    for (const page of s.rs.book.pages) {
      zip.addLocalFile(hashToPng(s.rs.tmpPath ?? "unknown", page.hash));
    }
    await new Promise<void>((resolve, reject) => zip.writeZip(filename, error =>
      error ? reject(error) : resolve()
    ));*/
  }
};

export const importBook = async () => {
  const filename = dialog.showOpenDialogSync({
    defaultPath: "book.zip",
    filters: [{ extensions: ["zip", "ZIP"], name: "zip" }],
    properties: ["openFile"],
  });
  if (filename && filename[0]) {
    /*const zip = new AdmZip(filename[0]);
    const book: Book = JSON.parse(zip.readAsText("book.json"));
    for (const page of book.pages) {
      zip.extractEntryTo(`${page.hash}.png`, dirname(hashToPng(s.rs.tmpPath ?? "unknown", page.hash)), true, true);
    }
    s.setRS(() => loadRSFromBook(book));*/
  }
};
