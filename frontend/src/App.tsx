import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { HomePage } from './pages/HomePage';
import { ShopAllPage } from './pages/ShopAllPage';
import { ProductDetailsPage } from './pages/ProductDetailsPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { SignInPage } from './pages/SignInPage';
import { MyAccountPage } from './pages/MyAccountPage';
import { AdminOverviewPage } from './pages/AdminOverviewPage';
import { ContactUsPage } from './pages/ContactUsPage';
import { FAQPage } from './pages/FAQPage';
import { OurStoryPage } from './pages/OurStoryPage';
import { BlogPage } from './pages/BlogPage';
import { ArticlePage } from './pages/ArticlePage';
import { SearchPage } from './pages/SearchPage';

function App() {
  return (
    <BrowserRouter>
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
          {/* We will add more routes here as we build them */}
        </Route>
        <Route path="/login" element={<SignInPage />} />
        <Route path="/admin" element={<AdminOverviewPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
