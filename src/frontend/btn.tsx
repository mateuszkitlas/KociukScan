import { DetailedHTMLProps, HTMLAttributes } from "react";
import { className as cn, mouse } from "./react.mjs";
import { Icon, IconName, IconProps } from "./icon.js";
import { SRecord } from "../native/utils.mjs";

export type DivProps<U extends SRecord<unknown> = Record<never, never>> = Omit<
  DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>,
  keyof U
> &
  U;

export const DivIB = (props: DivProps) => (
  <div {...props} style={{ display: "inline-block", ...props.style }} />
);

export const Btn = ({
  children,
  icon,
  sm,
  onClick,
  className,
  ...props
}: DivProps<{
  sm?: boolean;
  onClick?: () => void;
  icon?: IconName | IconProps;
  children?: string;
}>) => (
  <div
    {...props}
    {...cn("button", className, { sm, inactive: !onClick })}
    onClick={onClick && mouse(onClick)}
  >
    {icon && <Icon {...(typeof icon === "string" ? { name: icon } : icon)} />}
    {children && (
      <DivIB>
        <div
          style={{ position: "relative", top: -3, padding: 0, marginRight: -9 }}
          children={children}
        />
      </DivIB>
    )}
  </div>
);
