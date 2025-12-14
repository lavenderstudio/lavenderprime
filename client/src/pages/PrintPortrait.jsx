// client/src/pages/Products.jsx
// ----------------------------------------------------
// All Products page (hard-coded)
// Clean gallery layout matching your reference design
// ----------------------------------------------------

import { Link } from "react-router-dom";
import Page from "../components/Page.jsx";

const PRODUCTS = [
  {
    id: "print",
    name: "Print",
    image: "/printandframe.png",
    href: "/print/portrait",
  },
  {
    id: "print-frame",
    name: "Print & Frame",
    image: "/printandframe.png",
    href: "/editor/print-frame",
  },
  {
    id: "canvas",
    name: "Canvas",
    image: "/printandframe.png",
    href: "/canvas",
  },
  {
    id: "poster",
    name: "Poster",
    image: "/printandframe.png",
    href: "/poster",
  },
  {
    id: "collage",
    name: "Collage",
    image: "/printandframe.png",
    href: "/collage",
  },
  {
    id: "frame-set",
    name: "Frame Set",
    image: "/printandframe.png",
    href: "/frame-set",
  },
  {
    id: "wedding-print",
    name: "Wedding Print",
    image: "/printandframe.png",
    href: "/wedding-print",
  },
];

export default function Products() {
  return (
    <Page>
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-2xl font-bold text-gray-900">All Products</h1>
        <div className="mx-auto mt-2 h-0.75 w-8 rounded-full bg-gray-900" />
      </div>

      {/* Product Grid */}
      <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
        {PRODUCTS.map((p, index) => (
          <ProductCard
            key={p.id}
            product={p}
            index={index}
            total={PRODUCTS.length}
          />
        ))}
      </div>
    </Page>
  );
}

function ProductCard({ product, index, total }) {
  const isLastSingle =
    total % 3 === 1 && index === total - 1;
  return (
    <div
      className={`text-center ${
        isLastSingle ? "lg:col-start-2" : ""
      }`}
    >
      {/* Clickable tile */}
      <Link to={product.href} className="group block">
        <div className="mx-auto flex h-95 w-full max-w-115 items-center justify-center rounded-[36px] bg-[#F4F1F2] shadow-[0_20px_45px_rgba(0,0,0,0.08)] transition group-hover:shadow-[0_25px_60px_rgba(0,0,0,0.12)]">
          <div className="flex h-full w-full items-center justify-center">
            <img
              src={product.image}
              alt={product.name}
              className="max-h-full max-w-full object-contain drop-shadow-sm transition group-hover:scale-[1.02]"
              loading="lazy"
            />
          </div>
        </div>
      </Link>

      {/* Name */}
      <div className="mt-4 mb-10 text-lg font-semibold text-gray-900">
        {product.name}
      </div>
    </div>
  );
}
