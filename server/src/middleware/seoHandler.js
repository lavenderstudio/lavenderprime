import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const seoHandler = async (req, res, next) => {
    // Chỉ xử lý các link Editor hoặc Blog để tránh làm chậm các API khác
    const isEditorPath = req.path.startsWith('/editor/');
    const isBlogPath = req.path.startsWith('/blog/');

    if (!isEditorPath && !isBlogPath) return next();

    // Đường dẫn tới file index.html đã build của Frontend
    const indexPath = path.resolve(__dirname, '../../../client/dist/index.html');

    if (!fs.existsSync(indexPath)) {
        return next(); // Nếu chưa build frontend thì bỏ qua
    }

    try {
        let title = "Lavender Prime Studio";
        let description = "In nghệ thuật chuyên biệt cho căn hộ hiện đại.";
        let image = "https://lavenderprime.studio/default-thumbnail.jpg";
        let slugOrId = req.params.id || req.path.split('/').pop();

        // 1. TRUY VẤN NHANH: Chỉ lấy các trường cần cho SEO
        if (isEditorPath) {
            const Product = mongoose.connection.collection('products');
            const product = await Product.findOne(
                { _id: new mongoose.Types.ObjectId(slugOrId) },
                { projection: { name: 1, imageUrl: 1, description: 1 } }
            );
            if (product) {
                title = `${product.name} | Lavender Prime`;
                image = product.imageUrl;
                description = product.description?.substring(0, 160);
            }
        } else if (isBlogPath) {
            const Blog = mongoose.connection.collection('blogs');
            const blog = await Blog.findOne(
                { slug: slugOrId },
                { projection: { title: 1, thumbnail: 1, summary: 1 } }
            );
            if (blog) {
                title = blog.title;
                image = blog.thumbnail;
                description = blog.summary;
            }
        }

        // 2. NHỒI DỮ LIỆU: Thay thế các biến chờ trong index.html
        let html = fs.readFileSync(indexPath, 'utf8');
        html = html
            .replace(/__TITLE__/g, title)
            .replace(/__OG_TITLE__/g, title)
            .replace(/__OG_IMAGE__/g, image)
            .replace(/__DESCRIPTION__/g, description)
            .replace(/__OG_DESCRIPTION__/g, description);

        // 3. TRẢ VỀ HTML ĐÃ NHỒI
        res.send(html);

    } catch (error) {
        console.error("SEO Injection Error:", error);
        res.sendFile(indexPath); // Lỗi thì trả file gốc, app vẫn chạy bình thường
    }
};
