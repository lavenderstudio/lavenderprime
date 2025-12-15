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

export default function App() {
  return (
    <Routes>
        {/* Redirect home to print portrait for now */}
        <Route path="/" element={<Navigate to="/products" replace />} />

        {/* Print landing */}
        <Route path="/products" element={<ProductsPage />} />

        {/* Editor Print And Frame */}
        <Route path="/editor/print-frame" element={<EditorPrintPortrait />} />
        
        {/* Editor Print */}
        <Route path="/editor/print" element={<EditorPrint />} />

        {/* Editor Canvas */}
        <Route path="/editor/canvas" element={<EditorCanvas />} />

        {/* 404 */}
        <Route path="*" element={<div style={{ padding: 24 }}>404 - Not Found</div>} />

        <Route path="/cart" element={<CartPage />} />

        <Route path="/checkout" element={<CheckoutPage />} />

        <Route path="/order/:id" element={<OrderSuccessPage />} />
    </Routes>
  );
}
