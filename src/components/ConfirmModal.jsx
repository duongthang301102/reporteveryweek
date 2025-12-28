import React, { useState, useEffect } from 'react';
import { Trash2, X, AlertTriangle, Lock, ArrowRight, ShieldAlert } from 'lucide-react';

const ConfirmModal = ({ isOpen, onClose, onConfirm }) => {
  // --- STATE QUẢN LÝ ---
  const [step, setStep] = useState('auth'); // 'auth' (nhập pass) hoặc 'select' (chọn xóa)
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  // Mật khẩu quy định
  const CORRECT_PASSWORD = "6868"; 

  // Reset trạng thái mỗi khi mở Modal
  useEffect(() => {
    if (isOpen) {
      setStep('auth'); // Luôn bắt đầu ở bước nhập mật khẩu
      setPassword('');
      setError(false);
      setIsShaking(false);
    }
  }, [isOpen]);

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (password === CORRECT_PASSWORD) {
      // Mật khẩu đúng -> Chuyển sang bước chọn dữ liệu
      setStep('select');
    } else {
      // Mật khẩu sai -> Rung lắc
      setError(true);
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 300);
    }
  };

  const deleteOptions = [
    { label: 'Phaco Vãng Lai', type: 'vanglai', color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Phaco Tuyến', type: 'tuyen', color: 'text-green-400', bg: 'bg-green-500/10' },
    { label: 'Combo Dịch vụ', type: 'dichvu', color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: 'Dữ liệu Test', type: 'test', color: 'text-gray-400', bg: 'bg-gray-500/10' },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop mờ */}
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

      {/* MODAL CONTAINER */}
      <div className={`relative bg-[#1C1E26] w-full max-w-sm rounded-2xl border border-gray-700 shadow-2xl overflow-hidden transform transition-all ${isShaking ? 'animate-shake' : ''}`}>
        
        {/* Nút đóng chung */}
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white transition z-10">
            <X size={20} />
        </button>

        {/* --- LOGIC HIỂN THỊ THEO BƯỚC --- */}
        {step === 'auth' ? (
            
            // === BƯỚC 1: NHẬP MẬT KHẨU (GIAO DIỆN HACKER) ===
            <div className="animate-fade-in-up">
                {/* Thanh màu trang trí */}
                <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600"></div>
                
                <div className="p-8 flex flex-col items-center">
                    <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-4 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                        <Lock size={32} className="text-blue-500" />
                    </div>

                    <h3 className="text-xl font-bold text-white mb-1">Xác thực Admin</h3>
                    <p className="text-sm text-gray-400 mb-6 text-center">Nhập mật khẩu để truy cập vùng xóa dữ liệu.</p>

                    <form onSubmit={handlePasswordSubmit} className="w-full">
                        <div className="relative mb-4">
                            <input 
                                type="password" 
                                autoFocus
                                value={password}
                                onChange={(e) => { setPassword(e.target.value); setError(false); }}
                                placeholder="Mật khẩu..."
                                className={`w-full bg-[#0F1115] border ${error ? 'border-red-500 focus:border-red-500' : 'border-gray-700 focus:border-blue-500'} text-white text-center text-lg rounded-xl py-3 px-4 focus:outline-none focus:ring-1 transition-all placeholder:text-gray-600`}
                            />
                            {error && (
                                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none animate-pulse">
                                    <ShieldAlert size={18} className="text-red-500" />
                                </div>
                            )}
                        </div>

                        <button 
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg hover:shadow-blue-500/20 flex items-center justify-center gap-2"
                        >
                            Mở Khóa <ArrowRight size={18} />
                        </button>
                    </form>
                </div>
            </div>

        ) : (

            // === BƯỚC 2: CHỌN DỮ LIỆU ĐỂ XÓA (GIAO DIỆN CŨ CỦA BẠN) ===
            <div className="animate-fade-in-right">
                {/* Header */}
                <div className="p-5 border-b border-gray-800 flex justify-between items-center bg-[#15171e]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                        <Trash2 size={20} className="text-red-500" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">Xóa dữ liệu</h3>
                        <p className="text-xs text-green-400 flex items-center gap-1">● Đã xác thực quyền Admin</p>
                    </div>
                  </div>
                </div>

                {/* Body - List Options */}
                <div className="p-5 space-y-3">
                    {deleteOptions.map((opt) => (
                        <button
                            key={opt.type}
                            onClick={() => onConfirm(opt.type)}
                            className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-700 bg-[#0F1115] hover:bg-[#252830] hover:border-gray-500 transition group"
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${opt.bg}`}>
                                    <div className={`w-2 h-2 rounded-full ${opt.color.replace('text', 'bg')}`}></div>
                                </div>
                                <span className="font-medium text-gray-200 group-hover:text-white">{opt.label}</span>
                            </div>
                            <Trash2 size={16} className="text-gray-500 group-hover:text-red-400" />
                        </button>
                    ))}
                </div>

                {/* Footer - Delete All */}
                <div className="p-5 pt-2 bg-[#15171e]">
                    <button 
                        onClick={() => onConfirm('all')}
                        className="w-full py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 font-bold text-sm hover:bg-red-600 hover:text-white transition flex items-center justify-center gap-2"
                    >
                        <AlertTriangle size={16} /> XÓA TOÀN BỘ DỮ LIỆU
                    </button>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

export default ConfirmModal;