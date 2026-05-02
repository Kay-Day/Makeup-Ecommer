import { useTranslation } from 'react-i18next';

export function ContactUsPage() {
  const { t } = useTranslation();
  return (
    <div className="pb-section-padding px-8 md:px-16 max-w-[1440px] mx-auto mt-12">
      <header className="mb-16 text-center">
        <h1 className="font-h1 text-4xl md:text-5xl font-bold text-primary mb-4">Liên Hệ Với Chúng Tôi</h1>
        <p className="font-body-lg text-lg text-on-surface-variant max-w-2xl mx-auto">
          CÔNG TY TNHH TMC Medical luôn sẵn sàng lắng nghe và hỗ trợ bạn trên hành trình chăm sóc sắc đẹp hoàn mỹ.
        </p>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start mb-20">
        <div className="space-y-12">
          
          <section className="bg-surface-container-low rounded-2xl p-8 border border-outline-variant/30 shadow-sm hover:shadow-md transition-shadow">
            <h2 className="font-label-caps text-sm font-bold text-primary uppercase tracking-widest mb-6 border-b border-outline-variant/30 pb-4">Thông tin liên hệ</h2>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-full">domain</span>
                <div>
                  <p className="font-bold text-on-surface mb-1">Trụ sở chính:</p>
                  <p className="text-on-surface-variant text-sm">72 Bùi Giáng, Phường An Khê, Thành Phố Đà Nẵng</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-full">business</span>
                <div>
                  <p className="font-bold text-on-surface mb-1">Văn phòng:</p>
                  <p className="text-on-surface-variant text-sm">223 Trường Chinh, Phường An Khê, Thành Phố Đà Nẵng</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-full">language</span>
                <p className="text-on-surface-variant font-medium">tmcmedical.vn</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-full">call</span>
                <p className="text-primary font-bold text-lg">0766.669.266</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-full">mail</span>
                <p className="text-on-surface-variant font-medium">tmccarevietnam@gmail.com</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-label-caps text-xs font-bold text-primary uppercase tracking-widest mb-6">Giờ làm việc</h2>
            <div className="bg-white rounded-xl p-6 border border-outline-variant/30 space-y-4 shadow-sm">
              <div className="flex justify-between border-b border-outline-variant/30 pb-3">
                <span className="text-on-surface-variant text-sm font-medium">Thứ 2 – Thứ 6</span>
                <span className="font-semibold text-primary text-sm">08:00 AM – 09:00 PM</span>
              </div>
              <div className="flex justify-between border-b border-outline-variant/30 pb-3">
                <span className="text-on-surface-variant text-sm font-medium">Thứ 7 – Chủ Nhật</span>
                <span className="font-semibold text-primary text-sm">09:00 AM – 10:00 PM</span>
              </div>
            </div>
          </section>
        </div>

        {/* Form liên hệ */}
        <div className="bg-white rounded-2xl p-8 md:p-12 shadow-lg border border-outline-variant/30">
          <h2 className="font-h3 text-2xl font-bold text-primary mb-8 text-center">Gửi tin nhắn cho chúng tôi</h2>
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-on-surface uppercase tracking-widest">Họ và Tên</label>
                <input 
                  className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg py-3 px-4 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all text-sm" 
                  placeholder="Tên của bạn" 
                  type="text"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-on-surface uppercase tracking-widest">Số Điện Thoại</label>
                <input 
                  className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg py-3 px-4 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all text-sm" 
                  placeholder="09xx xxx xxx" 
                  type="tel"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-on-surface uppercase tracking-widest">Email</label>
              <input 
                className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg py-3 px-4 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all text-sm" 
                placeholder="email@example.com" 
                type="email"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-on-surface uppercase tracking-widest">Chủ đề</label>
              <select className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg py-3 px-4 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all text-sm">
                <option>Tư vấn sản phẩm</option>
                <option>Hỗ trợ đơn hàng</option>
                <option>Hợp tác đại lý</option>
                <option>Góp ý dịch vụ</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-on-surface uppercase tracking-widest">Nội dung</label>
              <textarea 
                className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg py-3 px-4 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all text-sm resize-none" 
                placeholder="Bạn cần chúng tôi hỗ trợ gì?" 
                rows={4}
              ></textarea>
            </div>

            <button 
              className="w-full bg-primary text-white font-bold uppercase tracking-widest py-4 rounded-lg hover:bg-emerald-800 transition-all duration-300 shadow-md flex items-center justify-center gap-2 mt-4" 
              type="submit"
            >
              Gửi Yêu Cầu
              <span className="material-symbols-outlined text-sm">send</span>
            </button>
          </form>
        </div>
      </div>

      {/* Bản Đồ */}
      <div className="border-t border-outline-variant/30 pt-16 mt-8">
        <h2 className="font-h2 text-3xl font-bold text-center mb-10 text-on-surface">Hệ Thống Chi Nhánh</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Bản đồ 1: Trụ sở */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-outline-variant/30">
            <h3 className="font-bold text-primary mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined">location_on</span>
              Trụ Sở: 72 Bùi Giáng, Đà Nẵng
            </h3>
            <div className="w-full h-[300px] rounded-xl overflow-hidden bg-surface-container-low">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3833.864197368661!2d108.17510257599026!3d16.072530139352932!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x314219b16ea9844f%3A0xc3afbfaf0486c121!2zNzIgQsWpaSBHacOhbmcsIEhvw6AgQW4sIEPhuqltIEzhu4csIMSQw6AgTuG6tW5nIDU1MDAwMCwgVmlldG5hbQ!5e0!3m2!1sen!2s!4v1715053421111!5m2!1sen!2s" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen={true} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Map Trụ Sở"
              ></iframe>
            </div>
          </div>

          {/* Bản đồ 2: Văn phòng */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-outline-variant/30">
            <h3 className="font-bold text-primary mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined">business</span>
              Văn Phòng: 223 Trường Chinh, Đà Nẵng
            </h3>
            <div className="w-full h-[300px] rounded-xl overflow-hidden bg-surface-container-low">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3834.020164287319!2d108.18128367598993!3d16.064434239566937!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31421908cd536e2f%3A0xc66c109c122045cc!2zMjIzIFRyxrDhu51uZyBDaGluaCwgQW4gS2jDqiwgVGhhbmggS2jDqiwgxJDDoCBO4bq1bmcgNTUwMDAwLCBWaWV0bmFt!5e0!3m2!1sen!2s!4v1715053460453!5m2!1sen!2s" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen={true} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Map Văn Phòng"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
