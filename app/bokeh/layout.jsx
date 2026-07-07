// File Path: app/bokeh/layout.jsx
// SEO for /bokeh — metadata + rich results (page.jsx client component hai).
import { buildMetadata } from "@/lib/seo";
import { SeoPageShell } from "@/components/seo/seo-page-shell";

const seo = {
  title: "AI Bokeh Effect — Blur Photo Background Online",
  description:
    "Add dreamy DSLR-style bokeh and background blur to any photo with Pixxel's AI. Create professional portrait depth-of-field effects online — no camera lens needed.",
  path: "/bokeh",
  keywords: [
    "bokeh effect online",
    "blur background",
    "AI depth of field",
    "portrait blur",
    "photo background blur",
    "blur background of photo online free",
    "add bokeh to photo without photoshop",
    "DSLR blur effect app",
    "portrait mode effect online",
  ],
};

export const metadata = buildMetadata(seo);

export default function Layout({ children }) {
  return <SeoPageShell seo={seo}>{children}</SeoPageShell>;
}
