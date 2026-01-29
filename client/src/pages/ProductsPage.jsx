// client/src/pages/Products.jsx
// ----------------------------------------------------
// Products page (Golden Art Frames theme)
// - No framer-motion
// - Responsive grid with centered last item rule
// - Soft gradient background + themed cards
// ----------------------------------------------------

import { Link } from "react-router-dom";
import Page from "../components/Page.jsx";
import { ACCENT, ACCENT_BG, ACCENT_HOVER } from "../components/home/ui.jsx";

const PRODUCTS = [
  { id: "print", name: "Print", image: "/products/print_converted.avif", href: "/editor/print" },
  { id: "print-frame", name: "Print & Frame", image: "/products/printandframe_converted.avif", href: "/editor/print-frame" },
  { id: "canvas", name: "Canvas", image: "/products/canvas_converted.avif", href: "/editor/canvas" },
  { id: "mini-frames", name: "Mini Frames", image: "/products/canvas_converted.avif", href: "/editor/mini-frames" },
  { id: "collage-frame", name: "Collage Frame", image: "/products/canvas_converted.avif", href: "/editor/collage-frame" },
  { id: "wedding-frame", name: "Wedding Frame", image: "/products/canvas_converted.avif", href: "/editor/wedding-frame" },
  { id: "wedding-print", name: "Wedding Print", image: "/products/canvas_converted.avif", href: "/editor/wedding-print" },
  { id: "fine-art-print", name: "Fine Art Print", image: "/products/canvas_converted.avif", href: "/editor/fine-art-print" },
];

export default function ProductsPage() {
  return (
    <Page title="Products">
      {/* Header */}
      <div className="mb-8 rounded-3xl border bg-linear-to-b from-blue-100/75 via-white to-white p-6 shadow-sm sm:p-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className={`text-sm font-extrabold uppercase tracking-wide ${ACCENT}`}>
              Golden Art Frames
            </p>

            <h1 className="mt-2 text-3xl font-extrabold leading-tight text-slate-900 sm:text-4xl">
              Choose what you want to create
            </h1>

            <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
              Upload your photo, choose size & finish, and we’ll print, frame and deliver it to your doorstep.
            </p>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {PRODUCTS.map((p, index) => (
          <ProductCard key={p.id} product={p} index={index} total={PRODUCTS.length} />
        ))}
      </div>
    </Page>
  );
}

function ProductCard({ product, index, total }) {
  // Center the last single card if the final row has only one item (3-col layout)
  const isLastSingle = total % 3 === 1 && index === total - 1;

  return (
    <div className={isLastSingle ? "lg:col-start-2" : ""}>
      <Link
        to={product.href}
        className="group block rounded-3xl border bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        aria-label={product.name}
      >
        {/* Image area */}
        <div className="rounded-3xl bg-linear-to-b from-slate-50 to-white p-5">
          <div className="relative overflow-hidden rounded-2xl border bg-white">
            <div className="aspect-4/3 w-full">
              <img
                src={product.image}
                alt={product.name}
                className="h-full w-full object-contain p-6 transition-transform duration-300 group-hover:scale-[1.03]"
                loading="lazy"
                decoding="async"
              />
            </div>

            {/* Accent ring on hover */}
            <div className="pointer-events-none absolute inset-0 rounded-2xl ring-0 ring-blue-600/20 transition group-hover:ring-2" />
          </div>
        </div>

        {/* Text */}
        <div className="px-6 pb-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-lg font-extrabold text-slate-900">{product.name}</p>
              <p className="mt-1 text-sm font-semibold text-slate-600">
                Custom sizes • Premium finishing • Fast delivery
              </p>
            </div>

            <span
              className={`shrink-0 rounded-full border px-3 py-1 text-xs font-extrabold ${ACCENT} bg-blue-50`}
            >
              Create
            </span>
          </div>

          <div className="mt-5">
            <div
              className={`inline-flex w-full items-center justify-center rounded-2xl ${ACCENT_BG} ${ACCENT_HOVER} px-4 py-2.5 text-sm font-extrabold text-white transition`}
            >
              Start
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
