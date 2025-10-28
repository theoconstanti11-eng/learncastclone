import { forwardRef, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const testimonials = [
  {
    quote: "I revised on the bus every day with StudyCast — and it worked! The neon player makes me want to keep learning.",
    name: "Amina, Year 11",
    role: "GCSE Student",
  },
  {
    quote: "My friends and I sync topics before exams and binge the Plus playlists together. It's like Spotify for revision.",
    name: "Leo, Sixth Form",
    role: "A-Level Physics",
  },
  {
    quote: "I never thought I'd enjoy textbooks. StudyCast's AI voice keeps everything calm, clear, and surprisingly fun.",
    name: "Priya, IB Diploma",
    role: "IB HL Chemistry",
  },
];

const Testimonials = forwardRef<HTMLDivElement>((_, ref) => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 5200);

    return () => window.clearInterval(interval);
  }, []);

  const current = testimonials[activeIndex];

  return (
    <section ref={ref} className="relative z-10 px-6 py-24">
      <div className="container mx-auto">
        <div className="mb-12 flex flex-col gap-4 text-center">
          <motion.p
            className="mx-auto w-fit rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.35em] text-cyan-100/70"
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.4 }}
          >
            ✨ Loved by learners
          </motion.p>
          <motion.h2
            className="text-3xl font-bold text-white md:text-4xl"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            What students are saying
          </motion.h2>
          <motion.p
            className="mx-auto max-w-2xl text-base text-white/70"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            From GCSE to IB, StudyCast keeps revision effortless. The carousel rotates every few seconds, sharing the glow from students already tuning in.
          </motion.p>
        </div>

        <div className="relative mx-auto max-w-3xl overflow-hidden rounded-3xl border border-white/12 bg-white/5 p-10 text-left shadow-glass backdrop-blur-2xl">
          <AnimatePresence mode="wait">
            <motion.blockquote
              key={current.quote}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <p className="text-2xl font-semibold text-white">“{current.quote}”</p>
              <div className="text-sm text-white/60">
                <p className="font-semibold text-white/80">{current.name}</p>
                <p>{current.role}</p>
              </div>
            </motion.blockquote>
          </AnimatePresence>

          <div className="mt-8 flex justify-center gap-2">
            {testimonials.map((testimonial, index) => (
              <button
                key={testimonial.name}
                onClick={() => setActiveIndex(index)}
                className={`h-2.5 w-2.5 rounded-full transition-all ${
                  activeIndex === index ? "bg-[#22D3EE] w-6" : "bg-white/30"
                }`}
                aria-label={`Show testimonial from ${testimonial.name}`}
              />
            ))}
          </div>

          <motion.span
            className="absolute -left-6 top-6 text-3xl"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            ✨
          </motion.span>
          <motion.span
            className="absolute -right-4 bottom-8 text-3xl"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          >
            ⭐️
          </motion.span>
        </div>
      </div>
    </section>
  );
});

Testimonials.displayName = "Testimonials";

export default Testimonials;
