export interface Book {
  title: string;
  files: File[];
  fspath: string;
}

export interface File {
  path: string;
  nr?: number;
  crop: { start: Point; end: Point }
  rotate: number;
  orientation: "left" | "right";
}

export interface Point { x: number; y: number; }
