// File Path: app/pixxel-os/layout.jsx
// SEO for /pixxel-os — metadata + rich results (page.jsx client component hai).
import { buildMetadata } from "@/lib/seo";
import { SeoPageShell } from "@/components/seo/seo-page-shell";

const seo = {
  title: "Pixxel OS — AI Photo Editing on Every Device",
  description:
    "Pixxel OS brings AI photo editing to desktop and every device. Sync your workflow anywhere with the Pixxel cloud engine, built for professional creators.",
  path: "/pixxel-os",
  keywords: [
    "Pixxel OS",
    "desktop photo editor",
    "cross-device photo editing",
    "cloud photo editor",
    "photo editor with cloud sync",
    "AI photo editor for Windows and Mac",
    "professional photo editing software",
  ],
};

export const metadata = buildMetadata(seo);

export default function Layout({ children }) {
  return <SeoPageShell seo={seo}>{children}</SeoPageShell>;
}
