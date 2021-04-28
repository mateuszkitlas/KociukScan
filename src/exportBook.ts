import { State } from './state';
import AdmZip from "adm-zip";
import { hashToPng } from './utils';
import { dialog } from './electronImports';

export const exportBook = async (s: State) => {
  const filename = dialog.showSaveDialogSync({
    defaultPath: "book.zip",
    filters: [{ extensions: ["zip", "ZIP"], name: "zip"}],
  });
  if (filename) {
    const zip = new AdmZip();
    zip.addFile("book.json", Buffer.from(JSON.stringify(s.rs.book), "utf8"));
    for (const page of s.rs.book.pages) {
      zip.addLocalFile(hashToPng(page.hash));
    }
    await new Promise<void>((resolve, reject) => zip.writeZip(filename, error =>
      error ? reject(error) : resolve()
    ));
  }
}
