import React from 'react';
import { Heart, Globe, Users, Zap, Target, Star, Award, Truck, Instagram } from 'lucide-react';
import { Button } from '../components/ui/button';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const stats = [
  { icon: Users, label: 'Happy Customers', value: '1K+' },
  { icon: Globe, label: 'Countries', value: '5+' },
  { icon: Award, label: 'Awards Won', value: '2' },
  { icon: Truck, label: 'Orders Shipped', value: '500+' },
];

const values = [
  {
    icon: Heart,
    title: 'Passion-Driven',
    description: 'Every design comes from the heart, inspired by real stories and authentic experiences.',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop'
  },
  {
    icon: Globe,
    title: 'Global Impact',
    description: 'Connecting cultures and communities through fashion that transcends boundaries.',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=400&fit=crop'
  },
  {
    icon: Users,
    title: 'Community First',
    description: 'Building a movement where everyone belongs and every voice matters.',
    image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&h=400&fit=crop'
  },
  {
    icon: Zap,
    title: 'Innovation',
    description: 'Pushing creative boundaries while staying true to our streetwear roots.',
    image: 'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=600&h=400&fit=crop'
  },
];

const timeline = [
  {
    year: '2020',
    title: 'The Beginning',
    description: 'Started with a vision to create authentic streetwear that tells stories.',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop'
  },
  {
    year: '2021',
    title: 'First Collection',
    description: 'Launched our debut collection "Left Home to Feed Home" to critical acclaim.',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop'
  },
  {
    year: '2022',
    title: 'Global Expansion',
    description: 'Expanded to 15 countries, bringing our message worldwide.',
    image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=300&fit=crop'
  },
  {
    year: '2024',
    title: 'Today',
    description: 'Leading the next generation of conscious streetwear with purpose.',
    image: 'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=400&h=300&fit=crop'
  },
];

export function AboutPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pt-20 bg-white">
      {/* Hero Section */}
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
                <span className="text-product-category text-gray-500 uppercase tracking-wider">
                  Our Mission
                </span>
              </div>
              <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl mb-8">
                Built Different. <br /> Made for the Bold.
              </h1>
              <p className="font-body text-lg md:text-xl text-gray-600 leading-relaxed mb-8">
                Rain by Nurain is streetwear with purpose made for those who move with vision. Every drop reflects hustle, ambition, and the quiet confidence of the streets that raised us. We design for creators, dreamers, and believers — people who live by their grind and wear their story.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" onClick={() => navigate('/shop')}>
                  Shop Collection
                </Button>
                {/* <Button size="lg" variant="outline" onClick={() => navigate('/community')}>
                  Join Community
                </Button>*/}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="aspect-[4/5] bg-gray-200 overflow-hidden">
                <img
                  src="/assets/rbn.jpg"
                  alt="RBN founder"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white p-6 shadow-lg max-w-xs">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-black text-white flex items-center justify-center font-bold">
                    R
                  </div>
                  <div>
                    <p className="font-body font-semibold">Rain by Nurain</p>
                    <p className="font-body text-gray-600 text-sm">Left Home to Feed Home</p>
                  </div>
                </div>
                <p className="font-body text-sm text-gray-600">
                  "Every design is a piece of my journey, shared with the world."
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
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
                <div className="w-16 h-16 bg-black text-white flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-8 h-8" />
                </div>
                <div className="font-heading text-3xl md:text-4xl mb-2">{stat.value}</div>
                <div className="font-body text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      {/*
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl mb-6">
              Our Values
            </h2>
            <p className="font-body text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              These principles guide everything we do, from design to delivery.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white p-8 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 bg-black text-white flex items-center justify-center flex-shrink-0">
                    <value.icon className="w-8 h-8" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-body text-xl font-semibold mb-3">{value.title}</h3>
                    <p className="font-body text-gray-600 leading-relaxed mb-4">{value.description}</p>
                  </div>
                </div>
                <div className="aspect-[16/9] bg-gray-200 overflow-hidden mt-6">
                  <img
                    src={value.image}
                    alt={value.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section> 
      */}

      {/* About the Founder Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl mb-6">
              The Founder
            </h2>
            <p className="font-body text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Meet Nurain, the creative with vision, grit & style
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <div className="aspect-[4/5] bg-gray-200 overflow-hidden">
                <img
                  src="/assets/nurain.jpg"
                  alt="Nurain - Founder of RBN"
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <div>
                <h3 className="font-heading text-3xl md:text-4xl mb-4">Nurain</h3>
                <p className="font-body text-lg text-gray-600 mb-6">
                  Founder & Creative Director
                </p>
              </div>

              <div className="space-y-6">
                <p className="font-body text-lg text-gray-600 leading-relaxed">
                  From the capital city to the world, Nurain built Rain by Nurain out of raw passion and relentless drive. Self-taught, inspired by street life and global minimalism, he turned an idea into a statement brand.
                </p>
                
                <p className="font-body text-lg text-gray-600 leading-relaxed">
                  Every design tells a story of perseverance, creativity, and the relentless pursuit of excellence. 
                  Nurain believes that fashion should be more than just clothing—it should be a statement, a movement, and a bridge between cultures.
                </p>

                <div className="bg-gray-50 p-6 space-y-4">
                  <p className="font-body text-gray-600">
                    RBN is more than clothing — it’s proof that you can start small, stay real, and still go global.
                  </p>
                </div>
                
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-black text-white py-24">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="mb-8">
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
            className="bg-white text-black hover:bg-black font-normal tracking-wide px-4 py-6 text-sm uppercase mx-auto mobile-keep-center transition-all duration-200 flex items-center gap-3"
          >
            <Instagram className="w-5 h-5" />
            Join on Instagram
          </Button>
        </div>
      </div>
    </section>
    </div>
  );
}
