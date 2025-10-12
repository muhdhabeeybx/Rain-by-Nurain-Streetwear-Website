import React from 'react';
import { Button } from './ui/button';
import { motion } from 'framer-motion';

const heroImage = '/imgi_5_534163430_1308784940600142_2043372202433117803_n.jpeg';

export function HeroSection() {
  const scrollToNewArrivals = () => {
    const newArrivalsSection = document.getElementById('new-arrivals');
    if (newArrivalsSection) {
      newArrivalsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      className="relative h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${heroImage})` }}
    >
      {/* Premium Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/30 to-transparent"></div>
      <div className="absolute inset-0 backdrop-blur-[2px]"></div>

      {/* Content */}
      <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto flex flex-col items-center hero-content mobile-keep-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full"
        >
          <h1 className="font-heading text-[46px] md:text-6xl lg:text-7xl mb-8 leading-tight tracking-tight drop-shadow-xl">
            For the Dreamers & Hustlers
          </h1>
          <p className="font-body text-lg md:text-xl mb-12 max-w-2xl mx-auto leading-relaxed text-white/90 drop-shadow">
            Rain by Nurain is more than streetwear — it’s a movement stitched from hustle, pride, and culture.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="w-full flex justify-center"
          >
            <Button
              size="lg"
              onClick={scrollToNewArrivals}
              className="bg-white text-black font-semibold rounded-lg shadow-lg hover:bg-gray-100 hover:scale-105 transition-all duration-200 px-6 py-4 text-base uppercase tracking-wide"
              // px-6 (24px left/right), py-4 (16px top/bottom), rounded-lg for slightly rounded corners
            >
              Discover the Collection
            </Button>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/80"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        <div className="flex flex-col items-center">
          <p className="text-xs uppercase tracking-wider mb-2 font-body">Scroll</p>
          <div className="w-px h-8 bg-white/50 rounded"></div>
        </div>
      </motion.div>
    </section>
  );
}
