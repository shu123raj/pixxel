// File Path: components/seo/seo-page-shell.jsx
// Ek hi wrapper jo har public feature page ke layout.jsx mein use hota hai.
// Yeh inject karta hai:
//   1. JSON-LD: WebPage + BreadcrumbList + FAQPage (rich results)
//   2. Visible breadcrumb trail (schema ke saath match — Google guideline)
//   3. Visible FAQ section (sirf un pages par jinke page.jsx mein apna FAQ nahi)
// Server Component — koi client JS bundle cost nahi.
import {
  getPageJsonLd,
  getBreadcrumbJsonLd,
  FEATURE_PAGES,
} from "@/lib/seo";

import Breadcrumbs from "@/components/seo/breadcrumbs";

export function SeoPageShell({ seo, children }) {
  const feature = FEATURE_PAGES.find((p) => p.path === seo.path);
  const breadcrumbLabel = feature?.breadcrumb || seo.title;

  // Sirf Page + Breadcrumb Schema
  const jsonLd = [
    getPageJsonLd(seo),
    getBreadcrumbJsonLd({
      ...seo,
      breadcrumb: breadcrumbLabel,
    }),
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />

      <Breadcrumbs />

      {children}
    </>
  );
}