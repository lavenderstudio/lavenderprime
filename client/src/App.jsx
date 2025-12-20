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
import RequireAuth from "./components/RequireAuth.jsx";
import Navbar from "./components/Navbar.jsx";

export default function App() {
  return (
    <>
      <Navbar />   {/* 👈 always visible */}
      <Routes>
        <Route path="/" element={<Navigate to="/products" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
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
        <Route path="/order/success" element={<OrderSuccessPage />} />
        <Route path="/orders" element={<UserOrdersPage />} />
        <Route path="/admin" element={<AdminOrdersPage />} />
        <Route path="*" element={<div>404</div>} />
      </Routes>
    </>
  );
}