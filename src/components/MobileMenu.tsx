import React, { useState } from 'react';
import { X, User, Home, Store, Mail, Search, Info } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import brandLogo from 'figma:asset/0579ff569064c8c2a3a6be5eccb9e10f44dae83d.png';

export function MobileMenu() {
  const { isMobileMenuOpen, setIsMobileMenuOpen, products } = useApp();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const menuItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Store, label: 'Shop', path: '/shop' },
    { icon: Info, label: 'About', path: '/about' },
    { icon: Mail, label: 'Contact', path: '/contact' },
    { icon: User, label: 'Account', path: '/account' },
  ];

  const handleNavigation = (path: string) => {
    setIsMobileMenuOpen(false);
    navigate(path);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsMobileMenuOpen(false);
      navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  return (
    <AnimatePresence>
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Menu */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed left-0 top-0 h-full w-80 bg-white z-50 shadow-xl md:hidden"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b">
                <div className="flex items-center gap-3">
                  <img src={brandLogo} alt="RBN" className="h-8 w-auto" />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Navigation */}
              <div className="flex-1 p-6">
                <nav className="space-y-3 mb-8">
                  {menuItems.map((item) => (
                    <button
                      key={item.path}
                      onClick={() => handleNavigation(item.path)}
                      className="flex items-center gap-4 w-full p-3 text-left hover:bg-gray-50 transition-colors text-lg"
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </button>
                  ))}
                </nav>

                {/* Search */}
                <div className="mb-8">
                  <form onSubmit={handleSearch} className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-gray-50 border-0 focus:bg-white focus:ring-1 focus:ring-black"
                    />
                  </form>
                </div>

                {/* Brand Description */}
                <div className="pt-6 border-t">
                  <p className="text-sm text-gray-600 leading-relaxed">
                    <strong>"Left Home to Feed Home"</strong>
                    <br />
                    Streetwear with soul for the culture. Every piece tells a story, every purchase supports the journey.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}