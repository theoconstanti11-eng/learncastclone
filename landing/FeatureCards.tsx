import { forwardRef } from "react";
import { motion } from "framer-motion";
import { BrainCircuit, Headphones, Sparkles } from "lucide-react";

const features = [
  {
    title: "AI-Powered Podcasts",
    description: "StudyCast's voice engine turns dense chapters into studio-quality audio with smart pacing and sound design.",
    icon: Headphones,
  },
  {
    title: "Real Textbook Topics",
    description: "Built for GCSE, A-Level, IB, and more — we map to your exam board and pull verified concepts straight from your syllabus.",
    icon: BrainCircuit,
  },
  {
    title: "Personalised to You",
    description: "Choose your level, tone, and study time. We adapt scripts, recap questions, and revisions to match how you learn best.",
    icon: Sparkles,
  },
];

const FeatureCards = forwardRef<HTMLDivElement>((_, ref) => (
  <section ref={ref} className="relative z-10 px-6 py-24">
    <div className="container mx-auto">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <motion.h2
          className="text-3xl font-bold text-white md:text-4xl"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5 }}
        >
          Built for curious minds who love to listen
        </motion.h2>
        <motion.p
          className="max-w-xl text-base text-white/70"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Framer Motion animations, glowing gradients, and glassmorphism bring your study journey to life — so revising feels like queueing your favourite playlist.
        </motion.p>
      </div>

      <div className="mt-12 grid gap-8 md:grid-cols-3">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            className="glow-border group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-2xl"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ y: -12 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6366F1]/70 via-[#22D3EE]/60 to-[#F472B6]/60 text-white shadow-glow">
              <feature.icon className="h-6 w-6" />
            </div>
            <h3 className="relative z-10 mt-8 text-2xl font-semibold text-white">{feature.title}</h3>
            <p className="relative z-10 mt-4 text-base text-white/70">{feature.description}</p>
            <motion.div
              className="relative z-10 mt-8 h-[2px] w-24 bg-gradient-to-r from-transparent via-white/60 to-transparent"
              initial={{ scaleX: 0.6, opacity: 0.3 }}
              whileHover={{ scaleX: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            />
          </motion.div>
        ))}
      </div>
    </div>
  </section>
));

FeatureCards.displayName = "FeatureCards";

export default FeatureCards;
