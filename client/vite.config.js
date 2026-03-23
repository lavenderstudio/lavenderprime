import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import mongoose from "mongoose";

export default defineConfig(async () => {
    const fetchProductRoutes = async () => {
        const MONGODB_URI = "mongodb://mongo:bsuJNsALhobbvwKMyYUpDAqjBLKmIVmm@mongodb.railway.internal:27017";
        
        try {
            console.log("📡 [Lavender Prime] Kết nối MongoDB lấy danh sách Editor SEO...");
            await mongoose.connect(MONGODB_URI, { dbName: 'test' }); 
            
            const Product = mongoose.connection.collection('products');
            const products = await Product.find({}, { projection: { _id: 1 } }).toArray();
            
            await mongoose.disconnect();
            
            // ✅ ĐÃ SỬA: Khớp với cấu trúc /editor/ của bạn
            // Nếu các trang sản phẩm của bạn có dạng /editor/[ID], hãy dùng dòng này:
            const routes = products.map(p => `/editor/${p._id.toString()}`);
            
            // Bổ sung các trang tĩnh quan trọng khác của bạn
            const staticRoutes = ['/editor/multiple-prints']; 
            
            console.log(`✅ [Lavender Prime] Đã sẵn sàng tạo ${routes.length} trang Editor tĩnh.`);
            return [...staticRoutes, ...routes];
        } catch (err) {
            console.error("❌ [Lavender Prime] Lỗi:", err);
            return ['/editor/multiple-prints'];
        }
    };

    const dynamicRoutes = await fetchProductRoutes();

    return {
        plugins: [react(), tailwindcss()],
        ssgOptions: {
            script: 'async',
            formatting: 'minify',
            async includedRoutes(paths) {
                return [...paths, ...dynamicRoutes];
            }
        }
    };
});
