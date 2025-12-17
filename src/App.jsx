import React, { useState, useMemo, useRef, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { Calendar, Upload, ArrowRight, Menu, X, Check, AlertCircle } from 'lucide-react';
import { saveTransactions, getAllTransactions, clearTransactions } from './db';
import { SpeedInsights } from "@vercel/speed-insights/react";

import Sidebar from './components/Sidebar';
import PhacoVangLai from './pages/PhacoVangLai';
import PhacoTuyen from './pages/PhacoTuyen';
import ServiceReport from './pages/ServiceReport';
import DataManagement from './pages/DataManagement';
import ConfirmModal from './components/ConfirmModal';

// --- HELPERS ---
const safeParseNumber = (value) => {
    if (value === null || value === undefined || value === '') return 0;
    const cleanString = String(value).replace(/[^0-9.-]+/g, "");
    const result = Number(cleanString);
    return isNaN(result) ? 0 : result;
};

const parseDateAllFormats = (dateStr) => {
    if (!dateStr) return null;
    if (dateStr instanceof Date) return dateStr;
    if (typeof dateStr === 'string') {
        const cleanStr = dateStr.trim();
        if (cleanStr.includes('-')) return new Date(cleanStr);
        if (cleanStr.includes('/')) {
            const parts = cleanStr.split('/');
            if (parts.length === 3) {
                const d1 = parseInt(parts[0], 10);
                const m1 = parseInt(parts[1], 10) - 1;
                const y1 = parseInt(parts[2], 10);
                return new Date(y1, m1, d1); 
            }
        }
        return new Date(cleanStr);
    }
    return new Date(dateStr);
};

const FilterButton = ({ label, active, onClick }) => (
  <button onClick={onClick} className={`px-2.5 py-1.5 text-[11px] md:text-sm rounded transition-all duration-200 whitespace-nowrap ${active ? 'bg-[#2D3039] text-white shadow-sm font-medium' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>{label}</button>
);

// --- MAIN LAYOUT ---
const MainLayout = ({ children, timeFilter, setTimeFilter, customStart, setCustomStart, customEnd, setCustomEnd, dateLabel, onUpload, category, activeMenuTitle, onClearData }) => {
  const fileInputRef = useRef(null);
  const handleFileChange = (e) => { const file = e.target.files[0]; if (file) onUpload(file, category); };
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  return (
    <div className="flex h-screen bg-[#0F1115] text-white overflow-hidden font-sans">
      <Sidebar 
        onClearData={onClearData} 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      /> 
      
      <main className="flex-1 overflow-y-auto p-3 md:p-8 w-full relative">
        
        {/* Overlay cho DatePicker (Z-Index thấp hơn Header) */}
        {showDatePicker && (
            <div 
                className="fixed inset-0 z-30 bg-black/80 md:bg-transparent transition-colors" 
                onClick={() => setShowDatePicker(false)}
            ></div>
        )}

        {/* HEADER (Z-Index cao hơn Overlay để nút bấm được) */}
        <header className="flex flex-col gap-3 md:gap-4 mb-4 md:mb-6 relative z-40">
          
          {/* HÀNG 1: TIÊU ĐỀ & MENU */}
          <div className="flex items-start gap-2">
            <button 
                onClick={() => setIsSidebarOpen(true)} 
                className="md:hidden p-1.5 bg-[#1C1E26] rounded-lg border border-gray-800 text-gray-300 active:scale-95 mt-0.5"
            >
                <Menu size={20} />
            </button>

            <div className="flex flex-col">
                <div className="hidden md:flex items-center gap-2 text-sm text-gray-400 mb-1"><span>Trang chủ</span> / <span className="text-white">Dashboard</span></div>
                
                {/* Tiêu đề căn chỉnh line-height */}
                <h2 className="text-base sm:text-lg md:text-3xl font-bold truncate text-white leading-tight">
                    {activeMenuTitle}
                </h2>
                
                {/* Dòng Note căn chỉnh sát tiêu đề */}
                <div className="flex items-center gap-1.5 mt-0.5">
                    <AlertCircle size={12} className="text-amber-500 flex-shrink-0" />
                    <p className="text-[10px] md:text-xs text-amber-500/90 italic font-medium leading-none pt-0.5">
                        Lưu ý: Dữ liệu được cập nhật hàng tuần
                    </p>
                </div>
            </div>
          </div>

          {/* HÀNG 2: BỘ LỌC & NÚT */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-3 md:gap-4">
            <div className="w-full md:w-auto flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <div className="flex bg-[#1C1E26] rounded-lg p-1 border border-gray-800 overflow-x-auto max-w-full scrollbar-hide">
                    <FilterButton label="Tuần này" active={timeFilter === 'week'} onClick={() => { setTimeFilter('week'); setShowDatePicker(false); }} />
                    <FilterButton label="Tháng này" active={timeFilter === 'month'} onClick={() => { setTimeFilter('month'); setShowDatePicker(false); }} />
                    <FilterButton label="Năm nay" active={timeFilter === 'year'} onClick={() => { setTimeFilter('year'); setShowDatePicker(false); }} />
                </div>
            </div>

            <div className="flex flex-wrap gap-2 w-full md:w-auto relative">
                {/* NÚT CHỌN NGÀY */}
                <div className="relative">
                    <button 
                        onClick={() => setShowDatePicker(!showDatePicker)}
                        className={`flex items-center gap-2 bg-[#1C1E26] px-3 py-1.5 md:py-2 rounded-lg border ${showDatePicker ? 'border-blue-500 text-white' : 'border-gray-800 text-gray-300'} text-[11px] md:text-sm justify-center shadow-inner flex-grow md:flex-grow-0 whitespace-nowrap hover:bg-[#252830] transition-colors`}
                    >
                        <Calendar size={14} className={showDatePicker ? "text-white" : "text-blue-400"}/><span className="font-semibold">{dateLabel}</span>
                    </button>

                    {/* POPUP CHỌN NGÀY */}
                    {showDatePicker && (
                        <div className={`
                            bg-[#1C1E26] border border-gray-700 rounded-xl shadow-2xl p-4 w-[280px] z-50 animate-fade-in-down
                            fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
                            md:absolute md:top-full md:right-0 md:left-auto md:translate-x-0 md:translate-y-0 md:mt-2
                        `}>
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-sm font-bold text-white">Tùy chọn khoảng ngày</span>
                                <button onClick={() => setShowDatePicker(false)}><X size={16} className="text-gray-500 hover:text-white"/></button>
                            </div>
                            
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Từ ngày</label>
                                    <input 
                                        type="date" 
                                        className="w-full bg-[#0F1115] border border-gray-700 rounded p-2 text-sm text-white focus:border-blue-500 outline-none [color-scheme:dark]"
                                        value={customStart} 
                                        onChange={(e) => {setTimeFilter('custom'); setCustomStart(e.target.value)}}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Đến ngày</label>
                                    <input 
                                        type="date" 
                                        className="w-full bg-[#0F1115] border border-gray-700 rounded p-2 text-sm text-white focus:border-blue-500 outline-none [color-scheme:dark]"
                                        value={customEnd} 
                                        onChange={(e) => {setTimeFilter('custom'); setCustomEnd(e.target.value)}}
                                    />
                                </div>
                                <button 
                                    onClick={() => setShowDatePicker(false)}
                                    className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded text-sm font-medium flex items-center justify-center gap-2 mt-2"
                                >
                                    <Check size={14}/> Áp dụng
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".xlsx, .xls" className="hidden" />
                <button onClick={() => fileInputRef.current.click()} className="bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white px-3 md:px-4 py-1.5 md:py-2 rounded-lg flex items-center justify-center gap-2 text-[11px] md:text-sm font-medium transition duration-200 flex-grow md:flex-grow-0 whitespace-nowrap">
                    <Upload size={14} /> <span className="hidden sm:inline">Nhập Excel</span> <span className="sm:hidden">Nhập</span>
                </button>
            </div>
          </div>
        </header>
        
        <div className="pb-10">
            {children}
        </div>
      </main>
    </div>
  );
};

function App() {
  const [timeFilter, setTimeFilter] = useState('month'); 
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [rawExcelData, setRawExcelData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewData, setViewData] = useState({ vanglai: null, tuyen: null, dichvu: null });

  useEffect(() => {
    const loadData = async () => { try { const data = await getAllTransactions(); if(data) setRawExcelData(data); } finally { setIsLoading(false); } };
    loadData();
  }, []);

  const handleOpenClearModal = () => { setIsModalOpen(true); };

  const executeClearData = async () => { await clearTransactions(); setIsModalOpen(false); window.location.reload(); };

  const handleUpload = (file, category) => {
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const bstr = evt.target.result;
      const workbook = XLSX.read(bstr, { type: 'binary', cellText: false, cellDates: true });
      const ws = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(ws, { raw: false });
      if (jsonData.length > 0) {
        const cleanData = jsonData.map(row => {
            const newRow = {};
            Object.keys(row).forEach(key => { newRow[key.trim().toLowerCase()] = row[key]; });
            return { ...newRow, type: category }; 
        });
        setRawExcelData(prev => [...prev, ...cleanData]); 
        await saveTransactions(cleanData); 
        alert(`✅ Đã thêm ${cleanData.length} dòng vào dữ liệu ${category}!`); 
      }
    };
    reader.readAsBinaryString(file);
  };

  const calculatePhacoStats = (dataSubset, rangeCurrent, rangePrevious) => {
    const initStats = () => ({ sales: 0, revenue: 0, insRev: 0, patRev: 0, details: {} });
    let current = { totalRevenue: 0, basic: initStats(), premium: initStats() };
    let prev = { totalRevenue: 0, basic: {insRev:0, patRev:0}, premium: {insRev:0, patRev:0} };

    dataSubset.forEach(row => {
        const rowDate = parseDateAllFormats(row['ngày']);
        if (!rowDate || isNaN(rowDate.getTime())) return; rowDate.setHours(0,0,0,0);
        const soLuong = safeParseNumber(row['số lượng']); const donGia = safeParseNumber(row['đơn giá']); const giaBaoHiem = safeParseNumber(row['giá bảo hiểm']);
        const loaiGoi = row['loại gói'] ? String(row['loại gói']).toLowerCase().trim() : ''; const tenGoi = row['tên gói'] ? String(row['tên gói']).trim() : 'Khác';
        const dtBaoHiem = giaBaoHiem * soLuong; const dtBenhNhan = (donGia - giaBaoHiem) * soLuong; const thanhTien = dtBaoHiem + dtBenhNhan;

        if (rowDate >= rangeCurrent.start && rowDate <= rangeCurrent.end) {
            current.totalRevenue += thanhTien;
            if (loaiGoi.includes('cơ bản')) { current.basic.sales += soLuong; current.basic.revenue += thanhTien; current.basic.insRev += dtBaoHiem; current.basic.patRev += dtBenhNhan; current.basic.details[tenGoi] = (current.basic.details[tenGoi] || 0) + soLuong; } 
            else if (loaiGoi.includes('cao cấp')) { current.premium.sales += soLuong; current.premium.revenue += thanhTien; current.premium.insRev += dtBaoHiem; current.premium.patRev += dtBenhNhan; current.premium.details[tenGoi] = (current.premium.details[tenGoi] || 0) + soLuong; }
        } else if (rangePrevious && rowDate >= rangePrevious.start && rowDate <= rangePrevious.end) {
            prev.totalRevenue += thanhTien;
            if (loaiGoi.includes('cơ bản')) { prev.basic.insRev += dtBaoHiem; prev.basic.patRev += dtBenhNhan; } 
            else if (loaiGoi.includes('cao cấp')) { prev.premium.insRev += dtBaoHiem; prev.premium.patRev += dtBenhNhan; }
        }
    });
    const calcGrowth = (curr, pre) => timeFilter === 'custom' ? null : pre === 0 ? (curr > 0 ? 100 : 0) : ((curr - pre) / pre) * 100;
    const formatDetails = (obj) => Object.keys(obj).map(k => ({ name: k, qty: obj[k] }));
    return {
        totalRevenue: current.totalRevenue, compareRevenue: timeFilter === 'custom' ? null : prev.totalRevenue, percent: calcGrowth(current.totalRevenue, prev.totalRevenue), chart: Array.from({length: 10}, () => Math.floor(Math.random() * 100)),
        basic: { insRev: current.basic.insRev, patRev: current.basic.patRev, insGrowth: calcGrowth(current.basic.insRev, prev.basic.insRev), patGrowth: calcGrowth(current.basic.patRev, prev.basic.patRev), details: formatDetails(current.basic.details) },
        premium: { insRev: current.premium.insRev, patRev: current.premium.patRev, insGrowth: calcGrowth(current.premium.insRev, prev.premium.insRev), patGrowth: calcGrowth(current.premium.patRev, prev.premium.patRev), details: formatDetails(current.premium.details) }
    };
  };

  const calculateServices = (dataSubset, rangeCurrent, rangePrevious) => {
      let totalRevenue = 0; let prevTotalRevenue = 0; let itemsMap = {}; 
      dataSubset.forEach(row => {
          const rowDate = parseDateAllFormats(row['ngày']); if (!rowDate || isNaN(rowDate.getTime())) return; rowDate.setHours(0,0,0,0);
          const qty = safeParseNumber(row['số lượng']); const price = safeParseNumber(row['đơn giá']); const total = qty * price;
          if (rowDate >= rangeCurrent.start && rowDate <= rangeCurrent.end) {
              const name = row['tên gói'] ? String(row['tên gói']).trim() : 'Dịch vụ khác'; totalRevenue += total;
              if (!itemsMap[name]) itemsMap[name] = { name: name, qty: 0, price: price, total: 0 };
              itemsMap[name].qty += qty; itemsMap[name].total += total; itemsMap[name].price = price; 
          } else if (rangePrevious && rowDate >= rangePrevious.start && rowDate <= rangePrevious.end) { prevTotalRevenue += total; }
      });
      const items = Object.values(itemsMap).sort((a, b) => b.total - a.total);
      const calcGrowth = (curr, pre) => timeFilter === 'custom' ? null : pre === 0 ? (curr > 0 ? 100 : 0) : ((curr - pre) / pre) * 100;
      return { totalRevenue, compareRevenue: timeFilter === 'custom' ? null : prevTotalRevenue, percent: calcGrowth(totalRevenue, prevTotalRevenue), items };
  };

  const getDateRange = (filter, offset=0) => {
    if(filter==='custom'){ if(!customStart||!customEnd) return {start:null, end:null}; const s=new Date(customStart); s.setHours(0,0,0,0); const e=new Date(customEnd); e.setHours(23,59,59,999); return {start:s,end:e}; }
    const t=new Date(); t.setHours(0,0,0,0); const y=t.getFullYear(); const m=t.getMonth();
    if(filter==='week'){ const d=t.getDay(); const dist=d===0?6:d-1; const mon=new Date(t); mon.setDate(t.getDate()-dist-(7*offset)); const sun=new Date(mon); sun.setDate(mon.getDate()+6); sun.setHours(23,59,59,999); return {start:mon, end:sun}; }
    if(filter==='month'){ const tm=m-offset; return {start:new Date(y,tm,1), end:new Date(y,tm+1,0,23,59,59)}; }
    if(filter==='year'){ const ty=y-offset; return {start:new Date(ty,0,1), end:new Date(ty,11,31,23,59,59)}; }
    return {start:null,end:null};
  };

  const dateLabel = useMemo(() => {
    if (timeFilter === 'custom') return (!customStart || !customEnd) ? "Chọn khoảng ngày" : `${(new Date(customStart).getDate()+'').padStart(2,'0')}/${(new Date(customStart).getMonth()+1+'').padStart(2,'0')} - ${(new Date(customEnd).getDate()+'').padStart(2,'0')}/${(new Date(customEnd).getMonth()+1+'').padStart(2,'0')}`;
    const { start, end } = getDateRange(timeFilter, 0);
    return !start ? "" : timeFilter === 'year' ? `Năm ${start.getFullYear()}` : `${(start.getDate()+'').padStart(2,'0')}/${(start.getMonth()+1+'').padStart(2,'0')} - ${(end.getDate()+'').padStart(2,'0')}/${(end.getMonth()+1+'').padStart(2,'0')}`;
  }, [timeFilter, customStart, customEnd]);

  useEffect(() => {
    const rangeCurrent = getDateRange(timeFilter, 0);
    if (timeFilter === 'custom' && (!rangeCurrent.start || !rangeCurrent.end)) return;
    let rangePrevious = timeFilter !== 'custom' ? getDateRange(timeFilter, 1) : null;
    setViewData({
        vanglai: calculatePhacoStats(rawExcelData.filter(d => d.type === 'vanglai'), rangeCurrent, rangePrevious),
        tuyen: calculatePhacoStats(rawExcelData.filter(d => d.type === 'tuyen'), rangeCurrent, rangePrevious),
        dichvu: calculateServices(rawExcelData.filter(d => d.type === 'dichvu'), rangeCurrent, rangePrevious)
    });
  }, [rawExcelData, timeFilter, customStart, customEnd]);

  const formatCurrency = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  const getSafeData = (data) => data || { totalRevenue: 0, percent: 0, compareRevenue: 0, chart: [], basic: {}, premium: {} };

  if (isLoading) return <div className="flex h-screen bg-[#0F1115] text-white items-center justify-center">Đang tải dữ liệu...</div>;

  return (
    <Router>
      <Routes>
        <Route path="/" element={ <MainLayout onClearData={handleOpenClearModal} activeMenuTitle="Phaco Vãng Lai" category="vanglai" onUpload={handleUpload} timeFilter={timeFilter} setTimeFilter={setTimeFilter} customStart={customStart} setCustomStart={setCustomStart} customEnd={customEnd} setCustomEnd={setCustomEnd} dateLabel={dateLabel}> <PhacoVangLai data={{ summary: { label: dateLabel, ...getSafeData(viewData.vanglai) }, packages: getSafeData(viewData.vanglai) }} formatCurrency={formatCurrency} /> </MainLayout> } />
        <Route path="/phaco-tuyen" element={ <MainLayout onClearData={handleOpenClearModal} activeMenuTitle="Phaco Tuyến" category="tuyen" onUpload={handleUpload} timeFilter={timeFilter} setTimeFilter={setTimeFilter} customStart={customStart} setCustomStart={setCustomStart} customEnd={customEnd} setCustomEnd={setCustomEnd} dateLabel={dateLabel}> <PhacoTuyen data={{ summary: { label: dateLabel, ...getSafeData(viewData.tuyen) }, phacoTuyen: getSafeData(viewData.tuyen) }} formatCurrency={formatCurrency} /> </MainLayout> } />
        <Route path="/services" element={ <MainLayout onClearData={handleOpenClearModal} activeMenuTitle="Gói Dịch vụ" category="dichvu" onUpload={handleUpload} timeFilter={timeFilter} setTimeFilter={setTimeFilter} customStart={customStart} setCustomStart={setCustomStart} customEnd={customEnd} setCustomEnd={setCustomEnd} dateLabel={dateLabel}> <ServiceReport data={{ label: dateLabel, ...(viewData.dichvu || { totalRevenue: 0, compareRevenue: 0, percent: 0, items: [] }) }} formatCurrency={formatCurrency} /> </MainLayout> } />
        <Route path="/data" element={ <MainLayout onClearData={handleOpenClearModal} activeMenuTitle="Dữ liệu chi tiết" category="vanglai" onUpload={handleUpload} timeFilter={timeFilter} setTimeFilter={setTimeFilter} customStart={customStart} setCustomStart={setCustomStart} customEnd={customEnd} setCustomEnd={setCustomEnd} dateLabel={dateLabel}> <DataManagement data={rawExcelData} formatCurrency={formatCurrency} /> </MainLayout> } />
      </Routes>
      <ConfirmModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConfirm={executeClearData} />
      <SpeedInsights />
    </Router>
  );
}

export default App;