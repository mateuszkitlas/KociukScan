import { useState, useEffect } from "react";

const sidebarWidth = 142;
const toolbarHeight = 30;

export const offset = {
  x: sidebarWidth,
  y: toolbarHeight,
};

const f = () => ({
  width: window.innerWidth - offset.x,
  height: window.innerHeight - offset.y,
});

export const useMainPageSize = () => {
  const [state, set] = useState(f());
  useEffect(() => {
    const g = () => set(f());
    window.addEventListener("resize", g);
    return () => window.removeEventListener("resize", g);
  }, []);
  return state;
};
