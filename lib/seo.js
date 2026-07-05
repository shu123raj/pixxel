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
