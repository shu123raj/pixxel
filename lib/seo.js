// File Path: lib/seo.js
// Central SEO configuration for Pixxel — AI Photo Editor
// Har page ka metadata yahin se generate hota hai (single source of truth).

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://pixxel-c7tu.vercel.app"
).replace(/\/$/, "");

export const SITE_NAME = "Pixxel";

export const DEFAULT_TITLE = "Pixxel — Free AI Photo Editor Online";

export const DEFAULT_DESCRIPTION =
  "Edit photos online with Pixxel, the AI photo editor. Remove backgrounds, retouch faces, replace skies, add HDR & bokeh effects — professional image editing powered by AI, right in your browser.";

export const DEFAULT_OG_IMAGE = `${SITE_URL}/logo-text.png`;

export const BASE_KEYWORDS = [
  "AI photo editor",
  "AI image editor",
  "free online photo editor",
  "photo editing with AI",
  "AI photo enhancement",
  "online image editing",
  "Pixxel",
];

/**
 * Build complete Next.js metadata for a page.
 * @param {Object} opts
 * @param {string} opts.title - Page title (without brand suffix)
 * @param {string} opts.description - Meta description (~150-160 chars)
 * @param {string} opts.path - Route path, e.g. "/background"
 * @param {string[]} [opts.keywords] - Page-specific keywords (merged with base)
 * @param {string} [opts.image] - OG image URL (absolute or /relative)
 * @param {boolean} [opts.noIndex] - Set true to keep page out of Google
 */
export function buildMetadata({
  title,
  description,
  path = "/",
  keywords = [],
  image,
  noIndex = false,
}) {
  const url = `${SITE_URL}${path === "/" ? "" : path}`;
  const ogImage = image
    ? image.startsWith("http")
      ? image
      : `${SITE_URL}${image}`
    : DEFAULT_OG_IMAGE;

  return {
    title,
    description,
    keywords: [...new Set([...keywords, ...BASE_KEYWORDS])],
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      url,
      siteName: SITE_NAME,
      type: "website",
      locale: "en_US",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${title} — ${SITE_NAME} AI Photo Editor`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${SITE_NAME}`,
      description,
      images: [ogImage],
    },
    robots: noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
  };
}

/**
 * JSON-LD Schema for the whole site (WebApplication + Organization).
 * Root layout mein <script type="application/ld+json"> ke through inject hota hai.
 */
export function getSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: SITE_NAME,
        url: SITE_URL,
        logo: {
          "@type": "ImageObject",
          url: `${SITE_URL}/pixxel-logo.png`,
        },
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        name: SITE_NAME,
        url: SITE_URL,
        publisher: { "@id": `${SITE_URL}/#organization` },
      },
      {
        "@type": "WebApplication",
        "@id": `${SITE_URL}/#webapplication`,
        name: `${SITE_NAME} — AI Photo Editor`,
        url: SITE_URL,
        description: DEFAULT_DESCRIPTION,
        applicationCategory: "MultimediaApplication",
        operatingSystem: "Web browser",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
          description: "Free plan available with premium upgrades",
        },
        featureList: [
          "AI background removal",
          "AI face retouching",
          "AI skin smoothing",
          "Sky replacement",
          "HDR enhancement",
          "Bokeh effects",
          "E-commerce product photo editing",
        ],
        publisher: { "@id": `${SITE_URL}/#organization` },
      },
    ],
  };
}

/**
 * Per-page JSON-LD (SoftwareApplication feature page as WebPage).
 * @param {Object} opts
 * @param {string} opts.title
 * @param {string} opts.description
 * @param {string} opts.path
 */
export function getPageJsonLd({ title, description, path }) {
  const url = `${SITE_URL}${path === "/" ? "" : path}`;
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${url}/#webpage`,
    name: `${title} | ${SITE_NAME}`,
    description,
    url,
    isPartOf: { "@id": `${SITE_URL}/#website` },
    about: { "@id": `${SITE_URL}/#webapplication` },
  };
}

/**
 * BreadcrumbList JSON-LD — Google search results mein
 * "Home › Feature" breadcrumb trail dikhata hai (rich result).
 * @param {Object} opts
 * @param {string} opts.title - Breadcrumb label for the current page
 * @param {string} [opts.breadcrumb] - Short label override (e.g. "Background Remover")
 * @param {string} opts.path - Route path, e.g. "/background"
 */
export function getBreadcrumbJsonLd({ title, breadcrumb, path }) {
  const url = `${SITE_URL}${path === "/" ? "" : path}`;
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${url}/#breadcrumb`,
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: breadcrumb || title,
        item: url,
      },
    ],
  };
}

/**
 * FEATURE_PAGES — internal linking ka single source of truth.
 * RelatedFeatures component + breadcrumbs isi se generate hote hain.
 * Naya feature page banao toh yahan entry add karo.
 */
