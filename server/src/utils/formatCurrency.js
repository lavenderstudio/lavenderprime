export const formatVND = (amount) => {
    if (!amount) return "0" + "₫";
    // Logic: Làm tròn đến hàng nghìn gần nhất (1.234.567 -> 1.235.000)
    const rounded = Math.round(amount / 1000) * 1000;
    
    // Định dạng số có dấu chấm phân cách
    const formattedNumber = new Intl.NumberFormat('vi-VN').format(rounded);
    
    // Trả về chuỗi kèm ký hiệu đ viết cao (Dùng HTML/CSS để hiển thị đẹp hơn)
    return formattedNumber; 
};
