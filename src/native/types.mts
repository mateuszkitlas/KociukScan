export interface Book {
  pages: Page[];
  delay: number;
  width: number;
  height: number;
  dpi: number;
  color: Color;
}

export interface Color {
  contrast: number;
}
export namespace Color {
  export const merge = (c1: Page, c2: Book): Color => ({
    contrast: (c1.props?.color.contrast ?? 0) + c2.color.contrast,
  });
}

export interface Page {
  id: number;
  props?: Page.Props;
  original: { width: number; height: number };
}

export namespace Page {
  export interface Full extends Page {
    props: Page.Props;
  }
  export const defaultProps: Props = {
    x: 0,
    y: 0,
    rotate: 0,
    color: { contrast: 0 },
  };
  export interface Props {
    x: number;
    y: number;
    rotate: number;
    color: Color;
  }
}
