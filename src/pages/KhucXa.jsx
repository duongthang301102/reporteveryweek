import React from 'react';
import { Glasses, TrendingUp, TrendingDown, Layers } from 'lucide-react';

const KhucXa = ({ data, formatCurrency }) => {
  // 1. Kiểm tra dữ liệu an toàn
  const summary = data?.summary || { totalRevenue: 0, compareRevenue: 0, percent: 0, label: '' };
  
  // 2. Gộp tất cả chi tiết từ 2 nhóm (nếu có) thành 1 danh sách duy nhất
  const basicDetails = data?.packages?.basic?.details || [];
  const premiumDetails = data?.packages?.premium?.details || [];
  
  // Gộp lại và sắp xếp theo số lượng giảm dần
  const allServices = [...basicDetails, ...premiumDetails].sort((a, b) => b.qty - a.qty);

  return (
    <div className="animate-fade-in">
      {/* --- PHẦN 1: TỔNG QUAN (HEADER CARD) --- */}
      <div className="bg-gradient-to-r from-rose-900 to-[#1C1E26] p-6 rounded-2xl border border-rose-800/50 mb-8 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10"><Glasses size={120} /></div>
        <div className="relative z-10">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-1 flex items-center gap-3">
             <span className="bg-rose-500/20 p-2 rounded-lg text-rose-400"><Glasses size={24} /></span>
             Phẫu Thuật Khúc Xạ
          </h2>
          <p className="text-rose-200/70 text-sm mb-6 font-medium uppercase tracking-wider">{summary.label}</p>
          
          <div className="flex items-end gap-3">
            <h3 className="text-3xl md:text-5xl font-bold text-white tracking-tight drop-shadow-md">
              {formatCurrency(summary.totalRevenue)}
            </h3>
            {summary.percent !== null && (
              <div className={`flex items-center gap-1 text-sm font-bold mb-2 px-2 py-1 rounded-md ${summary.percent >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                {summary.percent >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                {Math.abs(summary.percent).toFixed(1)}%
              </div>
            )}
          </div>
          <p className="text-gray-400 text-xs mt-2 font-medium">So với kỳ trước: <span className="text-gray-300">{formatCurrency(summary.compareRevenue || 0)}</span></p>
        </div>
      </div>

      {/* --- PHẦN 2: DANH SÁCH CHI TIẾT (KHÔNG CHIA CẤP) --- */}
      <div className="bg-[#1C1E26] border border-gray-800 rounded-xl p-6 shadow-md">
        <div className="flex items-center gap-2 mb-4 border-b border-gray-800 pb-2">
            <Layers className="text-rose-400" size={20} />
            <h3 className="text-lg font-bold text-white uppercase tracking-wide">Chi tiết các gói phẫu thuật</h3>
        </div>

        {allServices.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allServices.map((item, index) => (
                    <div key={index} className="flex items-center justify-between bg-[#252830] p-4 rounded-lg border border-gray-700 hover:border-rose-500/50 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-400 font-bold text-xs">
                                {index + 1}
                            </div>
                            <span className="font-medium text-gray-200 text-sm">{item.name}</span>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-xl font-bold text-white">{item.qty}</span>
                            <span className="text-[10px] text-gray-500 uppercase">Ca</span>
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            <div className="text-center py-8 text-gray-500 italic">
                Chưa có dữ liệu phẫu thuật khúc xạ trong khoảng thời gian này.
            </div>
        )}
      </div>
    </div>
  );
};

export default KhucXa;