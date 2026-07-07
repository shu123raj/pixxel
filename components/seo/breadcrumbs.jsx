"use client";
import Script from "next/script";



import { usePathname } from "next/navigation";
import { SITE_URL } from "@/lib/seo";

export default function Breadcrumbs() {
  const pathname = usePathname();

  const label =
    pathname === "/"
      ? "Home"
      : pathname
          .split("/")
          .filter(Boolean)
          .map((item) =>
            item
              .replace(/-/g, " ")
              .replace(/\b\w/g, (c) => c.toUpperCase())
          )
          .join(" / ");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: label,
        item: `${SITE_URL}${pathname}`,
      },
    ],
  };

  return (
    <Script
      id="breadcrumb-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(jsonLd),
      }}
    />
  );
}