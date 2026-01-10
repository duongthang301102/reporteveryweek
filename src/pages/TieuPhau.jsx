import React from 'react';
import { Construction } from 'lucide-react';

const TieuPhau = () => {
  return (
    <div className="flex flex-col items-center justify-center h-[70vh] animate-fade-in text-center px-4">
      <div className="bg-gray-800/50 p-8 rounded-full mb-6 border border-gray-700 shadow-xl">
        <Construction size={80} className="text-orange-500 animate-pulse" />
      </div>
      <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Tiểu Phẫu</h2>
      <p className="text-gray-400 text-lg max-w-md">
        Trang này đang được xây dựng và cập nhật tính năng. 
        <br/>Vui lòng quay lại sau!
      </p>
    </div>
  );
};

export default TieuPhau;