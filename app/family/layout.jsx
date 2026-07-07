// File Path: app/family/layout.jsx
// SEO for /family — metadata + rich results (page.jsx client component hai).
import { buildMetadata } from "@/lib/seo";
import { SeoPageShell } from "@/components/seo/seo-page-shell";

const seo = {
  title: "Family Photo Editor — Enhance & Restore with AI",
  description:
    "Make family memories shine with Pixxel's AI. Enhance group photos, fix lighting, restore old family pictures, and get everyone looking their best in one click.",
  path: "/family",
  keywords: [
    "family photo editing",
    "restore old photos",
    "group photo enhancer",
    "photo restoration AI",
    "restore old family photos online free",
    "fix dark faces in group photo",
    "enhance scanned photos AI",
    "old photo repair online",
  ],
};

export const metadata = buildMetadata(seo);

export default function Layout({ children }) {
  return <SeoPageShell seo={seo}>{children}</SeoPageShell>;
}
