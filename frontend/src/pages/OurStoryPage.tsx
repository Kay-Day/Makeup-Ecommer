import { useTranslation } from 'react-i18next';

export function OurStoryPage() {
  const { t } = useTranslation();
  return (
    <div className="pt-20">
      {/* Hero: Our Philosophy */}
      <section className="pb-section-padding px-8 md:px-16 bg-white overflow-hidden">
        <div className="max-w-[1280px] mx-auto grid md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-6 space-y-8">
            <span className="font-label-caps text-xs font-bold text-primary uppercase tracking-widest">{t('about.label')}</span>
            <h1 className="font-h1 text-5xl md:text-6xl font-bold text-on-surface">{t('about.title')}</h1>
            <p className="font-body-lg text-lg text-on-surface-variant max-w-xl">{t('about.description')}</p>
            <div className="pt-4">
              <button className="bg-primary text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary-container transition-all active:scale-95">
                {t('about.discover_btn')}
              </button>
            </div>
          </div>
          <div className="md:col-span-6 relative">
            <div className="relative z-10 rounded-2xl overflow-hidden aspect-[4/5] shadow-2xl">
              <img 
                className="w-full h-full object-cover" 
                alt="Minimalist Medical Consultation Room" 
                src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=800"
              />
            </div>
            <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-secondary-fixed rounded-full -z-0 opacity-50 blur-3xl"></div>
          </div>
        </div>
      </section>

      {/* Our Standards: Bento Grid */}
      <section className="py-section-padding px-8 md:px-16 bg-surface-container-low">
        <div className="max-w-[1280px] mx-auto">
          <div className="text-center mb-20 space-y-2">
            <span className="font-label-caps text-xs font-bold text-primary uppercase tracking-widest">{t('about.foundation_label')}</span>
            <h2 className="font-h2 text-4xl font-bold text-on-surface">{t('about.foundation_title')}</h2>
          </div>
          
          <div className="grid md:grid-cols-4 grid-rows-2 gap-6 h-auto md:h-[600px]">
            {/* Safety */}
            <div className="md:col-span-2 md:row-span-2 bg-white p-12 rounded-xl flex flex-col justify-end border border-outline-variant shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
              <div className="absolute top-8 right-8 text-primary/10">
                <span className="material-symbols-outlined !text-9xl transition-transform duration-500 group-hover:scale-110">verified_user</span>
              </div>
              <div className="relative z-10 space-y-4">
                <span className="material-symbols-outlined text-primary text-4xl">security</span>
                <h3 className="font-h3 text-3xl font-bold text-on-surface">{t('about.safety_title')}</h3>
                <p className="font-body-md text-on-surface-variant">{t('about.safety_desc')}</p>
              </div>
            </div>

            {/* Certifications */}
            <div className="md:col-span-2 bg-primary text-white p-12 rounded-xl flex items-center justify-between group transition-all hover:bg-emerald-900">
              <div className="space-y-4 max-w-sm">
                <h3 className="font-h3 text-3xl font-bold text-white">{t('about.cert_title')}</h3>
                <p className="font-body-md opacity-80">{t('about.cert_desc')}</p>
              </div>
              <div className="hidden lg:block">
                <span className="material-symbols-outlined !text-6xl text-primary-fixed transition-transform duration-500 group-hover:rotate-12">award_star</span>
              </div>
            </div>

            {/* Quality Control */}
            <div className="md:col-span-1 bg-secondary-container p-8 rounded-xl space-y-4 flex flex-col justify-center hover:bg-secondary-fixed transition-colors cursor-default">
              <span className="material-symbols-outlined text-primary text-3xl">biotech</span>
              <h3 className="font-h3 text-[20px] font-bold leading-tight text-on-surface">{t('about.equipment')}</h3>
            </div>
            
            <div className="md:col-span-1 bg-white p-8 rounded-xl border border-outline-variant space-y-4 flex flex-col justify-center hover:border-primary transition-colors cursor-default">
              <span className="material-symbols-outlined text-primary text-3xl">monitoring</span>
              <h3 className="font-h3 text-[20px] font-bold leading-tight text-on-surface">{t('about.monitoring')}</h3>
            </div>
          </div>
        </div>
      </section>

      {/* Meet the Specialists: Clinical Carousel */}
      <section className="py-section-padding px-8 md:px-16 bg-white overflow-hidden">
        <div className="max-w-[1280px] mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="space-y-2 max-w-xl">
              <span className="font-label-caps text-xs font-bold text-primary uppercase tracking-widest">{t('about.team_label')}</span>
              <h2 className="font-h2 text-4xl font-bold text-on-surface">{t('about.team_title')}</h2>
              <p className="font-body-md text-on-surface-variant">{t('about.team_desc')}</p>
            </div>
            <div className="flex space-x-4">
              <button className="w-12 h-12 rounded-full border border-outline flex items-center justify-center hover:bg-surface-container transition-all active:scale-95">
                <span className="material-symbols-outlined text-on-surface">arrow_back</span>
              </button>
              <button className="w-12 h-12 rounded-full border border-outline flex items-center justify-center hover:bg-surface-container transition-all active:scale-95">
                <span className="material-symbols-outlined text-on-surface">arrow_forward</span>
              </button>
            </div>
          </div>

          <div className="flex overflow-x-auto gap-8 pb-12 snap-x hide-scrollbar scroll-smooth">
            {/* Doctor 1 */}
            <div className="min-w-[320px] md:min-w-[400px] snap-start group cursor-pointer">
              <div className="aspect-[3/4] rounded-2xl overflow-hidden mb-6 relative">
                <img 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                  alt="Dr. Elena Trinh" 
                  src="https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&q=80&w=800"
                />
                <div className="absolute bottom-6 left-6 right-6 p-6 bg-white/80 backdrop-blur-md rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg">
                  <p className="text-on-surface text-sm font-semibold">Specialty: Regenerative Aesthetics</p>
                </div>
              </div>
              <h3 className="font-h3 text-2xl font-bold text-on-surface mb-1">Dr. Elena Trinh</h3>
              <p className="font-label-caps text-xs font-bold text-primary uppercase tracking-wider">Chief Medical Officer</p>
            </div>

            {/* Doctor 2 */}
            <div className="min-w-[320px] md:min-w-[400px] snap-start group cursor-pointer">
              <div className="aspect-[3/4] rounded-2xl overflow-hidden mb-6 relative">
                <img 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                  alt="Dr. Marcus Vu" 
                  src="https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?auto=format&fit=crop&q=80&w=800"
                />
                <div className="absolute bottom-6 left-6 right-6 p-6 bg-white/80 backdrop-blur-md rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg">
                  <p className="text-on-surface text-sm font-semibold">Specialty: Surgical Dermatology</p>
                </div>
              </div>
              <h3 className="font-h3 text-2xl font-bold text-on-surface mb-1">Dr. Marcus Vu</h3>
              <p className="font-label-caps text-xs font-bold text-primary uppercase tracking-wider">Lead Surgical Specialist</p>
            </div>

            {/* Doctor 3 */}
            <div className="min-w-[320px] md:min-w-[400px] snap-start group cursor-pointer">
              <div className="aspect-[3/4] rounded-2xl overflow-hidden mb-6 relative">
                <img 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                  alt="Dr. Sophia Nguyen" 
                  src="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=800"
                />
                <div className="absolute bottom-6 left-6 right-6 p-6 bg-white/80 backdrop-blur-md rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg">
                  <p className="text-on-surface text-sm font-semibold">Specialty: Laser Technology</p>
                </div>
              </div>
              <h3 className="font-h3 text-2xl font-bold text-on-surface mb-1">Dr. Sophia Nguyen</h3>
              <p className="font-label-caps text-xs font-bold text-primary uppercase tracking-wider">Dermatologist & Laser Expert</p>
            </div>
          </div>
        </div>
      </section>

      {/* Clinic Space Gallery */}
      <section className="py-section-padding px-8 md:px-16 bg-surface">
        <div className="max-w-[1280px] mx-auto">
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 md:col-span-4 space-y-4 flex flex-col justify-center">
              <span className="font-label-caps text-xs font-bold text-primary uppercase tracking-widest">{t('about.env_label')}</span>
              <h2 className="font-h2 text-4xl font-bold text-on-surface">{t('about.env_title')}</h2>
              <p className="font-body-md text-on-surface-variant">{t('about.env_desc')}</p>
              
              <div className="pt-8 grid grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-lg border border-outline-variant text-center hover:border-primary transition-colors cursor-default">
                  <div className="text-3xl font-bold text-primary mb-1">12</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{t('about.private_suites')}</div>
                </div>
                <div className="bg-white p-6 rounded-lg border border-outline-variant text-center hover:border-primary transition-colors cursor-default">
                  <div className="text-3xl font-bold text-primary mb-1">100%</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{t('about.sterile')}</div>
                </div>
              </div>
            </div>
            
            <div className="col-span-12 md:col-span-8 grid grid-cols-2 gap-6">
              <div className="rounded-xl overflow-hidden h-[300px] md:h-full group">
                <img 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                  alt="Luxury Medical Clinic Lobby" 
                  src="https://images.unsplash.com/photo-1599305090598-fe179d501227?auto=format&fit=crop&q=80&w=800"
                />
              </div>
              <div className="grid grid-rows-2 gap-6">
                <div className="rounded-xl overflow-hidden group">
                  <img 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                    alt="High-tech Medical Treatment Room" 
                    src="https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&q=80&w=800"
                  />
                </div>
                <div className="rounded-xl overflow-hidden group">
                  <img 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                    alt="Premium Skin Consultation Station" 
                    src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=800"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-section-padding px-8 md:px-16 bg-primary-container text-white">
        <div className="max-w-[800px] mx-auto text-center space-y-8">
          <h2 className="font-h1 text-4xl md:text-5xl font-bold text-white">{t('about.cta_title')}</h2>
          <p className="font-body-lg text-lg text-primary-fixed">{t('about.cta_desc')}</p>
          <div className="flex flex-col md:flex-row gap-4 justify-center pt-8">
            <button className="bg-white text-primary px-10 py-5 rounded-lg font-bold hover:bg-surface transition-all active:scale-95 shadow-lg">
              {t('about.book_btn')}
            </button>
            <button className="border-2 border-white/30 text-white px-10 py-5 rounded-lg font-bold hover:bg-white/10 transition-all active:scale-95">
              {t('about.view_treatments')}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
