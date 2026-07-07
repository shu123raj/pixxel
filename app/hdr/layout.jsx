// File Path: app/hdr/layout.jsx
// SEO for /hdr — metadata + rich results (page.jsx client component hai).
import { buildMetadata } from "@/lib/seo";
import { SeoPageShell } from "@/components/seo/seo-page-shell";

const seo = {
  title: "AI HDR Photo Effect — Enhance Dynamic Range",
  description:
    "Give photos stunning HDR depth with Pixxel's AI. Balance shadows and highlights, boost detail and color, and create dramatic high-dynamic-range images instantly.",
  path: "/hdr",
  keywords: [
    "HDR photo editor",
    "AI HDR effect",
    "dynamic range enhancement",
    "HDR photography online",
    "HDR effect from single photo",
    "fix overexposed sky in photo",
    "recover shadow detail AI",
    "real estate photo HDR editor",
  ],
};

export const metadata = buildMetadata(seo);

export default function Layout({ children }) {
  return <SeoPageShell seo={seo}>{children}</SeoPageShell>;
}
