// client/src/components/home/Topbar.jsx
import { Phone, MapPin, Clock, Instagram, Facebook, Twitter } from "lucide-react";
import { Container } from "./ui.jsx";

export default function Topbar() {
  return (
    <div className="hidden border-b bg-white sm:block">
      <Container className="py-2">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-2">
              <Phone className="h-4 w-4" /> +971 522640871
            </span>
            <span className="inline-flex items-center gap-2">
              <MapPin className="h-4 w-4" /> Sharjah, UAE
            </span>
            <span className="inline-flex items-center gap-2">
              <Clock className="h-4 w-4" /> Mon–Sat: 10am–8pm
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Instagram className="h-4 w-4" />
            <Facebook className="h-4 w-4" />
            <Twitter className="h-4 w-4" />
          </div>
        </div>
      </Container>
    </div>
  );
}
