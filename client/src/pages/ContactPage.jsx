/* eslint-disable no-unused-vars */
// client/src/pages/ContactPage.jsx
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Facebook, Instagram, Mail, MapPin, Phone, ArrowRight } from "lucide-react";
import { Container, ACCENT, ACCENT_BG, ACCENT_HOVER } from "../components/home/ui.jsx";

const WHATSAPP_NUMBER = "971522640871";

function InfoRow({ icon: Icon, title, children }) {
  return (
    <div className="flex gap-4 items-start">
      <div className="grid h-11 w-11 place-items-center rounded-xl border bg-white shadow-sm">
        <Icon className={`h-5 w-5 ${ACCENT}`} />
      </div>
      <div>
        <h3 className="text-sm font-extrabold text-slate-900">{title}</h3>
        <div className="mt-1 text-sm text-slate-600 leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    country: "",
    city: "",
    reason: "Service Enquiry",
    product: "",
    remarks: "",
  });

  const reasons = useMemo(
    () => ["Service Enquiry", "Product Enquiry", "Sales Enquiry", "Support Request", "Other"],
    []
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone) {
      alert("Please fill in Name, Email and Phone.");
      return;
    }

    const message = `
*New Website Enquiry — Golden Art Frames*

*Name:* ${form.name}
*Email:* ${form.email}
*Phone:* ${form.phone}
*Location:* ${form.country || "-"}${form.city ? ` - ${form.city}` : ""}

*Reason:* ${form.reason || "-"}
*Product / Service:* ${form.product || "-"}

*Remarks:*
${form.remarks || "-"}
    `.trim();

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Hero */}
      <section className="relative overflow-hidden bg-linear-to-b from-amber-50 via-white to-white">
        <Container className="py-10 sm:py-14">
          <p className={`text-sm font-semibold tracking-wide uppercase ${ACCENT}`}>
            Contact Golden Art Frames
          </p>
          <h1 className="mt-2 text-3xl font-extrabold leading-tight sm:text-4xl">
            Let’s help you print, frame & deliver it perfectly
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base">
            Ask about custom sizes, bulk orders, delivery timelines, or product recommendations.
            Send your enquiry and we’ll respond quickly.
          </p>
        </Container>
      </section>

      {/* Content */}
      <section className="py-12 sm:py-16">
        <Container>
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
            {/* Left */}
            <div className="rounded-3xl border bg-white p-6 shadow-sm sm:p-8">
              <p className={`text-sm font-semibold tracking-wide uppercase ${ACCENT}`}>Contact</p>
              <h2 className="mt-2 text-2xl font-extrabold">Say hello</h2>
              <p className="mt-2 text-sm text-slate-600">
                We’re happy to guide you on print finishes, frame styles, and delivery.
              </p>

              <div className="mt-8 space-y-6">
                <InfoRow icon={MapPin} title="Address">
                  1103-Al Ghanem Business Building Al-Majaz-3, Sharjah,<br /> United Arab Emirates
                </InfoRow>

                <InfoRow icon={Mail} title="Email">
                  <a className="hover:underline" href="mailto:print@albumhq.ae">print@albumhq.ae</a>
                  <br />
                  <a className="hover:underline" href="mailto:info@goldenartframe.com">info@goldenartframe.com</a>
                </InfoRow>

                <InfoRow icon={Phone} title="Phone">
                  <a className="hover:underline" href="tel:+971522640871">+971 522640871</a>
                  <br />
                  <a className="hover:underline" href="tel:+97168053054">+971 6 8053054</a>
                </InfoRow>
              </div>

              <div className="mt-8 border-t pt-6">
                <p className="text-sm font-extrabold">Follow us</p>
                <div className="mt-4 flex gap-3">
                  <a
                    href="https://www.facebook.com/albumhq/"
                    target="_blank"
                    rel="noreferrer"
                    className="grid h-10 w-10 place-items-center rounded-xl border bg-white shadow-sm hover:bg-slate-50"
                    aria-label="Facebook"
                  >
                    <Facebook className={`h-5 w-5 ${ACCENT}`} />
                  </a>
                  <a
                    href="https://www.instagram.com/albumhq.ae/"
                    target="_blank"
                    rel="noreferrer"
                    className="grid h-10 w-10 place-items-center rounded-xl border bg-white shadow-sm hover:bg-slate-50"
                    aria-label="Instagram"
                  >
                    <Instagram className={`h-5 w-5 ${ACCENT}`} />
                  </a>
                  <a
                    href={`https://wa.me/${WHATSAPP_NUMBER}`}
                    target="_blank"
                    rel="noreferrer"
                    className="grid h-10 w-10 place-items-center rounded-xl border bg-white shadow-sm hover:bg-slate-50"
                    aria-label="WhatsApp"
                  >
                    <Phone className={`h-5 w-5 ${ACCENT}`} />
                  </a>
                </div>
              </div>
            </div>

            {/* Right */}
            <div className="rounded-3xl border bg-white p-6 shadow-sm sm:p-8">
              <p className={`text-sm font-semibold tracking-wide uppercase ${ACCENT}`}>Enquiry</p>
              <h2 className="mt-2 text-2xl font-extrabold">Request a call back</h2>
              <p className="mt-2 text-sm text-slate-600">
                Fill the form — we’ll open WhatsApp with a ready message.
              </p>

              <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                <div>
                  <label className="block text-sm font-extrabold mb-1">
                    Name <span className="text-rose-600">*</span>
                  </label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="h-11 w-full rounded-xl border px-4 text-sm font-semibold outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/15"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-extrabold mb-1">
                    Email <span className="text-rose-600">*</span>
                  </label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    className="h-11 w-full rounded-xl border px-4 text-sm font-semibold outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/15"
                    placeholder="you@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-extrabold mb-1">
                    Phone <span className="text-rose-600">*</span>
                  </label>
                  <input
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    className="h-11 w-full rounded-xl border px-4 text-sm font-semibold outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/15"
                    placeholder="+971..."
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-extrabold mb-1">Country</label>
                    <input
                      name="country"
                      value={form.country}
                      onChange={handleChange}
                      className="h-11 w-full rounded-xl border px-4 text-sm font-semibold outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/15"
                      placeholder="Country"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-extrabold mb-1">City</label>
                    <input
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      className="h-11 w-full rounded-xl border px-4 text-sm font-semibold outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/15"
                      placeholder="City"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-extrabold mb-1">Reason</label>
                  <select
                    name="reason"
                    value={form.reason}
                    onChange={handleChange}
                    className="h-11 w-full rounded-xl border px-4 text-sm font-semibold outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/15"
                  >
                    {reasons.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-extrabold mb-1">Product / service</label>
                  <input
                    name="product"
                    value={form.product}
                    onChange={handleChange}
                    className="h-11 w-full rounded-xl border px-4 text-sm font-semibold outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/15"
                    placeholder="e.g. Print & Frame"
                  />
                </div>

                <div>
                  <label className="block text-sm font-extrabold mb-1">Remarks</label>
                  <textarea
                    name="remarks"
                    value={form.remarks}
                    onChange={handleChange}
                    rows={5}
                    className="w-full rounded-2xl border px-4 py-3 text-sm font-semibold outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/15"
                    placeholder="Tell us what you need..."
                  />
                </div>

                <div className="pt-2 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="submit"
                    className={`inline-flex items-center justify-center gap-2 rounded-xl ${ACCENT_BG} ${ACCENT_HOVER} px-6 py-3 text-sm font-extrabold text-white transition`}
                  >
                    Send via WhatsApp <ArrowRight className="h-4 w-4" />
                  </button>

                  <Link
                    to="/delivery"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border bg-white px-6 py-3 text-sm font-extrabold hover:bg-slate-50"
                  >
                    How delivery works <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>

                <p className="text-xs text-slate-500">
                  WhatsApp opens with your message — you can edit before sending.
                </p>
              </form>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
