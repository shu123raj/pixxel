// File Path: components/seo/seo-page-shell.jsx
// Ek hi wrapper jo har public feature page ke layout.jsx mein use hota hai.
// Yeh inject karta hai:
//   1. JSON-LD: WebPage + BreadcrumbList + FAQPage (rich results)
//   2. Visible breadcrumb trail (schema ke saath match — Google guideline)
//   3. Visible FAQ section (sirf un pages par jinke page.jsx mein apna FAQ nahi)
//   4. RelatedFeatures internal-linking section (link equity + crawl depth)
// Server Component — koi client JS bundle cost nahi.
import {
  getPageJsonLd,
  getBreadcrumbJsonLd,
  getFaqJsonLd,
  FEATURE_PAGES,
} from "@/lib/seo";
import { FAQS, PAGES_WITH_OWN_FAQ_UI } from "@/lib/faqs";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { FaqSection } from "@/components/seo/faq-section";
import { RelatedFeatures } from "@/components/seo/related-features";

export function SeoPageShell({ seo, children }) {
  const feature = FEATURE_PAGES.find((p) => p.path === seo.path);
  const breadcrumbLabel = feature?.breadcrumb || seo.title;
  const faqs = FAQS[seo.path] || [];
  const showFaqUi = faqs.length > 0 && !PAGES_WITH_OWN_FAQ_UI.includes(seo.path);

  // Saare schemas ek hi <script> mein — valid JSON-LD array
  const jsonLd = [
    getPageJsonLd(seo),
    getBreadcrumbJsonLd({ ...seo, breadcrumb: breadcrumbLabel }),
    ...(faqs.length > 0 ? [getFaqJsonLd(faqs, seo.path)] : []),
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Breadcrumbs label={breadcrumbLabel} />
      {children}
      {showFaqUi && <FaqSection faqs={faqs} />}
      <RelatedFeatures currentPath={seo.path} />
    </>
  );
}
