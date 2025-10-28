import { forwardRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

type PricingPreviewProps = {
  onCompare: () => void;
  onStart: () => void;
};

const plans = [
  {
    name: "Free",
    price: "£0",
    tagline: "3 episodes each day",
    features: ["AI podcasts in minutes", "Library of GCSE topics", "Progress tracking basics"],
    highlight: false,
  },
  {
    name: "Pro",
    price: "£6",
    tagline: "Unlimited listens",
    features: ["Download for offline", "Smart quizzes & recaps", "Study streak rewards"],
    highlight: true,
  },
  {
    name: "Plus",
    price: "£12",
    tagline: "Group & exam prep",
    features: ["Team revision rooms", "Exam cram playlists", "Priority AI voices"],
    highlight: false,
  },
];

const PricingPreview = forwardRef<HTMLDivElement, PricingPreviewProps>(({ onCompare, onStart }, ref) => (
  <section ref={ref} className="relative z-10 px-6 py-24">
    <div className="container mx-auto">
      <div className="flex flex-col items-start gap-6 md:flex-row md:items-end md:justify-between">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-xs uppercase tracking-[0.35em] text-cyan-100/70">Pricing Preview</p>
          <h2 className="mt-3 text-3xl font-bold text-white md:text-4xl">Choose a plan when you are ready to binge-learn</h2>
          <p className="mt-4 max-w-xl text-base text-white/70">
            Start for free and upgrade whenever you need offline downloads, smart quizzes, or group revision rooms. Every tier keeps the neon glow.
          </p>
        </motion.div>
        <Button
          onClick={onCompare}
          className="glass-button rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white/80 hover:text-white"
        >
          Compare Plans
        </Button>
      </div>

      <div className="mt-12 grid gap-8 md:grid-cols-3">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.name}
            className={`relative overflow-hidden rounded-3xl border border-white/12 bg-white/5 p-8 backdrop-blur-2xl ${plan.highlight ? "shadow-glow" : "shadow-glass"}`}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            animate={
              plan.highlight
                ? { boxShadow: ["0 0 0 rgba(0,0,0,0)", "0 0 45px rgba(99,102,241,0.45)", "0 0 0 rgba(0,0,0,0)"] }
                : { boxShadow: "0 0 0 rgba(0,0,0,0)" }
            }
            transition={{
              duration: 0.5,
              delay: index * 0.1,
              boxShadow: plan.highlight
                ? { duration: 5.5, repeat: Infinity, repeatType: "mirror", ease: "easeInOut", delay: 0.5 }
                : { duration: 0 },
            }}
          >
            {plan.highlight ? (
              <span className="absolute right-6 top-6 rounded-full border border-[#22D3EE]/40 bg-[#22D3EE]/10 px-4 py-1 text-xs uppercase tracking-[0.25em] text-[#22D3EE]">
                Most Popular
              </span>
            ) : null}
            <div className="relative z-10">
              <p className="text-sm uppercase tracking-[0.3em] text-white/50">{plan.name}</p>
              <div className="mt-4 flex items-baseline gap-2 text-white">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-sm text-white/50">/month</span>
              </div>
              <p className="mt-2 text-sm text-white/60">{plan.tagline}</p>
              <ul className="mt-6 space-y-3 text-sm text-white/70">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#22D3EE]" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {plan.highlight ? (
              <Button
                onClick={onStart}
                className="glass-button mt-8 w-full rounded-full border-white/20 bg-gradient-to-r from-[#6366F1] via-[#22D3EE] to-[#F472B6] px-6 py-4 text-sm font-semibold text-white shadow-glow"
              >
                Start Free, Upgrade Anytime
              </Button>
            ) : (
              <Button
                onClick={onCompare}
                variant="ghost"
                className="glass-button mt-8 w-full rounded-full border-white/20 bg-white/10 px-6 py-4 text-sm font-semibold text-white/80 hover:text-white"
              >
                Explore details
              </Button>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  </section>
));

PricingPreview.displayName = "PricingPreview";

export default PricingPreview;
