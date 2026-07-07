// File Path: app/sky/layout.jsx
// SEO for /sky — metadata + rich results (page.jsx client component hai).
import { buildMetadata } from "@/lib/seo";
import { SeoPageShell } from "@/components/seo/seo-page-shell";

const seo = {
  title: "AI Sky Replacement — Change Photo Sky Online",
  description:
    "Swap dull skies for dramatic sunsets, blue skies or starry nights with Pixxel's AI sky replacement. Automatic masking and realistic relighting in seconds.",
  path: "/sky",
  keywords: [
    "sky replacement",
    "change sky in photo",
    "AI sky editor",
    "sunset sky photo",
    "replace sky in photo online free",
    "add dramatic sky to photo",
    "sky swap AI tool",
    "night sky replacement photo editor",
  ],
};

export const metadata = buildMetadata(seo);

export default function Layout({ children }) {
  return <SeoPageShell seo={seo}>{children}</SeoPageShell>;
}
