import React from 'react';
import {
  Heart,
  Globe,
  Users,
  Award,
  Truck,
  Target,
  Instagram
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

import rbnImg from '../assets/rbn.jpg';
import nurainImg from '../assets/nurain.jpg';

const stats = [
  { icon: Users, label: 'Happy Customers', value: '1K+' },
  { icon: Globe, label: 'Countries', value: '5+' },
  { icon: Award, label: 'Awards Won', value: '2' },
  { icon: Truck, label: 'Orders Shipped', value: '500+' },
];

export function AboutPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pt-20 bg-white">

      {/* About RBN */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-2 mb-6">
                <Target className="w-5 h-5 text-gray-400" />
                <span className="text-gray-500 uppercase tracking-wider">
                  Who We Are
                </span>
              </div>
              <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl mb-8">
                Built Different. <br /> Made for the Bold.
              </h1>
              <p className="font-body text-lg md:text-xl text-gray-600 leading-relaxed mb-8">
                Rain by Nurain is streetwear with purpose made for those who move with vision.
                Every drop reflects hustle, ambition, and the quiet confidence of the streets that raised us.
                We design for creators, dreamers, and believers — people who live by their grind and wear their story.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" onClick={() => navigate('/shop')}>
                  Shop Collection
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="aspect-[1/1] bg-gray-100 overflow-hidden rounded-2xl shadow-lg">
                <img
                  src={rbnImg}
                  alt="RBN founder"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white p-6 shadow-lg max-w-xs rounded-xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-black text-white flex items-center justify-center font-bold">
                    R
                  </div>
                  <div>
                    <p className="font-body font-semibold">Rain by Nurain</p>
                    <p className="font-body text-gray-600 text-sm">For the Dreamers</p>
                  </div>
                </div>
                <p className="font-body text-sm text-gray-600">
                  Every design is a piece of my journey, shared with the world.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-black text-white flex items-center justify-center mx-auto mb-4 rounded-full">
                  <stat.icon className="w-8 h-8" />
                </div>
                <div className="font-heading text-3xl md:text-4xl mb-2">{stat.value}</div>
                <div className="font-body text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Nurain */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="relative order-2 lg:order-1"
            >
              <div className="aspect-[1/1] bg-gray-100 overflow-hidden rounded-2xl shadow-lg">
                <img
                  src={nurainImg}
                  alt="Nurain Idris"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="order-1 lg:order-2"
            >
              <div className="flex items-center gap-2 mb-6">
                <Heart className="w-5 h-5 text-gray-400" />
                <span className="text-gray-500 uppercase tracking-wider">
                  The Founder
                </span>
              </div>
              <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl mb-8">
                Meet Nurain — Vision, Grit & Style
              </h1>
              <p className="font-body text-lg md:text-xl text-gray-600 leading-relaxed mb-8">
                From the capital city to the world, Nurain built Rain by Nurain out of raw passion and relentless drive.
                Self-taught, inspired by street life and global minimalism, he turned an idea into a statement brand.
                Every collection reflects purpose and culture made for those who dare to stand out.
              </p>
              <Button
                size="lg"
                onClick={() =>
                  window.open("https://www.instagram.com/_idrees_nurain/", "_blank")
                }
                className="bg-black text-white hover:bg-gray-800 flex items-center gap-3"
              >
                <Instagram className="w-5 h-5" />
                Let’s Connect
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-black text-white py-24">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
            Join the Tribe
          </h2>
          <p className="text-lg lg:text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Connect with a global community of creators, hustlers, and dreamers.
            Share your story, inspire others, and be part of something bigger.
          </p>
          <Button
            size="lg"
            onClick={() =>
              window.open("https://www.instagram.com/rainbynurain", "_blank")
            }
            className="bg-white text-black hover:bg-gray-200 flex items-center gap-3"
          >
            <Instagram className="w-5 h-5" />
            Join on Instagram
          </Button>
        </div>
      </section>

    </div>
  );
}
