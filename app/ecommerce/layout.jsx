// File Path: app/ecommerce/layout.jsx
// SEO for /ecommerce — metadata + rich results (page.jsx client component hai).
import { buildMetadata } from "@/lib/seo";
import { SeoPageShell } from "@/components/seo/seo-page-shell";

const seo = {
  title: "E-commerce Product Photo Editor — AI Retouching",
  description:
    "Turn product shots into sales-ready images with Pixxel's AI. Clean backgrounds, perfect lighting, and marketplace-ready product photos for Amazon, Shopify and more.",
  path: "/ecommerce",
  keywords: [
    "product photo editing",
    "ecommerce photo editor",
    "amazon product images",
    "white background product photo",
    "shopify product photo editor",
    "bulk product image editing AI",
    "marketplace ready product photos",
    "product photography retouching online",
  ],
};

export const metadata = buildMetadata(seo);

export default function Layout({ children }) {
  return <SeoPageShell seo={seo}>{children}</SeoPageShell>;
}
