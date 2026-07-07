// File Path: components/seo/breadcrumbs.jsx
// Visible breadcrumb trail — Server Component (no "use client").
// BreadcrumbList JSON-LD ke saath match karta hai (Google guideline:
// schema wahi dikhaye jo page par visible ho).
import Link from "next/link";

export function Breadcrumbs({ label }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="relative z-30 max-w-7xl mx-auto px-5 lg:px-8 pt-24 pb-0"
    >
      <ol className="flex items-center gap-2 text-[12px] font-medium text-slate-500">
        <li>
          <Link
            href="/"
            className="hover:text-cyan-400 transition-colors"
          >
            Home
          </Link>
        </li>
        <li aria-hidden="true" className="select-none text-slate-600">
          ›
        </li>
        <li aria-current="page" className="text-slate-300">
          {label}
        </li>
      </ol>
    </nav>
  );
}
