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


export default function App() {
  return (
    <>
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
      </Routes>
      <Footer />
    </>
  );
}