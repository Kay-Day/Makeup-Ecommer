import { Link } from 'react-router-dom';

export function AdminOverviewPage() {
  return (
    <div className="flex min-h-screen bg-background">
      {/* SideNavBar */}
      <aside className="h-screen w-64 border-r border-stone-200 bg-stone-50 flex flex-col py-6 fixed left-0 top-0 z-40">
        <div className="px-6 mb-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-container rounded-xl flex items-center justify-center">
            <span className="material-symbols-outlined text-white">medical_services</span>
          </div>
          <div>
            <h1 className="text-lg font-black text-emerald-900 leading-tight">TMC Admin</h1>
            <p className="font-manrope text-xs leading-relaxed text-stone-500">Medical Portal</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {/* Dashboard Active */}
          <Link className="bg-emerald-900 text-white rounded-lg mx-2 my-1 px-4 py-3 flex items-center gap-3 font-manrope text-sm font-semibold scale-95 active:scale-100 transition-all" to="/admin">
            <span className="material-symbols-outlined text-sm">dashboard</span>
            <span>Dashboard</span>
          </Link>
          <Link className="text-stone-600 hover:bg-stone-100 rounded-lg mx-2 my-1 px-4 py-3 flex items-center gap-3 font-manrope text-sm font-semibold transition-all" to="/admin">
            <span className="material-symbols-outlined text-sm">calendar_today</span>
            <span>Appointments</span>
          </Link>
          <Link className="text-stone-600 hover:bg-stone-100 rounded-lg mx-2 my-1 px-4 py-3 flex items-center gap-3 font-manrope text-sm font-semibold transition-all" to="/admin">
            <span className="material-symbols-outlined text-sm">group</span>
            <span>Patients</span>
          </Link>
          <Link className="text-stone-600 hover:bg-stone-100 rounded-lg mx-2 my-1 px-4 py-3 flex items-center gap-3 font-manrope text-sm font-semibold transition-all" to="/admin">
            <span className="material-symbols-outlined text-sm">inventory_2</span>
            <span>Inventory</span>
          </Link>
          <Link className="text-stone-600 hover:bg-stone-100 rounded-lg mx-2 my-1 px-4 py-3 flex items-center gap-3 font-manrope text-sm font-semibold transition-all" to="/admin">
            <span className="material-symbols-outlined text-sm">payments</span>
            <span>Sales</span>
          </Link>
          <Link className="text-stone-600 hover:bg-stone-100 rounded-lg mx-2 my-1 px-4 py-3 flex items-center gap-3 font-manrope text-sm font-semibold transition-all" to="/admin">
            <span className="material-symbols-outlined text-sm">settings</span>
            <span>Settings</span>
          </Link>
        </nav>

        <div className="px-4 mt-auto">
          <div className="p-4 bg-white border border-stone-200 rounded-xl flex items-center gap-3 shadow-sm">
            <img 
              alt="Dr. Nguyen Lan" 
              className="w-10 h-10 rounded-full object-cover" 
              src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=800"
            />
            <div className="overflow-hidden">
              <p className="font-manrope text-sm font-bold text-emerald-900 truncate">Dr. Nguyen Lan</p>
              <p className="font-manrope text-xs text-stone-500 truncate">Medical Director</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Canvas */}
      <main className="flex-1 ml-64 min-h-screen flex flex-col">
        {/* TopAppBar */}
        <header className="h-20 px-8 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-30 border-b border-stone-100">
          <div className="flex-1 max-w-md">
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">search</span>
              <input className="w-full bg-stone-50 border-none rounded-full py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary-container/20 placeholder:text-stone-400 font-manrope outline-none transition-all" placeholder="Search patients, results, orders..." type="text"/>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <button className="relative text-stone-600 hover:text-emerald-900 transition-colors">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-0 right-0 w-2 h-2 bg-error rounded-full border-2 border-white"></span>
            </button>
            <button className="text-stone-600 hover:text-emerald-900 transition-colors">
              <span className="material-symbols-outlined">help</span>
            </button>
            <div className="h-8 w-[1px] bg-stone-200"></div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs font-bold font-label-caps text-stone-400 uppercase tracking-widest">STATUS</p>
                <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">CLINIC OPEN</p>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-8 max-w-[1440px] mx-auto w-full">
          {/* KPI Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-[0_4px_30px_rgba(79,95,63,0.03)] group hover:border-emerald-100 transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-900">
                  <span className="material-symbols-outlined">monetization_on</span>
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">+12.5%</span>
              </div>
              <p className="text-stone-500 font-label-caps mb-1 text-xs font-bold uppercase tracking-wider">Total Sales</p>
              <h2 className="font-h2 text-3xl font-bold text-primary">₫1.240.000</h2>
            </div>
            
            <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-[0_4px_30px_rgba(79,95,63,0.03)] group hover:border-emerald-100 transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-900">
                  <span className="material-symbols-outlined">person_add</span>
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">+8.2%</span>
              </div>
              <p className="text-stone-500 font-label-caps mb-1 text-xs font-bold uppercase tracking-wider">Active Patients</p>
              <h2 className="font-h2 text-3xl font-bold text-primary">2,842</h2>
            </div>
            
            <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-[0_4px_30px_rgba(79,95,63,0.03)] group hover:border-emerald-100 transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-900">
                  <span className="material-symbols-outlined">shopping_basket</span>
                </div>
                <span className="text-xs font-bold text-stone-400 bg-stone-50 px-2 py-1 rounded-full">-2.4%</span>
              </div>
              <p className="text-stone-500 font-label-caps mb-1 text-xs font-bold uppercase tracking-wider">Total Orders</p>
              <h2 className="font-h2 text-3xl font-bold text-primary">458</h2>
            </div>
          </div>

          {/* Charts Area (Bento Grid Style) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
            <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-stone-100 shadow-[0_4px_30px_rgba(79,95,63,0.03)]">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="font-h3 text-xl font-bold text-primary">Revenue Growth</h3>
                  <p className="text-stone-500 font-body-md">Monthly performance analytics</p>
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-2 text-xs font-bold bg-stone-50 text-stone-600 rounded-lg hover:bg-stone-100 transition-colors">Month</button>
                  <button className="px-4 py-2 text-xs font-bold bg-primary-container text-white rounded-lg transition-colors">Year</button>
                </div>
              </div>
              <div className="relative h-64 w-full bg-stone-50 rounded-xl overflow-hidden flex items-end px-4 gap-2">
                {/* Simulated Chart Bars */}
                <div className="flex-1 bg-primary-container/10 rounded-t-lg transition-all hover:bg-primary-container/30 h-[40%]"></div>
                <div className="flex-1 bg-primary-container/10 rounded-t-lg transition-all hover:bg-primary-container/30 h-[55%]"></div>
                <div className="flex-1 bg-primary-container/10 rounded-t-lg transition-all hover:bg-primary-container/30 h-[45%]"></div>
                <div className="flex-1 bg-primary-container/10 rounded-t-lg transition-all hover:bg-primary-container/30 h-[70%]"></div>
                <div className="flex-1 bg-primary-container/10 rounded-t-lg transition-all hover:bg-primary-container/30 h-[85%]"></div>
                <div className="flex-1 bg-primary-container rounded-t-lg transition-all h-[95%]"></div>
                <div className="flex-1 bg-primary-container/10 rounded-t-lg transition-all hover:bg-primary-container/30 h-[60%]"></div>
                <div className="flex-1 bg-primary-container/10 rounded-t-lg transition-all hover:bg-primary-container/30 h-[75%]"></div>
                <div className="flex-1 bg-primary-container/10 rounded-t-lg transition-all hover:bg-primary-container/30 h-[50%]"></div>
                <div className="flex-1 bg-primary-container/10 rounded-t-lg transition-all hover:bg-primary-container/30 h-[65%]"></div>
                <div className="flex-1 bg-primary-container/10 rounded-t-lg transition-all hover:bg-primary-container/30 h-[80%]"></div>
                <div className="flex-1 bg-primary-container/10 rounded-t-lg transition-all hover:bg-primary-container/30 h-[90%]"></div>
              </div>
              <div className="flex justify-between mt-4 px-4 text-[10px] font-bold text-stone-400 font-label-caps">
                <span>JAN</span><span>FEB</span><span>MAR</span><span>APR</span><span>MAY</span><span>JUN</span><span>JUL</span><span>AUG</span><span>SEP</span><span>OCT</span><span>NOV</span><span>DEC</span>
              </div>
            </div>

            <div className="bg-primary-container p-8 rounded-2xl shadow-xl flex flex-col justify-between text-white">
              <div>
                <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-[10px] font-bold tracking-widest uppercase mb-4">Premium Insights</span>
                <h3 className="font-h3 text-2xl font-bold text-white mb-2 leading-tight">Patient Retention is up 14% this quarter.</h3>
                <p className="font-body-md text-white/70">Your most booked treatment remains the <span className="text-white font-semibold">TMC Signature Laser Facial</span>.</p>
              </div>
              <div className="mt-8">
                <button className="w-full py-4 bg-white text-primary rounded-xl font-bold font-manrope text-sm flex items-center justify-center gap-2 hover:bg-emerald-50 transition-colors">
                  Download Report
                  <span className="material-symbols-outlined text-sm">download</span>
                </button>
              </div>
            </div>
          </div>

          {/* Recent Orders Table */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-[0_4px_30px_rgba(79,95,63,0.03)] overflow-hidden">
            <div className="p-8 flex justify-between items-center border-b border-stone-50">
              <div>
                <h3 className="font-h3 text-xl font-bold text-primary">Recent Orders</h3>
                <p className="text-stone-500 font-body-md">Latest transactions and prescription fills</p>
              </div>
              <button className="text-primary font-bold text-sm hover:underline">View All Orders</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-stone-50">
                  <tr>
                    <th className="px-8 py-4 font-label-caps text-stone-400 text-xs font-bold uppercase tracking-wider">Patient</th>
                    <th className="px-8 py-4 font-label-caps text-stone-400 text-xs font-bold uppercase tracking-wider">Treatment/Product</th>
                    <th className="px-8 py-4 font-label-caps text-stone-400 text-xs font-bold uppercase tracking-wider">Date</th>
                    <th className="px-8 py-4 font-label-caps text-stone-400 text-xs font-bold uppercase tracking-wider">Amount</th>
                    <th className="px-8 py-4 font-label-caps text-stone-400 text-xs font-bold uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50">
                  <tr className="hover:bg-stone-50/50 transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed text-xs font-bold">LM</div>
                        <span className="font-semibold text-sm text-stone-800">Le Minh</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-sm text-stone-600">Dermal Fillers - Session A</td>
                    <td className="px-8 py-5 text-sm text-stone-600">Oct 24, 2024</td>
                    <td className="px-8 py-5 text-sm font-bold text-stone-800">₫4.500.000</td>
                    <td className="px-8 py-5">
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full uppercase tracking-wider">Completed</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-stone-50/50 transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center text-stone-600 text-xs font-bold">TV</div>
                        <span className="font-semibold text-sm text-stone-800">Tran Van</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-sm text-stone-600">TMC Cleansing Gel (200ml)</td>
                    <td className="px-8 py-5 text-sm text-stone-600">Oct 24, 2024</td>
                    <td className="px-8 py-5 text-sm font-bold text-stone-800">₫850.000</td>
                    <td className="px-8 py-5">
                      <span className="px-3 py-1 bg-stone-100 text-stone-500 text-[10px] font-bold rounded-full uppercase tracking-wider">Shipped</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-stone-50/50 transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed text-xs font-bold">NH</div>
                        <span className="font-semibold text-sm text-stone-800">Nguyen Hoang</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-sm text-stone-600">HydraFacial Consultation</td>
                    <td className="px-8 py-5 text-sm text-stone-600">Oct 23, 2024</td>
                    <td className="px-8 py-5 text-sm font-bold text-stone-800">₫1.200.000</td>
                    <td className="px-8 py-5">
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full uppercase tracking-wider">Completed</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-stone-50/50 transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-secondary-fixed-dim flex items-center justify-center text-on-secondary-fixed-variant text-xs font-bold">PA</div>
                        <span className="font-semibold text-sm text-stone-800">Pham Anh</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-sm text-stone-600">Post-Op Recovery Kit</td>
                    <td className="px-8 py-5 text-sm text-stone-600">Oct 23, 2024</td>
                    <td className="px-8 py-5 text-sm font-bold text-stone-800">₫3.100.000</td>
                    <td className="px-8 py-5">
                      <span className="px-3 py-1 bg-amber-50 text-amber-700 text-[10px] font-bold rounded-full uppercase tracking-wider">Processing</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-auto w-full py-12 px-8 bg-stone-50 border-t border-stone-200">
          <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="md:col-span-2">
              <h4 className="font-bold text-emerald-900 mb-4">TMC Medical Vietnam</h4>
              <p className="font-manrope text-xs leading-relaxed text-stone-500 max-w-sm">Premium dermatological care and medical aesthetics. Providing a tranquil healing environment through minimalist design and clinical excellence.</p>
            </div>
            <div>
              <h4 className="font-bold text-emerald-900 mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link className="font-manrope text-xs text-stone-500 hover:underline transition-all" to="/faq">Medical Disclaimer</Link></li>
                <li><Link className="font-manrope text-xs text-stone-500 hover:underline transition-all" to="/faq">Privacy Policy</Link></li>
                <li><Link className="font-manrope text-xs text-stone-500 hover:underline transition-all" to="/faq">Support Portal</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-emerald-900 mb-4">System</h4>
              <p className="font-manrope text-xs text-stone-500">Version 2.4.0-Stable</p>
              <p className="font-manrope text-xs text-stone-500">© 2024 TMC Medical Vietnam. All Rights Reserved.</p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
