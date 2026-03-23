// ─────────────────────────────────────────────────────────────────────────────
// TRANG QUY TRÌNH & VẬN CHUYỂN — Phong cách "Museum Archive & Editorial"
// ─────────────────────────────────────────────────────────────────────────────

import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Ruler,
  Image as ImageIcon,
  Clock,
  CreditCard,
  BadgeCheck,
  ShieldCheck,
  Truck,
  MapPin,
  Box,
} from "lucide-react";
import { FadeUp, Stagger, item } from "../components/motion/MotionWrappers.jsx";

const CYAN = "#00ffff";
const MAGENTA = "#ff00ff";
const TEXT_DARK = "#1a1a1a";

// ─── Step Card (Thiết kế dạng Thẻ Lưu Trữ) ───────────────────────────────────
function StepCard({ icon: Icon, title, text, number }) {
  return (
    <motion.div
      variants={item}
      className="group relative border-b border-r border-slate-100 p-12 transition-all duration-700 hover:bg-slate-50"
    >
      <div className="mb-12 flex items-center justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 transition-all duration-500 group-hover:border-cyan-400 group-hover:bg-cyan-50">
          <Icon className="h-5 w-5" style={{ color: TEXT_DARK }} />
        </div>
        <span className="font-mono text-[10px] font-black tracking-[0.3em] text-slate-300 group-hover:text-cyan-400">
          PHASE_0{number}
        </span>
      </div>
      <h3 className="text-2xl font-black uppercase tracking-tighter transition-all duration-500 group-hover:translate-x-2" style={{ color: TEXT_DARK }}>
        {title}
      </h3>
      <p className="mt-6 text-sm leading-relaxed tracking-tight text-slate-500 max-w-[240px]">
        {text}
      </p>
      {/* Accent Line */}
      <div className="absolute bottom-0 left-0 h-[3px] w-0 bg-cyan-400 transition-all duration-700 group-hover:w-full" />
    </motion.div>
  );
}

// ─── Section Header (Đồng bộ trang chủ) ─────────────────────────────────────
function SectionHeader({ tag, title, sub, strokeTitle }) {
  return (
    <FadeUp>
      <div className="mb-24">
        <div className="flex items-center gap-6 mb-8">
          <div className="h-px w-12 bg-magenta-500" style={{ backgroundColor: MAGENTA }} />
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.5em]" style={{ color: MAGENTA }}>{tag}</p>
        </div>
        <h2 className="text-6xl font-black uppercase leading-none tracking-tighter md:text-8xl lg:text-9xl">
          {title} <br />
          <span 
            className="italic"
            style={{ 
              WebkitTextStroke: `1.5px ${TEXT_DARK}`, 
              color: 'transparent' 
            }}
          >
            {strokeTitle}
          </span>
        </h2>
        {sub && <p className="mt-10 max-w-xl text-lg font-light leading-relaxed text-slate-400">{sub}</p>}
      </div>
    </FadeUp>
  );
}

