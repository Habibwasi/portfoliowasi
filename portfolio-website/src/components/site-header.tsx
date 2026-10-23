import Link from "next/link";
import { about } from "@/content/about";
import { anchors, hash } from "@/content/anchors";
import { isPlaceholder } from "@/content/placeholder";
import { site } from "@/content/site";
import { NavLinks, type NavItem } from "./nav-links";

/**
 * Nav items in the design system's order: Work, About, CV, Contact.
 * CV appears once the PDF exists.
 */
export function navItems(): NavItem[] {
  const items: NavItem[] = [
    { label: "Work", href: `/${hash(anchors.work)}` },
    { label: "About", href: about.path },
  ];
  if (!isPlaceholder(site.cv)) items.push({ label: "CV", href: site.cv, download: true });
  items.push({ label: "Contact", href: `/${hash(anchors.contact)}` });
  return items;
}

export function SiteHeader() {
  return (
    <>
      <a className="hw-skip" href={hash(anchors.main)}>
        Skip to content
      </a>
      <header className="hw-header">
        <div className="hw-container hw-header__inner">
          <Link className="hw-wordmark" href="/">
            {site.name}
          </Link>
          <NavLinks items={navItems()} />
        </div>
      </header>
    </>
  );
}
