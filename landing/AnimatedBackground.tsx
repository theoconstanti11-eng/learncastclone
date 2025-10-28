import { motion, useReducedMotion } from "framer-motion";

const particles = [
  { left: "8%", top: "18%", size: "6px", delay: 0 },
  { left: "22%", top: "62%", size: "10px", delay: 1.2 },
  { left: "42%", top: "28%", size: "8px", delay: 2.4 },
  { left: "68%", top: "14%", size: "12px", delay: 0.8 },
  { left: "82%", top: "48%", size: "7px", delay: 1.6 },
  { left: "74%", top: "74%", size: "9px", delay: 2.8 },
  { left: "56%", top: "82%", size: "6px", delay: 1.4 },
  { left: "32%", top: "78%", size: "11px", delay: 0.4 },
  { left: "14%", top: "70%", size: "7px", delay: 2 },
  { left: "88%", top: "30%", size: "8px", delay: 3.2 },
  { left: "48%", top: "12%", size: "6px", delay: 1 },
  { left: "60%", top: "44%", size: "5px", delay: 2.6 },
];

const gradientStyle = {
  background:
    "radial-gradient(circle at 20% 20%, rgba(99, 102, 241, 0.45), transparent 55%)," +
    "radial-gradient(circle at 80% 30%, rgba(34, 211, 238, 0.45), transparent 55%)," +
    "radial-gradient(circle at 50% 80%, rgba(244, 114, 182, 0.4), transparent 60%)",
  backgroundSize: "140% 140%",
};

export const AnimatedBackground = () => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <motion.div
        className="absolute inset-0 opacity-90"
        style={gradientStyle}
        animate={
          shouldReduceMotion
            ? { backgroundPosition: "0% 50%" }
            : { backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }
        }
        transition={
          shouldReduceMotion
            ? { duration: 0 }
            : { duration: 22, repeat: Infinity, ease: "linear" }
        }
      />

      <motion.div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(120deg, rgba(15, 20, 50, 0.8), rgba(16, 21, 60, 0.55), rgba(10, 14, 45, 0.85))",
        }}
        animate={shouldReduceMotion ? { opacity: 0.7 } : { opacity: [0.65, 0.75, 0.65] }}
        transition={
          shouldReduceMotion
            ? { duration: 0 }
            : { duration: 12, repeat: Infinity, ease: "easeInOut" }
        }
      />

      <div className="absolute inset-0 opacity-70">
        {particles.map((particle, index) => (
          <motion.span
            key={index}
            className="absolute rounded-full bg-cyan-300/40 shadow-glow"
            style={{ left: particle.left, top: particle.top, width: particle.size, height: particle.size }}
            animate={
              shouldReduceMotion
                ? { opacity: 0.4 }
                : { opacity: [0.1, 0.7, 0.1], y: [-6, 6, -6] }
            }
            transition={
              shouldReduceMotion
                ? { duration: 0 }
                : { duration: 6, delay: particle.delay, repeat: Infinity, ease: "easeInOut" }
            }
          />
        ))}
      </div>

      <motion.div
        className="absolute inset-x-[10%] top-1/4 h-32 rounded-full bg-gradient-to-r from-[#6366F1]/30 via-[#22D3EE]/20 to-[#F472B6]/30 blur-3xl"
        animate={shouldReduceMotion ? { opacity: 0.5, scale: 1 } : { opacity: [0.35, 0.6, 0.35], scale: [1, 1.05, 1] }}
        transition={
          shouldReduceMotion
            ? { duration: 0 }
            : { duration: 14, repeat: Infinity, ease: "easeInOut" }
        }
      />

      <motion.div
        className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/60 via-transparent to-transparent"
        animate={shouldReduceMotion ? { opacity: 0.8 } : { opacity: [0.7, 0.85, 0.7] }}
        transition={
          shouldReduceMotion
            ? { duration: 0 }
            : { duration: 10, repeat: Infinity, ease: "easeInOut" }
        }
      />

      <motion.div
        className="absolute left-1/2 top-[18%] h-[1px] w-[120%] -translate-x-1/2 bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-60"
        animate={shouldReduceMotion ? { scaleX: 1 } : { scaleX: [0.7, 1.05, 0.7] }}
        transition={
          shouldReduceMotion
            ? { duration: 0 }
            : { duration: 8, repeat: Infinity, ease: "easeInOut" }
        }
      />
    </div>
  );
};

export default AnimatedBackground;
