import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

type FinalCTAProps = {
  onStart: () => void;
  onLogin: () => void;
  isAuthenticated: boolean;
};

const FinalCTA = ({ onStart, onLogin, isAuthenticated }: FinalCTAProps) => (
  <section className="relative z-10 px-6 pb-24">
    <motion.div
      className="container mx-auto overflow-hidden rounded-[2.5rem] border border-white/12 bg-gradient-to-br from-[#0B0F29]/80 via-[#141B3A]/80 to-[#1B1B3F]/90 px-8 py-16 text-center shadow-glow backdrop-blur-2xl"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="absolute inset-0 -z-10"
        animate={{ opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        style={{
          background:
            "radial-gradient(circle at 15% 20%, rgba(99, 102, 241, 0.35), transparent 60%)," +
            "radial-gradient(circle at 85% 30%, rgba(34, 211, 238, 0.35), transparent 60%)," +
            "radial-gradient(circle at 50% 85%, rgba(244, 114, 182, 0.3), transparent 65%)",
        }}
      />

      <motion.h2
        className="text-3xl font-bold text-white md:text-4xl"
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        Join thousands of students learning faster with StudyCast.
      </motion.h2>
      <motion.p
        className="mx-auto mt-4 max-w-2xl text-base text-white/70"
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        Turn every commute, walk, or study break into a revision session. Fire up your AI podcast and stay in flow with neon glow.
      </motion.p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <Button
          size="lg"
          onClick={onStart}
          className="relative overflow-hidden rounded-full bg-gradient-to-r from-[#6366F1] via-[#22D3EE] to-[#F472B6] px-8 py-6 text-base font-semibold text-white shadow-glow transition-transform duration-300 hover:scale-[1.03]"
        >
          <span className="relative z-10">{isAuthenticated ? "Go to Dashboard" : "Sign Up Free"}</span>
          <motion.span
            aria-hidden
            className="absolute inset-0 bg-white/30"
            initial={{ opacity: 0, x: "-120%" }}
            animate={{ opacity: [0, 0.4, 0], x: ["-120%", "120%", "120%"] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          />
        </Button>
        <Button
          size="lg"
          variant="outline"
          onClick={onLogin}
          className="glass-button rounded-full border border-white/20 bg-white/10 px-8 py-6 text-base font-semibold text-white/80 hover:text-white"
        >
          {isAuthenticated ? "Open App" : "Log In"}
        </Button>
      </div>
    </motion.div>
  </section>
);

export default FinalCTA;
