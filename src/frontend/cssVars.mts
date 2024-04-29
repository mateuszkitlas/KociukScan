const cssVars = {
  background: "#1f1f1f",
  toolbar: "#181818",
  toolbarHover: "#1f1f1f",
  border: "#2b2b2b",
  textHover: "#fff",
  text: "#888889",
  textInactive: "#666",
  danger: "#a00",
  selectBorder: "#3c3c3c",
  focusedBorder: "#0078d4",
  dropdownBackground: "#313131",
  dropdownSelectedBackground: "#04395e",
  selectColor: "#cccccc",
};

export const cssVar = (name: keyof typeof cssVars) => `var(--${name})`;
export const injectCssVars = () => {
  const s = document.createElement("style");
  s.textContent = [
    ".dark,body {",
    ...Object.entries(cssVars).map(([k, v]) => `--${k}: ${v};`),
    "}",
  ].join("");
  document.head.appendChild(s);
};
