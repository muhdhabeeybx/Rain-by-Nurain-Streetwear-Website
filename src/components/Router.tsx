import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navigation } from './Navigation';
import { Footer } from './Footer';
import { CartSidebar } from './CartSidebar';
import { MobileMenu } from './MobileMenu';
import { ScrollToTop } from './ScrollToTop';
import { Toaster } from './ui/sonner';
import { HomePage } from '../pages/HomePage';
import { ShopPage } from '../pages/ShopPage';
import { ProductPage } from '../pages/ProductPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { AboutPage } from '../pages/AboutPage';
import { CommunityPage } from '../pages/CommunityPage';
import { ContactPage } from '../pages/ContactPage';
import { AccountPage } from '../pages/AccountPage';
import { AdminWrapper } from './AdminWrapper';
import { SizeGuidePage } from '../pages/SizeGuidePage';
import { ShippingPage } from '../pages/ShippingPage';
import { ReturnsPage } from '../pages/ReturnsPage';
import { CareInstructionsPage } from '../pages/CareInstructionsPage';
import { FAQPage } from '../pages/FAQPage';
import { PrivacyPolicyPage } from '../pages/PrivacyPolicyPage';
import { TermsOfServicePage } from '../pages/TermsOfServicePage';

export function Router() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-white">
        <ScrollToTop />
        <Navigation />
        <MobileMenu />
        <CartSidebar />
        <Toaster />
        
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/shop/:category" element={<ShopPage />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/admin" element={<AdminWrapper />} />
          <Route path="/size-guide" element={<SizeGuidePage />} />
          <Route path="/shipping" element={<ShippingPage />} />
          <Route path="/returns" element={<ReturnsPage />} />
          <Route path="/care-instructions" element={<CareInstructionsPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/terms-of-service" element={<TermsOfServicePage />} />
          {/* Catch-all route for unmatched paths */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        
        <Footer />
      </div>
    </BrowserRouter>
  );
}