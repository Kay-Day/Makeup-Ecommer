import { Outlet } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { FloatingContact } from '../components/layout/FloatingContact';
import { ChatbotWidget } from '../components/layout/ChatbotWidget';
import { ToastContainer } from '../components/ui/Toast';

export function MainLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow pt-20">
        <Outlet />
      </main>
      <Footer />
      <FloatingContact />
      <ChatbotWidget />
      <ToastContainer />
    </div>
  );
}
