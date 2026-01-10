import React, { useState, useEffect } from 'react';
import { Lock, X, ArrowRight, AlertCircle } from 'lucide-react';

// [SỬA ĐỔI] Thêm prop 'title' vào danh sách nhận
const PasswordModal = ({ isOpen, onClose, onSuccess, title }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isShake, setIsShake] = useState(false);

  // Mật khẩu cứng (Bạn có thể đổi ở đây)
  const ADMIN_PASSWORD = "123"; 

  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setError('');
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      onSuccess();
      onClose();
    } else {
      setError('Mật khẩu không đúng');
      setIsShake(true);
      setTimeout(() => setIsShake(false), 300);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className={`relative bg-[#1C1E26] border border-gray-700 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden transform transition-all ${isShake ? 'animate-shake' : 'animate-fade-in-up'}`}>
        {/* Header Gradient */}
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"></div>

        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors p-1"><X size={18} /></button>

        <div className="p-6 md:p-8">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-14 h-14 rounded-full bg-[#13151A] border border-gray-700 flex items-center justify-center mb-4 shadow-inner">
              <Lock size={24} className="text-blue-500" />
            </div>
            
            {/* [SỬA ĐỔI] Hiển thị tiêu đề động từ prop 'title'. Nếu không truyền thì mặc định là "Xác thực bảo mật" */}
            <h3 className="text-lg font-bold text-white mb-1">
                {title || "Xác thực bảo mật"}
            </h3>
            
            <p className="text-xs text-gray-400">Nhập mật khẩu để tiếp tục.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                className={`w-full bg-[#13151A] border ${error ? 'border-red-500 focus:border-red-500' : 'border-gray-700 focus:border-blue-500'} rounded-xl px-4 py-3 text-white text-center tracking-widest outline-none transition-all placeholder-gray-600 focus:ring-1 focus:ring-blue-500/50`}
                placeholder="Mật khẩu..."
                autoFocus
              />
            </div>

            {error && (
              <div className="flex items-center justify-center gap-1.5 text-red-400 text-xs font-medium animate-fade-in">
                <AlertCircle size={12} /> {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 group"
            >
              Mở Khóa <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PasswordModal;