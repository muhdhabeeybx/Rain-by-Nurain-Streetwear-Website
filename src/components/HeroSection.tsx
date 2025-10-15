import React from 'react';
import { Button } from './ui/button';
import { motion } from 'framer-motion';
import heroImage from '../assets/rbnhero.png'; 

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
      <div className="absolute inset-0 bg-black/90"></div>

      <div className="relative z-10 text-center text-white px-4 max-w-5xl mx-auto hero-content mobile-keep-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="hero-section mobile-keep-center"
        >
          <h1 className="font-heading text-[56px] md:text-6xl lg:text-7xl mb-8 leading-tight tracking-tight">
            For the Hustlers & Dreamers Who Left Home to Feed Home
          </h1>

          <p className="font-body text-lg md:text-xl mb-12 max-w-2xl mx-auto leading-relaxed text-white/90">
            Born from hustle and crafted for those who turn struggle into rhythm. Each piece echoes the story of movement from the streets that shaped us to the worlds we’re building.
          </p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mobile-keep-center"
          >
            <Button
              size="sm"
              onClick={scrollToNewArrivals}
              className="bg-white text-black hover:bg-gray-100 font-normal tracking-wide px-4 py-6 text-sm uppercase mx-auto mobile-keep-center transition-all duration-200"
              >
              Discover the Collection ↓
            </Button>

          </motion.div>
        </motion.div>
      </div>

      <motion.div 
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/80"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        <div className="flex flex-col items-center">
          <p className="text-xs uppercase tracking-wider mb-2 font-body">Scroll. Don’t just wear it — live it.</p>
          <div className="w-px h-8 bg-white/50"></div>
        </div>
      </motion.div>
    </section>
  );
}
