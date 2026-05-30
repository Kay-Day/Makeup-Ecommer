import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { initAnalytics, trackPageView } from './services/analytics';

const HomePage = lazy(() => import('./pages/HomePage').then((module) => ({ default: module.HomePage })));
const ShopAllPage = lazy(() => import('./pages/ShopAllPage').then((module) => ({ default: module.ShopAllPage })));
const ProductDetailsPage = lazy(() => import('./pages/ProductDetailsPage').then((module) => ({ default: module.ProductDetailsPage })));
const CartPage = lazy(() => import('./pages/CartPage').then((module) => ({ default: module.CartPage })));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage').then((module) => ({ default: module.CheckoutPage })));
const SignInPage = lazy(() => import('./pages/SignInPage').then((module) => ({ default: module.SignInPage })));
const MyAccountPage = lazy(() => import('./pages/MyAccountPage').then((module) => ({ default: module.MyAccountPage })));
const AdminOverviewPage = lazy(() => import('./pages/AdminOverviewPage').then((module) => ({ default: module.AdminOverviewPage })));
const ContactUsPage = lazy(() => import('./pages/ContactUsPage').then((module) => ({ default: module.ContactUsPage })));
const FAQPage = lazy(() => import('./pages/FAQPage').then((module) => ({ default: module.FAQPage })));
const OurStoryPage = lazy(() => import('./pages/OurStoryPage').then((module) => ({ default: module.OurStoryPage })));
const BlogPage = lazy(() => import('./pages/BlogPage').then((module) => ({ default: module.BlogPage })));
const ArticlePage = lazy(() => import('./pages/ArticlePage').then((module) => ({ default: module.ArticlePage })));
const SearchPage = lazy(() => import('./pages/SearchPage').then((module) => ({ default: module.SearchPage })));
const CombosPage = lazy(() => import('./pages/CombosPage').then((module) => ({ default: module.CombosPage })));
const ComboDetailPage = lazy(() => import('./pages/ComboDetailPage').then((module) => ({ default: module.ComboDetailPage })));

function PageFallback() {
  return <div className="min-h-[45vh] py-20 text-center text-stone-500">Đang tải...</div>;
}

function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname, search]);

  return null;
}

function AnalyticsTracker() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    initAnalytics();
  }, []);

  useEffect(() => {
    trackPageView(`${pathname}${search}`);
  }, [pathname, search]);

  return null;
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AnalyticsTracker />
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="shop" element={<ShopAllPage />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="product/:id" element={<ProductDetailsPage />} />
            <Route path="cart" element={<CartPage />} />
            <Route path="checkout" element={<CheckoutPage />} />
            <Route path="account" element={<MyAccountPage />} />
            <Route path="contact" element={<ContactUsPage />} />
            <Route path="faq" element={<FAQPage />} />
            <Route path="philosophy" element={<OurStoryPage />} />
            <Route path="blog" element={<BlogPage />} />
            <Route path="blog/:id" element={<ArticlePage />} />
            <Route path="combos" element={<CombosPage />} />
            <Route path="combo/:id" element={<ComboDetailPage />} />
          </Route>
          <Route path="/login" element={<SignInPage />} />
          <Route path="/admin" element={<AdminOverviewPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
