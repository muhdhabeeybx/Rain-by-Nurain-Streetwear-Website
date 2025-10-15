import React, { useMemo } from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { ProductCard } from './ProductCard';
import { motion } from 'framer-motion';
import { useApp } from '../contexts/AppContext';

// Utility to shuffle array
function shuffleArray(array: any[]) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function RandomProductsSection() {
  const { products, isLoadingProducts } = useApp();

  // Shuffle and pick 8 random products — refreshes automatically on each reload
  const randomProducts = useMemo(() => {
    if (!products || !Array.isArray(products)) return [];
    return shuffleArray(products).slice(0, 8);
  }, [products]);

  if (isLoadingProducts) {
    return (
      <section id="featured-products" className="py-24 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="font-body text-lg text-gray-600">Loading products...</p>
        </div>
      </section>
    );
  }

  if (!randomProducts.length) {
    return (
      <section id="featured-products" className="py-24 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="font-body text-lg text-gray-600">No products available.</p>
        </div>
      </section>
    );
  }

  return (
    <section id="featured-products" className="py-24 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-5 h-5 text-gray-400" />
            <span className="text-gray-500 uppercase tracking-wider">
              Fresh Picks
            </span>
            <Sparkles className="w-5 h-5 text-gray-400" />
          </div>

          <h2 className="font-heading text-5xl md:text-6xl uppercase tracking-tight mb-6">
            For The Culture. For The Street.
          </h2>

          <p className="font-body text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Not every drop is new — some just hit different. Explore a random mix of styles, 
            crafted for the dreamers, the hustlers, and everyone pushing the culture forward.
          </p>
        </motion.div>

        {/* Grid Layout */}
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {randomProducts.map((product, index) => (
            <motion.div
              key={product.id || index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <div className="text-center mt-16">
          <Button
            size="lg"
            className="bg-black text-white hover:bg-gray-800 px-10 py-4 font-normal tracking-wide uppercase"
          >
            View All Products →
          </Button>
        </div>
      </div>
    </section>
  );
}
