const sidebarWidth = 142;
const toolbarHeight = 60;

export const offset = {
  x: sidebarWidth,
  y: toolbarHeight,
};

export const mainPageSize = () => ({
  width: window.innerWidth - offset.x,
  height: window.innerHeight - offset.y,
});
