import { motion } from "framer-motion";
import { Github, Instagram, Twitter } from "lucide-react";

const socialLinks = [
  { icon: Twitter, label: "Twitter", href: "https://twitter.com" },
  { icon: Instagram, label: "Instagram", href: "https://instagram.com" },
  { icon: Github, label: "GitHub", href: "https://github.com" },
];

const LandingFooter = () => (
  <footer className="relative z-10 px-6 pb-16">
    <motion.div
      className="container mx-auto overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/5 px-8 py-10 backdrop-blur-2xl"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-white">
            <span className="rounded-full bg-gradient-to-br from-[#6366F1] via-[#22D3EE] to-[#F472B6] px-3 py-1 text-xs uppercase tracking-[0.35em]">StudyCast</span>
            <span className="text-sm text-white/70">Learn Anything. Anywhere. In Your Ears.</span>
          </div>
          <p className="text-sm text-white/50">© {new Date().getFullYear()} StudyCast. Built for learners, by learners.</p>
        </div>

        <nav className="flex flex-wrap items-center gap-4 text-sm text-white/70">
          <a className="transition-colors hover:text-white" href="/about">
            About
          </a>
          <a className="transition-colors hover:text-white" href="/privacy">
            Privacy
          </a>
          <a className="transition-colors hover:text-white" href="/terms">
            Terms
          </a>
          <a className="transition-colors hover:text-white" href="mailto:hello@studycast.app">
            Contact
          </a>
        </nav>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
        <div className="flex items-center gap-3">
          {socialLinks.map(({ icon: Icon, label, href }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white/70 transition-transform hover:-translate-y-1 hover:text-white"
            >
              <Icon className="h-4 w-4" aria-hidden />
              <span className="sr-only">{label}</span>
            </a>
          ))}
        </div>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
      </div>
    </motion.div>

    <div className="mx-auto mt-6 h-[2px] w-2/3 max-w-3xl animate-gradient-flow rounded-full bg-gradient-to-r from-[#6366F1] via-[#22D3EE] to-[#F472B6] opacity-40" />
  </footer>
);

export default LandingFooter;
