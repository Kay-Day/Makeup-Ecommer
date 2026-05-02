import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export function BlogPage() {
  const { t } = useTranslation();
  return (
    <div className="pt-20">
      <header className="mb-16 text-center max-w-3xl mx-auto pt-12">
        <span className="font-label-caps text-xs font-bold text-primary uppercase tracking-widest mb-4 block">{t('blog.label')}</span>
        <h1 className="font-h1 text-4xl md:text-5xl font-bold text-on-surface mb-6">{t('blog.title')}</h1>
        <p className="font-body-lg text-lg text-on-surface-variant">{t('blog.description')}</p>
      </header>

      <section className="flex flex-wrap justify-center gap-4 mb-20 border-b border-outline-variant pb-8 px-8 max-w-[1440px] mx-auto">
        <button className="px-6 py-2 rounded-full bg-secondary-fixed text-on-secondary-fixed font-manrope text-sm font-semibold hover:bg-secondary-container transition-all active:scale-95">{t('blog.all_articles')}</button>
        <button className="px-6 py-2 rounded-full bg-white border border-outline-variant text-on-surface-variant font-manrope text-sm font-semibold hover:bg-surface-container transition-all active:scale-95">{t('blog.skincare')}</button>
        <button className="px-6 py-2 rounded-full bg-white border border-outline-variant text-on-surface-variant font-manrope text-sm font-semibold hover:bg-surface-container transition-all active:scale-95">{t('blog.doctor_qa')}</button>
        <button className="px-6 py-2 rounded-full bg-white border border-outline-variant text-on-surface-variant font-manrope text-sm font-semibold hover:bg-surface-container transition-all active:scale-95">{t('blog.treatment')}</button>
        <button className="px-6 py-2 rounded-full bg-white border border-outline-variant text-on-surface-variant font-manrope text-sm font-semibold hover:bg-surface-container transition-all active:scale-95">{t('blog.wellness')}</button>
      </section>

      <section className="mb-24 px-8 md:px-16 max-w-[1440px] mx-auto">
        <div className="relative group overflow-hidden rounded-xl bg-white border border-outline-variant shadow-[0_30px_60px_rgba(79,95,63,0.05)] cursor-pointer">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            <div className="h-[400px] lg:h-[600px] overflow-hidden">
              <img 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                alt="Featured Article Header" 
                src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=800"
              />
            </div>
            <div className="p-12 flex flex-col justify-center bg-white relative z-10 lg:-ml-10 lg:rounded-l-3xl shadow-[-20px_0_40px_rgba(0,0,0,0.05)]">
              <span className="font-label-caps text-xs font-bold text-primary-container uppercase tracking-widest mb-4">{t('blog.featured')}</span>
              <h2 className="font-h2 text-3xl font-bold text-on-surface mb-6 leading-tight group-hover:text-primary transition-colors">The Science of Barrier Repair: Why Vietnam's Climate Demands a Specialized Approach</h2>
              <p className="font-body-lg text-lg text-on-surface-variant mb-8">Dr. Nguyen Minh Thao explores the delicate relationship between tropical humidity and the skin's lipid barrier, revealing why standard European skincare protocols often fail in Southeast Asian urban environments.</p>
              
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-full bg-surface-container-high overflow-hidden border border-outline-variant">
                  <img 
                    alt="Dr. Thao Profile" 
                    className="w-full h-full object-cover"
                    src="https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&q=80&w=800"
                  />
                </div>
                <div>
                  <p className="font-manrope font-bold text-on-surface">Dr. Nguyen Minh Thao</p>
                  <p className="text-xs text-on-surface-variant">Chief Dermatologist, TMC Medical</p>
                </div>
              </div>
              
              <div className="inline-flex items-center text-primary-container font-bold group-hover:underline">
                {t('blog.read_full')}
                <span className="material-symbols-outlined ml-2 transition-transform group-hover:translate-x-2">arrow_forward</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16 px-8 md:px-16 max-w-[1440px] mx-auto">
        {/* Article 1 */}
        <article className="flex flex-col group cursor-pointer">
          <div className="aspect-[4/5] rounded-lg overflow-hidden mb-6 border border-outline-variant">
            <img 
              alt="Skincare routine visuals" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              src="https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?auto=format&fit=crop&q=80&w=800"
            />
          </div>
          <div className="flex-1">
            <span className="font-label-caps text-xs font-bold text-primary uppercase tracking-widest mb-3 block">Skincare Routines</span>
            <h3 className="font-h3 text-xl font-bold text-on-surface mb-3 group-hover:text-primary transition-colors">Retinol 101: Navigating Your First Professional Prescription</h3>
            <p className="font-body-md text-on-surface-variant mb-6 line-clamp-3">Everything you need to know about starting vitamin A treatments, managing the adjustment period, and achieving that sought-after clinical glow safely.</p>
            <div className="font-manrope font-bold text-primary group-hover:opacity-70 transition-opacity flex items-center">
              Read More
              <span className="material-symbols-outlined text-sm ml-1 transition-transform group-hover:translate-x-1">chevron_right</span>
            </div>
          </div>
        </article>

        {/* Article 2 */}
        <article className="flex flex-col group cursor-pointer">
          <div className="aspect-[4/5] rounded-lg overflow-hidden mb-6 border border-outline-variant">
            <img 
              alt="Clinical procedure" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              src="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=800"
            />
          </div>
          <div className="flex-1">
            <span className="font-label-caps text-xs font-bold text-primary uppercase tracking-widest mb-3 block">Treatment Insights</span>
            <h3 className="font-h3 text-xl font-bold text-on-surface mb-3 group-hover:text-primary transition-colors">Pico-Second Lasers: The New Gold Standard for Pigmentation</h3>
            <p className="font-body-md text-on-surface-variant mb-6 line-clamp-3">A deep dive into how ultra-fast light pulses break down melanin without heat damage, specifically tailored for Asian skin types prone to PIH.</p>
            <div className="font-manrope font-bold text-primary group-hover:opacity-70 transition-opacity flex items-center">
              Read More
              <span className="material-symbols-outlined text-sm ml-1 transition-transform group-hover:translate-x-1">chevron_right</span>
            </div>
          </div>
        </article>

        {/* Article 3 */}
        <article className="flex flex-col group cursor-pointer">
          <div className="aspect-[4/5] rounded-lg overflow-hidden mb-6 border border-outline-variant">
            <img 
              alt="Doctor consultation" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              src="https://images.unsplash.com/photo-1599305090598-fe179d501227?auto=format&fit=crop&q=80&w=800"
            />
          </div>
          <div className="flex-1">
            <span className="font-label-caps text-xs font-bold text-primary uppercase tracking-widest mb-3 block">Doctor Q&A</span>
            <h3 className="font-h3 text-xl font-bold text-on-surface mb-3 group-hover:text-primary transition-colors">Ask the Expert: Truths and Myths About Adult Acne</h3>
            <p className="font-body-md text-on-surface-variant mb-6 line-clamp-3">Dr. Le Hoang answers your most frequent questions about persistent breakouts, hormonal triggers, and the role of clinical dietetics.</p>
            <div className="font-manrope font-bold text-primary group-hover:opacity-70 transition-opacity flex items-center">
              Read More
              <span className="material-symbols-outlined text-sm ml-1 transition-transform group-hover:translate-x-1">chevron_right</span>
            </div>
          </div>
        </article>

        {/* Article 4 */}
        <article className="flex flex-col group cursor-pointer">
          <div className="aspect-[4/5] rounded-lg overflow-hidden mb-6 border border-outline-variant">
            <img 
              alt="Microscopic view" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              src="https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&q=80&w=800"
            />
          </div>
          <div className="flex-1">
            <span className="font-label-caps text-xs font-bold text-primary uppercase tracking-widest mb-3 block">Treatment Insights</span>
            <h3 className="font-h3 text-xl font-bold text-on-surface mb-3 group-hover:text-primary transition-colors">The Bio-remodeling Revolution: Profhilo Explained</h3>
            <p className="font-body-md text-on-surface-variant mb-6 line-clamp-3">Understanding the mechanism of injectable hyaluronic acid and how it differs from traditional dermal fillers for skin hydration and laxity.</p>
            <div className="font-manrope font-bold text-primary group-hover:opacity-70 transition-opacity flex items-center">
              Read More
              <span className="material-symbols-outlined text-sm ml-1 transition-transform group-hover:translate-x-1">chevron_right</span>
            </div>
          </div>
        </article>

        {/* Article 5 */}
        <article className="flex flex-col group cursor-pointer">
          <div className="aspect-[4/5] rounded-lg overflow-hidden mb-6 border border-outline-variant">
            <img 
              alt="Modern clinical architecture" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              src="https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=800"
            />
          </div>
          <div className="flex-1">
            <span className="font-label-caps text-xs font-bold text-primary uppercase tracking-widest mb-3 block">Philosophy</span>
            <h3 className="font-h3 text-xl font-bold text-on-surface mb-3 group-hover:text-primary transition-colors">Creating Sanctuary: The Architecture of Clinical Calm</h3>
            <p className="font-body-md text-on-surface-variant mb-6 line-clamp-3">A conversation with our lead designer on why TMC Medical prioritizes environmental wellness and quiet luxury as part of the healing journey.</p>
            <div className="font-manrope font-bold text-primary group-hover:opacity-70 transition-opacity flex items-center">
              Read More
              <span className="material-symbols-outlined text-sm ml-1 transition-transform group-hover:translate-x-1">chevron_right</span>
            </div>
          </div>
        </article>

        {/* Article 6 */}
        <article className="flex flex-col group cursor-pointer">
          <div className="aspect-[4/5] rounded-lg overflow-hidden mb-6 border border-outline-variant">
            <img 
              alt="Dermatologist at work" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=800"
            />
          </div>
          <div className="flex-1">
            <span className="font-label-caps text-xs font-bold text-primary uppercase tracking-widest mb-3 block">Doctor Q&A</span>
            <h3 className="font-h3 text-xl font-bold text-on-surface mb-3 group-hover:text-primary transition-colors">Sun Protection Strategies for the Modern Urbanite</h3>
            <p className="font-body-md text-on-surface-variant mb-6 line-clamp-3">Beyond SPF: Dr. Pham on HEV blue light protection and why re-application is your most important skincare step in the digital age.</p>
            <div className="font-manrope font-bold text-primary group-hover:opacity-70 transition-opacity flex items-center">
              Read More
              <span className="material-symbols-outlined text-sm ml-1 transition-transform group-hover:translate-x-1">chevron_right</span>
            </div>
          </div>
        </article>
      </section>

      <section className="mt-32 mb-32 p-16 rounded-3xl bg-surface-container text-center max-w-[1000px] mx-auto border border-outline-variant shadow-[0_4px_30px_rgba(79,95,63,0.03)] mx-4 md:mx-auto">
        <h2 className="font-h2 text-3xl md:text-4xl font-bold text-primary mb-4">{t('blog.newsletter_title')}</h2>
        <p className="font-body-lg text-lg text-on-surface-variant mb-8 max-w-xl mx-auto">{t('blog.newsletter_desc')}</p>
        <form className="flex flex-col md:flex-row gap-4 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
          <input 
            className="flex-1 rounded-lg border-outline-variant bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none h-12 px-6 shadow-sm transition-shadow" 
            placeholder={t('blog.newsletter_placeholder')}
            type="email"
          />
          <button 
            className="bg-primary-container text-white px-8 h-12 rounded-lg font-manrope font-bold hover:bg-primary transition-colors active:scale-95"
            type="submit"
          >
            {t('blog.subscribe')}
          </button>
        </form>
        <p className="text-[10px] text-stone-400 mt-6 font-manrope font-bold uppercase tracking-widest">{t('blog.newsletter_note')}</p>
      </section>
    </div>
  );
}
