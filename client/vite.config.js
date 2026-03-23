import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import mongoose from "mongoose";

export default defineConfig(async () => {
    const fetchFullProductData = async () => {
        const MONGODB_URI = "mongodb://mongo:bsuJNsALhobbvwKMyYUpDAqjBLKmIVmm@mongodb.railway.internal:27017";
        try {
            console.log("📡 [Lavender Prime] Đang kết nối MongoDB nội bộ...");
            await mongoose.connect(MONGODB_URI, { dbName: 'test' }); 
            const Product = mongoose.connection.collection('products');
            
            // Lấy TẤT CẢ dữ liệu để phục vụ việc render HTML tĩnh
            const products = await Product.find({}).toArray();
            await mongoose.disconnect();

            // Chuyển đổi dữ liệu sang dạng Route có kèm dữ liệu tranh
            const dynamicRoutes = products.map(p => ({
                route: `/editor/${p._id.toString()}`,
                data: p // Bơm dữ liệu bức tranh vào đây
            }));

            console.log(`✅ [Lavender Prime] Đã sẵn sàng đúc ${dynamicRoutes.length} file HTML SEO.`);
            return dynamicRoutes;
        } catch (err) {
            console.error("❌ [Lavender Prime] Lỗi kết nối:", err);
            return [];
        }
    };

    const productRoutes = await fetchFullProductData();

    return {
        plugins: [react(), tailwindcss()],
        ssgOptions: {
            script: 'async',
            formatting: 'minify',
            async includedRoutes(paths) {
                // Chỉ lấy phần 'route' để tạo danh sách file .html
                const staticPaths = ['/editor/multiple-prints'];
                const dynamicPaths = productRoutes.map(r => r.route);
                return [...paths, ...staticPaths, ...dynamicPaths];
            },
            // Ma thuật ở đây: Truyền dữ liệu vào từng trang khi render
            onBeforePageRender(route, indexHtml, appCtx) {
                const found = productRoutes.find(r => r.route === route);
                if (found) {
                    // Bơm dữ liệu vào biến toàn cục để React "nhặt" được ngay
                    return indexHtml.replace(
                        '<head>',
                        `<head><script>window.__INITIAL_DATA__ = ${JSON.stringify(found.data)}</script>`
                    );
                }
                return indexHtml;
            }
        }
    };
});
