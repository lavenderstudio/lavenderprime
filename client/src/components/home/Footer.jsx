// client/src/components/home/Footer.jsx
// ----------------------------------------------------
// Footer section (dark) - replace contact details as needed
// ----------------------------------------------------

import { Link } from "react-router-dom";
import { Phone, MapPin, Mail } from "lucide-react";
import { Container } from "./ui.jsx";

export default function Footer() {
  return (
    <footer className="border-t bg-slate-950 text-white">
      <Container className="py-10">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <p className="text-lg font-extrabold">Print & Frame</p>
            <p className="mt-2 text-sm text-white/70">
              Premium prints and frames, custom sizes, and safe delivery to your door.
            </p>
          </div>

          <div>
            <p className="text-sm font-extrabold">Links</p>
            <div className="mt-3 grid gap-2 text-sm text-white/80">
              <Link to="/shop" className="hover:text-white">Shop</Link>
              <Link to="/custom" className="hover:text-white">Custom Print</Link>
              <Link to="/track" className="hover:text-white">Track Order</Link>
              <Link to="/contact" className="hover:text-white">Contact</Link>
            </div>
          </div>

          <div>
            <p className="text-sm font-extrabold">Contact</p>
            <div className="mt-3 grid gap-2 text-sm text-white/80">
              <span className="inline-flex items-center gap-2">
                <MapPin className="h-4 w-4" /> Sharjah, UAE
              </span>
              <span className="inline-flex items-center gap-2">
                <Phone className="h-4 w-4" /> +971 522640871
              </span>
              <span className="inline-flex items-center gap-2">
                <Mail className="h-4 w-4" /> print@albumhq.ae
              </span>
            </div>
          </div>

          <div>
            <p className="text-sm font-extrabold">Support</p>
            <p className="mt-3 text-sm text-white/70">
              Need help choosing sizes or finishing? Message us — we reply fast.
            </p>
            <Link
              to="/contact"
              className="mt-4 inline-flex rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-bold text-white hover:bg-white/10"
            >
              Contact Support
            </Link>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-xs text-white/60">
          © {new Date().getFullYear()} Print & Frame. All rights reserved.
        </div>
      </Container>
    </footer>
  );
}
