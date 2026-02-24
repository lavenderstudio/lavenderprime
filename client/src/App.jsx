// client/src/App.jsx
// ----------------------------------------------------
// App routes
// ----------------------------------------------------

import { Routes, Route, Navigate } from "react-router-dom";
import ProductsPage from "./pages/ProductsPage.jsx";
import EditorPrintPortrait from "./pages/EditorPrint&Frame.jsx";
import EditorPrint from "./pages/EditorPrint.jsx";
import EditorCanvas from "./pages/EditorCanvas.jsx";
import CartPage from "./pages/CartPage.jsx";
import CheckoutPage from "./pages/CheckoutPage.jsx";
import OrderSuccessPage from "./pages/OrderSuccessPage.jsx";
import AdminOrdersPage from "./pages/AdminOrdersPage.jsx";
import LoginPage from "./pages/Login.jsx";
import SignupPage from "./pages/Signup.jsx";
import UserOrdersPage from "./pages/UserOrdersPage.jsx";
import AccountPage from "./pages/AccountPage.jsx";
import HomePage from "./pages/HomePage.jsx";
import ContactPage from "./pages/ContactPage.jsx";
import AboutPage from "./pages/AboutPage.jsx";
import Delivery from "./pages/Delivery.jsx";
import RequireAuth from "./components/RequireAuth.jsx";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import GuestRoute from "./components/GuestRoute.jsx";
import EditorMiniFrame from "./pages/EditorMiniFrame.jsx";
import EditorCollage from "./pages/EditorCollage.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";
import EditorWeddingFrame from "./pages/EditorWeddingFrame.jsx";
import EditorWeddingPrint from "./pages/EditorWeddingPrint.jsx";
import EditorFineArtPrint from "./pages/EditorFineArtPrint.jsx";
import EditorMultiplePrints from "./pages/EditorMultiplePrints.jsx";
import BlogListPage from "./pages/BlogListPage.jsx";
import BlogPostPage from "./pages/BlogPostPage.jsx";
import AdminBlogsPage from "./pages/AdminBlogsPage.jsx";
import AdminBlogEditorPage from "./pages/AdminBlogEditorPage.jsx";
import RequireRole from "./components/auth/RequireRole.jsx";
import ForgotPasswordPage from "./pages/ForgotPasswordPage.jsx";
import ResetPasswordPage from "./pages/ResetPasswordPage.jsx";
import AdminPricingPage from "./pages/AdminPricingPage.jsx";


export default function App() {
  return (
    <>
      <ScrollToTop />
      <Navbar />   {/* 👈 always visible */}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/login"
          element={
            <GuestRoute>
              <LoginPage />
            </GuestRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <GuestRoute>
              <SignupPage />
            </GuestRoute>
          }
        />
        <Route
          path="/account"
          element={
            <RequireAuth>
              <AccountPage />
            </RequireAuth>
          }
        />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/editor/print-frame" element={<EditorPrintPortrait />} />
        <Route path="/editor/print" element={<EditorPrint />} />
        <Route path="/editor/canvas" element={<EditorCanvas />} />
        <Route path="/editor/mini-frames" element={<EditorMiniFrame />} />
        <Route path="/editor/collage-frame" element={<EditorCollage />} />
        <Route path="/editor/wedding-frame" element={<EditorWeddingFrame />} />
        <Route path="/editor/wedding-print" element={<EditorWeddingPrint />} />
        <Route path="/editor/fine-art-print" element={<EditorFineArtPrint />} />
        <Route path="/editor/multiple-prints" element={<EditorMultiplePrints />} />
        <Route
          path="/checkout"
          element={
            <RequireAuth>
              <CheckoutPage />
            </RequireAuth>
          }
        />
        <Route path="/order/:id" element={<OrderSuccessPage />} />
        <Route path="/orders" element={<UserOrdersPage />} />
        <Route path="/admin" element={<AdminOrdersPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="*" element={<div>404</div>} />
        <Route path="/delivery" element={<Delivery />} />

        {/* Public */}
        <Route path="/blog" element={<BlogListPage />} />
        <Route path="/blog/:slug" element={<BlogPostPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Admin/Manager */}
        <Route
          path="/admin/blogs"
          element={
            <RequireRole roles={["admin", "manager"]}>
              <AdminBlogsPage />
            </RequireRole>
          }
        />
        <Route
          path="/admin/blogs/new"
          element={
            <RequireRole roles={["admin", "manager"]}>
              <AdminBlogEditorPage mode="create" />
            </RequireRole>
          }
        />
        <Route
          path="/admin/blogs/:id/edit"
          element={
            <RequireRole roles={["admin", "manager"]}>
              <AdminBlogEditorPage mode="edit" />
            </RequireRole>
          }
        />
        <Route
          path="/admin/pricing"
          element={
            <RequireRole roles={["admin", "manager"]}>
              <AdminPricingPage />
            </RequireRole>
          }
        />


      </Routes>
      <Footer />
    </>
  );
}