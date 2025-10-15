import React, { useCallback, useRef } from 'react';
import { Button } from './ui/button';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import heroImage from '../assets/rbnhero.png';

// Animation variants for better organization
const heroVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" }
  }
};

const buttonVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, delay: 0.3 }
  }
};

const scrollIndicatorVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { delay: 1, duration: 0.5 }
  }
};

export function HeroSection() {
  // Use ref for more reliable DOM access
  const newArrivalsRef = useRef(null);
  
  // Using useCallback to prevent unnecessary re-renders
  const scrollToNewArrivals = useCallback(() => {
    if (newArrivalsRef.current) {
      newArrivalsRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  // Use intersection observer for animations when in viewport
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  return (
    <>
      <section 
        ref={ref}
        className="relative h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
        role="banner"
        aria-label="Hero section with streetwear collection"
      >
        {/* Overlay for better text contrast */}
        <div className="absolute inset-0 bg-black/40" aria-hidden="true"></div>

        {/* Main content container - 50% width on medium screens and up */}
        <div className="relative z-10 text-center text-white px-4 w-full md:w-1/2 lg:w-1/2 xl:w-1/2 mx-auto">
          <motion.div
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            variants={heroVariants}
          >
            <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl mb-8 leading-tight tracking-tight">
              Left House to Feed Home
            </h1>
            <p className="font-body text-lg md:text-xl mb-12 max-w-2xl mx-auto leading-relaxed text-white/90">
              Discover our latest collection of premium streetwear that tells your story
            </p>
            
            <motion.div variants={buttonVariants}>
              <Button
                size="lg"
                onClick={scrollToNewArrivals}
                className="bg-white text-black hover:bg-gray-100 font-medium tracking-wide px-12 py-5 text-sm uppercase transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent"
                aria-label="Shop new arrivals"
              >
                Shop Now
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/80"
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={scrollIndicatorVariants}
          aria-hidden="true"
        >
          <div className="flex flex-col items-center">
            <p className="text-xs uppercase tracking-wider mb-2 font-body">Scroll</p>
            <div className="w-px h-8 bg-white/50"></div>
          </div>
        </motion.div>
      </section>
      
      {/* Ref target for scrolling */}
      <div ref={newArrivalsRef} id="new-arrivals" className="sr-only" aria-hidden="true"></div>
    </>
  );
}
