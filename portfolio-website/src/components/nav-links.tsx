"use client";

import { usePathname } from "next/navigation";

export type NavItem = {
  label: string;
  href: string;
  download?: boolean;
};

/** A link is current when it points at the current page itself, not at a section on it. */
export function isCurrent(href: string, pathname: string): boolean {
  if (href.includes("#")) return false;
  return href === pathname;
}

export function NavLinks({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Main">
      <div className="hw-textnav">
        {items.map((item) => (
          <a
            key={item.label}
            href={item.href}
            download={item.download || undefined}
            aria-current={isCurrent(item.href, pathname) ? "page" : undefined}
          >
            {item.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
