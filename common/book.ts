export interface Book {
  title: string;
  files: File[];
  fspath: string;
  delay: number;
}

export interface File {
  path: string;
  pages: Page[];
}

export interface Page {
  nr: number;
  crop: { start: Point; end: Point }
  rotate: number;
  orientation: "left" | "right";
}

export interface Point { x: number; y: number; }
