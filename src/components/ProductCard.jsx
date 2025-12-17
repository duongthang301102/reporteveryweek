import React, { useState } from 'react';
import { Package, Users, ChevronDown, ChevronUp } from 'lucide-react';

const ProductCard = ({ 
    title, subtitle, icon: IconParam, badge, 
    val1, val2, 
    label1 = "Số lượng bán", label2 = "Doanh thu", 
    growth1, growth2, 
    details, color, formatCurrency 
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    let Icon = IconParam || (color === 'purple' ? Users : Package);
    let bgClass = 'bg-blue-500/10'; let textClass = 'text-blue-400'; let borderClass = 'border-blue-500/20';
    if (color === 'purple') { bgClass = 'bg-purple-500/10'; textClass = 'text-purple-400'; borderClass = 'border-purple-500/20'; }

    const GrowthText = ({ value }) => {
        if (value === null || value === undefined) return null;
        const isPositive = value >= 0;
        return (
            <p className={`text-[10px] md:text-xs font-medium flex flex-wrap items-center gap-1 ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isPositive ? '↗' : '↘'} {Math.abs(Number(value).toFixed(1))}% 
                <span className="text-gray-500 font-normal opacity-80">vs kỳ trước</span>
            </p>
        );
    };

    const displayValue = (label, value) => {
        const num = Number(value) || 0; 
        if (label.toLowerCase().includes('doanh thu') || label.toLowerCase().includes('dt')) return formatCurrency(num);
        return num; 
    };

    return (
        <div className={`bg-[#1C1E26] rounded-2xl border border-gray-800 p-0 overflow-hidden shadow-lg hover:border-gray-600 transition-all duration-300`}>
            <div className={`p-4 md:p-6 border-b border-gray-800 ${color === 'purple' ? 'bg-purple-900/5' : 'bg-blue-900/5'}`}>
                <div className="flex justify-between items-start">
                    <div className="flex gap-3 md:gap-4">
                        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center ${bgClass} ${borderClass} border`}><Icon size={18} className={textClass} /></div>
                        <div>
                            <h4 className="text-base md:text-lg font-bold text-white">{title}</h4>
                            <p className="text-[11px] md:text-sm text-gray-500">{subtitle}</p>
                        </div>
                    </div>
                    <span className={`text-[9px] md:text-[10px] font-bold px-2 py-1 rounded border uppercase ${bgClass} ${textClass} ${borderClass}`}>{badge}</span>
                </div>
            </div>
            
            <div className="p-4 md:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8">
                <div>
                    <p className="text-[10px] md:text-xs text-gray-400 font-semibold uppercase mb-1">{label1}</p>
                    <p className="text-lg md:text-2xl font-bold text-white mb-1">{displayValue(label1, val1)}</p>
                    {growth1 !== undefined && <GrowthText value={growth1} />}
                </div>
                <div>
                    <p className="text-[10px] md:text-xs text-gray-400 font-semibold uppercase mb-1">{label2}</p>
                    <p className={`text-lg md:text-2xl font-bold ${textClass} mb-1`}>{displayValue(label2, val2)}</p>
                    {growth2 !== undefined && <GrowthText value={growth2} />}
                </div>
            </div>

            {isExpanded && (
                <div className="px-4 md:px-6 pb-6 animate-fade-in-down"><div className="p-3 md:p-4 bg-[#0F1115] rounded-lg border border-gray-800 text-sm"><p className="text-gray-400 mb-2 font-semibold border-b border-gray-700 pb-2 text-xs md:text-sm">Chi tiết giao dịch:</p>{details && details.length > 0 ? (<ul className="space-y-2 md:space-y-3 mt-3">{details.map((item, index) => (<li key={index} className="flex justify-between items-center text-gray-300"><div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-gray-500"></span><span className="text-xs md:text-sm truncate max-w-[150px] md:max-w-none">{item.name}</span></div><span className={`${textClass} font-mono font-medium bg-[#1C1E26] px-2 py-0.5 rounded text-[10px] md:text-xs`}>+ {item.qty}</span></li>))}</ul>) : <p className="text-gray-500 italic text-xs mt-2">Không có giao dịch</p>}</div></div>
            )}
            
            <div onClick={() => setIsExpanded(!isExpanded)} className="bg-[#24262d] p-2 md:p-3 text-center border-t border-gray-800 cursor-pointer hover:bg-[#2d3039] transition"><div className="flex justify-between items-center px-2 md:px-4 select-none"><span className="text-[11px] md:text-sm text-gray-400">{isExpanded ? 'Thu gọn' : 'Xem chi tiết'}</span>{isExpanded ? <ChevronUp size={14} className="text-gray-500"/> : <ChevronDown size={14} className="text-gray-500"/>}</div></div>
        </div>
    );
};
export default ProductCard;