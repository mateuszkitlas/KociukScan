import { ReactElement, useState } from "react";
import { Icon } from "./icon.js";
import { useDocument } from "./react.mjs";
import { cssVar } from "./cssVars.mjs";
import { DivIB } from "./btn.js";

export function Select<T>(props: {
  options: T[];
  onChange: (newValue: T) => void;
  value: T;
  onRender: (val: T) => ReactElement;
  onKey: (val: T) => React.Key;
}) {
  const [selected, setSelected] = useState(props.value);
  const [hoverKey, setHoverKey] = useState<React.Key>();
  const selectedKey = props.onKey(selected);
  const [expanded, setExpanded] = useState<Record<"top" | "left" | "width", number>>();
  const border = {
    borderWidth: 1,
    borderStyle: "solid",
    borderRadius: 3,
  } satisfies React.CSSProperties;
  useDocument("click", () => expanded && setExpanded(undefined));
  return (
    <>
      <div
        onClick={e => {
          const t = e.currentTarget;
          setExpanded({
            top: t.offsetTop + t.offsetHeight + 2,
            left: t.offsetLeft,
            width: t.offsetWidth,
          });
        }}
        style={{
          borderColor: cssVar("selectBorder"),
          ...border,
          padding: 3,
          color: cssVar("selectColor"),
          display: "inline-block",
          cursor: "pointer",
        }}
      >
        <DivIB
          style={{ verticalAlign: "middle", margin: "0 5px 1px 3px" }}
          children={props.onRender(selected)}
        />
        <Icon name="chevron-down" display="inline-block" verticalAlign="middle" />
      </div>
      {expanded && (
        <div
          style={{
            position: "absolute",
            maxHeight: 300,
            ...expanded,
            borderColor: cssVar("focusedBorder"),
            ...border,
            cursor: "pointer",
            backgroundColor: cssVar("dropdownBackground"),
            zIndex: 1,
          }}
        >
          {props.options
            .map(v => ({
              key: props.onKey(v),
              children: props.onRender(v),
              v,
            }))
            .map(({ key, children, v }) => (
              <div
                key={key}
                onClick={() => setSelected(v)}
                children={children}
                onMouseOver={() => setHoverKey(key)}
                style={{
                  padding: "3px 0 4px 6px",
                  color: cssVar("selectColor"),
                  backgroundColor:
                    hoverKey === key || (key === selectedKey && hoverKey === undefined)
                      ? cssVar("dropdownSelectedBackground")
                      : undefined,
                }}
              />
            ))}
        </div>
      )}
    </>
  );
}
