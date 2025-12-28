import React, { useState, useEffect } from 'react';
import { Lock, X, ArrowRight, ShieldAlert } from 'lucide-react';

const PasswordModal = ({ isOpen, onClose, onSuccess, title = "Xác thực quyền Admin" }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  // MẬT KHẨU QUY ĐỊNH
  const CORRECT_PASSWORD = "6868"; 

  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setError(false);
      setIsShaking(false);
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === CORRECT_PASSWORD) {
      onSuccess(); // Gọi hàm thành công
      onClose();   // Đóng modal
    } else {
      setError(true);
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 300);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

      <div className={`relative bg-[#1C1E26] w-full max-w-sm rounded-2xl border border-gray-700 shadow-2xl overflow-hidden transform transition-all ${isShaking ? 'animate-shake' : ''}`}>
        
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600"></div>

        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white transition z-10">
            <X size={20} />
        </button>

        <div className="p-8 flex flex-col items-center">
            <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-4 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                <Lock size={32} className="text-blue-500" />
            </div>

            <h3 className="text-xl font-bold text-white mb-1">{title}</h3>
            <p className="text-sm text-gray-400 mb-6 text-center">Nhập mật khẩu để tiếp tục.</p>

            <form onSubmit={handleSubmit} className="w-full">
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
    </div>
  );
};

export default PasswordModal;