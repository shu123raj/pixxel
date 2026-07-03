import { useIntersectionObserver } from "@/hooks/use-landing-hooks";
import { useAuth } from "@clerk/nextjs";
import { useState } from "react";
import { Button } from "./ui/button";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

const PricingCard = ({
  id,
  plan,
  price,
  features,
  featured = false,
  planId,
  buttonText,
  description,
  index,
}) => {
  const [ref, isVisible] = useIntersectionObserver();
  const [isHovered, setIsHovered] = useState(false);
  const { has } = useAuth();

  // Check if user has this specific plan
  const isCurrentPlan = id ? has?.({ plan: id }) : false;

  const handlePopup = async () => {
    if (isCurrentPlan) return;

    try {
      if (window.Clerk && window.Clerk.__internal_openCheckout) {
        await window.Clerk.__internal_openCheckout({
          planId: planId,
          planPeriod: "month",
          subscriberType: "user",
        });
      }
    } catch (error) {
      console.error("Checkout error:", error);
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delay: index * 0.2,
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      variants={cardVariants}
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative rounded-2xl lg:rounded-3xl p-6 sm:p-8 lg:p-10 transition-all duration-500 cursor-pointer overflow-hidden border ${
        featured
          ? "border-cyan-500/50 shadow-[0_0_40px_rgba(34,211,238,0.2)] lg:scale-105 bg-gradient-to-br from-cyan-500/15 to-blue-500/10"
          : "border-white/10 hover:border-cyan-500/30 bg-gradient-to-br from-white/5 to-white/[0.02] hover:from-white/10 hover:to-white/5"
      } ${isHovered ? "shadow-[0_20px_40px_rgba(0,0,0,0.3)]" : ""}`}
    >
      {featured && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10"
        >
          <div className="bg-gradient-to-r from-cyan-400 to-blue-500 text-white px-4 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap shadow-lg">
            🌟 Most Popular
          </div>
        </motion.div>
      )}

      <div className="text-center relative z-10">
        {/* Plan Name */}
        <h3 className="text-2xl lg:text-3xl font-bold text-white mb-2">
          {plan}
        </h3>

        {/* Description */}
        {description && (
          <p className="text-xs sm:text-sm text-gray-400 mb-6">{description}</p>
        )}

        {/* Price */}
        <div className="mb-6">
          <div className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            ${price}
          </div>
          {price > 0 && (
            <div className="text-xs sm:text-sm text-gray-400 mt-1">/month, billed monthly</div>
          )}
          {price === 0 && (
            <div className="text-xs sm:text-sm text-gray-400 mt-1">Forever free</div>
          )}
        </div>

        {/* Features List */}
        <ul className="space-y-3 mb-8 text-left">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3 text-sm sm:text-base">
              <Check className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
              <span className="text-gray-300">{feature}</span>
            </li>
          ))}
        </ul>

        {/* CTA Button */}
        <Button
          variant={featured ? "primary" : "glass"}
          size="lg"
          className="w-full text-sm sm:text-base"
          onClick={handlePopup}
          disabled={isCurrentPlan || !planId}
        >
          {isCurrentPlan ? "✓ Current Plan" : buttonText}
        </Button>

        {/* Additional Info */}
        {featured && (
          <p className="text-xs text-cyan-400/70 mt-4">14-day free trial, no credit card</p>
        )}
      </div>

      {/* Gradient Overlay */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-cyan-500/5 via-transparent to-blue-500/5 rounded-2xl lg:rounded-3xl pointer-events-none`} />
    </motion.div>
  );
};

// Pricing Section Component
const PricingSection = () => {
  const plans = [
    {
      id: "free_user",
      plan: "Free",
      description: "Perfect to get started",
      price: 0,
      features: [
        "3 projects maximum",
        "20 exports per month",
        "Basic crop & resize",
        "Color adjustments",
        "Text Tool",
        "Community support",
      ],
      buttonText: "Get Started",
    },
    {
      id: "pro",
      plan: "Pro",
      description: "For professional creators",
      price: 12,
      features: [
        "Unlimited projects",
        "Unlimited exports",
        "All Editing Tools",
        "AI Background Remover",
        "AI Image Extender",
        "AI Editing & Double Exposure",
        "Batch Editor",
        "Twilight & Water Enhancer",
        "Priority support",
      ],
      featured: true,
      planId: "cplan_2ywZwXjYQQipWYxjCmFZCgCgsTZ",
      buttonText: "Upgrade to Pro",
    },
  ];

  return (
    <section className="py-16 lg:py-20" id="pricing">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 lg:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 lg:mb-6">
            Simple{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
              Pricing
            </span>
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-400 max-w-2xl mx-auto px-2">
            Start free and upgrade when you need more power. No hidden fees, cancel anytime.
          </p>
        </motion.div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <PricingCard key={index} {...plan} index={index} />
          ))}
        </div>

        {/* Footer Note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-center text-xs sm:text-sm text-gray-500 mt-10 lg:mt-12"
        >
          All plans include free updates and security patches. Questions?{" "}
          <a href="#contact" className="text-cyan-400 hover:text-cyan-300 transition-colors">
            Contact our sales team
          </a>
        </motion.p>
      </div>
    </section>
  );
};

export default PricingSection;
