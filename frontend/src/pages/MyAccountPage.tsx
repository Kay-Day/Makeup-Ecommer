import { Link } from 'react-router-dom';

export function MyAccountPage() {
  return (
    <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row min-h-[calc(100vh-80px)] mt-20">
      {/* SideNavBar */}
      <aside className="md:w-64 bg-stone-50 border-r border-stone-200 flex flex-col h-full py-6">
        <div className="px-6 mb-10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full overflow-hidden border border-secondary-fixed">
            <img 
              alt="TMC Admin" 
              className="w-full h-full object-cover" 
              src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=800"
            />
          </div>
          <div>
            <h3 className="font-manrope text-sm font-black text-emerald-900">TMC Admin</h3>
            <p className="font-manrope text-[10px] uppercase tracking-widest text-stone-500">Medical Portal</p>
          </div>
        </div>

        <nav className="flex flex-col flex-grow px-4">
          <Link to="/account" className="flex items-center gap-3 px-4 py-3 bg-emerald-900 text-white rounded-lg my-1 font-manrope text-sm font-semibold transition-all">
            <span className="material-symbols-outlined">person</span>
            Profile
          </Link>
          <Link className="flex items-center gap-3 px-4 py-3 text-stone-600 hover:bg-stone-100 rounded-lg my-1 font-manrope text-sm font-semibold transition-all scale-95 active:scale-100" to="/account">
            <span className="material-symbols-outlined">history</span>
            Order History
          </Link>
          <Link className="flex items-center gap-3 px-4 py-3 text-stone-600 hover:bg-stone-100 rounded-lg my-1 font-manrope text-sm font-semibold transition-all scale-95 active:scale-100" to="/account">
            <span className="material-symbols-outlined">face_6</span>
            My Skin Profile
          </Link>
          <Link className="flex items-center gap-3 px-4 py-3 text-stone-600 hover:bg-stone-100 rounded-lg my-1 font-manrope text-sm font-semibold transition-all scale-95 active:scale-100" to="/account">
            <span className="material-symbols-outlined">location_on</span>
            Addresses
          </Link>

          <div className="mt-auto pt-10">
            <Link className="flex items-center gap-3 px-4 py-3 text-stone-600 hover:bg-stone-100 rounded-lg my-1 font-manrope text-sm font-semibold transition-all" to="/account">
              <span className="material-symbols-outlined">settings</span>
              Settings
            </Link>
            <Link className="flex items-center gap-3 px-4 py-3 text-error hover:bg-error-container/20 rounded-lg my-1 font-manrope text-sm font-semibold transition-all" to="/login">
              <span className="material-symbols-outlined">logout</span>
              Logout
            </Link>
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <section className="flex-grow bg-white px-8 md:px-16 py-12 md:py-20 overflow-y-auto">
        <div className="max-w-4xl">
          <header className="mb-12">
            <h1 className="font-h1 text-4xl md:text-5xl font-bold text-primary mb-2">My Account</h1>
            <p className="font-body-lg text-lg text-stone-500">Manage your personal details and clinical skin assessment.</p>
          </header>

          {/* Personal Details Bento Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="md:col-span-2 bg-surface-container-low/30 border border-secondary-fixed p-8 rounded-xl shadow-[0_4px_30px_rgba(79,95,63,0.02)]">
              <h2 className="font-h3 text-2xl font-bold text-primary mb-8">Personal Details</h2>
              <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="font-label-caps text-xs font-bold uppercase tracking-widest text-stone-500">FULL NAME</label>
                    <input className="w-full bg-transparent border-b border-stone-200 py-2 focus:border-primary-container outline-none font-body-md text-on-surface transition-colors" type="text" defaultValue="Sophia Nguyen"/>
                  </div>
                  <div className="space-y-2">
                    <label className="font-label-caps text-xs font-bold uppercase tracking-widest text-stone-500">EMAIL ADDRESS</label>
                    <input className="w-full bg-transparent border-b border-stone-200 py-2 focus:border-primary-container outline-none font-body-md text-on-surface transition-colors" type="email" defaultValue="sophia.nguyen@example.com"/>
                  </div>
                  <div className="space-y-2">
                    <label className="font-label-caps text-xs font-bold uppercase tracking-widest text-stone-500">PHONE NUMBER</label>
                    <input className="w-full bg-transparent border-b border-stone-200 py-2 focus:border-primary-container outline-none font-body-md text-on-surface transition-colors" type="tel" defaultValue="+84 901 234 567"/>
                  </div>
                  <div className="space-y-2">
                    <label className="font-label-caps text-xs font-bold uppercase tracking-widest text-stone-500">DATE OF BIRTH</label>
                    <input className="w-full bg-transparent border-b border-stone-200 py-2 focus:border-primary-container outline-none font-body-md text-on-surface transition-colors" type="text" defaultValue="March 12, 1992"/>
                  </div>
                </div>
                <div className="pt-4">
                  <button className="bg-primary-container text-white px-8 py-3 rounded-full font-manrope font-bold text-sm hover:opacity-90 transition-opacity">
                    Update Profile
                  </button>
                </div>
              </form>
            </div>

            {/* Side Summary Card */}
            <div className="bg-primary text-white p-8 rounded-xl flex flex-col justify-between">
              <div>
                <h3 className="font-h3 text-2xl font-bold mb-4">Membership</h3>
                <div className="bg-primary-fixed/20 rounded-lg p-4 mb-6">
                  <p className="font-label-caps text-[10px] font-bold uppercase tracking-widest text-primary-fixed mb-1">CURRENT TIER</p>
                  <p className="font-h3 text-xl font-bold text-primary-fixed">Jade Elite</p>
                </div>
                <p className="font-body-md opacity-80 mb-6">You are 250 points away from Emerald Status and complimentary laser treatments.</p>
              </div>
              <button className="w-full border border-primary-fixed/30 py-3 rounded-full font-manrope font-bold text-sm hover:bg-white/5 transition-all">
                View Benefits
              </button>
            </div>
          </div>

          {/* Skin Profile Summary */}
          <div className="space-y-8">
            <div className="flex justify-between items-end">
              <h2 className="font-h2 text-3xl font-bold text-primary">Skin Profile</h2>
              <Link className="text-primary font-bold text-sm flex items-center gap-2 hover:underline" to="/account">
                Full Assessment <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Characteristic Card */}
              <div className="bg-white border border-secondary-fixed p-6 rounded-xl text-center shadow-[0_30px_50px_rgba(79,95,63,0.03)] hover:-translate-y-1 transition-transform">
                <span className="material-symbols-outlined text-primary text-3xl mb-4">opacity</span>
                <p className="font-label-caps text-xs font-bold uppercase tracking-widest text-stone-500 mb-1">TYPE</p>
                <p className="font-h3 text-xl font-bold text-on-surface">Combination</p>
              </div>
              {/* Characteristic Card */}
              <div className="bg-white border border-secondary-fixed p-6 rounded-xl text-center shadow-[0_30px_50px_rgba(79,95,63,0.03)] hover:-translate-y-1 transition-transform">
                <span className="material-symbols-outlined text-primary text-3xl mb-4">flare</span>
                <p className="font-label-caps text-xs font-bold uppercase tracking-widest text-stone-500 mb-1">SENSITIVITY</p>
                <p className="font-h3 text-xl font-bold text-on-surface">Moderate</p>
              </div>
              {/* Characteristic Card */}
              <div className="bg-white border border-secondary-fixed p-6 rounded-xl text-center shadow-[0_30px_50px_rgba(79,95,63,0.03)] hover:-translate-y-1 transition-transform">
                <span className="material-symbols-outlined text-primary text-3xl mb-4">spa</span>
                <p className="font-label-caps text-xs font-bold uppercase tracking-widest text-stone-500 mb-1">CONCERN</p>
                <p className="font-h3 text-xl font-bold text-on-surface">Hydration</p>
              </div>
              {/* Characteristic Card */}
              <div className="bg-white border border-secondary-fixed p-6 rounded-xl text-center shadow-[0_30px_50px_rgba(79,95,63,0.03)] hover:-translate-y-1 transition-transform">
                <span className="material-symbols-outlined text-primary text-3xl mb-4">calendar_month</span>
                <p className="font-label-caps text-xs font-bold uppercase tracking-widest text-stone-500 mb-1">NEXT VISIT</p>
                <p className="font-h3 text-xl font-bold text-on-surface">Oct 24</p>
              </div>
            </div>

            {/* Clinical Image Showcase (Clinical Carousel style) */}
            <div className="bg-surface-container-low border border-secondary-fixed rounded-2xl p-10 overflow-hidden relative">
              <div className="flex flex-col md:flex-row gap-12 items-center">
                <div className="md:w-1/2 rounded-xl overflow-hidden shadow-2xl">
                  <img 
                    className="w-full h-full object-cover" 
                    alt="Clinical Scanning Equipment" 
                    src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=800"
                  />
                </div>
                <div className="md:w-1/2 space-y-6">
                  <span className="bg-secondary-fixed text-on-secondary-container px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase">Latest Scan</span>
                  <h3 className="font-h2 text-3xl font-bold text-primary">VISIA Analysis Result</h3>
                  <p className="font-body-lg text-lg text-stone-600">Your recent collagen density scan shows a 12% improvement following the series of Thermage FLX sessions. Your skin barrier resilience is currently at peak levels.</p>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3 text-primary-container font-semibold">
                      <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span> 
                      Collagen Production: +12%
                    </li>
                    <li className="flex items-center gap-3 text-primary-container font-semibold">
                      <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span> 
                      Pigmentation: -8%
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