export default function Delivery() {
  const orderSteps = [
    { icon: ImageIcon, title: "Tải Lên Tác Phẩm", text: "Hệ thống AI tự động kiểm tra mật độ điểm ảnh để đảm bảo độ sắc nét bảo tàng." },
    { icon: Ruler, title: "Tùy Chỉnh Kích Thước", text: "Lựa chọn tỉ lệ vàng và chất liệu Canvas hoặc Giấy mỹ thuật Acid-free." },
    { icon: CreditCard, title: "Thanh Toán An Toàn", text: "Mã hóa 256-bit bảo mật tuyệt đối thông tin giao dịch của khách hàng." },
    { icon: BadgeCheck, title: "Kiểm Định & Đóng Gói", text: "Mỗi bản in được nghệ nhân ký tên và đóng dấu niêm phong lưu trữ." },
  ];

  return (
    <div className="min-h-screen bg-white font-sans antialiased selection:bg-cyan-100">
      
      {/* ── Hero Section (Phong cách Poster triển lãm) ───────────────── */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#FBFBFB] px-6">
        {/* Decorative Grid Background */}
        <div className="absolute inset-0 z-0 opacity-[0.03]" 
             style={{ backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`, size: '50px 50px', backgroundSize: '60px 60px' }} />
        
        <div className="relative z-10 mx-auto max-w-7xl w-full">
          <div className="grid lg:grid-cols-12 gap-12">
            <div className="lg:col-span-8">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-8 flex items-center gap-4">
                 <span className="h-[2px] w-8 bg-black" />
                 <span className="font-mono text-[11px] font-bold uppercase tracking-[0.4em]">Logistics Protocol v.25</span>
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="text-7xl font-black uppercase leading-[0.85] tracking-[-0.05em] sm:text-9xl md:text-[10rem] lg:text-[12rem]"
              >
                Vận chuyển <br />
                <span style={{ WebkitTextStroke: `2px ${MAGENTA}`, color: 'transparent' }}>Nghệ thuật</span>
              </motion.h1>
            </div>

            <div className="lg:col-span-4 flex flex-col justify-end pb-12">
               <motion.p 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                className="text-sm font-medium leading-relaxed text-slate-500 border-l-2 border-slate-900 pl-6 italic"
               >
                 Chúng tôi không chỉ gửi một gói hàng. Chúng tôi chuyển giao một di sản tinh thần với sự cẩn trọng tuyệt đối của một quản thủ bảo tàng.
               </motion.p>
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="mt-10">
                  <Link to="/products" className="group inline-flex items-center gap-8 bg-black p-6 text-[10px] font-black uppercase tracking-[0.5em] text-white transition-all hover:bg-cyan-400 hover:text-black">
                    Bắt đầu dịch vụ <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-4" />
                  </Link>
               </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Quy trình (Bố cục Grid liền mạch) ─────────────────────────── */}
      <section className="border-t border-slate-100">
        <div className="mx-auto max-w-7xl px-6 py-32">
          <SectionHeader 
            tag="Workflow" 
            title="Quy trình" 
            strokeTitle="Chuẩn mực"
            sub="Từ màn hình đến không gian sống của bạn là một hành trình của sự chính xác."
          />
          <Stagger className="grid grid-cols-1 border-t border-l border-slate-100 md:grid-cols-2 lg:grid-cols-4">
            {orderSteps.map((s, idx) => (
              <StepCard key={s.title} number={idx + 1} icon={s.icon} title={s.title} text={s.text} />
            ))}
          </Stagger>
        </div>
      </section>

      {/* ── Packaging (High Contrast - Inverted) ────────────────────── */}
      <section className="bg-black py-40 text-white">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-24 lg:grid-cols-2">
            <div>
               <p className="font-mono text-[10px] font-black uppercase tracking-[0.5em] text-cyan-400">Packaging Standards</p>
               <h2 className="mt-8 text-6xl font-black uppercase tracking-tighter md:text-8xl">
                 Bảo vệ <br />
                 <span className="italic opacity-30">Vĩnh cửu.</span>
               </h2>
               <div className="mt-12 space-y-8">
                 {[
                   { label: "Vật liệu", val: "Thùng Carton 5 lớp Double-Wall" },
                   { label: "Chống sốc", val: "Foam đúc định hình theo kích thước khung" },
                   { label: "Bề mặt", val: "Màng Glassine chống ẩm và axit" }
                 ].map(item => (
                   <div key={item.label} className="flex items-center justify-between border-b border-white/10 pb-4">
                     <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500">{item.label}</span>
                     <span className="text-sm font-bold uppercase">{item.val}</span>
                   </div>
                 ))}
               </div>
            </div>

            <div className="relative aspect-square overflow-hidden bg-slate-900">
               {/* Thay bằng ảnh minh họa đóng gói hoặc Canvas đồ họa */}
               <div className="absolute inset-0 flex items-center justify-center">
                  <Box className="h-32 w-32 text-white/10" strokeWidth={0.5} />
                  <div className="absolute h-full w-px bg-white/5 left-1/2" />
                  <div className="absolute w-full h-px bg-white/5 top-1/2" />
               </div>
               <div className="absolute bottom-10 left-10">
                 <p className="text-[10px] font-mono tracking-[0.2em] text-cyan-400 uppercase">Archive Security Seal</p>
                 <p className="mt-2 text-xs text-slate-400 italic">Đảm bảo nguyên vẹn 100% từ xưởng chế tác.</p>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Logistics Network (Minimalist) ───────────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 py-32">
        <div className="grid gap-12 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <h3 className="text-4xl font-black uppercase tracking-tighter leading-none">Mạng lưới <br/> Tin cậy</h3>
          </div>
          <div className="lg:col-span-2 grid gap-12 sm:grid-cols-2">
             {[
               { icon: Truck, t: "Hỏa tốc nội thành", d: "Giao hàng trong vòng 24h đối với các tác phẩm kích thước tiêu chuẩn." },
               { icon: MapPin, t: "Truy vết thời gian thực", d: "Hệ thống định vị chính xác vị trí tác phẩm trong suốt quá trình di chuyển." },
               { icon: Clock, t: "Cam kết thời gian", d: "Bồi hoàn 100% chi phí vận chuyển nếu trễ hẹn so với dự kiến." },
               { icon: BadgeCheck, t: "Đồng kiểm (Open-box)", d: "Mở hộp và kiểm tra tình trạng tranh cùng nhân viên giao hàng." }
             ].map((item) => (
               <div key={item.t} className="group">
                 <item.icon className="h-6 w-6 mb-6 transition-transform group-hover:scale-110 group-hover:text-magenta-500" style={{ color: MAGENTA }} />
                 <h4 className="text-xs font-black uppercase tracking-widest">{item.t}</h4>
                 <p className="mt-4 text-sm leading-relaxed text-slate-500">{item.d}</p>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* ── Final Call to Action (Big Typography) ───────────────────── */}
      <section className="px-6 pb-40">
        <Link to="/products" className="group relative block w-full overflow-hidden border border-black py-32 text-center transition-all hover:bg-black">
          <div className="relative z-10">
            <h2 className="text-5xl font-black uppercase tracking-tighter text-black transition-colors group-hover:text-white md:text-8xl">
              Bắt đầu <span style={{ WebkitTextStroke: '1px currentColor', color: 'transparent' }}>Bộ sưu tập</span>
            </h2>
            <div className="mt-12 flex justify-center">
              <span className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.5em] text-black group-hover:text-cyan-400">
                Khám phá ngay <ArrowRight className="h-4 w-4" />
              </span>
            </div>
          </div>
          {/* Overlay effect */}
          <div className="absolute inset-0 -translate-x-full bg-black transition-transform duration-700 group-hover:translate-x-0" />
        </Link>
      </section>
    </div>
  );
}
