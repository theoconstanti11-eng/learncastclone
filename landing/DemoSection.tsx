import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Pause, Play } from "lucide-react";

const audioSrc = "https://cdn.pixabay.com/download/audio/2023/03/08/audio_fd559b09ee.mp3?filename=calm-meditation-145027.mp3";

const DemoSection = forwardRef<HTMLDivElement>((_, ref) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handlePause);

    return () => {
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handlePause);
    };
  }, []);

  const togglePlayback = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      void audio.play();
    } else {
      audio.pause();
    }
  };

  const bars = useMemo(
    () =>
      Array.from({ length: 24 }, (_, index) => ({
        delay: index * 0.05,
        scale: 0.55 + ((index * 7) % 5) / 10,
      })),
    [],
  );

  return (
    <section ref={ref} className="relative z-10 px-6">
      <div className="container mx-auto rounded-3xl border border-white/10 bg-white/5 px-8 py-16 backdrop-blur-2xl">
        <div className="flex flex-col gap-12 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl space-y-4">
            <motion.p
              className="inline-flex items-center rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.35em] text-cyan-100/70"
              initial={{ opacity: 0, y: -10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.4 }}
            >
              🎧 Experience StudyCast
            </motion.p>
            <motion.h2
              className="text-3xl font-bold text-white md:text-4xl"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Press play to hear how your notes transform into cinematic sound.
            </motion.h2>
            <motion.p
              className="text-base text-white/70"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Each StudyCast episode blends smart AI narration, exam tips, and memory hooks. The player pulses with the rhythm of your learning soundtrack.
            </motion.p>
          </div>

          <motion.div
            className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-white/15 bg-black/40 p-8 shadow-glass backdrop-blur-2xl"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="absolute -top-10 left-10 h-28 w-28 rounded-full bg-[#6366F1]/40 blur-3xl" />
            <div className="absolute -bottom-12 right-2 h-36 w-36 rounded-full bg-[#22D3EE]/30 blur-3xl" />

            <div className="relative z-10 flex flex-col gap-6">
              <div className="flex items-center justify-between text-sm text-white/70">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-white/50">Demo Episode</p>
                  <p className="text-lg font-semibold text-white">"Photosynthesis in 4 minutes"</p>
                </div>
                <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-white/60">
                  Powered by AI
                </span>
              </div>

              <div className="relative flex items-center gap-6 rounded-2xl border border-white/10 bg-white/5 px-6 py-4">
                <Button
                  onClick={togglePlayback}
                  className="glass-button flex h-16 w-16 items-center justify-center rounded-full border-white/20 bg-white/10 text-white hover:scale-105"
                  aria-label={isPlaying ? "Pause demo" : "Play demo"}
                >
                  {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                  <span className="sr-only">{isPlaying ? "Pause demo" : "Play demo"}</span>
                </Button>

                <div className="flex w-full items-center gap-2">
                  {bars.map((bar, index) => (
                    <motion.span
                      key={index}
                      className="h-20 w-1 rounded-full bg-gradient-to-b from-[#22D3EE] via-[#6366F1] to-[#F472B6]"
                      animate={
                        isPlaying
                          ? { scaleY: [0.4, 1.6 * bar.scale, 0.4] }
                          : { scaleY: 0.45 }
                      }
                      transition={{ duration: 0.9, repeat: isPlaying ? Infinity : 0, delay: bar.delay, ease: "easeInOut" }}
                      style={{ transformOrigin: "center bottom" }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-white/60">
                <p>Scripted in seconds · Personalised for you</p>
                <p>Download MP3 · Share to friends</p>
              </div>
            </div>

            <motion.div
              className="absolute -right-6 top-12 hidden rounded-2xl border border-cyan-200/30 bg-white/5 px-4 py-3 text-xs text-white/70 backdrop-blur-xl lg:block"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            >
              Powered by AI — crafted just for you.
            </motion.div>

            <audio ref={audioRef} src={audioSrc} preload="none" className="hidden" />
          </motion.div>
        </div>
      </div>
    </section>
  );
});

DemoSection.displayName = "DemoSection";

export default DemoSection;
