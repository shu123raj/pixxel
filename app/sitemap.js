// File Path: app/sitemap.js
// Generates /sitemap.xml automatically.
// Plain JS (not .ts) — project mein typescript package nahi hai,
// isliye .ts version build par 404 de sakta tha.

import { SITE_URL } from "@/lib/seo";

const publicPages = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/pricing", priority: 0.9, changeFrequency: "weekly" },
  { path: "/background", priority: 0.85, changeFrequency: "monthly" },
  { path: "/demo", priority: 0.8, changeFrequency: "weekly" },
  { path: "/hdr", priority: 0.8, changeFrequency: "monthly" },
  { path: "/face", priority: 0.8, changeFrequency: "monthly" },
  { path: "/skin", priority: 0.75, changeFrequency: "monthly" },
  { path: "/bokeh", priority: 0.75, changeFrequency: "monthly" },
  { path: "/landscape", priority: 0.75, changeFrequency: "monthly" },
  { path: "/wildlife", priority: 0.75, changeFrequency: "monthly" },
  { path: "/family", priority: 0.7, changeFrequency: "monthly" },
  { path: "/sky", priority: 0.7, changeFrequency: "monthly" },
  { path: "/ecommerce", priority: 0.7, changeFrequency: "monthly" },
  { path: "/pixxel-os", priority: 0.65, changeFrequency: "monthly" },
  { path: "/Pixxel", priority: 0.6, changeFrequency: "monthly" },
];

export default function sitemap() {
  const lastModified = new Date();

  return publicPages.map(({ path, priority, changeFrequency }) => ({
    url: `${SITE_URL}${path === "/" ? "" : path}`,
    lastModified,
    changeFrequency,
    priority,
  }));
}
