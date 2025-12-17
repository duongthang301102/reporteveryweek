// --- KẾT NỐI FIREBASE ---
import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  getDocs, 
  writeBatch, 
  doc 
} from "firebase/firestore";

// Cấu hình từ dự án của bạn
const firebaseConfig = {
  apiKey: "AIzaSyBKcQfgS9MNQfU9UYhP8oxBofbgF30PYLU",
  authDomain: "reporteveryweek.firebaseapp.com",
  projectId: "reporteveryweek",
  storageBucket: "reporteveryweek.firebasestorage.app",
  messagingSenderId: "628679346122",
  appId: "1:628679346122:web:e3d7c381b6f7cbd3757133",
  measurementId: "G-960Z6P3V1F"
};

// Khởi tạo
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const COLLECTION_NAME = "transactions"; // Tên bảng dữ liệu trên mây

// --- 1. LẤY TOÀN BỘ DỮ LIỆU ---
export const getAllTransactions = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    // Chuyển đổi dữ liệu từ Firestore về dạng Array chuẩn cho App
    const data = querySnapshot.docs.map(doc => {
      const item = doc.data();
      
      // Xử lý chuyển đổi Timestamp của Firestore về Date string nếu cần
      // (Để đảm bảo App đọc được ngày tháng như cũ)
      if (item.createdAt && item.createdAt.toDate) {
         item.createdAt = item.createdAt.toDate();
      }
      return item;
    });
    return data;
  } catch (error) {
    console.error("Lỗi khi tải dữ liệu:", error);
    alert("Lỗi tải dữ liệu từ Server! Kiểm tra kết nối mạng.");
    return [];
  }
};

// --- 2. LƯU DỮ LIỆU (BATCH WRITE - Tối ưu tốc độ) ---
export const saveTransactions = async (newData) => {
  try {
    // Firestore chỉ cho phép ghi tối đa 500 dòng/lần (batch)
    // Nên ta phải chia nhỏ dữ liệu ra nếu file Excel quá lớn
    const BATCH_SIZE = 450; 
    const chunks = [];
    
    for (let i = 0; i < newData.length; i += BATCH_SIZE) {
        chunks.push(newData.slice(i, i + BATCH_SIZE));
    }

    // Duyệt qua từng gói và đẩy lên
    for (const chunk of chunks) {
        const batch = writeBatch(db);
        chunk.forEach((item) => {
            // Tạo ID ngẫu nhiên cho từng dòng
            const docRef = doc(collection(db, COLLECTION_NAME)); 
            // Thêm timestamp để biết ngày tạo (tùy chọn)
            batch.set(docRef, { ...item, _uploadedAt: new Date() });
        });
        await batch.commit(); // Gửi gói lên mây
    }
    
    console.log("Đã lưu xong toàn bộ dữ liệu lên Cloud.");
  } catch (error) {
    console.error("Lỗi khi lưu:", error);
    throw error;
  }
};

// --- 3. XÓA TOÀN BỘ DỮ LIỆU ---
export const clearTransactions = async () => {
  try {
    // Firestore không có lệnh "Xóa tất cả", ta phải lấy hết về rồi xóa từng gói
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    
    const BATCH_SIZE = 450;
    const docs = querySnapshot.docs;
    const chunks = [];

    for (let i = 0; i < docs.length; i += BATCH_SIZE) {
        chunks.push(docs.slice(i, i + BATCH_SIZE));
    }

    for (const chunk of chunks) {
        const batch = writeBatch(db);
        chunk.forEach(doc => {
            batch.delete(doc.ref);
        });
        await batch.commit();
    }
    console.log("Đã xóa sạch dữ liệu trên Cloud.");
  } catch (error) {
    console.error("Lỗi khi xóa:", error);
    alert("Có lỗi khi xóa dữ liệu!");
  }
};