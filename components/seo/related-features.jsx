// File Path: components/seo/related-features.jsx
// Internal linking section — Server Component (no "use client").
// Har feature page ke neeche keyword-rich anchor text ke saath
// doosre feature pages ke links — crawl depth kam hoti hai aur
// link equity distribute hoti hai.
import Link from "next/link";
import { getRelatedFeatures } from "@/lib/seo";

export function RelatedFeatures({ currentPath }) {
  const related = getRelatedFeatures(currentPath, 6);

  return (
    <section
      aria-labelledby="related-features-heading"
      className="relative z-20 border-t border-white/[0.05] bg-[#050507] py-16 sm:py-20"
    >
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <h2
          id="related-features-heading"
          className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-3"
        >
          Explore More{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
            AI Tools
          </span>
        </h2>
        <p className="text-slate-500 text-sm mb-10 max-w-xl">
          Pixxel is a complete AI photo editor — every tool works together in
          one workflow.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {related.map((page) => (
            <Link
              key={page.path}
              href={page.path}
              className="group rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 transition-all duration-300 hover:border-cyan-400/30 hover:bg-white/[0.04]"
            >
              <h3 className="text-[15px] font-bold text-white mb-1.5 group-hover:text-cyan-300 transition-colors">
                {page.label}
              </h3>
              <p className="text-[13px] leading-6 text-slate-500 mb-3">
                {page.blurb}
              </p>
              <span className="text-[13px] font-semibold text-cyan-400/90 group-hover:text-cyan-300 transition-colors">
                {page.anchor} →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
