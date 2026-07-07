// File Path: app/skin/layout.jsx
// SEO for /skin — metadata + rich results (page.jsx client component hai).
import { buildMetadata } from "@/lib/seo";
import { SeoPageShell } from "@/components/seo/seo-page-shell";

const seo = {
  title: "AI Skin Retouching — Smooth Skin Photo Editor",
  description:
    "Get flawless, natural-looking skin with Pixxel's AI skin retouching. Remove blemishes, even skin tone, and smooth texture without the plastic look.",
  path: "/skin",
  keywords: [
    "skin retouching",
    "blemish remover",
    "AI skin smoothing",
    "skin editor online",
    "remove acne from photo online",
    "even skin tone photo editor",
    "natural skin retouching AI free",
    "smooth skin without losing texture",
  ],
};

export const metadata = buildMetadata(seo);

export default function Layout({ children }) {
  return <SeoPageShell seo={seo}>{children}</SeoPageShell>;
}
