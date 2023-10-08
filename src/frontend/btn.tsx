import { DetailedHTMLProps, HTMLAttributes } from "react";
import { className as cn, mouse } from "./react.mjs";
import { Icon, IconName } from "./icon.js";

export const Btn = ({
  children,
  icon,
  sm,
  onClick,
  className,
  ...props
}: Omit<DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>, "onClick"> & {
  sm?: boolean;
  onClick?: () => void;
  icon?: IconName;
}) => (
  <div {...props} {...cn("button", className, { sm, inactive: !onClick })} onClick={onClick && mouse(onClick)}>
    {icon && <Icon name={icon} />} {children}
  </div>
);
