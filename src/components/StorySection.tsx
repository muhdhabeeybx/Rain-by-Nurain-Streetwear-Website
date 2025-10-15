import React from 'react';
import { Heart, Globe, Users, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  {
    icon: Heart,
    title: 'Crafted with Care',
    description: 'Every piece goes through hands that care, eyes that see detail, and minds that dream global.'
  },
  {
    icon: Globe,
    title: 'Driven by Purpose',
    description: 'We don’t follow trends — we set pace. Each collection is built with the culture in mind.'
  },
  {
    icon: Users,
    title: 'For the Culture',
    description: 'RBN stands for movement, for art, for creators who turn chaos into beauty.'
  },
  {
    icon: Zap,
    title: 'Built to Last',
    description: 'Quality that ages gracefully — because real style doesn’t expire.'
  }
];

export function StorySection() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-8 md:p-16 lg:p-20 shadow-sm border border-gray-100">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mobile-keep-center mb-20"
          >
            <Sparkles className="w-5 h-5 text-gray-400" />
            <span className="text-product-category text-gray-500 uppercase tracking-wider">
              Our Story
            </span>
            <Sparkles className="w-5 h-5 text-gray-400" />
          </div>
          <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl mb-8 tracking-tight">
            From Streets to Statements
          </h2>
          <p className="font-body text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            RBN was born in motion — between Abuja grit and global dreams. It’s for those who understand that “home” isn’t just a place; it’s carried within. Every stitch is a salute to those who left, who grind, who build, and who return — bringing light, value, and vision.
          </p>
          </motion.div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center mobile-keep-center"
              >
                <div className="w-16 h-16 bg-black text-white flex items-center justify-center mx-auto mb-4 rounded-full">
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="font-body text-lg font-semibold mb-4 tracking-tight">{feature.title}</h3>
                <p className="font-body text-gray-600 leading-relaxed text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>

          {/* Quote Section */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mobile-keep-center border-t border-gray-200 pt-16"
          >
            <blockquote className="font-heading text-xl md:text-2xl lg:text-3xl leading-[1em] mb-8 max-w-4xl mx-auto text-gray-800">
              "Fashion is not about showing off. It’s about showing up."
            </blockquote>
            <div className="flex items-center justify-center gap-4 mobile-keep-center">
              <div className="w-12 h-12 bg-black flex items-center justify-center text-white font-bold rounded-full">
                R
              </div>
              <div className="text-left">
                <p className="font-body font-semibold">Usman Nurain</p>
                <p className="font-body text-gray-600 text-sm">Founder & Creative Director</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
