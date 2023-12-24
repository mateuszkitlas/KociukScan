import { DetailedHTMLProps, HTMLAttributes } from "react";
import { className as cn, mouse } from "./react.mjs";
import { Icon, IconName, IconProps } from "./icon.js";

export const Btn = ({
  children,
  icon,
  sm,
  onClick,
  className,
  ...props
}: Omit<DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>, "onClick" | "children"> & {
  sm?: boolean;
  onClick?: () => void;
  icon?: IconName | IconProps;
  children?: string;
}) => (
  <div {...props} {...cn("button", className, { sm, inactive: !onClick })} onClick={onClick && mouse(onClick)}>
    {icon && <Icon {...(typeof icon === "string" ? { name: icon } : icon)} />}
    {children && (
      <div style={{ display: "inline-block" }}>
        <div style={{ position: "relative", top: -3, padding: 0, marginRight: -9 }} children={children} />
      </div>
    )}
  </div>
);
