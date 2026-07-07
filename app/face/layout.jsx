// File Path: app/face/layout.jsx
// SEO for /face — metadata + rich results (page.jsx client component hai).
import { buildMetadata } from "@/lib/seo";
import { SeoPageShell } from "@/components/seo/seo-page-shell";

const seo = {
  title: "AI Face Retouch — Portrait Photo Editor Online",
  description:
    "Retouch portraits naturally with Pixxel's AI face editor. Smooth skin, enhance features, and perfect every selfie or portrait while keeping it authentic.",
  path: "/face",
  keywords: [
    "AI face retouch",
    "portrait editor",
    "face enhancement",
    "selfie editor",
    "AI portrait retouching",
    "face retouching app online free",
    "natural face editor no plastic look",
    "enhance face in photo AI",
    "professional headshot retouching online",
  ],
};

export const metadata = buildMetadata(seo);

export default function Layout({ children }) {
  return <SeoPageShell seo={seo}>{children}</SeoPageShell>;
}
