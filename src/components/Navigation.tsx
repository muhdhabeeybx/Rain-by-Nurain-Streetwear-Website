import React, { useState } from "react";
import { ShoppingBag, Menu, Search, User } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useApp } from "../contexts/AppContext";
import { useNavigate, useLocation } from "react-router-dom";
import brandLogo from 'figma:asset/0579ff569064c8c2a3a6be5eccb9e10f44dae83d.png';

export function Navigation() {
  const { cartCount, setIsCartOpen, setIsMobileMenuOpen, products } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [logoClickCount, setLogoClickCount] = useState(0);

  const handleCartClick = () => {
    setIsCartOpen(true);
  };

  const handleMobileMenuClick = () => {
    setIsMobileMenuOpen(true);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      const results = products.filter(product =>
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.category.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(results.slice(0, 5));
    } else {
      setSearchResults([]);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
      setSearchResults([]);
    }
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Shop", path: "/shop" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <header className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-black/10 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Mobile menu button */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="lg:hidden"
            onClick={handleMobileMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Desktop navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className={`font-body text-sm font-medium hover:text-gray-600 transition-colors ${
                  location.pathname === link.path ? "text-black" : "text-gray-700"
                }`}
              >
                {link.name}
              </button>
            ))}
          </div>

          {/* Logo */}
          <div className="flex-1 lg:flex-none lg:absolute lg:left-1/2 lg:transform lg:-translate-x-1/2">
            <button
              onClick={() => {
                const newCount = logoClickCount + 1;
                setLogoClickCount(newCount);
                
                if (newCount >= 5) {
                  navigate("/admin");
                  setLogoClickCount(0);
                } else {
                  navigate("/");
                }
                
                // Reset counter after 3 seconds
                setTimeout(() => setLogoClickCount(0), 3000);
              }}
              className="block text-center"
            >
              <img 
                src={brandLogo} 
                alt="RBN - Rain by Nurain" 
                className={`h-8 w-auto mx-auto transition-all duration-200 ${logoClickCount >= 3 ? 'opacity-70 scale-95' : ''}`}
              />
            </button>
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="relative"
              onClick={handleCartClick}
            >
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-black text-white text-xs w-5 h-5 flex items-center justify-center font-medium rounded-full">
                  {cartCount}
                </span>
              )}
            </Button>

            {/* Account button - desktop only */}
            <Button 
              variant="ghost" 
              size="sm"
              className="hidden md:flex"
              onClick={() => navigate("/account")}
            >
              <User className="h-5 w-5" />
            </Button>

            {/* Search Bar - desktop only */}
            <div className="relative hidden md:block">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <form onSubmit={handleSearchSubmit} className="relative">
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-56 xl:w-64 pl-11 pr-4 py-2.5 bg-gray-50 border-0 focus:bg-white focus:ring-1 focus:ring-black transition-all duration-200 placeholder:text-gray-500"
                />
                {searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 shadow-xl mt-2 z-50 max-h-72 overflow-y-auto">
                    {searchResults.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => {
                          navigate(`/product/${product.id}`);
                          setSearchQuery("");
                          setSearchResults([]);
                        }}
                        className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 text-left border-b border-gray-100 last:border-b-0 transition-colors"
                      >
                        <div className="w-12 h-12 bg-gray-100 overflow-hidden flex-shrink-0">
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-black line-clamp-1">{product.name}</p>
                          <p className="text-xs text-gray-500 capitalize mt-1">{product.category}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}