import React, { useState, useMemo } from 'react';
import { Package, Users, ChevronDown, ChevronUp, TrendingUp, TrendingDown, Wallet } from 'lucide-react'; // Thêm icon Wallet nếu thích

const ProductCard = ({ 
    title, subtitle, icon: IconParam, badge, 
    val1, val2, 
    count, 
    label1 = "Doanh thu Bảo hiểm", label2 = "Doanh thu Bệnh nhân", 
    growth1, growth2, 
    details, color, formatCurrency 
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    
    // 1. Tự động tính tổng số lượng
    const finalCount = useMemo(() => {
        if (count && Number(count) > 0) return count;
        if (details && Array.isArray(details)) {
            return details.reduce((sum, item) => sum + (Number(item.qty) || 0), 0);
        }
        return 0;
    }, [count, details]);

    // 2. [MỚI] Tự động tính Tổng Tiền (Bảo hiểm + Bệnh nhân)
    const totalRevenue = useMemo(() => {
        return (Number(val1) || 0) + (Number(val2) || 0);
    }, [val1, val2]);

    let Icon = IconParam || (color === 'purple' ? Users : Package);
    
    // Cấu hình màu sắc
    let bgClass = 'bg-blue-500/10'; 
    let textClass = 'text-blue-400'; 
    let borderClass = 'border-blue-500/20';
    let countBg = 'bg-blue-500/20'; 

    if (color === 'purple') { 
        bgClass = 'bg-purple-500/10'; 
        textClass = 'text-purple-400'; 
        borderClass = 'border-purple-500/20';
        countBg = 'bg-purple-500/20';
    }

    const GrowthText = ({ value }) => {
        if (value === null || value === undefined) return null;
        const isPositive = value >= 0;
        return (
            <div className={`text-[10px] md:text-xs font-medium flex flex-wrap items-center gap-1 ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isPositive ? <TrendingUp size={14} strokeWidth={2.5} /> : <TrendingDown size={14} strokeWidth={2.5} />}
                <span>{Math.abs(Number(value).toFixed(1))}%</span>
                <span className="text-gray-500 font-normal opacity-80 ml-0.5">vs kỳ trước</span>
            </div>
        );
    };

    const displayValue = (label, value) => {
        const num = Number(value) || 0; 
        if (label.toLowerCase().includes('doanh thu') || label.toLowerCase().includes('dt')) return formatCurrency(num);
        return num; 
    };

    return (
        <div className={`bg-[#1C1E26] rounded-2xl border border-gray-800 p-0 overflow-hidden shadow-lg hover:border-gray-600 transition-all duration-300`}>
            {/* HEADER */}
            <div className={`p-4 md:p-5 border-b border-gray-800 ${color === 'purple' ? 'bg-purple-900/5' : 'bg-blue-900/5'}`}>
                <div className="flex justify-between items-center gap-3">
                    <div className="flex gap-3 md:gap-4 items-center flex-1 min-w-0">
                        <div className={`w-12 h-12 md:w-14 md:h-14 flex-shrink-0 rounded-xl flex items-center justify-center ${bgClass} ${borderClass} border shadow-inner`}>
                            <Icon size={24} className={textClass} />
                        </div>
                        <div className="flex flex-col justify-center min-w-0">
                            <div className="flex mb-1">
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider leading-none ${bgClass} ${textClass} ${borderClass}`}>
                                    {badge}
                                </span>
                            </div>
                            <h4 className="text-base md:text-lg font-bold text-white leading-tight truncate pr-2">
                                {title}
                            </h4>
                            <p className="text-[10px] md:text-sm text-gray-500 truncate leading-tight">
                                {subtitle}
                            </p>
                        </div>
                    </div>
                    
                    <div className={`flex flex-col items-center justify-center flex-shrink-0 min-w-[70px] md:min-w-[80px] px-2 py-1.5 md:py-2 rounded-xl border ${borderClass} ${countBg}`}>
                        <span className="text-[9px] text-gray-300 uppercase font-bold tracking-wider leading-none mb-0.5 opacity-80">
                            SL Bán
                        </span>
                        <span className={`text-2xl md:text-3xl font-black leading-none tracking-tight ${textClass}`}>
                            {finalCount}
                        </span>
                    </div>
                </div>
            </div>
            
            {/* BODY */}
            <div className="flex flex-col">
                
                {/* 1. PHẦN TỔNG DOANH THU (MỚI THÊM) */}
                <div className="px-4 md:px-6 pt-5 pb-2">
                    <p className="text-[10px] md:text-xs text-gray-400 font-semibold uppercase mb-1 tracking-wider">
                        Tổng doanh thu gói
                    </p>
                    <div className="flex items-baseline gap-2">
                        <span className={`text-2xl sm:text-3xl md:text-4xl font-bold ${textClass} tracking-tight`}>
                            {formatCurrency(totalRevenue)}
                        </span>
                    </div>
                    {/* Đường kẻ mờ phân cách */}
                    <div className="w-full h-px bg-gray-800 mt-4"></div>
                </div>

                {/* 2. PHẦN CHI TIẾT (Bảo hiểm vs Bệnh nhân) */}
                <div className="px-4 md:px-6 pb-4 md:pb-6 pt-3 grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8">
                    <div>
                        <p className="text-[10px] md:text-xs text-gray-500 font-semibold uppercase mb-1">{label1}</p>
                        <p className="text-lg md:text-xl font-bold text-gray-200 mb-1">{displayValue(label1, val1)}</p>
                        {growth1 !== undefined && <GrowthText value={growth1} />}
                    </div>
                    <div>
                        <p className="text-[10px] md:text-xs text-gray-500 font-semibold uppercase mb-1">{label2}</p>
                        <p className="text-lg md:text-xl font-bold text-gray-200 mb-1">{displayValue(label2, val2)}</p>
                        {growth2 !== undefined && <GrowthText value={growth2} />}
                    </div>
                </div>
            </div>

            {/* EXPAND DETAILS */}
            {isExpanded && (
                <div className="px-4 md:px-6 pb-6 animate-fade-in-down"><div className="p-3 md:p-4 bg-[#0F1115] rounded-lg border border-gray-800 text-sm"><p className="text-gray-400 mb-2 font-semibold border-b border-gray-700 pb-2 text-xs md:text-sm">Chi tiết giao dịch:</p>{details && details.length > 0 ? (<ul className="space-y-2 md:space-y-3 mt-3">{details.map((item, index) => (<li key={index} className="flex justify-between items-center text-gray-300"><div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-gray-500"></span><span className="text-xs md:text-sm truncate max-w-[150px] md:max-w-none">{item.name}</span></div><span className={`${textClass} font-mono font-medium bg-[#1C1E26] px-2 py-0.5 rounded text-[10px] md:text-xs`}>+ {item.qty}</span></li>))}</ul>) : <p className="text-gray-500 italic text-xs mt-2">Không có giao dịch</p>}</div></div>
            )}
            
            <div onClick={() => setIsExpanded(!isExpanded)} className="bg-[#24262d] p-2 md:p-3 text-center border-t border-gray-800 cursor-pointer hover:bg-[#2d3039] transition"><div className="flex justify-between items-center px-2 md:px-4 select-none"><span className="text-[11px] md:text-sm text-gray-400">{isExpanded ? 'Thu gọn' : 'Xem chi tiết'}</span>{isExpanded ? <ChevronUp size={14} className="text-gray-500"/> : <ChevronDown size={14} className="text-gray-500"/>}</div></div>
        </div>
    );
};
export default ProductCard;