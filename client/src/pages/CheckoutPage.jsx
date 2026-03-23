/* eslint-disable no-unused-vars */
// client/src/pages/CheckoutPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Museum Design — Thanh toán liền mạch phong cách Gallery
// Cyan × Magenta thuần · Typography tối giản · Tràn viền hoàn toàn
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence, useInView } from "framer-motion";
import api from "../lib/api.js";
import { getSessionId } from "../lib/session.js";

// ✅ Stripe
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";

// ─── Bảng màu hệ thống ───────────────────────────────────────────────────────
const C = "#00e5ff";   // Cyan thuần
const M = "#e040fb";   // Magenta thuần
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const UAE_CITIES = [
  "Abu Dhabi", "Dubai", "Sharjah", "Ajman",
  "Ras Al Khaimah", "Fujairah", "Umm Al Quwain", "Al Ain", "Khorfakkan",
];

// ─── Thành phần giao diện dùng chung ──────────────────────────────────────────
const INPUT_STYLE = 
  "w-full border-b border-slate-200 bg-transparent px-0 py-3 text-sm font-bold text-slate-900 outline-none " +
  "transition-all duration-300 focus:border-[#00e5ff] placeholder:text-slate-300 placeholder:font-normal";

function Reveal({ children, delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

function SectionLabel({ step, title }) {
  return (
    <div className="mb-8 flex items-center gap-4">
      <span className="font-mono text-xs font-bold text-white bg-slate-900 px-2 py-1 leading-none">
        {step.padStart(2, '0')}
      </span>
      <h3 className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
        {title}
      </h3>
      <div className="h-px flex-1 bg-slate-100" />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// THANH TOÁN (STRIPE)
// ─────────────────────────────────────────────────────────────────────────────
function PaymentStep({ orderId, onPaid }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const handlePay = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    const { error, paymentIntent } = await stripe.confirmPayment({ elements, redirect: "if_required" });
    if (error) { setMsg(error.message); setLoading(false); return; }
    if (paymentIntent?.status === "succeeded") onPaid?.();
    setLoading(false);
  };

  return (
    <div className="mt-12 border-t-2 border-slate-900 pt-10">
      <SectionLabel step="3" title="Phương thức thanh toán" />
      <div className="bg-slate-50 p-8">
        <PaymentElement />
        <button
          onClick={handlePay}
          disabled={!stripe || loading}
          className="mt-8 w-full py-5 text-xs font-black uppercase tracking-[0.2em] text-white transition-all hover:scale-[1.02]"
          style={{ background: "#000" }}
        >
          {loading ? "Đang xử lý..." : "Xác nhận thanh toán 🔒"}
        </button>
        {msg && <p className="mt-4 text-xs font-bold text-rose-500">{msg}</p>}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TRANG CHÍNH
// ─────────────────────────────────────────────────────────────────────────────
export default function CheckoutPage() {
  const navigate = useNavigate();
  const sessionId = useMemo(() => getSessionId(), []);

  const [cart, setCart] = useState(null);
  const [error, setError] = useState("");
  const [orderId, setOrderId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [creating, setCreating] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    line1: "", line2: "", city: "", postcode: "", country: "United Arab Emirates",
  });
  const [customer, setCustomer] = useState({ fullName: "", email: "", phone: "" });

  useEffect(() => {
    api.get(`/cart/${sessionId}`).then(res => setCart(res.data)).catch(err => setError(err.message));
  }, [sessionId]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const orderRes = await api.post("/orders/checkout", { sessionId, customer, shippingAddress });
      const piRes = await api.post("/payments/create-intent", { orderId: orderRes.data._id });
      setOrderId(orderRes.data._id);
      setClientSecret(piRes.data.clientSecret);
    } catch (err) { setError(err.message); }
    setCreating(false);
  };

  const subtotal = cart?.items?.reduce((sum, item) => sum + (item.price?.total || 0), 0) || 0;

  return (
    <div className="min-h-screen bg-white font-sans antialiased">
      {/* ── Header Bảo Tàng ── */}
      <section className="relative border-b border-slate-100 bg-white px-10 py-20 sm:px-16 lg:px-24">
        <div className="absolute left-0 top-0 bottom-0 w-1" style={{ background: C }} />
        <Reveal>
          <p className="font-mono text-xs tracking-[0.3em] text-slate-400">GIAO DỊCH AN TOÀN</p>
          <h1 className="mt-4 font-extrabold leading-none tracking-tighter text-slate-900" style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)" }}>
            Thanh <span style={{ WebkitTextStroke: `1.5px ${M}`, color: "transparent" }}>Toán.</span>
          </h1>
        </Reveal>
      </section>

      <div className="mx-auto max-w-[1600px] px-10 py-16 sm:px-16 lg:px-24">
        <div className="grid gap-20 lg:grid-cols-12">
          
          {/* ── BÊN TRÁI: NHẬP LIỆU ── */}
          <div className="lg:col-span-7">
            <form onSubmit={onSubmit}>
              <Reveal delay={0.1}>
                <SectionLabel step="1" title="Thông tin khách hàng" />
                <div className="grid gap-8 sm:grid-cols-2">
                  <input className={INPUT_STYLE} placeholder="Họ và tên *" required 
                    onChange={e => setCustomer({...customer, fullName: e.target.value})} />
                  <input className={INPUT_STYLE} type="email" placeholder="Email *" required 
                    onChange={e => setCustomer({...customer, email: e.target.value})} />
                  <input className={`${INPUT_STYLE} sm:col-span-2`} placeholder="Số điện thoại *" required 
                    onChange={e => setCustomer({...customer, phone: e.target.value})} />
                </div>
              </Reveal>

              <Reveal delay={0.2}>
                <div className="mt-16">
                  <SectionLabel step="2" title="Địa chỉ giao hàng" />
                  <div className="grid gap-8">
                    <input className={INPUT_STYLE} placeholder="Số nhà, tên đường *" required 
                      onChange={e => setShippingAddress({...shippingAddress, line1: e.target.value})} />
                    <div className="grid gap-8 sm:grid-cols-2">
                      <select className={INPUT_STYLE} required onChange={e => setShippingAddress({...shippingAddress, city: e.target.value})}>
                        <option value="">Chọn thành phố (UAE) *</option>
                        {UAE_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <input className={INPUT_STYLE} placeholder="Mã bưu điện (tùy chọn)" 
                        onChange={e => setShippingAddress({...shippingAddress, postcode: e.target.value})} />
                    </div>
                  </div>
                </div>
              </Reveal>

              {!clientSecret && (
                <Reveal delay={0.3}>
                  <button type="submit" disabled={creating}
                    className="mt-12 w-full py-5 text-xs font-black uppercase tracking-[0.2em] text-white transition-all hover:scale-[1.02]"
                    style={{ background: "#000" }}>
                    {creating ? "Đang khởi tạo..." : "Tiếp tục đến thanh toán →"}
                  </button>
                </Reveal>
              )}
            </form>

            <AnimatePresence>
              {clientSecret && (
                <Reveal>
                  <Elements stripe={stripePromise} options={{ clientSecret }}>
                    <PaymentStep orderId={orderId} onPaid={() => navigate(`/order/${orderId}`)} />
                  </Elements>
                </Reveal>
              )}
            </AnimatePresence>
          </div>

          {/* ── BÊN PHẢI: TÓM TẮT ĐƠN HÀNG ── */}
          <div className="lg:col-span-5">
            <div className="sticky top-10 border border-slate-100 bg-white p-8">
              <h3 className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-slate-900 mb-8">
                Giỏ hàng của bạn ({cart?.items?.length || 0})
              </h3>
              
              <div className="space-y-6">
                {cart?.items?.map((item, i) => (
                  <div key={i} className="flex gap-4 border-b border-slate-50 pb-6">
                    <div className="h-20 w-16 shrink-0 bg-slate-100">
                      <img src={item.assets?.previewUrl} alt="" className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-black uppercase leading-none text-slate-900">{item.productSlug?.replace(/-/g, ' ')}</p>
                      <p className="mt-2 text-[10px] text-slate-400 uppercase tracking-wider">
                        Kích thước: {item.config?.size} | Khung: {item.config?.frame}
                      </p>
                      <p className="mt-1 font-mono text-xs font-bold" style={{ color: C }}>
                        {item.price?.total} {item.price?.currency}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 space-y-4 font-mono text-xs uppercase tracking-widest">
                <div className="flex justify-between text-slate-400">
                  <span>Tạm tính</span>
                  <span>{subtotal} AED</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Phí vận chuyển</span>
                  <span>Tính tại bước sau</span>
                </div>
                <div className="border-t border-slate-900 pt-4 flex justify-between text-base font-black text-slate-900">
                  <span className="tracking-tighter">Tổng cộng</span>
                  <span style={{ color: M }}>{subtotal} AED</span>
                </div>
              </div>

              <div className="mt-10 grid grid-cols-2 gap-2">
                {["Giao hàng UAE", "Đóng gói cao cấp"].map(tag => (
                  <div key={tag} className="border border-slate-100 py-3 text-center text-[10px] font-bold uppercase text-slate-400">
                    {tag}
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
