import { DetailedHTMLProps, HTMLAttributes } from "react";
import { className as cn, mouse } from "./react.mjs";

export const Btn = ({
  sm,
  onClick,
  className,
  ...props
}: Omit<DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>, "onClick"> & {
  sm?: boolean;
  onClick?: () => void;
}) => <div {...props} {...cn("button", className, { sm, inactive: !onClick })} onClick={onClick && mouse(onClick)} />;
