export interface Book {
  title: string;
  files: File[];
  fspath: string;
  delay: number;
  width: number;
  height: number;
}

export interface File {
  path: string;
  pages: Page[];
  hash: string;
}

export interface Page {
  nr: number;
  x: number;
  y: number;
  rotate: number;
  orientation: "left" | "right";
}
