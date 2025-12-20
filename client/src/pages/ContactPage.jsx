// ContactUs.jsx
import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone } from "lucide-react";
import { useState } from "react";

// Put your WhatsApp number here in *international* format:
// Example (UAE mobile 055 835 8586) → "971558358586"
// No "+" and no spaces.
const WHATSAPP_NUMBER = "971522640871";

const ContactPage = () => {
  // ----------- Form state -----------
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

  // Handle all input changes in one function
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // When user submits the form → open WhatsApp with formatted message
  const handleSubmit = (e) => {
    e.preventDefault();

    // Basic required fields check (you can make this stricter if you want)
    if (!form.name || !form.email || !form.phone) {
      alert("Please fill in Name, Email and Phone.");
      return;
    }

    // Build a nice multi-line message for WhatsApp
    const message = `
*New Website Enquiry*

*Name:* ${form.name}
*Email:* ${form.email}
*Phone:* ${form.phone}
*Location:* ${form.country || "-"} ${form.city ? `- ${form.city}` : ""}
*Reason for Enquiry:* ${form.reason || "-"}
*Product / Service:* ${form.product || "-"}

*Remarks:*
${form.remarks || "-"}
    `.trim();

    // Encode the message for URL
    const encoded = encodeURIComponent(message);

    // WhatsApp deep link
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`;

    // Open WhatsApp in new tab / app
    window.open(url, "_blank");
  };

  return (
    <div className="w-full bg-white py-10">
      <div className="max-w-6xl mx-auto px-4 lg:px-8">
        {/* Page Heading */}
        <h1 className="text-3xl md:text-4xl font-semibold text-center mb-10">
          Contact Us
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* ========== LEFT COLUMN: CONTACT INFO ========== */}
          <div className="space-y-8">
            <div>
              <p className="text-sm text-gray-900 font-semibold">Contact</p>
              <h2 className="text-2xl font-semibold mt-1">Say Hello</h2>
              <div className="mt-2 h-0.5 w-16 bg-gray-900" />
            </div>

            {/* Address */}
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-full border border-gray-900 flex items-center justify-center text-gray-900">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Address</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  1103-Al Ghanem Business Building Al-Majaz-3, Sharjah,<br /> United Arab Emirates
                </p>
              </div>
            </div>

            {/* Email */}
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-full border border-gray-900 flex items-center justify-center text-gray-900">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Email</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  print@albumhq.ae<br />
                  info@goldenartframe.com
                </p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-full border border-gray-900 flex items-center justify-center text-gray-900">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Phone</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  +971 522640871<br />
                  +971 6 8053054
                </p>
              </div>
            </div>

            {/* Social icons (dummy links, replace with your URLs) */}
            <div className="pt-4">
              <p className="text-sm font-semibold mb-2">
                Follow us for latest updates
              </p>
              <div className="flex gap-3">
                <a href="https://www.facebook.com/albumhq/" className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm"><Facebook className="w-5 h-5" /></a>
                <a href="https://www.instagram.com/albumhq.ae/" className="w-9 h-9 rounded-full bg-pink-400 flex items-center justify-center text-white text-sm"><Instagram className="w-5 h-5" /></a>
                <a href="https://wa.me/971522640871" className="w-9 h-9 rounded-full bg-green-500 flex items-center justify-center text-white text-sm">
                  <Phone className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          {/* ========== RIGHT COLUMN: FORM ========== */}
          <div>
            <div className="mb-4">
              <p className="text-sm text-gray-900 font-semibold">
                Product/Service Enquiry
              </p>
              <h2 className="text-2xl font-semibold mt-1">
                Request a Call Back
              </h2>
              <div className="mt-2 h-0.5 w-16 bg-gray-900" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-none px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="Name"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-none px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="Enter your email address"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Phone <span className="text-red-500">*</span>
                </label>
                <input
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-none px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="Enter your contact number"
                />
              </div>

              {/* Location: Country + City */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
								{/* Country + label */}
								<div>
									<label className="block text-sm font-semibold mb-1">
										Location <span className="text-red-500">*</span>
									</label>
									<input
										name="country"
										type="text"
										value={form.country}
										onChange={handleChange}
										className="w-full border border-slate-300 rounded-none px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
										placeholder="Country"
									/>
								</div>

								{/* City (no label, but aligned by items-end) */}
								<div>
									<input
										name="city"
										type="text"
										value={form.city}
										onChange={handleChange}
										className="w-full border border-slate-300 rounded-none px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
										placeholder="City"
									/>
								</div>
							</div>

              {/* Reason for enquiry */}
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Reason for Enquiry <span className="text-red-500">*</span>
                </label>
                <select
                  name="reason"
                  value={form.reason}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-none px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                >
                  <option>Service Enquiry</option>
                  <option>Product Enquiry</option>
                  <option>Sales Enquiry</option>
                  <option>Support Request</option>
                  <option>Other</option>
                </select>
              </div>

              {/* Product / service */}
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Specify product or service you’re looking for{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  name="product"
                  type="text"
                  value={form.product}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-none px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="e.g. Print And Frame"
                />
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Remarks
                </label>
                <textarea
                  name="remarks"
                  value={form.remarks}
                  onChange={handleChange}
                  rows={5}
                  className="w-full border border-slate-300 rounded-2xl px-4 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="Type your message here…"
                />
              </div>

              {/* Submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-none bg-gray-900 text-white px-8 py-2.5 text-sm font-semibold hover:bg-gray-600 transition"
                >
                  Send via WhatsApp
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