export const FEATURE_PAGES = [
  {
    path: "/background",
    label: "AI Background Remover",
    breadcrumb: "Background Remover",
    anchor: "Remove image backgrounds with AI",
    blurb: "Clean cutouts and transparent backgrounds in one click.",
  },
  {
    path: "/face",
    label: "AI Face Retouch",
    breadcrumb: "Face Retouch",
    anchor: "Retouch portraits with AI face editing",
    blurb: "Natural skin smoothing and feature enhancement.",
  },
  {
    path: "/skin",
    label: "AI Skin Retouching",
    breadcrumb: "Skin Retouching",
    anchor: "Smooth skin without the plastic look",
    blurb: "Blemish removal and even skin tone in seconds.",
  },
  {
    path: "/sky",
    label: "AI Sky Replacement",
    breadcrumb: "Sky Replacement",
    anchor: "Replace dull skies with dramatic sunsets",
    blurb: "Automatic sky masking with realistic relighting.",
  },
  {
    path: "/hdr",
    label: "AI HDR Effect",
    breadcrumb: "HDR Effect",
    anchor: "Add HDR depth to any photo",
    blurb: "Balanced shadows, highlights, and vivid detail.",
  },
  {
    path: "/bokeh",
    label: "AI Bokeh Effect",
    breadcrumb: "Bokeh Effect",
    anchor: "Blur photo backgrounds with DSLR-style bokeh",
    blurb: "Professional depth-of-field without a camera lens.",
  },
  {
    path: "/landscape",
    label: "AI Landscape Editor",
    breadcrumb: "Landscape Editor",
    anchor: "Enhance landscape photos with AI",
    blurb: "Richer skies, vivid colors, perfect exposure.",
  },
  {
    path: "/wildlife",
    label: "Wildlife Photo Editor",
    breadcrumb: "Wildlife Editor",
    anchor: "Sharpen wildlife shots with AI enhancement",
    blurb: "Fur and feather detail, noise reduction, low-light fixes.",
  },
  {
    path: "/family",
    label: "Family Photo Editor",
    breadcrumb: "Family Photos",
    anchor: "Enhance and restore family photos",
    blurb: "Group photo fixes and old photo restoration.",
  },
  {
    path: "/ecommerce",
    label: "E-commerce Photo Editor",
    breadcrumb: "E-commerce Photos",
    anchor: "Create marketplace-ready product photos",
    blurb: "Clean backgrounds and perfect lighting for Amazon & Shopify.",
  },
  {
    path: "/demo",
    label: "Live Demo",
    breadcrumb: "Live Demo",
    anchor: "Try the AI photo editor free",
    blurb: "See portrait enhancement and background removal live.",
  },
  {
    path: "/pricing",
    label: "Pricing & Plans",
    breadcrumb: "Pricing",
    anchor: "Compare Pixxel plans and pricing",
    blurb: "Start free, upgrade for pro AI editing tools.",
  },
  {
    path: "/pixxel-os",
    label: "Pixxel OS",
    breadcrumb: "Pixxel OS",
    anchor: "Edit on every device with Pixxel OS",
    blurb: "Desktop power with cloud sync across devices.",
  },
  {
    path: "/Pixxel",
    label: "About Pixxel",
    breadcrumb: "About",
    anchor: "Learn about the Pixxel platform",
    blurb: "The all-in-one AI photo editing platform.",
  },
];

/**
 * Current page ko chhod kar related feature pages return karta hai.
 * Rotation: current page ke index ke BAAD se start hota hai, taaki har
 * page par alag links aayein aur link equity evenly distribute ho.
 * @param {string} currentPath - e.g. "/background"
 * @param {number} [limit] - kitne links chahiye (default 6)
 */
export function getRelatedFeatures(currentPath, limit = 6) {
  const others = FEATURE_PAGES.filter((p) => p.path !== currentPath);
  const idx = FEATURE_PAGES.findIndex((p) => p.path === currentPath);
  const start = idx === -1 ? 0 : idx % others.length;
  return [...others.slice(start), ...others.slice(0, start)].slice(0, limit);
}

/**
 * FAQPage JSON-LD — page par visible FAQ content ke saath match hona chahiye
 * (Google guideline). FAQ rich results ke liye.
 * @param {Array<{question: string, answer: string}>} faqs
 * @param {string} path - Route path (unique @id ke liye)
 */
export function getFaqJsonLd(faqs, path = "/") {
  const url = `${SITE_URL}${path === "/" ? "" : path}`;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${url}/#faq`,
    mainEntity: faqs.map(({ question, answer }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: {
        "@type": "Answer",
        text: answer,
      },
    })),
  };
}
