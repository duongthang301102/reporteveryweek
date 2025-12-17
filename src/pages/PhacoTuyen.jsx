import React from 'react';
import ProductCard from '../components/ProductCard';
// 1. IMPORT ICON MỚI
import { Package, Users, TrendingUp, TrendingDown } from 'lucide-react';

const PhacoTuyen = ({ data, formatCurrency }) => {
  // 2. CẬP NHẬT GROWTH BADGE DÙNG ICON
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

  const summaryData = data.phacoTuyen; 
  if (!summaryData) return <div className="text-gray-500 p-4">Đang tải dữ liệu...</div>;

  return (
    <>
      <div className="bg-[#1C1E26] rounded-2xl p-5 md:p-8 mb-4 md:mb-8 relative overflow-hidden border border-gray-800 shadow-lg">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 blur-3xl rounded-full pointer-events-none"></div>
        <p className="text-gray-400 text-[10px] md:text-sm font-medium uppercase tracking-wider mb-1 md:mb-2">Tổng Doanh Thu Tuyến ({data.summary.label})</p>
        
        <div className="mt-1 md:mt-2">
            <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">{formatCurrency(summaryData.totalRevenue)}</h3>
        </div>

        <div className="flex items-center mt-2 md:mt-3 text-[11px] md:text-sm text-gray-500 gap-2 md:gap-3">
            {summaryData.percent !== null && <GrowthBadge value={summaryData.percent} />}
            {summaryData.compareRevenue !== null 
                ? (<span>So với kỳ trước: <span className="text-gray-300 font-medium">{formatCurrency(summaryData.compareRevenue)}</span></span>)
                : <span className="italic opacity-50">Không có dữ liệu so sánh</span>
            }
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <ProductCard 
              title="Gói Cơ bản" subtitle="Dòng phổ thông" icon={Package} badge="TIÊU CHUẨN" color="blue"
              label1="Doanh thu Bảo hiểm" val1={summaryData.basic.insRev} growth1={summaryData.basic.insGrowth}
              label2="Doanh thu Bệnh nhân" val2={summaryData.basic.patRev} growth2={summaryData.basic.patGrowth}
              details={summaryData.basic.details} formatCurrency={formatCurrency}
          />
          <ProductCard 
              title="Gói Cao cấp" subtitle="Dòng chuyên sâu" icon={Users} badge="CAO CẤP" color="purple"
              label1="Doanh thu Bảo hiểm" val1={summaryData.premium.insRev} growth1={summaryData.premium.insGrowth}
              label2="Doanh thu Bệnh nhân" val2={summaryData.premium.patRev} growth2={summaryData.premium.patGrowth}
              details={summaryData.premium.details} formatCurrency={formatCurrency}
          />
      </div>
    </>
  );
};

export default PhacoTuyen;