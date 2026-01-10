import React, { useMemo, useState, useEffect } from 'react';
import { 
  BarChart3, TrendingUp, Calendar, DollarSign, 
  Award, Activity, Users, ArrowUpRight, ArrowDownRight, Table2
} from 'lucide-react';

// --- 1. HIỆU ỨNG SỐ CHẠY (CountUp) ---
const CountUp = ({ end, duration = 1500, formatter }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let startTime = null;
    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const easeOut = 1 - Math.pow(2, -10 * progress);
      setCount(easeOut * end);
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [end, duration]);
  return <>{formatter ? formatter(count) : Math.floor(count)}</>;
};

// --- HÀM XỬ LÝ NGÀY ---
const parseDate = (dateInput) => {
    if (!dateInput) return null;
    if (dateInput instanceof Date) return isNaN(dateInput.getTime()) ? null : dateInput;
    if (typeof dateInput === 'number' && dateInput > 20000) return new Date((dateInput - 25569) * 86400 * 1000);
    if (typeof dateInput === 'string') {
        const parts = dateInput.trim().split(/[-/.]/);
        if (parts.length === 3) {
            let p1 = parseInt(parts[0], 10); let p2 = parseInt(parts[1], 10); let p3 = parseInt(parts[2], 10);
            if (p1 > 1900) return new Date(p1, p2 - 1, p3);
            if (p3 > 1900) return new Date(p3, p2 - 1, p1);
        }
        const tryDate = new Date(dateInput);
        return isNaN(tryDate.getTime()) ? null : tryDate;
    }
    return null;
};

// --- COMPONENT THẺ THỐNG KÊ (STAT CARD) ---
const StatCard = ({ title, value, subtext, icon: Icon, colorClass, bgClass, delay }) => (
  <div className={`bg-[#1C1E26] p-5 rounded-2xl border border-gray-800 shadow-lg relative overflow-hidden animate-fade-in-up group hover:-translate-y-1 transition-transform duration-300`} style={{ animationDelay: `${delay}ms` }}>
    <div className={`absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity ${colorClass}`}>
        <Icon size={80} />
    </div>
    <div className="relative z-10">
        <div className="flex items-center gap-3 mb-3">
            <div className={`p-2.5 rounded-xl ${bgClass} ${colorClass}`}>
                <Icon size={20} />
            </div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">{title}</p>
        </div>
        <h3 className="text-2xl md:text-3xl font-bold text-white mb-1 tracking-tight">{value}</h3>
        <p className={`text-xs font-medium ${colorClass} flex items-center gap-1`}>
            {subtext}
        </p>
    </div>
  </div>
);

