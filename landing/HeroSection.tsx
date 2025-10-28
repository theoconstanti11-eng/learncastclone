import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetClose, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { BookOpenCheck, Headphones, Menu, Sparkles, Waves } from "lucide-react";

const phrases = [
  "Let's learn Chemistry!",
  "Ready for GCSE Maths?",
  "How about History next?",
  "Audio notes, coming right up!",
];

type HeroSectionProps = {
  onStart: () => void;
  onSeeHow: () => void;
  onPricing: () => void;
  onLibrary: () => void;
  onLogin: () => void;
  onFeatures: () => void;
  onTestimonials: () => void;
  isAuthenticated: boolean;
};

const shimmerVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

const HeroSection = ({
  onStart,
  onSeeHow,
  onPricing,
  onLibrary,
  onLogin,
  onFeatures,
  onTestimonials,
  isAuthenticated,
}: HeroSectionProps) => {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const voicePhrase = useMemo(() => phrases[phraseIndex], [phraseIndex]);

  const navItems = useMemo(
    () => [
      { label: "Features", onSelect: onFeatures },
      { label: "Plans", onSelect: onPricing },
      { label: "Voices", onSelect: onTestimonials },
      { label: "Library", onSelect: onLibrary },
    ],
    [onFeatures, onPricing, onTestimonials, onLibrary],
  );

  const handleMobileNavSelect = useCallback(
    (callback: () => void) => () => {
      callback();
      setIsMobileNavOpen(false);
    },
    [],
  );

  useEffect(() => {
    const interval = window.setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % phrases.length);
    }, 3200);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <section className="relative z-10 px-6 pt-10 pb-32 md:pt-16">
      <header className="container mx-auto flex items-center justify-between rounded-full border border-white/10 bg-white/10 px-6 py-4 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6366F1]/60 via-[#22D3EE]/50 to-[#F472B6]/50 text-white shadow-glow">
            <Headphones className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-cyan-100/70">StudyCast</p>
            <p className="text-sm text-white/90">Learn Anything. Anywhere. In Your Ears.</p>
          </div>
        </div>
        <nav className="hidden items-center gap-6 text-sm text-white/70 md:flex">
          {navItems.map((item) => (
            <button key={item.label} onClick={item.onSelect} className="transition-colors hover:text-white">
              {item.label}
            </button>
          ))}
        </nav>
        <Sheet open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen}>
          <div className="flex items-center gap-2 md:hidden">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileNavOpen(true)}
              className="h-10 w-10 rounded-full border border-white/10 bg-white/10 text-white/80 backdrop-blur-xl transition hover:text-white"
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" aria-hidden />
            </Button>
          </div>
          <SheetContent side="top" className="border-white/10 bg-[rgba(15,20,50,0.95)] text-white shadow-glow backdrop-blur-xl">
            <SheetTitle className="text-center text-lg font-semibold text-white">Menu</SheetTitle>
            <div className="mt-8 flex flex-col gap-4">
              {navItems.map((item) => (
                <SheetClose asChild key={item.label}>
                  <button
                    type="button"
                    onClick={handleMobileNavSelect(item.onSelect)}
                    className="rounded-full border border-white/10 bg-white/10 px-6 py-3 text-base text-white/90 transition hover:bg-white/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  >
                    {item.label}
                  </button>
                </SheetClose>
              ))}
              <div className="mt-2 flex flex-col gap-3">
                <SheetClose asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleMobileNavSelect(onLogin)}
                    className="rounded-full border border-white/10 bg-white/10 px-6 py-3 text-base text-white/80 hover:bg-white/20 hover:text-white"
                  >
                    {isAuthenticated ? "Dashboard" : "Log In"}
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button
                    type="button"
                    onClick={handleMobileNavSelect(onStart)}
                    className="relative overflow-hidden rounded-full bg-gradient-to-r from-[#6366F1] via-[#22D3EE] to-[#F472B6] px-6 py-3 text-base font-semibold text-white shadow-glow"
                  >
                    <span className="relative z-10">{isAuthenticated ? "Open App" : "Start Free"}</span>
                  </Button>
                </SheetClose>
              </div>
            </div>
          </SheetContent>
        </Sheet>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            onClick={onLogin}
            className="rounded-full border border-white/10 bg-white/10 px-5 py-2 text-sm text-white/80 backdrop-blur-xl hover:bg-white/20 hover:text-white"
          >
            {isAuthenticated ? "Dashboard" : "Log In"}
          </Button>
          <Button
            onClick={onStart}
            className="relative overflow-hidden rounded-full bg-gradient-to-r from-[#6366F1] via-[#22D3EE] to-[#F472B6] px-6 py-2 text-sm font-semibold text-white shadow-glow"
          >
            <span className="relative z-10">{isAuthenticated ? "Open App" : "Start Free"}</span>
            <motion.span
              aria-hidden
              className="absolute inset-0 bg-white/30"
              initial={{ opacity: 0, x: "-100%" }}
              animate={{ opacity: [0, 0.4, 0], x: ["-120%", "120%", "120%"] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            />
          </Button>
        </div>
      </header>

      <div className="container mx-auto mt-24 grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-8">
          <Badge className="glass-button inline-flex items-center gap-2 rounded-full border-white/20 bg-white/5 px-4 py-2 text-sm uppercase tracking-[0.25em] text-cyan-100/80">
            <Sparkles className="h-4 w-4 text-[#F472B6]" />
            GCSE · A-Level · IB
          </Badge>

          <motion.h1
            className="shimmer-text text-4xl font-extrabold leading-tight text-white md:text-6xl lg:text-7xl"
            variants={shimmerVariants}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            Turn your textbooks into AI podcasts.
          </motion.h1>

          <motion.p
            className="max-w-2xl text-lg text-white/80 md:text-xl"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
          >
            Study smarter with personalised audio lessons created by AI. Designed for GCSE, A-Level, and beyond — perfect for revising anywhere life takes you.
          </motion.p>

          <div className="flex flex-wrap items-center gap-4">
            <Button
              size="lg"
              onClick={onStart}
              className="relative overflow-hidden rounded-full bg-gradient-to-r from-[#6366F1] via-[#22D3EE] to-[#F472B6] px-8 py-6 text-base font-semibold text-white shadow-glow transition-transform duration-300 hover:scale-[1.02]"
            >
              <span className="relative z-10 flex items-center gap-2">
                <Waves className="h-5 w-5" />
                {isAuthenticated ? "Continue Listening" : "Start Free"}
              </span>
              <motion.span
                aria-hidden
                className="absolute inset-0 bg-white/30"
                initial={{ opacity: 0, x: "-120%" }}
                animate={{ opacity: [0, 0.3, 0], x: ["-120%", "120%", "120%"] }}
                transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
              />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={onSeeHow}
              className="glass-button rounded-full border border-cyan-200/40 bg-white/5 px-8 py-6 text-base font-semibold text-white/90 hover:scale-[1.02] hover:text-white"
            >
              See How It Works
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-sm text-white/70">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-[#22D3EE]">
                <Sparkles className="h-4 w-4" />
              </div>
              <p>AI-crafted scripts tailored to your syllabus.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-[#F472B6]">
                <BookOpenCheck className="h-4 w-4" />
              </div>
              <p>Listen offline, keep streaks, and crush exams.</p>
            </div>
          </div>
        </div>

        <motion.div
          className="relative glass-panel overflow-hidden rounded-3xl border-white/10 p-8"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
        >
          <div className="absolute -left-10 top-1/2 hidden h-24 w-24 -translate-y-1/2 rounded-full bg-[#22D3EE]/40 blur-3xl lg:block" />
          <div className="absolute -right-10 top-12 hidden h-28 w-28 rounded-full bg-[#F472B6]/40 blur-3xl lg:block" />

          <p className="text-xs uppercase tracking-[0.35em] text-white/50">Live preview</p>
          <h3 className="mt-4 text-2xl font-semibold text-white">🎧 Learn Anything. Anywhere. In Your Ears.</h3>
          <p className="mt-3 text-sm text-white/70">
            Spin up audio lessons that feel like your favourite playlist. Waveforms shimmer while AI narrators bring your notes to life.
          </p>

          <div className="mt-8 h-[2px] w-full animate-wave-slide bg-gradient-to-r from-transparent via-white/40 to-transparent" />

          <div className="mt-10 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/50">Subjects</p>
              <p className="mt-1 text-lg font-semibold text-white">Chemistry · Biology · Literature · More</p>
            </div>
            <div className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.25em] text-white/60">
              Daily New Drops
            </div>
          </div>

          <motion.div
            className="mt-8 flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-6 py-4 backdrop-blur-xl"
            animate={{ boxShadow: ["0 0 0 rgba(0,0,0,0)", "0 0 35px rgba(99,102,241,0.35)", "0 0 0 rgba(0,0,0,0)"] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            <div>
              <p className="text-sm text-white/60">Next Up</p>
              <p className="text-lg font-semibold text-white">Photosynthesis in 4 minutes</p>
            </div>
            <Button
              onClick={onSeeHow}
              className="glass-button rounded-full border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/80 hover:text-white"
            >
              Preview
            </Button>
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        className="absolute right-12 top-48 hidden min-w-[220px] rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm text-white/80 shadow-glass backdrop-blur-xl md:block"
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <p className="text-xs uppercase tracking-[0.25em] text-cyan-100/70">AI voice</p>
        <p className="mt-2 text-base font-semibold text-white">{voicePhrase}</p>
      </motion.div>
    </section>
  );
};

export default HeroSection;
