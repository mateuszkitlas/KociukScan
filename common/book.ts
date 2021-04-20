export interface Book {
  title: string;
  pages: Page[];
  fspath: string;
  delay: number;
  width: number;
  height: number;
}

export interface Page {
  hash: string;
  nr?: number;
  x: number;
  y: number;
  rotate: number;
  orientation: "left" | "right";
}
