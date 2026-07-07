// File Path: components/seo/faq-section.jsx
// Visible FAQ accordion — Server Component (native <details>, no JS).
// Google rule: FAQPage schema tabhi valid hai jab questions page par
// VISIBLE hon — yeh section wahi content dikhata hai jo schema mein hai.
export function FaqSection({ faqs, title = "Frequently Asked Questions" }) {
  if (!faqs || faqs.length === 0) return null;

  return (
    <section
      aria-labelledby="faq-heading"
      className="relative z-20 border-t border-white/[0.05] bg-[#030304] py-16 sm:py-24"
    >
      <div className="max-w-4xl mx-auto px-5 lg:px-8">
        <h2
          id="faq-heading"
          className="text-2xl sm:text-4xl font-black tracking-tight text-white mb-10 text-center"
        >
          {title.split(" ").slice(0, -1).join(" ")}{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
            {title.split(" ").slice(-1)}
          </span>
        </h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <details
              key={index}
              className="group rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-xl transition-all duration-300 hover:border-white/20 hover:bg-white/[0.03] open:border-cyan-400/20"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 sm:px-7 py-5 text-[15px] font-semibold text-white [&::-webkit-details-marker]:hidden">
                {faq.question}
                <span
                  aria-hidden="true"
                  className="shrink-0 text-slate-500 transition-transform duration-300 group-open:rotate-180"
                >
                  ⌄
                </span>
              </summary>
              <p className="px-5 sm:px-7 pb-6 text-[14px] leading-7 text-white/60">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
