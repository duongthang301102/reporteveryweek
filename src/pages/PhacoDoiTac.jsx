import React from 'react';
import ProductCard from '../components/ProductCard';
import { Package, Users, TrendingUp, TrendingDown, Handshake, Orbit } from 'lucide-react';

const PhacoDoiTac = ({ data, formatCurrency }) => {
  const GrowthBadge = ({ value }) => {
    if (value === null || value === undefined) return null;
    const isPositive = value >= 0;
    return (
        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] md:text-xs font-medium border ${isPositive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
            {isPositive ? <TrendingUp size={12} strokeWidth={2.5} /> : <TrendingDown size={12} strokeWidth={2.5} />} 
            {Math.abs(Number(value).toFixed(1))}%
        </span>
    );
  };

  // [FIX] Lấy trực tiếp data
  const summaryData = data; 
  if (!summaryData || summaryData.totalRevenue === undefined) {
      return <div className="text-gray-500 p-8 text-center italic">Đang tải hoặc chưa có dữ liệu...</div>;
  }

  return (
    <div className="animate-fade-in">
      <div className="bg-gradient-to-r from-indigo-900 to-[#1C1E26] p-6 rounded-2xl border border-indigo-800/50 mb-8 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10"><Handshake size={120} /></div>
        <div className="relative z-10">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-1 flex items-center gap-3">
             <span className="bg-indigo-500/20 p-2 rounded-lg text-indigo-400"><Orbit size={24} /></span>
             Phaco - Đối Tác
          </h2>
          <p className="text-indigo-200/70 text-sm mb-6 font-medium uppercase tracking-wider">Tổng Doanh Thu</p>
          
          <div className="flex items-end gap-3">
            <h3 className="text-3xl md:text-5xl font-bold text-white tracking-tight drop-shadow-md">
                {formatCurrency(summaryData.totalRevenue)}
            </h3>
            {summaryData.percent !== null && <div className="mb-2"><GrowthBadge value={summaryData.percent} /></div>}
          </div>
          <div className="flex items-center mt-2 text-xs md:text-sm text-gray-400 font-medium">
            {summaryData.compareRevenue !== null 
                ? (<span>So với kỳ trước: <span className="text-gray-300">{formatCurrency(summaryData.compareRevenue)}</span></span>)
                : <span className="italic opacity-50">Không có dữ liệu so sánh</span>
            }
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <ProductCard 
              title="Gói Cơ bản" subtitle="Đối Tác" icon={Package} badge="TIÊU CHUẨN" color="indigo"
              count={summaryData.basic?.sales || 0}
              val1={summaryData.basic?.insRev || 0} label1="Doanh thu Bảo hiểm"
              val2={summaryData.basic?.patRev || 0} label2="Doanh thu Bệnh nhân"
              details={summaryData.basic?.details || []} formatCurrency={formatCurrency}
          />
          <ProductCard 
              title="Gói Cao cấp" subtitle="Đối Tác" icon={Users} badge="CAO CẤP" color="purple"
              count={summaryData.premium?.sales || 0}
              val1={summaryData.premium?.insRev || 0} label1="Doanh thu Bảo hiểm"
              val2={summaryData.premium?.patRev || 0} label2="Doanh thu Bệnh nhân"
              details={summaryData.premium?.details || []} formatCurrency={formatCurrency}
          />
      </div>
    </div>
  );
};
export default PhacoDoiTac;