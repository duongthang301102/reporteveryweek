// --- KẾT NỐI FIREBASE ---
import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  getDocs, 
  writeBatch, 
  doc,
  query, // [MỚI] Để tạo câu lệnh lọc
  where  // [MỚI] Để tìm theo điều kiện
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
    const data = querySnapshot.docs.map(doc => {
      const item = doc.data();
      // Chuyển đổi Timestamp về Date
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

// --- 2. LƯU DỮ LIỆU (BATCH WRITE) ---
export const saveTransactions = async (newData) => {
  try {
    const BATCH_SIZE = 450; 
    const chunks = [];
    
    for (let i = 0; i < newData.length; i += BATCH_SIZE) {
        chunks.push(newData.slice(i, i + BATCH_SIZE));
    }

    for (const chunk of chunks) {
        const batch = writeBatch(db);
        chunk.forEach((item) => {
            const docRef = doc(collection(db, COLLECTION_NAME)); 
            // Lưu thêm timestamp để sort nếu cần
            batch.set(docRef, { ...item, _uploadedAt: new Date() });
        });
        await batch.commit(); 
    }
    
    console.log("Đã lưu xong toàn bộ dữ liệu lên Cloud.");
  } catch (error) {
    console.error("Lỗi khi lưu:", error);
    throw error;
  }
};

// --- 3. XÓA TOÀN BỘ DỮ LIỆU (CẨN THẬN) ---
export const clearTransactions = async () => {
  try {
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

// --- 4. [MỚI] XÓA DỮ LIỆU THEO LOẠI (Menu cụ thể) ---
export const clearTransactionsByType = async (type) => {
  try {
    // 1. Tạo Query: Chỉ lấy những dòng có cột 'type' trùng với loại muốn xóa
    const q = query(collection(db, COLLECTION_NAME), where("type", "==", type));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        console.log(`Không có dữ liệu loại '${type}' để xóa.`);
        return;
    }

    // 2. Chia lô để xóa (Batch delete)
    const BATCH_SIZE = 450;
    const docs = querySnapshot.docs;
    const chunks = [];

    for (let i = 0; i < docs.length; i += BATCH_SIZE) {
        chunks.push(docs.slice(i, i + BATCH_SIZE));
    }

    // 3. Thực thi xóa
    for (const chunk of chunks) {
        const batch = writeBatch(db);
        chunk.forEach(doc => {
            batch.delete(doc.ref);
        });
        await batch.commit();
    }
    console.log(`Đã xóa sạch dữ liệu loại: ${type}`);
  } catch (error) {
    console.error(`Lỗi khi xóa loại ${type}:`, error);
    alert(`Có lỗi khi xóa dữ liệu mục ${type}!`);
    throw error;
  }
};