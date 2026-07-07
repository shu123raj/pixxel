// File Path: app/wildlife/layout.jsx
// SEO for /wildlife — metadata + rich results (page.jsx client component hai).
import { buildMetadata } from "@/lib/seo";
import { SeoPageShell } from "@/components/seo/seo-page-shell";

const seo = {
  title: "Wildlife Photo Editor — AI Enhancement Tools",
  description:
    "Bring wildlife photos to life with Pixxel's AI. Sharpen fur and feathers, fix low light, reduce noise and make every animal shot gallery-worthy.",
  path: "/wildlife",
  keywords: [
    "wildlife photo editing",
    "animal photo enhancer",
    "AI noise reduction",
    "nature photography editing",
    "sharpen bird photos online",
    "fix noisy high ISO photos",
    "safari photo editor AI",
    "denoise wildlife photography",
  ],
};

export const metadata = buildMetadata(seo);

export default function Layout({ children }) {
  return <SeoPageShell seo={seo}>{children}</SeoPageShell>;
}
