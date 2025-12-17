import React, { useState } from 'react';
import { AlertTriangle, X, Check, Lock } from 'lucide-react';

const ConfirmModal = ({ isOpen, onClose, onConfirm }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (password === 'admin') {
      onConfirm(); // Mật khẩu đúng -> Gọi hàm xóa
      setPassword(''); // Reset
      setError('');
    } else {
      setError('Mật khẩu không chính xác!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Lớp phủ mờ phía sau */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>

      {/* Hộp thoại chính */}
      <div className="relative bg-[#1C1E26] border border-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6 transform transition-all animate-fade-in-up">
        
        {/* Nút tắt */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        {/* Nội dung */}
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="text-red-500" size={24} />
          </div>
          
          <h3 className="text-xl font-bold text-white mb-2">Xác nhận xóa dữ liệu</h3>
          <p className="text-gray-400 text-sm mb-6">
            Hành động này sẽ xóa toàn bộ dữ liệu trong hệ thống và <span className="text-red-400 font-bold">không thể khôi phục</span>. 
            <br/>Vui lòng nhập mật khẩu quản trị để tiếp tục.
          </p>

          {/* Ô nhập mật khẩu */}
          <div className="w-full relative mb-4">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="password" 
              className="w-full bg-[#0F1115] border border-gray-700 text-white text-sm rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:border-red-500 transition-colors"
              placeholder="Nhập mật khẩu..."
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              autoFocus
            />
          </div>

          {error && (
            <p className="text-red-500 text-xs font-medium mb-4 bg-red-500/10 px-3 py-1 rounded border border-red-500/20">
              {error}
            </p>
          )}

          {/* Nút hành động */}
          <div className="flex gap-3 w-full mt-2">
            <button 
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm font-medium transition-colors"
            >
              Hủy bỏ
            </button>
            <button 
              onClick={handleSubmit}
              className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-bold shadow-lg shadow-red-900/20 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Check size={16} /> Xác nhận Xóa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;