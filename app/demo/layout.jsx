// File Path: app/demo/layout.jsx
// SEO for /demo — metadata + rich results (page.jsx client component hai).
import { buildMetadata } from "@/lib/seo";
import { SeoPageShell } from "@/components/seo/seo-page-shell";

const seo = {
  title: "Live Demo — Try the AI Photo Editor Free",
  description:
    "See Pixxel in action: portrait enhancement, background removal, and color correction. Try our AI photo editing tools live in your browser — free, no download required.",
  path: "/demo",
  keywords: [
    "photo editor demo",
    "try AI photo editor",
    "free photo editing online",
    "AI photo editor no download",
    "online photo editor no signup",
    "browser based photo editing",
  ],
};

export const metadata = buildMetadata(seo);

export default function Layout({ children }) {
  return <SeoPageShell seo={seo}>{children}</SeoPageShell>;
}
