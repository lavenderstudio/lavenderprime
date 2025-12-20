// client/src/components/Footer.jsx
// ----------------------------------------------------
// Seamless, premium footer for Golden Art Frames
// - Consistent column rhythm (headings + links)
// - Clean spacing + subtle separators
// - Mobile responsive
// ----------------------------------------------------

import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="mt-14 border-t border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-12">
        {/* Top grid */}
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="text-sm font-extrabold tracking-[0.22em] text-gray-900">
              GOLDEN ART FRAMES
            </div>

            <p className="mt-4 max-w-sm text-sm leading-6 text-gray-600">
              Premium custom prints, frames, and canvas art crafted with care.
              Designed to elevate your space with timeless elegance.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900">Shop</h4>

            <ul className="mt-4 space-y-3 text-sm text-gray-600">
              <li>
                <Link to="/products" className="hover:text-gray-900">
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/editor/print-frame" className="hover:text-gray-900">
                  Print &amp; Frame
                </Link>
              </li>
              <li>
                <Link to="/editor/canvas" className="hover:text-gray-900">
                  Canvas Prints
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-gray-900">
                  Cart
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900">Support</h4>

            <ul className="mt-4 space-y-3 text-sm text-gray-600">
              <li>
                <Link to="/account" className="hover:text-gray-900">
                  My Account
                </Link>
              </li>
              <li>
                <Link to="/orders" className="hover:text-gray-900">
                  My Orders
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-gray-900">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900">Contact</h4>

            <ul className="mt-4 space-y-3 text-sm text-gray-600 leading-6">
              <li>
                1103-Al Ghanem Business Building,
                <br />
                Al-Majaz-3, Sharjah,
                <br />
                United Arab Emirates
              </li>

              <li>
                <a
                  href="mailto:info@goldenartframe.com"
                  className="hover:text-gray-900"
                >
                  info@goldenartframe.com
                </a>
              </li>

              <li>
                <a
                  href="tel:+971522640871"
                  className="hover:text-gray-900"
                >
                  +971 52 264 0871
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="mt-10 border-t border-gray-200 pt-6">
          <div className="flex flex-col gap-2 text-sm text-gray-600 sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} Golden Art Frames. All rights reserved.</p>

            {/* <div className="flex items-center gap-4">
              <Link to="/privacy" className="hover:text-gray-900">
                Privacy
              </Link>
              <Link to="/terms" className="hover:text-gray-900">
                Terms
              </Link>
              <Link to="/refunds" className="hover:text-gray-900">
                Refunds
              </Link>
            </div> */}
          </div>
        </div>
      </div>
    </footer>
  );
}
