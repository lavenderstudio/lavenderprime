// client/src/pages/Home.jsx
// ----------------------------------------------------
// Home Page composed from reusable section components
// ----------------------------------------------------

import { useMemo } from "react";
import Topbar from "../components/home/Topbar.jsx";
import Header from "../components/home/Header.jsx";
import Hero from "../components/home/Hero.jsx";
import AboutSection from "../components/home/AboutSection.jsx";
import FeaturedProducts from "../components/home/FeaturedProducts.jsx";
import Testimonials from "../components/home/Testimonials.jsx";
import BlogPreview from "../components/home/BlogPreview.jsx";
import Newsletter from "../components/home/Newsletter.jsx";
import Footer from "../components/home/Footer.jsx";

export default function Home() {
  // const nav = useMemo(
  //   () => [
  //     { label: "Home", href: "/" },
  //     { label: "Products", href: "/shop" },
  //     { label: "Custom Print", href: "/custom" },
  //     { label: "Track Order", href: "/track" },
  //     { label: "Contact", href: "/contact" },
  //   ],
  //   []
  // );

  const promos = useMemo(
    () => [
      {
        title: "Print & Frame Your Photos",
        subtitle: "New arrivals",
        cta: "Start Designing",
        href: "/products",
        imageUrl:
          "https://images.unsplash.com/photo-1594335034276-470bb3d7ceac",
      },
      {
        title: "Premium Canvas Prints",
        subtitle: "Best seller",
        cta: "Shop Canvas",
        href: "/editor/canvas",
        imageUrl:
          "https://images.unsplash.com/photo-1568448705245-1250489bcd66",
      },
      {
        title: "Fast Delivery, Safe Packaging",
        subtitle: "Doorstep delivery",
        cta: "How Delivery Works",
        href: "/delivery",
        imageUrl:
          "https://images.unsplash.com/photo-1624137527136-66e631bdaa0e",
      },
    ],
    []
  );

  const products = useMemo(
    () => [
      {
        name: "Print & Frame",
        price: "from 89 AED",
        rating: 4.9,
        tag: "Popular",
        imageUrl:
          "https://images.unsplash.com/photo-1493666438817-866a91353ca9?w=1600&q=80&auto=format&fit=crop",
        href: "/editor/print-frame",
      },
      {
        name: "Print",
        price: "from 29 AED",
        rating: 4.8,
        tag: "Premium",
        imageUrl:
          "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1600&q=80&auto=format&fit=crop",
        href: "/editor/print",
      },
      {
        name: "Canvas Print",
        price: "from 149 AED",
        rating: 4.7,
        tag: "Best seller",
        imageUrl:
          "https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=1600&q=80&auto=format&fit=crop",
        href: "/editor/canvas",
      },
      {
        name: "Poster Print (A3/A2)",
        price: "from £9.99",
        rating: 4.6,
        tag: "Value",
        imageUrl:
          "https://images.unsplash.com/photo-1522770179533-24471fcdba45?w=1600&q=80&auto=format&fit=crop",
        href: "/editor/poster",
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

  const blogs = useMemo(
    () => [
      {
        title: "How to choose the right frame size",
        date: "Dec 2025 • Guides",
        excerpt:
          "A quick guide for picking frame sizes, mounts, and orientations for your wall space.",
        imageUrl:
          "https://images.unsplash.com/photo-1493666438817-866a91353ca9?w=1600&q=80&auto=format&fit=crop",
      },
      {
        title: "Canvas vs poster: what’s best for you?",
        date: "Dec 2025 • Comparison",
        excerpt:
          "We break down durability, finish, and style to help you choose confidently.",
        imageUrl:
          "https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=1600&q=80&auto=format&fit=crop",
      },
      {
        title: "How we pack frames for safe delivery",
        date: "Dec 2025 • Shipping",
        excerpt:
          "Behind the scenes: corner protection, wrap layers, and courier handling tips.",
        imageUrl:
          "https://images.unsplash.com/photo-1607082350899-7e105aa886ae?w=1600&q=80&auto=format&fit=crop",
      },
    ],
    []
  );

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* <Topbar />
      <Header nav={nav} /> */}

      <Hero promos={promos} />

      <AboutSection />
      <FeaturedProducts products={products} />

      <Testimonials testimonials={testimonials} />
      <BlogPreview blogs={blogs} />

      <Newsletter />
      <Footer />
    </div>
  );
}
