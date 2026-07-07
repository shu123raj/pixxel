// File Path: app/pricing/layout.jsx
// SEO for /pricing — metadata + rich results (page.jsx client component hai).
import { buildMetadata } from "@/lib/seo";
import { SeoPageShell } from "@/components/seo/seo-page-shell";

const seo = {
  title: "Pricing & Plans — Free AI Photo Editor",
  description:
    "Simple Pixxel pricing: start free, upgrade for pro AI editing tools. Compare desktop, cross-device and perpetual license plans and pick what fits your workflow.",
  path: "/pricing",
  keywords: [
    "photo editor pricing",
    "AI photo editor free plan",
    "Pixxel plans",
    "photo editing software cost",
    "best value AI photo editor",
    "photo editor perpetual license",
  ],
};

export const metadata = buildMetadata(seo);

export default function Layout({ children }) {
  return <SeoPageShell seo={seo}>{children}</SeoPageShell>;
}
