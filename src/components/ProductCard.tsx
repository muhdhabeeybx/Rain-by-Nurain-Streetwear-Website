import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { toast } from 'sonner@2.0.3';

interface ProductCardProps {
  product: {
    id: number | string;
    name: string;
    price: number;
    image: string;
    hoverImage?: string;
    category: string;
    isNew?: boolean;
    stock?: number;
    colors?: string[];
  };
  className?: string;
}

// Default color options for products
const defaultColors = ['#1a1a1a', '#8b4513', '#696969'];

// Color mapping for text-based colors to hex
const colorMap: Record<string, string> = {
  'Black': '#000000',
  'White': '#FFFFFF',
  'Gray': '#808080',
  'Grey': '#808080',
  'Navy': '#000080',
  'Olive': '#556B2F',
  'Khaki': '#F0E68C',
  'Indigo': '#4B0082',
  'Stone Wash': '#D3D3D3',
  'brown': '#8b4513',
  'beige': '#F5F5DC',
  'cream': '#FFFDD0',
};

export function ProductCard({ product, className = '' }: ProductCardProps) {
  const navigate = useNavigate();
  const { toggleWishlist, wishlist } = useApp();
  const { formatPrice } = useCurrency();
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [showSecondaryImage, setShowSecondaryImage] = useState(false);

  // Safety checks
  if (!product) {
    return null;
  }

  const isWishlisted = wishlist?.some(item => item.id === product.id) || false;
  
  // Convert color names to hex codes if needed
  const getColorHex = (color: string): string => {
    // If it's already a hex color, return it
    if (color.startsWith('#')) return color;
    // Otherwise, look it up in the color map
    return colorMap[color] || color;
  };
  
  const productColors = product.colors 
    ? product.colors.map(getColorHex) 
    : defaultColors;

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product);
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist', { duration: 2000 });
  };

  const handleProductClick = () => {
    navigate(`/product/${product.id}`);
  };

  // Determine if product is low stock
  const isLowStock = product.stock !== undefined && product.stock > 0 && product.stock <= 5;
  const isOutOfStock = product.stock === 0;

  return (
    <motion.div
      className={`group cursor-pointer ${className} ${isOutOfStock ? 'opacity-75' : ''}`}
      onMouseEnter={() => {
        setIsHovered(true);
        if (product.hoverImage) {
          setShowSecondaryImage(true);
        }
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowSecondaryImage(false);
      }}
      onClick={handleProductClick}
    >
      <div className="bg-white transition-all duration-300">
        {/* Image Container */}
        <div className="relative aspect-[4/5] overflow-hidden bg-gray-50 mb-4">
          {imageLoading && (
            <div className="absolute inset-0 bg-gray-100 animate-pulse"></div>
          )}
          <img
            src={showSecondaryImage && product.hoverImage ? product.hoverImage : product.image}
            alt={product.name}
            className={`w-full h-full object-cover transition-all duration-500 ${
              imageLoading ? 'opacity-0' : 'opacity-100'
            }`}
            onLoad={() => setImageLoading(false)}
            onError={(e) => {
              setImageLoading(false);
              e.currentTarget.src = 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500&h=600&fit=crop';
            }}
          />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.isNew && !isOutOfStock && (
              <Badge className="bg-black text-white text-xs px-2 py-1 font-medium">
                NEW
              </Badge>
            )}
            {isLowStock && !isOutOfStock && (
              <Badge className="bg-orange-500 text-white text-xs px-2 py-1 font-medium">
                LOW STOCK
              </Badge>
            )}
            {isOutOfStock && (
              <Badge className="bg-red-600 text-white text-xs px-2 py-1 font-medium">
                OUT OF STOCK
              </Badge>
            )}
          </div>

          {/* Action buttons */}
          <div className={`absolute top-3 right-3 flex flex-col gap-2 transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}>
            <Button
              size="sm"
              variant="secondary"
              className="w-9 h-9 p-0 bg-white/90 hover:bg-white border-0 shadow-md"
              onClick={handleWishlist}
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
            </Button>
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-3">
          {/* Title */}
          <h3 className="text-product-title text-black line-clamp-1 font-medium">
            {product.name}
          </h3>

          {/* Price and Colors - Desktop: same line, Mobile: stacked */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            {/* Price */}
            <div className="text-sm text-gray-800 font-normal tracking-wide">
              {formatPrice(product.price, 'NGN')}
            </div>

            {/* Color Swatches */}
            <div className="flex items-center gap-1.5">
              {productColors.slice(0, 3).map((color, index) => (
                <div
                  key={index}
                  className="w-3 h-3 rounded-full border border-gray-300 shadow-sm"
                  style={{ backgroundColor: color }}
                />
              ))}
              {productColors.length > 3 && (
                <span className="text-xs text-gray-500 ml-1">+{productColors.length - 3}</span>
              )}
            </div>
          </div>

          {/* Stock indicators */}
          {isOutOfStock && (
            <div className="text-xs text-red-600 font-medium">
              Out of Stock
            </div>
          )}
          {isLowStock && !isOutOfStock && (
            <div className="text-xs text-orange-600 font-medium">
              Only {product.stock} left
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}