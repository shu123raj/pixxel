// File Path: app/robots.js
// Generates /robots.txt automatically.
// Public pages Google ke liye open hain; private/auth/api routes blocked.

import { SITE_URL } from "@/lib/seo";

export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard",
          "/editor/",
          "/sign-in",
          "/sign-up",
          "/api/",
          "/_next/",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
