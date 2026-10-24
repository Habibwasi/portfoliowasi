import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Stamp-like mono label. `ai` tags (ink fill) read apart from languages and frameworks. */
export function Tag({ children, ai = false, className }: { children: ReactNode; ai?: boolean; className?: string }) {
  return <span className={cn("hw-tag", ai && "hw-tag--ai", className)}>{children}</span>;
}

export function Tags({ items, aiItems = [], className }: { items: string[]; aiItems?: string[]; className?: string }) {
  if (items.length === 0 && aiItems.length === 0) return null;
  return (
    <div className={cn("hw-tags", className)}>
      {aiItems.map((item) => (
        <Tag key={`ai-${item}`} ai>
          {item}
        </Tag>
      ))}
      {items.map((item) => (
        <Tag key={item}>{item}</Tag>
      ))}
    </div>
  );
}
