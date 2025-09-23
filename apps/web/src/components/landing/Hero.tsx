import { motion } from 'framer-motion';
import { HeroContent } from '@/components/landing/hero-content';

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-background overflow-hidden">
      {/* Radial Gradient Background */}
      <div className="absolute inset-0 bg-gradient-radial from-primary/20 via-primary/5 to-transparent opacity-40"></div>

      {/* Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      ></div>

      {/* Animated Grid Lines */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent animate-pulse delay-1000"></div>
        <div className="absolute top-0 left-0 w-px h-full bg-gradient-to-b from-transparent via-primary/30 to-transparent animate-pulse delay-500"></div>
        <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-primary/30 to-transparent animate-pulse delay-700"></div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-24 relative z-10">
        <HeroContent />
      </div>
    </section>
  );
};

export default Hero;
