// File Path: app/Pixxel/layout.jsx
// SEO for /Pixxel — metadata + rich results (page.jsx client component hai).
import { buildMetadata } from "@/lib/seo";
import { SeoPageShell } from "@/components/seo/seo-page-shell";

const seo = {
  title: "About Pixxel — The AI Photo Editing Platform",
  description:
    "Discover Pixxel: the all-in-one AI photo editing platform. Learn about our AI tools for retouching, background removal, sky replacement and more.",
  path: "/Pixxel",
  keywords: [
    "about Pixxel",
    "AI photo editing platform",
    "Pixxel editor",
    "all in one photo editor AI",
    "Pixxel photo editing tools",
  ],
};

export const metadata = buildMetadata(seo);

export default function Layout({ children }) {
  return <SeoPageShell seo={seo}>{children}</SeoPageShell>;
}
