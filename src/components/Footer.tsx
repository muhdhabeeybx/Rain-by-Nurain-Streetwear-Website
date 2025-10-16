import React, { useState } from "react";
import { Instagram } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AdminPasswordModal } from "./AdminPasswordModal";
import brandLogo from 'figma:asset/0579ff569064c8c2a3a6be5eccb9e10f44dae83d.png';

export function Footer() {
  const navigate = useNavigate();
  const [showAdminModal, setShowAdminModal] = useState(false);

  const shopLinks = [
    { name: "Hoodies", path: "/shop/hoodies" },
    { name: "T-Shirts", path: "/shop/tees" },
    { name: "Outerwear", path: "/shop/outerwear" },
    { name: "Accessories", path: "/shop/accessories" },
  ];

  const companyLinks = [
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
    { name: "FAQ", path: "/faq" },
  ];

  const supportLinks = [
    { name: "Size Guide", path: "/size-guide" },
    { name: "Shipping", path: "/shipping" },
    { name: "Returns", path: "/returns" },
    { name: "Care Instructions", path: "/care-instructions" },
  ];

  const legalLinks = [
    { name: "Privacy Policy", path: "/privacy-policy" },
    { name: "Terms of Service", path: "/terms-of-service" },
  ];

  return (
    <footer className="bg-white border-t border-black/10 py-12">
      <div className="max-w-7xl mx-auto px-4">

        {/* Three evenly spaced columns */}
        <div className="flex flex-col md:flex-row md:justify-between gap-8 mb-8">
          {/* Company column with social links */}
          <div className="flex-1">
            <h4 className="font-bold mb-4 text-sm">Company</h4>
            <ul className="space-y-2 mb-4 text-sm text-gray-600">
              {companyLinks.map((link, index) => (
                <li key={`company-${index}`}>
                  <button
                    onClick={() => navigate(link.path)}
                    className="hover:text-black transition-colors text-left font-normal"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>

            {/* Social links */}
            <div className="flex items-center space-x-4">
              <a
                href="https://www.instagram.com/rainbynurain"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-black transition-colors"
                title="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://www.tiktok.com/@rainbynurain"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-black transition-colors"
                title="TikTok"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Shop column */}
          <div className="flex-1">
            <h4 className="font-bold mb-4 text-sm">Shop</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              {shopLinks.map((link, index) => (
                <li key={`shop-${index}`}>
                  <button
                    onClick={() => navigate(link.path)}
                    className="hover:text-black transition-colors text-left font-normal"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Support column */}
          <div className="flex-1">
            <h4 className="font-bold mb-4 text-sm">Support</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              {supportLinks.map((link, index) => (
                <li key={`support-${index}`}>
                  <button
                    onClick={() => navigate(link.path)}
                    className="hover:text-black transition-colors text-left font-normal"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-black/10 pt-6 flex flex-col md:flex-row justify-between items-center">
          <span className="text-sm text-gray-500 mb-2 md:mb-0">
            © 2025 RainByNurain, All Rights Reserved | Powered by{" "}
            <a
              href="https://sableboxx.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-black transition-colors"
            >
              SableBoxx
            </a>
            .
          </span>

          <div className="flex space-x-4 text-xs text-gray-500">
            <button
              onClick={() => setShowAdminModal(true)}
              className="hover:text-black transition-colors font-normal"
            >
              Dashboard
            </button>
            {legalLinks.map((link, index) => (
              <button
                key={`legal-${index}`}
                onClick={() => navigate(link.path)}
                className="hover:text-black transition-colors font-normal"
              >
                {link.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <AdminPasswordModal
        isOpen={showAdminModal}
        onClose={() => setShowAdminModal(false)}
        onSuccess={() => navigate('/admin')}
      />
    </footer>
  );
}
