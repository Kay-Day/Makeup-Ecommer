import { Link } from 'react-router-dom';

export function ArticlePage() {
  return (
    <div className="bg-surface font-body-md text-on-surface">
      {/* Article Hero Section */}
      <header className="pt-20">
        <div className="w-full h-[716px] relative overflow-hidden">
          <img 
            className="w-full h-full object-cover" 
            alt="Clinical Excellence Hero" 
            src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=800"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent opacity-60"></div>
        </div>
      </header>

      {/* Article Body Layout */}
      <main className="max-w-[1440px] mx-auto px-8 md:px-16 py-section-padding grid grid-cols-1 lg:grid-cols-12 gap-16">
        {/* Left Column: Content Canvas */}
        <article className="lg:col-span-8 max-w-[800px] mx-auto lg:mx-0">
          <div className="mb-8">
            <span className="font-label-caps text-xs font-bold text-primary-container uppercase tracking-widest mb-2 block">DERMATOLOGY EDITORIAL</span>
            <h1 className="font-h1 text-4xl md:text-5xl font-bold text-on-surface mb-4">Advanced Protocols in Regenerative Aesthetics: The 2024 Synthesis</h1>
            
            <div className="flex items-center space-x-6 py-4 border-y border-outline-variant/30 mb-8 mt-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-secondary-fixed">
                  <img 
                    className="w-full h-full object-cover" 
                    alt="Dr. Elena Vo" 
                    src="https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&q=80&w=800"
                  />
                </div>
                <div>
                  <p className="font-label-caps text-[12px] font-bold text-on-surface uppercase tracking-wider">Dr. Elena Vo</p>
                  <p className="text-[12px] text-outline font-medium uppercase tracking-widest">Chief of Dermatology</p>
                </div>
              </div>
              <div className="h-8 w-[1px] bg-outline-variant/30"></div>
              <p className="font-label-caps text-[12px] font-bold text-outline uppercase tracking-widest">October 24, 2024</p>
            </div>
          </div>

          {/* Body Content */}
          <div className="space-y-8">
            <p className="font-body-lg text-lg leading-relaxed text-on-surface-variant">
              As we navigate the intersection of high-precision medical technology and the evolving landscape of holistic wellbeing, the field of regenerative aesthetics has moved beyond simple correction. Today, we focus on biological optimization—triggering the body's innate capacity for cellular repair through sophisticated, non-invasive protocols.
            </p>
            
            <h2 className="font-h2 text-3xl font-bold text-primary pt-4">The Shift Towards Biomimetic Skincare</h2>
            
            <p className="font-body-md text-base leading-relaxed text-on-surface-variant">
              Clinical research now indicates that the most sustainable aesthetic results are achieved when we mimic natural biological processes. At TMC Medical, our approach integrates the latest in exosome therapy and molecular bio-hacking to ensure that every treatment works in harmony with your skin's unique structural integrity.
            </p>
            
            <div className="my-8 rounded-xl overflow-hidden bg-surface-container-low p-1 shadow-sm">
              <img 
                className="w-full aspect-video object-cover rounded-lg" 
                alt="Clinical procedure close up" 
                src="https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?auto=format&fit=crop&q=80&w=800"
              />
              <p className="p-4 font-label-caps text-[11px] font-bold text-outline text-center uppercase tracking-widest">Clinical Observation: Fractional Laser Synthesis in Asian Skin Types</p>
            </div>
            
            <h3 className="font-h3 text-2xl font-bold text-primary">Key Innovations for the Modern Professional</h3>
            
            <p className="font-body-md text-base leading-relaxed text-on-surface-variant">
              The modern professional demands efficacy without extended downtime. This has led to the rise of 'Flash Protocols'—highly concentrated treatments that deliver significant regenerative signals in a compressed timeframe. These are not merely 'facials,' but medical interventions designed for long-term health.
            </p>
            
            <ul className="space-y-4 list-none pl-0 border-l-2 border-secondary-fixed pl-8 py-4">
              <li className="font-body-md text-on-surface-variant">
                <strong className="text-primary block mb-1">Cellular Synchronization:</strong> Aligning treatment cycles with the skin's natural circadian rhythm for maximum absorption.
              </li>
              <li className="font-body-md text-on-surface-variant">
                <strong className="text-primary block mb-1">Micro-Invasive Synergy:</strong> Combining RF Microneedling with bespoke serum infusions tailored to DNA profiles.
              </li>
              <li className="font-body-md text-on-surface-variant">
                <strong className="text-primary block mb-1">Post-Treatment Longevity:</strong> Advanced home-care protocols that utilize pharmaceutical-grade bioactive compounds.
              </li>
            </ul>
            
            <p className="font-body-md text-base leading-relaxed text-on-surface-variant italic border-t border-outline-variant/20 pt-8">
              "True beauty is no longer about changing what we see in the mirror, but about honoring the biological masterpiece that already exists." — Dr. Elena Vo
            </p>
          </div>
        </article>

        {/* Right Column: Sidebar (Related Treatments) */}
        <aside className="lg:col-span-4 space-y-8">
          <div className="sticky top-28 space-y-8">
            {/* Related Treatments Section */}
            <section className="bg-surface-container-low rounded-xl p-8 border border-outline-variant/30">
              <h4 className="font-h3 text-[20px] font-bold text-primary mb-8">Recommended Treatments</h4>
              <div className="space-y-8">
                {/* Treatment Card 1 */}
                <div className="group cursor-pointer">
                  <div className="relative overflow-hidden rounded-lg aspect-[4/3] mb-4">
                    <img 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                      alt="Regenerative Therapy" 
                      src="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=800"
                    />
                  </div>
                  <h5 className="font-label-caps text-[14px] font-bold text-on-surface mb-1 uppercase tracking-tight group-hover:text-primary transition-colors">TMC Signature Regeneration</h5>
                  <p className="text-[12px] text-outline line-clamp-2 leading-relaxed">Exosome-powered skin revitalization for instant radiance and long-term repair.</p>
                </div>
                
                {/* Treatment Card 2 */}
                <div className="group cursor-pointer">
                  <div className="relative overflow-hidden rounded-lg aspect-[4/3] mb-4">
                    <img 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                      alt="Precision RF" 
                      src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=800"
                    />
                  </div>
                  <h5 className="font-label-caps text-[14px] font-bold text-on-surface mb-1 uppercase tracking-tight group-hover:text-primary transition-colors">Precision RF Sculpting</h5>
                  <p className="text-[12px] text-outline line-clamp-2 leading-relaxed">Medical-grade radiofrequency for jawline definition and deep tissue tightening.</p>
                </div>
              </div>
              <button className="w-full mt-8 py-4 border border-primary text-primary font-label-caps text-[12px] font-bold uppercase tracking-widest rounded-full hover:bg-primary hover:text-white transition-all duration-300">
                View All Treatments
              </button>
            </section>

            {/* Newsletter / Lead Gen */}
            <section className="bg-primary-container text-white rounded-xl p-8 shadow-lg shadow-primary-container/10">
              <h4 className="font-h3 text-[20px] font-bold mb-4">Expert Insights</h4>
              <p className="text-[14px] opacity-80 mb-8 leading-relaxed">Join our inner circle for monthly clinical reports and early access to aesthetic innovations.</p>
              <div className="space-y-4">
                <input 
                  className="w-full bg-white/10 border-transparent focus:border-white/30 focus:ring-0 text-white placeholder-white/50 rounded-lg py-3 px-4 text-sm outline-none transition-all" 
                  placeholder="Email address" 
                  type="email"
                />
                <button className="w-full py-4 bg-white text-primary-container font-label-caps text-[12px] uppercase tracking-widest rounded-full font-bold hover:opacity-90 transition-opacity">
                  Subscribe
                </button>
              </div>
            </section>
          </div>
        </aside>
      </main>
    </div>
  );
}
