import { type RefObject, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import AnimatedBackground from "@/components/landing/AnimatedBackground";
import HeroSection from "@/components/landing/HeroSection";
import DemoSection from "@/components/landing/DemoSection";
import FeatureCards from "@/components/landing/FeatureCards";
import PricingPreview from "@/components/landing/PricingPreview";
import Testimonials from "@/components/landing/Testimonials";
import FinalCTA from "@/components/landing/FinalCTA";
import LandingFooter from "@/components/landing/LandingFooter";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const demoRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const pricingRef = useRef<HTMLDivElement>(null);
  const testimonialsRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const { user } = useAuth();

  const scrollTo = (ref: RefObject<HTMLElement>) => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleStart = () => navigate(user ? "/dashboard" : "/signup");
  const handleLogin = () => navigate(user ? "/dashboard" : "/login");
  const handlePricing = () => navigate("/pricing");
  const handleLibrary = () => navigate("/library");

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#06091A] text-white">
      <AnimatedBackground />

      <motion.div
        className="pointer-events-none absolute left-8 top-36 hidden text-5xl md:block"
        animate={{ y: [0, 14, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      >
        🎧
      </motion.div>
      <motion.div
        className="pointer-events-none absolute right-10 top-1/3 hidden text-5xl md:block"
        animate={{ y: [0, -16, 0], rotate: [0, -6, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      >
        📚
      </motion.div>
      <motion.div
        className="pointer-events-none absolute left-1/2 bottom-20 hidden -translate-x-1/2 text-5xl md:block"
        animate={{ y: [0, 10, 0], rotate: [0, 8, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      >
        ⚡️
      </motion.div>

      <div className="relative z-10 flex min-h-screen w-full flex-col">
        <HeroSection
          onStart={handleStart}
          onSeeHow={() => scrollTo(demoRef)}
          onPricing={() => scrollTo(pricingRef)}
          onLibrary={handleLibrary}
          onLogin={handleLogin}
          onFeatures={() => scrollTo(featuresRef)}
          onTestimonials={() => scrollTo(testimonialsRef)}
          isAuthenticated={Boolean(user)}
        />

        <DemoSection ref={demoRef} />
        <FeatureCards ref={featuresRef} />
        <PricingPreview ref={pricingRef} onCompare={handlePricing} onStart={handleStart} />
        <Testimonials ref={testimonialsRef} />
        <FinalCTA onStart={handleStart} onLogin={handleLogin} isAuthenticated={Boolean(user)} />
        <LandingFooter />
      </div>
    </div>
  );
};

export default Index;
