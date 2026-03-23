/* eslint-disable no-unused-vars */
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ImageIcon, ShieldCheck, Truck, Ruler, BadgeCheck, Sparkles } from "lucide-react";
import { FadeUp, Stagger, item } from "../components/motion/MotionWrappers.jsx";

const ACCENT = "#FF633F"; // Cam nghệ thuật hoặc giữ MAGENTA/CYAN tùy bạn chọn
const TEXT_DARK = "#050505";
const TEXT_MUTED = "#888888";

// ─── Gallery Value Card (Bỏ border-l, dùng Grid dứt khoát) ──────────────────
function ValueCard({ icon: Icon, title, text, index }) {
  return (
    <motion.div 
      variants={item}
      className="group relative border-b border-r border-slate-100 p-10 transition-all duration-700 hover:bg-black"
    >
      <div className="mb-12 flex items-center justify-between">
        <span className="font-mono text-[10px] font-black tracking-[0.4em] text-slate-300 group-hover:text-[#FF633F]">
          ID / 0{index + 1}
        </span>
        <Icon className="h-5 w-5 text-slate-400 group-hover:text-white transition-colors" strokeWidth={1.5} />
      </div>
      <h3 className="text-xl font-black uppercase tracking-tighter text-slate-900 group-hover:text-white">
        {title}
      </h3>
      <p className="mt-4 text-[13px] leading-relaxed tracking-wide text-slate-500 group-hover:text-slate-400">
        {text}
      </p>
    </motion.div>
  );
}

// ─── Archive FAQ (Phong cách hồ sơ lưu trữ) ───────────────────────────────
function FAQ({ q, a }) {
  return (
    <motion.div variants={item} className="group grid grid-cols-1 gap-4 border-b border-slate-100 py-10 lg:grid-cols-12">
      <p className="col-span-5 text-sm font-black uppercase tracking-widest text-slate-900">
        <span className="mr-4 text-slate-300">Q.</span>{q}
      </p>
      <p className="col-span-7 text-[13px] leading-relaxed text-slate-500 lg:pl-10">
        {a}
      </p>
    </motion.div>
  );
}

