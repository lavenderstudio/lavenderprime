import { lazy, Suspense, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { HelmetProvider, Helmet } from "react-helmet-async";

import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";
import RequireAuth from "./components/RequireAuth.jsx";
import GuestRoute from "./components/GuestRoute.jsx";
import RequireRole from "./components/auth/RequireRole.jsx";
import PageLoader from "./components/PageLoader.jsx";
import SplashScreen from "./components/SplashScreen.jsx";
import { usePageTracker } from "./lib/usePageTracker.js";

// ── Lazy page imports ─────────────────────────────────────────────────────────
const HomePage               = lazy(() => import("./pages/HomePage.jsx"));
const ProductsPage           = lazy(() => import("./pages/ProductsPage.jsx"));
const CartPage               = lazy(() => import("./pages/CartPage.jsx"));
const CheckoutPage           = lazy(() => import("./pages/CheckoutPage.jsx"));
const OrderSuccessPage       = lazy(() => import("./pages/OrderSuccessPage.jsx"));
const UserOrdersPage         = lazy(() => import("./pages/UserOrdersPage.jsx"));
const AccountPage            = lazy(() => import("./pages/AccountPage.jsx"));
const ContactPage            = lazy(() => import("./pages/ContactPage.jsx"));
const AboutPage              = lazy(() => import("./pages/AboutPage.jsx"));
const Delivery               = lazy(() => import("./pages/Delivery.jsx"));

const LoginPage              = lazy(() => import("./pages/Login.jsx"));
const SignupPage             = lazy(() => import("./pages/Signup.jsx"));
const ForgotPasswordPage     = lazy(() => import("./pages/ForgotPasswordPage.jsx"));
const ResetPasswordPage      = lazy(() => import("./pages/ResetPasswordPage.jsx"));

const EditorPrintPortrait    = lazy(() => import("./pages/EditorPrint&Frame.jsx"));
const EditorPrint            = lazy(() => import("./pages/EditorPrint.jsx"));
const EditorCanvas           = lazy(() => import("./pages/EditorCanvas.jsx"));
const EditorMiniFrame        = lazy(() => import("./pages/EditorMiniFrame.jsx"));
const EditorCollage          = lazy(() => import("./pages/EditorCollage.jsx"));
const EditorWeddingFrame     = lazy(() => import("./pages/EditorWeddingFrame.jsx"));
const EditorWeddingPrint     = lazy(() => import("./pages/EditorWeddingPrint.jsx"));
const EditorFineArtPrint     = lazy(() => import("./pages/EditorFineArtPrint.jsx"));
const EditorMultiplePrints   = lazy(() => import("./pages/EditorMultiplePrints.jsx"));

const BlogListPage           = lazy(() => import("./pages/BlogListPage.jsx"));
const BlogPostPage           = lazy(() => import("./pages/BlogPostPage.jsx"));

const AdminOrdersPage        = lazy(() => import("./pages/AdminOrdersPage.jsx"));
const AdminBlogsPage         = lazy(() => import("./pages/AdminBlogsPage.jsx"));
const AdminBlogEditorPage    = lazy(() => import("./pages/AdminBlogEditorPage.jsx"));
const AdminPricingPage       = lazy(() => import("./pages/AdminPricingPage.jsx"));
const AdminDashboardPage     = lazy(() => import("./pages/AdminDashboardPage.jsx"));

function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <img src="/logo.png" alt="Lavender Prime" className="h-24 w-auto object-contain" />
      <p className="text-7xl font-extrabold text-slate-200">404</p>
      <p className="text-lg font-bold text-slate-700">Page Not Found</p>
      <a href="/" className="text-sm font-semibold text-purple-600 hover:underline">← Back To Home</a>
    </div>
  );
}

export default function App() {
  usePageTracker();
  const location = useLocation();

  return (
    <HelmetProvider>
      <SplashScreen />
      <ScrollToTop />
      <Navbar />

      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public */}
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/delivery" element={<Delivery />} />
          <Route path="/order/:id" element={<OrderSuccessPage />} />
          <Route path="/orders" element={<UserOrdersPage />} />

          {/* Auth */}
          <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
          <Route path="/signup" element={<GuestRoute><SignupPage /></GuestRoute>} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Protected */}
          <Route path="/account" element={<RequireAuth><AccountPage /></RequireAuth>} />
          <Route path="/checkout" element={<RequireAuth><CheckoutPage /></RequireAuth>} />

          {/* Editors - Có thể tùy biến SEO cho từng loại Editor nếu cần */}
          <Route path="/editor/print-frame" element={<EditorPrintPortrait />} />
          <Route path="/editor/print" element={<EditorPrint />} />
          <Route path="/editor/canvas" element={<EditorCanvas />} />
          <Route path="/editor/mini-frames" element={<EditorMiniFrame />} />
          <Route path="/editor/collage-frame" element={<EditorCollage />} />
          <Route path="/editor/wedding-frame" element={<EditorWeddingFrame />} />
          <Route path="/editor/wedding-print" element={<EditorWeddingPrint />} />
          <Route path="/editor/fine-art-print" element={<EditorFineArtPrint />} />
          <Route path="/editor/multiple-prints" element={<EditorMultiplePrints />} />

          {/* Blog */}
          <Route path="/blog" element={<BlogListPage />} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />

          {/* Admin */}
          <Route path="/admin" element={<AdminOrdersPage />} />
          <Route path="/admin/dashboard" element={<RequireRole roles={["admin"]}><AdminDashboardPage /></RequireRole>} />
          <Route path="/admin/blogs" element={<RequireRole roles={["admin", "manager"]}><AdminBlogsPage /></RequireRole>} />
          <Route path="/admin/blogs/new" element={<RequireRole roles={["admin", "manager"]}><AdminBlogEditorPage mode="create" /></RequireRole>} />
          <Route path="/admin/blogs/:id/edit" element={<RequireRole roles={["admin", "manager"]}><AdminBlogEditorPage mode="edit" /></RequireRole>} />
          <Route path="/admin/pricing" element={<RequireRole roles={["admin", "manager"]}><AdminPricingPage /></RequireRole>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>

      <Footer />
    </HelmetProvider>
  );
}
