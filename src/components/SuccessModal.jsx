import React from 'react';
import { CheckCircle2, X } from 'lucide-react';

const SuccessModal = ({ isOpen, onClose, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      {/* Backdrop mờ */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity animate-fade-in" 
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-[#1C1E26] w-full max-w-sm rounded-2xl border border-green-500/30 shadow-[0_0_30px_rgba(34,197,94,0.2)] overflow-hidden transform transition-all animate-scale-up">
        
        {/* Nút đóng */}
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white transition z-10">
            <X size={20} />
        </button>

        <div className="p-8 flex flex-col items-center text-center">
            {/* Icon Check hoạt hình */}
            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-6 border border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.2)] animate-pulse-slow">
                <CheckCircle2 size={40} className="text-green-500" />
            </div>

            <h3 className="text-2xl font-bold text-white mb-2">Thành công!</h3>
            <p className="text-gray-400 mb-8 leading-relaxed">{message}</p>

            <button 
                onClick={onClose}
                className="w-full bg-green-600 hover:bg-green-500 active:bg-green-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg hover:shadow-green-500/20 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-[#1C1E26]"
            >
                Tuyệt vời
            </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;