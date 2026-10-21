import type { ReactNode } from "react";
import { isPlaceholder } from "@/content/placeholder";
import type { Content } from "@/content/types";
import { cn } from "@/lib/utils";

type PlaceholderProps = {
  label: string;
  inline?: boolean;
  className?: string;
};

/** A visible, labelled slot for content that hasn't been supplied yet. */
export function Placeholder({ label, inline = false, className }: PlaceholderProps) {
  const Tag = inline ? "span" : "div";
  return (
    <Tag className={cn("hw-placeholder", inline && "hw-placeholder--inline", className)} data-placeholder={label}>
      [{label}]
    </Tag>
  );
}

/** Renders `value`, or a Placeholder if it is still missing. */
export function ContentSlot<T>({
  value,
  inline,
  children,
}: {
  value: Content<T>;
  inline?: boolean;
  children: (value: T) => ReactNode;
}) {
  if (isPlaceholder(value)) return <Placeholder label={value.label} inline={inline} />;
  return <>{children(value)}</>;
}
