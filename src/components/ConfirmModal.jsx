import React from 'react';
import { X, Trash2, AlertTriangle, Database } from 'lucide-react';

const ConfirmModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  // Danh sách các loại dữ liệu có thể xóa
  // Key 'id' phải khớp với logic trong App.jsx và db.js
  const categories = [
    {
      title: "Nhóm Phaco",
      items: [
        { id: 'vanglai', label: 'Phaco Vãng Lai', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
        { id: 'tuyen', label: 'Phaco Tuyến', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
        { id: 'phaco_pkvt', label: 'Phaco PKVT', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
        { id: 'phaco_doitac', label: 'Phaco Đối Tác', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
      ]
    },
    {
      title: "Nhóm Mộng",
      items: [
        { id: 'mong_vanglai', label: 'Mộng Vãng Lai', color: 'bg-teal-500/10 text-teal-400 border-teal-500/20' },
        { id: 'mong_tuyen', label: 'Mộng Tuyến', color: 'bg-teal-500/10 text-teal-400 border-teal-500/20' },
        { id: 'mong_pkvt', label: 'Mộng PKVT', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
        { id: 'mong_doitac', label: 'Mộng Đối Tác', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
      ]
    },
    {
      title: "Khác",
      items: [
        { id: 'khucxa', label: 'Phẫu thuật Khúc Xạ', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
        { id: 'dichvu', label: 'Combo / Dịch vụ', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
        { id: 'test', label: 'Dữ liệu Test', color: 'bg-gray-500/10 text-gray-400 border-gray-500/20' },
      ]
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#1C1E26] w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-800 flex flex-col max-h-[90vh]">
        
        {/* HEADER */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-500/10 rounded-full text-red-500">
              <Trash2 size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Quản lý Dữ liệu</h3>
              <p className="text-sm text-gray-400">Chọn loại dữ liệu bạn muốn xóa để nhập lại</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition">
            <X size={20} />
          </button>
        </div>

        {/* BODY (SCROLLABLE) */}
        <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
          
          {categories.map((group, index) => (
            <div key={index}>
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 ml-1">{group.title}</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {group.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onConfirm(item.id)}
                    className={`flex items-center justify-between p-4 rounded-xl border transition-all hover:brightness-125 active:scale-95 group ${item.color} border-opacity-30 bg-opacity-5`}
                  >
                    <span className="font-semibold">{item.label}</span>
                    <Trash2 size={16} className="opacity-50 group-hover:opacity-100" />
                  </button>
                ))}
              </div>
            </div>
          ))}

        </div>

        {/* FOOTER - NÚT XÓA TẤT CẢ */}
        <div className="p-6 border-t border-gray-800 bg-[#16181D] rounded-b-2xl">
          <button
            onClick={() => onConfirm('all')}
            className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 border border-red-500/50 py-4 rounded-xl font-bold transition-all duration-300 group"
          >
            <AlertTriangle size={20} className="group-hover:animate-bounce" />
            XÓA SẠCH TOÀN BỘ DỮ LIỆU (RESET)
          </button>
          <p className="text-center text-xs text-gray-500 mt-3 italic">
            * Hành động này không thể hoàn tác. Hãy cân nhắc kỹ.
          </p>
        </div>

      </div>
    </div>
  );
};

export default ConfirmModal;