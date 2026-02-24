// client/src/pages/Home.jsx
// ----------------------------------------------------
// Home Page composed from reusable section components
// ----------------------------------------------------

import { useMemo } from "react";
import Hero from "../components/home/Hero.jsx";
import AboutSection from "../components/home/AboutSection.jsx";
import FeaturedProducts from "../components/home/FeaturedProducts.jsx";
import Testimonials from "../components/home/Testimonials.jsx";
import BlogPreview from "../components/home/BlogPreview.jsx";
import Newsletter from "../components/home/Newsletter.jsx";

export default function Home() {


  const products = useMemo(
    () => [
      {
        name: "Print & Frame",
        price: "from 89 AED",
        rating: 4.9,
        tag: "Popular",
        imageUrl:
          "./feature/feature1_converted.avif",
        href: "/editor/print-frame",
      },
      {
        name: "Print",
        price: "from 29 AED",
        rating: 4.8,
        tag: "Premium",
        imageUrl:
          "./feature/feature2_converted.avif",
        href: "/editor/print",
      },
      {
        name: "Canvas Print",
        price: "from 149 AED",
        rating: 4.7,
        tag: "Best seller",
        imageUrl:
          "./feature/feature3_converted.avif",
        href: "/editor/canvas",
      },
      {
        name: "Collage Frames",
        price: "from 179 AED",
        rating: 4.6,
        tag: "Value",
        imageUrl:
          "./feature/feature1_converted.avif",
        href: "/editor/collage-frame",
      },
    ],
    []
  );

  const testimonials = useMemo(
    () => [
      {
        name: "Hassan",
        role: "Print & Frame",
        text:
          "Quality is proper premium. The frame corners were perfect and packaging was solid — arrived safely.",
        rating: 5,
      },
      {
        name: "Naveera",
        role: "Canvas Print",
        text:
          "The canvas looked exactly like the preview. Delivery was quick and customer support replied fast.",
        rating: 5,
      },
      {
        name: "Areez",
        role: "Bulk Print Order",
        text:
          "Great finishing, clean print colors, and easy checkout on mobile. Would order again.",
        rating: 5,
      },
    ],
    []
  );

  return (
    <div className="min-h-screen bg-white text-slate-900">

      <Hero />

      <FeaturedProducts products={products} />
      <AboutSection />

      <Testimonials testimonials={testimonials} />
      <BlogPreview />

      <Newsletter />
    </div>
  );
}
