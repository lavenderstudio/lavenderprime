// client/src/App.jsx
// ----------------------------------------------------
// App routes
// ----------------------------------------------------

import { Routes, Route, Navigate } from "react-router-dom";
import PrintPortrait from "./pages/PrintPortrait.jsx";
import EditorPrintPortrait from "./pages/EditorPrintPortrait.jsx";
import CartPage from "./pages/CartPage.jsx";
import CheckoutPage from "./pages/CheckoutPage.jsx";
import OrderSuccessPage from "./pages/OrderSuccessPage.jsx";

export default function App() {
  return (
    <Routes>
        {/* Redirect home to print portrait for now */}
        <Route path="/" element={<Navigate to="/print/portrait" replace />} />

        {/* Print landing */}
        <Route path="/print/portrait" element={<PrintPortrait />} />

        {/* Editor */}
        <Route path="/editor/print/portrait" element={<EditorPrintPortrait />} />

        {/* 404 */}
        <Route path="*" element={<div style={{ padding: 24 }}>404 - Not Found</div>} />

        <Route path="/cart" element={<CartPage />} />

        <Route path="/checkout" element={<CheckoutPage />} />

        <Route path="/order/:id" element={<OrderSuccessPage />} />
    </Routes>
  );
}
