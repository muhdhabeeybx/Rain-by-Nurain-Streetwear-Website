import React from 'react';
import { BarChart3, ShoppingCart, Users, Package, Settings, Plus } from 'lucide-react';
import { Badge } from '../ui/badge';
import { motion } from 'framer-motion';

interface MobileTabNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  pendingOrdersCount?: number;
  lowStockCount?: number;
}

const tabItems = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3, shortLabel: 'Home' },
  { id: 'orders', label: 'Orders', icon: ShoppingCart, shortLabel: 'Orders', badge: true },
  { id: 'products', label: 'Products', icon: Package, shortLabel: 'Products' },
  { id: 'customers', label: 'Customers', icon: Users, shortLabel: 'Customers' },
];

export function MobileTabNav({ activeTab, onTabChange, pendingOrdersCount = 0, lowStockCount = 0 }: MobileTabNavProps) {
  const getBadgeCount = (itemId: string) => {
    switch (itemId) {
      case 'orders': return pendingOrdersCount;
      default: return null;
    }
  };

  return (
    <div className="lg:hidden mobile-admin-tabs">
      {/* Professional Mobile Tab Navigation */}
      <div className="bg-white border-b border-gray-100 shadow-sm sticky top-16 z-30">
        <div className="flex">
          {tabItems.map((item) => {
            const Icon = item.icon;
            const badgeCount = getBadgeCount(item.id);
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`relative flex-1 flex flex-col items-center gap-1.5 py-3 px-3 transition-all duration-200 ${
                  isActive 
                    ? 'text-black bg-gray-50' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-25'
                }`}
              >
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  {badgeCount && badgeCount > 0 && (
                    <span className="absolute -top-2 -right-2 min-w-[16px] h-4 px-1 bg-red-500 text-white text-xs font-medium rounded-full flex items-center justify-center">
                      {badgeCount > 9 ? '9+' : badgeCount}
                    </span>
                  )}
                </div>
                <span className="text-xs font-medium leading-none">
                  {item.shortLabel}
                </span>
                
                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="mobileActiveTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-black"
                    initial={false}
                    transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}