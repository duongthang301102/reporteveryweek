import React from 'react';
import { Eye, TrendingUp, TrendingDown, Eclipse, EqualApproximately } from 'lucide-react';
import ProductCard from '../components/ProductCard';

const MongVangLai = ({ data, formatCurrency }) => {
  const { summary, packages } = data;

  return (
    <div className="animate-fade-in">
      {/* HEADER CARD */}
      <div className="bg-gradient-to-r from-teal-900 to-[#1C1E26] p-6 rounded-2xl border border-teal-800/50 mb-8 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10"><EqualApproximately size={120} /></div>
        <div className="relative z-10">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-1 flex items-center gap-3">
             <span className="bg-teal-500/20 p-2 rounded-lg text-teal-400"><Eclipse size={24} /></span>
             Mộng - Vãng Lai
          </h2>
          <p className="text-teal-200/70 text-sm mb-6 font-medium uppercase tracking-wider">{summary.label}</p>
          
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

      {/* PACKAGES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <ProductCard 
            title="Mộng Đơn (Thường)" 
            subtitle="Phẫu thuật mộng thịt" 
            count={packages.basic.sales} 
            val1={packages.basic.insRev} 
            val2={packages.basic.patRev} 
            color="teal" 
            formatCurrency={formatCurrency} 
            badge="TIÊU CHUẨN"
            details={packages.basic.details}
        />
        <ProductCard 
            title="Mộng Kép (Ghép)" 
            subtitle="Phẫu thuật mộng ghép kết mạc" 
            count={packages.premium.sales} 
            val1={packages.premium.insRev} 
            val2={packages.premium.patRev} 
            color="purple" 
            formatCurrency={formatCurrency} 
            badge="CAO CẤP"
            details={packages.premium.details}
        />
      </div>
    </div>
  );
};

export default MongVangLai;