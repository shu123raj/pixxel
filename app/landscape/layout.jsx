// File Path: app/landscape/layout.jsx
// SEO for /landscape — metadata + rich results (page.jsx client component hai).
import { buildMetadata } from "@/lib/seo";
import { SeoPageShell } from "@/components/seo/seo-page-shell";

const seo = {
  title: "AI Landscape Photo Editor — Enhance Nature Shots",
  description:
    "Enhance landscape photos with Pixxel's AI: richer skies, vivid colors, sharper detail and perfect exposure for mountains, oceans, and every outdoor scene.",
  path: "/landscape",
  keywords: [
    "landscape photo editing",
    "nature photo enhancer",
    "AI landscape enhancement",
    "outdoor photo editor",
    "enhance landscape photos online free",
    "make landscape photos vivid",
    "mountain photography editor AI",
    "golden hour photo enhancement",
  ],
};

export const metadata = buildMetadata(seo);

export default function Layout({ children }) {
  return <SeoPageShell seo={seo}>{children}</SeoPageShell>;
}
