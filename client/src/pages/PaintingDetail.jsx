import { useHead } from "@unhead/react";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

function PaintingDetail() {
    const { id } = useParams();
    // Lấy dữ liệu đã được "đúc" sẵn trong file HTML lúc Build
    const [product, setProduct] = useState(typeof window !== 'undefined' ? window.__INITIAL_DATA__ : null);

    useEffect(() => {
        // Chỉ fetch nếu chưa có dữ liệu (ví dụ khách click từ trang khác sang)
        if (!product && id) {
            fetch(`https://lavender-prime.up.railway.app/api/products/${id}`)
                .then(res => res.json())
                .then(data => setProduct(data))
                .catch(err => console.error("Lỗi:", err));
        }
    }, [id, product]);

    // SEO tự động cho từng bức tranh
    useHead({
        title: product ? `${product.name} | Lavender Prime Studio` : "Lavender Prime Studio",
        meta: [
            { 
                name: 'description', 
                content: product?.description?.substring(0, 160) || "Tranh in cao cấp Lavender Prime." 
            },
            { property: 'og:title', content: product?.name },
            { property: 'og:image', content: product?.imageUrl },
            { property: 'og:url', content: `https://lavenderprime.studio/editor/${id}` },
            { property: 'og:type', content: 'product' },
        ],
    });

    if (!product) return <div className="p-10 text-center">Đang tải tác phẩm nghệ thuật...</div>;

    return (
        <main className="max-w-7xl mx-auto p-4 luxury-theme">
            <h1 className="text-3xl font-bold text-purple-900 mb-4">{product.name}</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <img 
                    src={product.imageUrl} 
                    alt={product.name} 
                    className="rounded-lg shadow-2xl border-4 border-[#D4AF37]" // Màu Gold Luxury
                />
                <div className="description text-lg text-gray-700 leading-relaxed italic">
                    {product.description}
                </div>
            </div>
        </main>
    );
}

export default PaintingDetail;
