// File Path: app/background/layout.jsx
// SEO for /background — metadata + rich results (page.jsx client component hai).
// SeoPageShell inject karta hai: JSON-LD (WebPage + Breadcrumb + FAQ),
// visible breadcrumbs aur RelatedFeatures internal links.
import { buildMetadata } from "@/lib/seo";
import { SeoPageShell } from "@/components/seo/seo-page-shell";

const seo = {
  title: "AI Background Remover & Editor — Remove BG Free",
  description:
    "Remove and change photo backgrounds instantly with Pixxel's AI background remover. Get clean cutouts, transparent backgrounds, and studio-quality results in one click.",
  path: "/background",
  keywords: [
    "background remover",
    "remove background from image",
    "AI background eraser",
    "transparent background maker",
    "change photo background online",
    "remove bg free",
    "background remover free no watermark",
    "png transparent background converter",
    "product photo background removal",
    "one click background remover online",
  ],
};

export const metadata = buildMetadata(seo);

export default function Layout({ children }) {
  return <SeoPageShell seo={seo}>{children}</SeoPageShell>;
}