// --- COMPONENT BIỂU ĐỒ ---
const SimpleBarChart = ({ data, formatCurrency }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    useEffect(() => { setTimeout(() => setIsLoaded(true), 300); }, []);

    if (!data || data.length === 0) return null;

    const chartData = [...data].reverse(); // Đảo ngược để hiện từ trái qua phải (cũ -> mới)
    const maxValue = Math.max(...chartData.map(d => d.totalRevenue)) || 1;

    return (
        <div className="bg-[#1C1E26] p-6 rounded-2xl border border-gray-800 shadow-lg animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm md:text-base font-bold text-white flex items-center gap-2">
                    <Activity className="text-indigo-400" size={18} /> 
                    Biểu đồ Xu hướng Doanh Thu
                </h3>
                <div className="flex gap-2 text-[10px] md:text-xs">
                    <span className="flex items-center gap-1 text-gray-400"><div className="w-2 h-2 rounded-full bg-indigo-500"></div> Doanh thu</span>
                </div>
            </div>
            
            <div className="h-48 md:h-64 flex items-end justify-between gap-1 md:gap-3 px-1 border-b border-gray-800 pb-2 relative">
                {/* Đường kẻ ngang mờ */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gray-800/30"></div>
                <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-800/30 border-t border-dashed border-gray-700"></div>

                {chartData.map((item, index) => {
                    const heightPercent = (item.totalRevenue / maxValue) * 100;
                    return (
                        <div key={index} className="flex-1 flex flex-col items-center group relative min-w-[30px] h-full justify-end">
                            {/* Tooltip Hover */}
                            <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 z-20 pointer-events-none">
                                <div className="bg-gray-900 text-white text-[10px] md:text-xs font-bold py-1.5 px-3 rounded-lg shadow-xl whitespace-nowrap border border-gray-700">
                                    {item.month}: {formatCurrency(item.totalRevenue)}
                                </div>
                            </div>
                            
                            {/* Cột */}
                            <div 
                                className="w-full max-w-[40px] md:max-w-[50px] bg-gradient-to-t from-indigo-900/80 to-indigo-500 rounded-t-sm hover:from-indigo-800 hover:to-indigo-400 relative cursor-pointer transition-all duration-1000 ease-out"
                                style={{ height: isLoaded ? `${Math.max(heightPercent, 1)}%` : '0%' }}
                            ></div>
                            
                            {/* Nhãn tháng (chỉ hiện tháng chẵn trên mobile để đỡ rối) */}
                            <div className="mt-2 text-[9px] md:text-[10px] text-gray-500 font-medium truncate w-full text-center group-hover:text-white transition-colors">
                                <span className="hidden md:inline">{item.month}</span>
                                <span className="md:hidden">{item.month.split('/')[0]}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// --- TRANG CHÍNH ---
const MonthlyReport = ({ data, formatCurrency }) => {
  const stats = useMemo(() => {
    const tempStats = {};
    data.forEach(row => {
        const date = parseDate(row['ngày']);
        if (!date) return;
        const monthKey = `${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
        
        if (!tempStats[monthKey]) {
            tempStats[monthKey] = {
                month: monthKey, rawDate: date, totalRevenue: 0, count: 0,
                phaco: { qty: 0, rev: 0 }, mong: { qty: 0, rev: 0 }, khucxa: { qty: 0, rev: 0 }, dichvu: { qty: 0, rev: 0 }
            };
        }
        const qty = Number(row['số lượng']) || 1;
        const price = Number(row['đơn giá']) || 0;
        const total = qty * price;
        const type = row.type || '';

        tempStats[monthKey].totalRevenue += total;
        tempStats[monthKey].count += qty;

        if (type.includes('phaco') || type === 'vanglai' || type === 'tuyen' || type.includes('pkvt') || type.includes('doitac')) {
            tempStats[monthKey].phaco.qty += qty; tempStats[monthKey].phaco.rev += total;
        } else if (type.includes('mong')) {
            tempStats[monthKey].mong.qty += qty; tempStats[monthKey].mong.rev += total;
        } else if (type === 'khucxa') {
            tempStats[monthKey].khucxa.qty += qty; tempStats[monthKey].khucxa.rev += total;
        } else {
            tempStats[monthKey].dichvu.qty += qty; tempStats[monthKey].dichvu.rev += total;
        }
    });
    return Object.values(tempStats).sort((a, b) => b.rawDate - a.rawDate);
  }, [data]);

  // Tính toán chỉ số tổng hợp
  const grandTotal = stats.reduce((acc, curr) => acc + curr.totalRevenue, 0);
  const totalCases = stats.reduce((acc, curr) => acc + curr.count, 0);
  
  // Tìm tháng cao điểm nhất
  const bestMonth = stats.length > 0 ? stats.reduce((prev, current) => (prev.totalRevenue > current.totalRevenue) ? prev : current) : null;
  
  // Tính trung bình tháng
  const avgRevenue = stats.length > 0 ? grandTotal / stats.length : 0;

  return (
    <div className="pb-20">
      {/* 1. HEADER & DASHBOARD CARDS */}
      <div className="mb-8">
         <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
             <span className="bg-blue-600 p-2 rounded-lg text-white shadow-lg shadow-blue-500/20"><TrendingUp size={24} /></span>
             Tổng Quan Hoạt Động
         </h2>

         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <StatCard 
                title="Tổng Doanh Thu" 
                value={<CountUp end={grandTotal} formatter={formatCurrency} />} 
                subtext={<><ArrowUpRight size={14} className="text-emerald-400"/> Tích lũy toàn thời gian</>}
                icon={DollarSign} colorClass="text-emerald-400" bgClass="bg-emerald-400/10" delay={0}
            />
            <StatCard 
                title="Tổng Số Ca" 
                value={<CountUp end={totalCases} />} 
                subtext="Phẫu thuật & Dịch vụ"
                icon={Users} colorClass="text-blue-400" bgClass="bg-blue-400/10" delay={100}
            />
            <StatCard 
                title="Tháng Kỷ Lục" 
                value={bestMonth ? bestMonth.month : "--/--"} 
                subtext={bestMonth ? `Đạt: ${formatCurrency(bestMonth.totalRevenue)}` : "Chưa có dữ liệu"}
                icon={Award} colorClass="text-amber-400" bgClass="bg-amber-400/10" delay={200}
            />
            <StatCard 
                title="Trung Bình / Tháng" 
                value={<CountUp end={avgRevenue} formatter={(val) => new Intl.NumberFormat('vi-VN', { notation: "compact", maximumFractionDigits: 1 }).format(val) + ' đ'} />} 
                subtext="Doanh thu ước tính"
                icon={Calendar} colorClass="text-purple-400" bgClass="bg-purple-400/10" delay={300}
            />
         </div>
      </div>

      {/* 2. BIỂU ĐỒ */}
      <SimpleBarChart data={stats} formatCurrency={formatCurrency} />

      {/* 3. BẢNG DỮ LIỆU CHI TIẾT (RESPONSIVE) */}
      <div className="bg-[#1C1E26] border border-gray-800 rounded-xl shadow-lg animate-fade-in-up mt-8 flex flex-col" style={{ animationDelay: '400ms' }}>
        <div className="p-5 border-b border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#181A20] rounded-t-xl">
            <div>
                <h3 className="font-bold text-lg text-white flex items-center gap-2"><Table2 size={20} className="text-blue-500"/> Báo Cáo Chi Tiết</h3>
                <p className="text-xs text-gray-400 mt-1">Dữ liệu được phân tách theo từng nhóm dịch vụ</p>
            </div>
        </div>
        
        {/* Container cuộn ngang cho mobile */}
        <div className="overflow-x-auto w-full custom-scrollbar rounded-b-xl">
            <div className="min-w-[1000px] align-middle inline-block w-full"> {/* min-w để ép bảng rộng ra, không bị co dúm */}
                <table className="w-full text-sm text-left">
                    <thead className="bg-[#111318] text-gray-400 uppercase text-[11px] font-bold tracking-wider">
                        <tr>
                            <th className="px-5 py-4 border-b border-gray-700 sticky left-0 bg-[#111318] z-20 shadow-[2px_0_5px_rgba(0,0,0,0.5)] text-center w-24">Thời gian</th>
                            
                            <th className="px-4 py-4 border-b border-gray-700 text-center bg-blue-900/10 text-blue-400">Phaco</th>
                            <th className="px-4 py-4 border-b border-gray-700 text-right bg-blue-900/10 text-blue-400 border-r border-gray-800/50">Doanh Thu</th>
                            
                            <th className="px-4 py-4 border-b border-gray-700 text-center bg-teal-900/10 text-teal-400">Mộng</th>
                            <th className="px-4 py-4 border-b border-gray-700 text-right bg-teal-900/10 text-teal-400 border-r border-gray-800/50">Doanh Thu</th>

                            <th className="px-4 py-4 border-b border-gray-700 text-center bg-rose-900/10 text-rose-400">Khúc Xạ</th>
                            <th className="px-4 py-4 border-b border-gray-700 text-right bg-rose-900/10 text-rose-400 border-r border-gray-800/50">Doanh Thu</th>

                            <th className="px-4 py-4 border-b border-gray-700 text-right bg-gray-800/30 text-gray-400 border-r border-gray-800/50">Dịch Vụ Khác</th>
                            <th className="px-4 py-4 border-b border-gray-700 text-right font-extrabold text-white bg-indigo-500/10">TỔNG CỘNG</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {stats.length > 0 ? (
                            stats.map((item, index) => (
                                <tr key={index} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-5 py-4 font-bold text-white sticky left-0 bg-[#1C1E26] group-hover:bg-[#22252E] border-r border-gray-800 shadow-[2px_0_5px_rgba(0,0,0,0.5)] text-center z-10">
                                        {item.month}
                                    </td>

                                    <td className="px-4 py-4 text-center text-gray-400">{item.phaco.qty || '-'}</td>
                                    <td className="px-4 py-4 text-right text-blue-400 font-medium tabular-nums border-r border-gray-800/50">{item.phaco.rev > 0 ? formatCurrency(item.phaco.rev) : '-'}</td>

                                    <td className="px-4 py-4 text-center text-gray-400">{item.mong.qty || '-'}</td>
                                    <td className="px-4 py-4 text-right text-teal-400 font-medium tabular-nums border-r border-gray-800/50">{item.mong.rev > 0 ? formatCurrency(item.mong.rev) : '-'}</td>

                                    <td className="px-4 py-4 text-center text-gray-400">{item.khucxa.qty || '-'}</td>
                                    <td className="px-4 py-4 text-right text-rose-400 font-medium tabular-nums border-r border-gray-800/50">{item.khucxa.rev > 0 ? formatCurrency(item.khucxa.rev) : '-'}</td>

                                    <td className="px-4 py-4 text-right text-gray-400 tabular-nums border-r border-gray-800/50">{item.dichvu.rev > 0 ? formatCurrency(item.dichvu.rev) : '-'}</td>

                                    <td className="px-4 py-4 text-right font-bold text-indigo-400 bg-indigo-500/5 tabular-nums text-base">{formatCurrency(item.totalRevenue)}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="9" className="px-4 py-16 text-center text-gray-500 italic flex flex-col items-center justify-center gap-2">
                                    <Database size={32} className="opacity-20"/>
                                    Chưa có dữ liệu nào được ghi nhận.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
      </div>
    </div>
  );
};

export default MonthlyReport;