export default function About() {
  const values = [
    { icon: ImageIcon, title: "Museum Quality", text: "Sử dụng mực in pigment 12 màu cho dải phổ màu rộng nhất và độ bền lên đến 100 năm." },
    { icon: ShieldCheck, title: "Precision Frame", text: "Khung gỗ nhập khẩu được cắt ghép bằng máy thủy lực, đảm bảo khít tuyệt đối tại các góc nối." },
    { icon: Truck, title: "Secure Logistics", text: "Quy trình đóng gói 5 lớp với màng co, xốp góc và thùng carton chịu lực cao." },
    { icon: Ruler, title: "Bespoke Size", text: "Tự do tùy chỉnh kích thước đến từng milimet, phá bỏ mọi giới hạn của khung hình tiêu chuẩn." },
    { icon: BadgeCheck, title: "QC Protocol", text: "Mỗi tác phẩm trải qua 3 bước kiểm định: Bề mặt in, Độ trong kính và Độ hoàn thiện khung." },
    { icon: Sparkles, title: "Art Curation", text: "Hỗ trợ tư vấn sắp xếp gallery wall phù hợp với kiến trúc và ánh sáng không gian của bạn." },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-950 selection:bg-black selection:text-white">
      
      {/* ── Section 1: Hero (Typography Focus) ─────────────────────────── */}
      <section className="relative flex min-h-screen flex-col justify-center px-6 py-20 md:px-12">
        <div className="absolute top-12 left-6 md:left-12 font-mono text-[10px] font-black uppercase tracking-[0.5em] text-slate-300">
          Philosophy / 2026
        </div>
        
        <div className="max-w-[1200px]">
          <motion.h1 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-7xl font-black uppercase leading-[0.85] tracking-[-0.06em] md:text-[14vw]"
          >
            Thiết kế <br />
            <span className="text-slate-200 transition-colors hover:text-black">Bản in</span><br />
            <span style={{ color: ACCENT }}>Nghệ thuật.</span>
          </motion.h1>
          
          <div className="mt-16 grid grid-cols-1 gap-12 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-[#FF633F]">
                [ Established in Vietnam ]
              </p>
            </div>
            <div className="lg:col-span-8">
              <p className="text-xl font-medium leading-tight tracking-tight text-slate-600 md:text-3xl">
                Chúng tôi không chỉ sản xuất khung tranh. Chúng tôi xây dựng một cầu nối vật lý cho những giá trị tinh thần trong kỷ nguyên số, biến dữ liệu thành di sản.
              </p>
              <div className="mt-12 flex gap-8">
                <Link to="/products" className="group flex items-center gap-4 text-xs font-black uppercase tracking-[0.3em]">
                  Explore Archive <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-2" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 2: Image & Grid (Asymmetric) ──────────────────────── */}
      <section className="border-t border-slate-950 bg-black py-32 text-white">
        <div className="mx-auto max-w-[1400px] px-6 md:px-12">
          <div className="grid grid-cols-1 gap-20 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <div className="sticky top-24">
                <h2 className="text-5xl font-black uppercase tracking-tighter md:text-7xl">
                  The <br /> Process.
                </h2>
                <div className="mt-12 space-y-8 font-mono text-[11px] uppercase tracking-widest text-slate-500">
                  <p className="leading-relaxed">
                    Mỗi tác phẩm đi qua một lộ trình nghiêm ngặt từ trích xuất dữ liệu, hiệu chỉnh màu sắc Lab-D65 đến khi được đóng dấu chứng nhận tại Studio.
                  </p>
                  <div className="h-px w-full bg-slate-800" />
                  <div className="flex justify-between">
                    <span>Precision Rate</span>
                    <span className="text-white">99.8%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Handcrafted in</span>
                    <span className="text-white">Saigon / VN</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:col-span-7">
              <div className="aspect-[4/5] overflow-hidden grayscale hover:grayscale-0 transition-all duration-1000">
                <img src="./about/13.avif" alt="Process" className="h-full w-full object-cover scale-110 hover:scale-100 transition-transform duration-1000" />
              </div>
              <div className="mt-12 grid grid-cols-2 gap-12">
                <div className="aspect-square border border-slate-800 p-8 flex flex-col justify-between italic">
                   <span className="text-4xl">"</span>
                   <p className="text-lg">Nghệ thuật là sự kéo dài của khoảnh khắc vào không gian vĩnh cửu.</p>
                </div>
                <img src="./about/1.avif" alt="Detail" className="aspect-square object-cover opacity-50" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 3: Values (The Grid) ─────────────────────────────── */}
      <section className="bg-white py-0">
        <div className="grid grid-cols-1 border-t border-slate-100 md:grid-cols-2 lg:grid-cols-3">
          {values.map((v, i) => <ValueCard key={v.title} {...v} index={i} />)}
        </div>
      </section>

      {/* ── Section 4: FAQ (Minimalist Table) ─────────────────────────── */}
      <section className="px-6 py-40 md:px-12">
        <div className="mx-auto max-w-5xl">
          <div className="mb-24 text-center">
            <span className="font-mono text-[10px] font-black uppercase tracking-[0.5em] text-slate-300">Inquiry / Support</span>
            <h2 className="mt-4 text-4xl font-black uppercase tracking-tighter">Câu hỏi thường gặp.</h2>
          </div>
          <Stagger>
            {[
              { q: "Thời gian hoàn thiện?", a: "Mọi đơn hàng được xử lý và xuất xưởng trong vòng 3-5 ngày làm việc để đảm bảo các lớp keo và mực đạt độ ổn định tối đa." },
              { q: "Chính sách bảo hành?", a: "Bảo hành 2 năm cho khung và 10 năm cho màu sắc in ấn trong điều kiện trưng bày trong nhà." },
              { q: "Giao hàng quốc tế?", a: "Chúng tôi hợp tác với DHL/FedEx để vận chuyển tác phẩm đi toàn cầu với mã tracking riêng biệt." },
              { q: "Kích thước tối đa?", a: "Chúng tôi có thể thực hiện các bản in khổ lớn lên đến 150cm x 300cm tùy theo chất liệu khung." }
            ].map(f => <FAQ key={f.q} {...f} />)}
          </Stagger>
        </div>
      </section>

      {/* ── Section 5: CTA (Brutalism Style) ──────────────────────────── */}
      <section className="bg-[#FF633F] py-24 text-white">
        <Link to="/products" className="group block text-center">
          <h2 className="text-5xl font-black uppercase tracking-tighter md:text-[10vw] transition-all group-hover:italic">
            Bắt đầu bản in
          </h2>
          <div className="mt-8 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-white transition-all group-hover:scale-125 group-hover:bg-white group-hover:text-[#FF633F]">
              <ArrowRight className="h-6 w-6" />
            </div>
          </div>
        </Link>
      </section>
    </div>
  );
}
