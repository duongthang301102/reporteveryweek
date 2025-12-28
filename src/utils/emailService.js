import emailjs from '@emailjs/browser';

// --- THAY 3 DÒNG NÀY BẰNG MÃ CỦA ANH ---
const SERVICE_ID = 'service_tkqq7v8'; // Thay bằng Service ID của anh
const TEMPLATE_ID = 'template_yzdo93t'; // Thay bằng Template ID của anh
const PUBLIC_KEY = 'Fv8pkIqMpvDK_2LSw'; // Thay bằng Public Key của anh

export const sendEmailReport = async (data) => {
  try {
    const templateParams = {
      // 1. Thông tin chung
      date_range: data.dateRange || new Date().toLocaleDateString('vi-VN'),
      total_all: data.totalAll ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(data.totalAll) : '0 đ',

      // 2. Vãng lai
      vl_revenue: data.vanglai?.totalRevenue ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(data.vanglai.totalRevenue) : '0 đ',
      vl_count: (data.vanglai?.basic?.sales || 0) + (data.vanglai?.premium?.sales || 0),
      
      // 3. Tuyến
      tuyen_revenue: data.tuyen?.totalRevenue ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(data.tuyen.totalRevenue) : '0 đ',
      tuyen_count: (data.tuyen?.basic?.sales || 0) + (data.tuyen?.premium?.sales || 0),

      // 4. Dịch vụ
      dv_revenue: data.dichvu?.totalRevenue ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(data.dichvu.totalRevenue) : '0 đ',
    };

    const response = await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
    return { success: true };
  } catch (error) {
    console.error('Lỗi gửi mail:', error);
    return { success: false, error };
  }
};