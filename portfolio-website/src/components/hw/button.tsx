import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "text";

type CommonProps = {
  variant?: ButtonVariant;
  className?: string;
  children: ReactNode;
};

type LinkButtonProps = CommonProps & { href: string } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "className">;
type NativeButtonProps = CommonProps & { href?: undefined } & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className">;

export type ButtonProps = LinkButtonProps | NativeButtonProps;

/**
 * One primary per screen (signal fill); secondary is outlined; text is a cobalt link.
 * Renders an <a> when given href, otherwise a <button>.
 */
export function Button(props: ButtonProps) {
  const { variant = "secondary", className, children } = props;
  const classes = cn("hw-btn", variant === "primary" && "hw-btn--primary", variant === "text" && "hw-btn--text", className);

  if (props.href !== undefined) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { variant: _v, className: _c, children: _ch, ...rest } = props;
    return (
      <a {...rest} className={classes}>
        {children}
      </a>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { variant: _v, className: _c, children: _ch, type = "button", ...rest } = props;
  return (
    <button {...rest} type={type} className={classes}>
      {children}
    </button>
  );
}
