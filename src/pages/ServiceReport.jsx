import React from 'react';
// 1. IMPORT ICON MỚI
import { ClipboardList, TrendingUp, TrendingDown } from 'lucide-react';

const ServiceReport = ({ data, formatCurrency }) => {
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

  return (
    <div className="animate-fade-in-up space-y-4 md:space-y-6">
      <div className="bg-[#1C1E26] rounded-2xl p-5 md:p-8 relative overflow-hidden border border-gray-800 shadow-lg">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-3xl rounded-full pointer-events-none"></div>
        <div className="flex items-center gap-3 mb-1 md:mb-2">
            <div className="p-1.5 md:p-2 bg-emerald-500/10 rounded-lg">
                <ClipboardList className="text-emerald-400" size={18} />
            </div>
            <p className="text-gray-400 text-[10px] md:text-sm font-medium uppercase tracking-wider">Tổng Doanh Thu Dịch Vụ ({data.label})</p>
        </div>
        
        <div className="mt-1 md:mt-2">
            <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">{formatCurrency(data.totalRevenue || 0)}</h3>
        </div>
        
        <div className="flex items-center mt-2 md:mt-3 text-[11px] md:text-sm text-gray-500 gap-2 md:gap-3">
             {data.percent !== null && <GrowthBadge value={data.percent} />}
            {data.compareRevenue !== null 
                ? (<span>So với kỳ trước: <span className="text-gray-300 font-medium">{formatCurrency(data.compareRevenue)}</span></span>)
                : <span className="italic opacity-50">Không có dữ liệu so sánh</span>
            }
        </div>
      </div>

      <div className="bg-[#1C1E26] rounded-2xl border border-gray-800 overflow-hidden shadow-lg">
        <div className="p-4 md:p-6 border-b border-gray-800">
            <h3 className="text-base md:text-lg font-bold text-white">Chi tiết từng gói dịch vụ</h3>
        </div>
        
        <div className="overflow-x-auto">
            <table className="w-full text-[11px] md:text-sm text-left whitespace-nowrap">
                <thead className="text-gray-400 uppercase bg-[#0F1115]">
                    <tr>
                        <th className="px-4 md:px-6 py-3 md:py-4">Tên gói dịch vụ</th>
                        <th className="px-4 md:px-6 py-3 md:py-4 text-center">SL</th>
                        <th className="px-4 md:px-6 py-3 md:py-4 text-right">Đơn giá</th>
                        <th className="px-4 md:px-6 py-3 md:py-4 text-right">Thành tiền</th>
                        <th className="px-4 md:px-6 py-3 md:py-4 text-right">Tỷ trọng</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                    {(!data.items || data.items.length === 0) ? (
                        <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500 italic">Chưa có dữ liệu dịch vụ</td></tr>
                    ) : (
                        data.items.map((item, index) => {
                            const percent = data.totalRevenue > 0 ? (item.total / data.totalRevenue) * 100 : 0;
                            return (
                                <tr key={index} className="hover:bg-white/5 transition-colors">
                                    <td className="px-4 md:px-6 py-3 md:py-4 font-medium text-white border-l-4 border-transparent hover:border-emerald-500 transition-all">
                                        {item.name}
                                    </td>
                                    <td className="px-4 md:px-6 py-3 md:py-4 text-center">
                                        <span className="bg-[#2D3039] text-white px-1.5 py-0.5 md:px-2 md:py-1 rounded font-mono text-[10px] md:text-xs">
                                            {item.qty}
                                        </span>
                                    </td>
                                    <td className="px-4 md:px-6 py-3 md:py-4 text-right text-gray-400 font-mono">
                                        {formatCurrency(item.price)}
                                    </td>
                                    <td className="px-4 md:px-6 py-3 md:py-4 text-right font-bold text-emerald-400 font-mono">
                                        {formatCurrency(item.total)}
                                    </td>
                                    <td className="px-4 md:px-6 py-3 md:py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <span className="text-[10px] md:text-xs text-gray-500">{percent.toFixed(1)}%</span>
                                            <div className="w-10 md:w-16 h-1 md:h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                                <div className="h-full bg-emerald-500" style={{ width: `${percent}%` }}></div>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default ServiceReport;