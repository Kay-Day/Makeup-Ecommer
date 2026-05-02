import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const faqData = [
  {
    question: "What is the recovery time for laser treatments?",
    answer: "Most of our dermatological laser treatments require minimal downtime. You may experience slight redness for 24-48 hours. We provide a post-treatment care kit including a curated selection of medical-grade soothing balms and SPF to ensure your skin recovers with maximum radiance."
  },
  {
    question: "How do I track my medical-grade skincare order?",
    answer: "You can track your order status directly from your Medical Portal dashboard under the 'Order History' section. We also send real-time email updates as your prescribed skincare regimen is prepared and dispatched."
  },
  {
    question: "Are the procedures performed by certified MDs?",
    answer: "Yes. All invasive and advanced laser procedures at TMC Medical are performed exclusively by board-certified dermatologists. Our support staff and aestheticians undergo rigorous medical training to assist under direct physician supervision."
  },
  {
    question: "What is TMC Medical's safety protocol?",
    answer: "We adhere strictly to international clinical standards. All equipment is sterilized using hospital-grade autoclaves, and our treatment rooms feature advanced air filtration. Your safety and comfort in a pristine environment are our absolute priorities."
  }
];

export function FAQPage() {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="pt-12 pb-section-padding">
      {/* Hero Search Section */}
      <section className="max-w-[1440px] mx-auto px-8 md:px-16 mb-20 text-center">
        <div className="max-w-3xl mx-auto">
          <span className="font-label-caps text-xs font-bold uppercase tracking-widest text-primary mb-4 block">{t('faq.label')}</span>
          <h1 className="font-h1 text-4xl md:text-5xl font-bold text-on-surface mb-8">{t('faq.title')}</h1>
          
          <div className="relative group">
            <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-outline text-2xl">search</span>
            </div>
            <input 
              className="w-full pl-16 pr-8 py-6 bg-white rounded-2xl border border-stone-200 shadow-[0_20px_50px_rgba(79,95,63,0.05)] focus:ring-2 focus:ring-primary-container/20 focus:border-primary-container outline-none transition-all text-lg font-manrope" 
              placeholder={t('faq.search_placeholder')} 
              type="text"
            />
            <div className="absolute inset-y-0 right-4 flex items-center">
              <kbd className="hidden md:inline-flex items-center px-3 py-1 bg-stone-100 border border-stone-200 rounded text-stone-400 font-sans text-xs">⌘K</kbd>
            </div>
          </div>
        </div>
      </section>

      {/* Category Bento Grid & Tabs */}
      <section className="max-w-[1440px] mx-auto px-8 md:px-16 mb-16">
        <div className="flex flex-wrap justify-center gap-4 mb-16">
          <button className="px-8 py-3 rounded-full bg-primary-container text-white font-h3 text-[16px] font-bold shadow-lg shadow-primary-container/20 flex items-center gap-2 transition-transform active:scale-95">
            <span className="material-symbols-outlined">medical_services</span>
            {t('faq.tab_treatments')}
          </button>
          <button className="px-8 py-3 rounded-full bg-white text-secondary font-h3 text-[16px] font-bold border border-stone-200 hover:bg-stone-50 transition-all flex items-center gap-2 active:scale-95">
            <span className="material-symbols-outlined">shopping_cart</span>
            {t('faq.tab_orders')}
          </button>
          <button className="px-8 py-3 rounded-full bg-white text-secondary font-h3 text-[16px] font-bold border border-stone-200 hover:bg-stone-50 transition-all flex items-center gap-2 active:scale-95">
            <span className="material-symbols-outlined">verified_user</span>
            {t('faq.tab_safety')}
          </button>
          <button className="px-8 py-3 rounded-full bg-white text-secondary font-h3 text-[16px] font-bold border border-stone-200 hover:bg-stone-50 transition-all flex items-center gap-2 active:scale-95">
            <span className="material-symbols-outlined">location_on</span>
            {t('faq.tab_stores')}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 max-w-5xl mx-auto">
          {/* Left Content: FAQ List */}
          <div className="md:col-span-8 space-y-4">
            {faqData.map((faq, index) => (
              <div key={index} className="bg-white border border-stone-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <button 
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-8 py-6 text-left flex justify-between items-center group"
                >
                  <span className="font-h3 text-[18px] font-bold text-on-surface group-hover:text-primary transition-colors">
                    {faq.question}
                  </span>
                  <span className={`material-symbols-outlined text-outline transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`}>
                    expand_more
                  </span>
                </button>
                <div 
                  className={`px-8 text-on-surface-variant font-body-md leading-relaxed border-t border-stone-50 overflow-hidden transition-all duration-300 ease-in-out ${openIndex === index ? 'max-h-96 pb-8 pt-6 opacity-100' : 'max-h-0 py-0 opacity-0 border-transparent'}`}
                >
                  {faq.answer}
                </div>
              </div>
            ))}
          </div>

          {/* Right Content: CTA/Sidebar */}
          <div className="md:col-span-4 space-y-6">
            <div className="bg-secondary-fixed p-8 rounded-3xl text-on-secondary-fixed">
              <h3 className="font-h3 text-2xl font-bold mb-4">{t('faq.still_questions')}</h3>
              <p className="font-body-md mb-6 opacity-80">{t('faq.still_questions_desc')}</p>
              <button className="w-full bg-primary-container text-white py-4 rounded-xl font-bold flex justify-center items-center gap-2 hover:opacity-90 transition-opacity active:scale-[0.98]">
                <span className="material-symbols-outlined">chat_bubble</span>
                {t('faq.live_chat')}
              </button>
            </div>

            <div className="relative h-64 rounded-3xl overflow-hidden group cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 to-transparent z-10"></div>
              <img 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                alt="TMC Clinic Interior" 
                src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=800"
              />
              <div className="absolute bottom-6 left-6 z-20 text-white">
                <p className="font-h3 text-[20px] font-bold">{t('faq.visit_flagship')}</p>
                <p className="text-sm opacity-80 mt-1">District 1, Ho Chi Minh City</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="max-w-[1440px] mx-auto px-8 md:px-16 mt-24">
        <div className="bg-surface-container-high rounded-[40px] py-20 px-8 text-center shadow-inner">
          <div className="max-w-2xl mx-auto">
            <h2 className="font-h2 text-4xl font-bold mb-4 text-on-surface">{t('faq.newsletter_title')}</h2>
            <p className="font-body-lg text-lg text-on-surface-variant mb-10">{t('faq.newsletter_desc')}</p>
            <form className="flex flex-col md:flex-row gap-4" onSubmit={(e) => e.preventDefault()}>
              <input 
                className="flex-1 px-8 py-4 rounded-full border-none ring-1 ring-stone-200 focus:ring-2 focus:ring-primary outline-none transition-shadow" 
                placeholder={t('faq.email_placeholder')}
                type="email"
              />
              <button 
                className="bg-primary text-white px-10 py-4 rounded-full font-bold hover:bg-primary-container transition-colors active:scale-95" 
                type="submit"
              >
                {t('faq.subscribe')}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
