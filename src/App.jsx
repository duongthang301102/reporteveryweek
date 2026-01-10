import React, { useState, useMemo, useRef, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { Calendar, Upload, Menu, AlertCircle } from 'lucide-react';
import { saveTransactions, getAllTransactions, clearTransactions, clearTransactionsByType } from './db';
import { SpeedInsights } from "@vercel/speed-insights/react";
import { sendEmailReport } from './utils/emailService';

// COMPONENTS & PAGES
import Sidebar from './components/Sidebar';
import ConfirmModal from './components/ConfirmModal';
import SuccessModal from './components/SuccessModal';
import PasswordModal from './components/PasswordModal'; // Đảm bảo đã import file này

// PAGE IMPORTS
import PhacoVangLai from './pages/PhacoVangLai';
import PhacoTuyen from './pages/PhacoTuyen';
import PhacoPKVT from './pages/PhacoPKVT';
import PhacoDoiTac from './pages/PhacoDoiTac';

import MongVangLai from './pages/MongVangLai';
import MongTuyen from './pages/MongTuyen';
import MongPKVT from './pages/MongPKVT';
import MongDoiTac from './pages/MongDoiTac';

import KhucXa from './pages/KhucXa';
import ThuThuat from './pages/ThuThuat';
import TieuPhau from './pages/TieuPhau';
import MonthlyReport from './pages/MonthlyReport'; 
import ServiceReport from './pages/ServiceReport';
import DataManagement from './pages/DataManagement';
import TestImport from './pages/TestImport';

// --- HELPERS (Giữ nguyên) ---
const safeParseNumber = (value) => {
    if (value === null || value === undefined || value === '') return 0;
    const cleanString = String(value).replace(/[^0-9.-]+/g, "");
    const result = Number(cleanString);
    return isNaN(result) ? 0 : result;
};

const parseDateAllFormats = (dateInput) => {
    if (!dateInput) return null;
    if (dateInput instanceof Date) return isNaN(dateInput.getTime()) ? null : dateInput;
    if (typeof dateInput === 'number' && dateInput > 20000) return new Date((dateInput - 25569) * 86400 * 1000);
    if (typeof dateInput === 'string') {
        const cleanStr = dateInput.trim();
        const parts = cleanStr.split(/[-/.]/);
        if (parts.length === 3) {
            let p1 = parseInt(parts[0], 10);
            let p2 = parseInt(parts[1], 10);
            let p3 = parseInt(parts[2], 10);
            if (p1 > 1900) return new Date(p1, p2 - 1, p3);
            if (p3 > 1900) return new Date(p3, p2 - 1, p1);
        }
        const tryDate = new Date(cleanStr);
        if (!isNaN(tryDate.getTime())) return tryDate;
    }
    return null;
};

const FilterButton = ({ label, active, onClick }) => (
  <button onClick={onClick} className={`px-2.5 py-1.5 text-[11px] md:text-sm rounded transition-all duration-200 whitespace-nowrap ${active ? 'bg-[#2D3039] text-white shadow-sm font-medium' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>{label}</button>
);

// --- MAIN LAYOUT ---
const MainLayout = ({ children, timeFilter, setTimeFilter, customStart, setCustomStart, customEnd, setCustomEnd, dateLabel, onUpload, category, activeMenuTitle, onClearData, onSendEmail, hideFilters }) => {
  const fileInputRef = useRef(null);
  const handleFileChange = (e) => { const file = e.target.files[0]; if (file) onUpload(file, category); };
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const handleClearClick = () => { if (onClearData) onClearData(category); };

  return (
    <div className="flex h-screen bg-[#0F1115] text-white overflow-hidden font-sans">
      <Sidebar onClearData={handleClearClick} onSendEmail={onSendEmail} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} /> 
      <main className="flex-1 overflow-y-auto p-3 md:p-8 w-full relative">
        {showDatePicker && (<div className="fixed inset-0 z-30 bg-black/80 md:bg-transparent transition-colors" onClick={() => setShowDatePicker(false)}></div>)}
        <header className="flex flex-col gap-3 md:gap-4 mb-4 md:mb-6 relative z-40">
          <div className="flex items-start gap-2">
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-1.5 bg-[#1C1E26] rounded-lg border border-gray-800 text-gray-300 active:scale-95 mt-0.5"><Menu size={20} /></button>
            <div className="flex flex-col">
                <div className="hidden md:flex items-center gap-2 text-sm text-gray-400 mb-1"><span>Trang chủ</span> / <span className="text-white">Dashboard</span></div>
                <h2 className="text-base sm:text-lg md:text-3xl font-bold truncate text-white leading-tight">{activeMenuTitle}</h2>
                {!hideFilters && (
                    <div className="flex items-center gap-1.5 mt-0.5"><AlertCircle size={12} className="text-amber-500 flex-shrink-0" /><p className="text-[10px] md:text-xs text-amber-500/90 italic font-medium leading-relaxed pt-0.5">Lưu ý: Dữ liệu được cập nhật hàng tuần, xem dữ liệu vào cuối thứ 7 hoặc chủ nhật sẽ chính xác nhất</p></div>
                )}
            </div>
          </div>
          {!hideFilters && (
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-3 md:gap-4 animate-fade-in">
                <div className="w-full md:w-auto flex flex-col sm:flex-row items-start sm:items-center gap-2">
                    <div className="flex bg-[#1C1E26] rounded-lg p-1 border border-gray-800 overflow-x-auto max-w-full scrollbar-hide">
                        <FilterButton label="Tuần này" active={timeFilter === 'week'} onClick={() => { setTimeFilter('week'); setShowDatePicker(false); }} />
                        <FilterButton label="Tháng này" active={timeFilter === 'month'} onClick={() => { setTimeFilter('month'); setShowDatePicker(false); }} />
                        <FilterButton label="Năm nay" active={timeFilter === 'year'} onClick={() => { setTimeFilter('year'); setShowDatePicker(false); }} />
                    </div>
                </div>
                <div className="flex flex-wrap gap-2 w-full md:w-auto relative">
                    <div className="relative">
                        <button onClick={() => setShowDatePicker(!showDatePicker)} className={`flex items-center gap-2 bg-[#1C1E26] px-3 py-1.5 md:py-2 rounded-lg border ${showDatePicker ? 'border-blue-500 text-white' : 'border-gray-800 text-gray-300'} text-[11px] md:text-sm justify-center shadow-inner flex-grow md:flex-grow-0 whitespace-nowrap hover:bg-[#252830] transition-colors`}><Calendar size={14} className={showDatePicker ? "text-white" : "text-blue-400"}/><span className="font-semibold">{dateLabel}</span></button>
                        {showDatePicker && (
                            <div className="bg-[#1C1E26] border border-gray-700 rounded-xl shadow-2xl p-4 w-[300px] z-50 animate-fade-in-down fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 md:absolute md:top-full md:right-0 md:left-auto md:translate-x-0 md:translate-y-0 md:mt-2">
                                <div className="flex justify-between items-center mb-4 border-b border-gray-800 pb-2"><span className="text-sm font-bold text-white">Tùy chọn thời gian</span><button onClick={() => setShowDatePicker(false)} className="p-1 hover:bg-white/10 rounded-full transition"><X size={16} className="text-gray-400 hover:text-white"/></button></div>
                                <div className="space-y-4">
                                    <div><label className="block text-xs font-medium text-gray-400 mb-1.5 ml-1">Từ ngày</label><div className="relative"><input type="date" className="w-full bg-[#2D3039] border border-gray-600 rounded-lg px-3 py-3 text-base text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all appearance-none [color-scheme:dark]" value={customStart} onChange={(e) => {setTimeFilter('custom'); setCustomStart(e.target.value)}}/></div></div>
                                    <div><label className="block text-xs font-medium text-gray-400 mb-1.5 ml-1">Đến ngày</label><div className="relative"><input type="date" className="w-full bg-[#2D3039] border border-gray-600 rounded-lg px-3 py-3 text-base text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all appearance-none [color-scheme:dark]" value={customEnd} onChange={(e) => {setTimeFilter('custom'); setCustomEnd(e.target.value)}}/></div></div>
                                    <button onClick={() => setShowDatePicker(false)} className="w-full bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white py-3 rounded-lg text-sm font-bold uppercase tracking-wide flex items-center justify-center gap-2 mt-2 shadow-lg hover:shadow-blue-500/20 transition-all"><Check size={16} strokeWidth={3} /> Áp dụng</button>
                                </div>
                            </div>
                        )}
                    </div>
                    {onUpload && (
                        <>
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".xlsx, .xls" className="hidden" />
                            {category === 'phau_thuat' ? (
                                <button onClick={() => fileInputRef.current.click()} className="bg-purple-600 hover:bg-purple-500 active:scale-95 text-white px-3 md:px-4 py-1.5 md:py-2 rounded-lg flex items-center justify-center gap-2 text-[11px] md:text-sm font-medium transition duration-200 flex-grow md:flex-grow-0 whitespace-nowrap shadow-lg shadow-purple-500/20">
                                    <Upload size={14} /> <span className="hidden sm:inline">Nhập Excel Phẫu Thuật</span> <span className="sm:hidden">Nhập PT</span>
                                </button>
                            ) : (
                                <button onClick={() => fileInputRef.current.click()} className="bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white px-3 md:px-4 py-1.5 md:py-2 rounded-lg flex items-center justify-center gap-2 text-[11px] md:text-sm font-medium transition duration-200 flex-grow md:flex-grow-0 whitespace-nowrap">
                                    <Upload size={14} /> <span className="hidden sm:inline">Nhập Excel Dịch Vụ</span> <span className="sm:hidden">Nhập DV</span>
                                </button>
                            )}
                        </>
                    )}
                </div>
              </div>
          )}
        </header>
        <div className="pb-10">{children}</div>
      </main>
    </div>
  );
};

// --- APP COMPONENT ---
function App() {
  const [timeFilter, setTimeFilter] = useState('month'); 
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [rawExcelData, setRawExcelData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // State cho Modal
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal Xác nhận "Có/Không"
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false); // Modal "Thành công"
  const [successMessage, setSuccessMessage] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  
  // [MỚI] State cho Modal Mật khẩu
  const [isDeletePasswordOpen, setIsDeletePasswordOpen] = useState(false);

  const [viewData, setViewData] = useState({ 
    vanglai: null, tuyen: null, phaco_pkvt: null, phaco_doitac: null,
    mong_vanglai: null, mong_tuyen: null, mong_pkvt: null, mong_doitac: null,
    khucxa: null, dichvu: null
  });

  useEffect(() => {
    const loadData = async () => { try { const data = await getAllTransactions(); if(data) setRawExcelData(data); } finally { setIsLoading(false); } };
    loadData();
  }, []);

  // 1. Khi người dùng bấm nút "Xóa dữ liệu" ở Sidebar
  // -> Mở Modal Mật khẩu trước (chưa mở Modal Xác nhận vội)
  const handleOpenClearModal = (category) => { 
      setDeleteTarget(category); 
      setIsDeletePasswordOpen(true); 
  };

  // 2. Khi nhập Mật khẩu đúng
  // -> Đóng Modal Mật khẩu, Mở Modal Xác nhận "Bạn có chắc không?"
  const handleDeletePasswordSuccess = () => {
      setIsDeletePasswordOpen(false);
      setIsModalOpen(true); 
  };

  const executeClearData = async (targetIdFromModal) => { 
    if (!targetIdFromModal) return;
    if (targetIdFromModal === 'all') { await clearTransactions(); setSuccessMessage("Đã xóa sạch TOÀN BỘ dữ liệu!"); } 
    else { await clearTransactionsByType(targetIdFromModal); setSuccessMessage(`Đã xóa dữ liệu của mục: ${targetIdFromModal}`); }
    setIsModalOpen(false); setIsSuccessModalOpen(true);
  };

  const handleUpload = (file, category) => {
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const bstr = evt.target.result;
      const workbook = XLSX.read(bstr, { type: 'binary', cellText: false, cellDates: true });
      const ws = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(ws, { raw: false });

      if (jsonData.length > 0) {
        if (category === 'phau_thuat') {
            const processedRows = jsonData.map(row => {
                const newRow = {}; Object.keys(row).forEach(key => { newRow[key.trim().toLowerCase()] = row[key]; });
                const findVal = (keys) => { const k = Object.keys(newRow).find(nk => keys.some(w => nk.includes(w))); return k ? newRow[k] : null; };
                const rawTen = findVal(['tên gói', 'ten goi']) || ''; const nameStr = String(rawTen).trim(); const lowerName = nameStr.toLowerCase();
                const isKhucXa = lowerName.includes('phẫu thuật khúc xạ'); const isPhaco = lowerName.includes('phaco'); const isMong = lowerName.includes('mộng') || lowerName.includes('pterygium') || lowerName.includes('ghép');
                if (!isPhaco && !isMong && !isKhucXa) return null; 
                const rawTuyen = findVal(['tuyến', 'tuyen', 'đối tượng']) || ''; const valTuyen = String(rawTuyen).trim().toLowerCase();
                let source = ''; 
                if (valTuyen.includes('pkvt')) source = 'pkvt'; else if (valTuyen.includes('đối tác') || valTuyen.includes('doi tac')) source = 'doitac'; else if (valTuyen.includes('vãng') || valTuyen.includes('vang')) source = 'vanglai'; else if (valTuyen.includes('tuyến') || valTuyen.includes('tuyen')) source = 'tuyen';
                if (!isKhucXa && !source) return null;
                let donGia = 0; let giaBaoHiem = 0; let finalType = ''; 
                
                if (isKhucXa) {
                    finalType = 'khucxa'; donGia = Number(findVal(['đơn giá', 'giá']) || 0);
                    if (lowerName.includes('phakic')) donGia = 90000000; else if (lowerName.includes('smile')) donGia = 45000000; else if (lowerName.includes('femto')) donGia = 29000000; else if (lowerName.includes('lasik')) donGia = 18000000;
                    if (donGia >= 40000000) newRow['loại gói'] = 'Cao cấp'; else newRow['loại gói'] = 'Cơ bản';
                } else if (isMong) {
                    const isMongKep = isMong && (lowerName.includes('kép') || lowerName.includes('ghép')); giaBaoHiem = 1223550;
                    if (source === 'tuyen') { donGia = isMongKep ? 3300000 : 2800000; finalType = 'mong_tuyen'; } else if (source === 'pkvt') { donGia = isMongKep ? 4650000 : 4250000; finalType = 'mong_pkvt'; } else if (source === 'doitac') { donGia = isMongKep ? 4650000 : 4250000; finalType = 'mong_doitac'; } else { donGia = isMongKep ? 4650000 : 4250000; finalType = 'mong_vanglai'; }
                    newRow['loại gói'] = isMongKep ? 'Cao cấp' : 'Cơ bản'; 
                } else {
                    giaBaoHiem = 6146950; if (lowerName.includes('phaco 0') || lowerName.includes('phaco 500')) giaBaoHiem = 5946950;
                    const normalizedName = nameStr.replace(/,/g, '.'); const priceMatch = normalizedName.match(/(\d+(\.\d+)?)/); let extracted = 0;
                    if (priceMatch) { extracted = parseFloat(priceMatch[0]); if (extracted < 100) donGia = extracted * 1000000; else if (extracted >= 100 && extracted < 1000) donGia = extracted * 1000; else donGia = extracted; } else { donGia = Number(findVal(['đơn giá', 'giá']) || 0); } if (donGia === 0) donGia = giaBaoHiem;
                    if (source === 'pkvt') finalType = 'phaco_pkvt'; else if (source === 'doitac') finalType = 'phaco_doitac'; else if (source === 'tuyen') finalType = 'tuyen'; else finalType = 'vanglai';
                    if (extracted >= 20 && extracted < 100) newRow['loại gói'] = 'Cao cấp'; else if ((String(findVal(['loại', 'phân loại']) || '') + nameStr).toLowerCase().includes('cao cấp')) newRow['loại gói'] = 'Cao cấp'; else newRow['loại gói'] = 'Cơ bản';
                }
                newRow['đơn giá'] = donGia; newRow['giá bảo hiểm'] = giaBaoHiem; newRow['type'] = finalType; newRow['tên gói'] = nameStr; return newRow;
            }).filter(item => item !== null);
            if (processedRows.length > 0) { setRawExcelData(prev => [...prev, ...processedRows]); await saveTransactions(processedRows); setSuccessMessage(`Đã nhập thành công ${processedRows.length} ca hợp lệ!`); setIsSuccessModalOpen(true); } else { alert("Không tìm thấy dữ liệu hợp lệ!"); }
        } else {
            const cleanData = jsonData.map(row => { const newRow = {}; Object.keys(row).forEach(key => { newRow[key.trim().toLowerCase()] = row[key]; }); return { ...newRow, type: 'dichvu' }; });
            setRawExcelData(prev => [...prev, ...cleanData]); await saveTransactions(cleanData); setSuccessMessage(`Đã thêm ${cleanData.length} dòng dịch vụ!`); setIsSuccessModalOpen(true);
        }
      }
    };
    reader.readAsBinaryString(file);
  };

  const calculatePhacoStats = (dataSubset, rangeCurrent, rangePrevious) => {
    const initStats = () => ({ sales: 0, revenue: 0, insRev: 0, patRev: 0, details: {} });
    let current = { totalRevenue: 0, basic: initStats(), premium: initStats() };
    let prev = { totalRevenue: 0, basic: {insRev:0, patRev:0}, premium: {insRev:0, patRev:0} };
    dataSubset.forEach(row => {
        const rowDate = parseDateAllFormats(row['ngày']); if (!rowDate || isNaN(rowDate.getTime())) return; rowDate.setHours(0,0,0,0);
        const soLuong = safeParseNumber(row['số lượng']) || 1; const donGia = safeParseNumber(row['đơn giá']); const giaBaoHiem = safeParseNumber(row['giá bảo hiểm']);
        const loaiGoi = row['loại gói'] ? String(row['loại gói']).toLowerCase().trim() : ''; const tenGoi = row['tên gói'] ? String(row['tên gói']).trim() : 'Khác';
        const dtBaoHiem = giaBaoHiem * soLuong; const dtBenhNhan = (donGia - giaBaoHiem) * soLuong; const thanhTien = dtBaoHiem + dtBenhNhan;
        if (rowDate >= rangeCurrent.start && rowDate <= rangeCurrent.end) {
            current.totalRevenue += thanhTien;
            if (loaiGoi.includes('cơ bản')) { current.basic.sales += soLuong; current.basic.revenue += thanhTien; current.basic.insRev += dtBaoHiem; current.basic.patRev += dtBenhNhan; current.basic.details[tenGoi] = (current.basic.details[tenGoi] || 0) + soLuong; } 
            else { current.premium.sales += soLuong; current.premium.revenue += thanhTien; current.premium.insRev += dtBaoHiem; current.premium.patRev += dtBenhNhan; current.premium.details[tenGoi] = (current.premium.details[tenGoi] || 0) + soLuong; }
        } else if (rangePrevious && rowDate >= rangePrevious.start && rowDate <= rangePrevious.end) {
            prev.totalRevenue += thanhTien;
            if (loaiGoi.includes('cơ bản')) { prev.basic.insRev += dtBaoHiem; prev.basic.patRev += dtBenhNhan; } else { prev.premium.insRev += dtBaoHiem; prev.premium.patRev += dtBenhNhan; }
        }
    });
    const calcGrowth = (curr, pre) => timeFilter === 'custom' ? null : pre === 0 ? (curr > 0 ? 100 : 0) : ((curr - pre) / pre) * 100;
    const formatDetails = (obj) => Object.keys(obj).map(k => ({ name: k, qty: obj[k] })).sort((a,b) => b.qty - a.qty);
    return { totalRevenue: current.totalRevenue, compareRevenue: timeFilter === 'custom' ? null : prev.totalRevenue, percent: calcGrowth(current.totalRevenue, prev.totalRevenue), basic: { sales: current.basic.sales, insRev: current.basic.insRev, patRev: current.basic.patRev, details: formatDetails(current.basic.details) }, premium: { sales: current.premium.sales, insRev: current.premium.insRev, patRev: current.premium.patRev, details: formatDetails(current.premium.details) } };
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
    const { start, end } = getDateRange(timeFilter, 0); if (!start) return "";
    let displayEnd = end; const today = new Date(); if (today >= start && today <= end) { displayEnd = today; } const f = (d) => `${(d.getDate()+'').padStart(2,'0')}/${(d.getMonth()+1+'').padStart(2,'0')}`;
    if (timeFilter === 'year') return `Năm ${start.getFullYear()} (đến ${f(displayEnd)})`; return `${f(start)} - ${f(displayEnd)}`;
  }, [timeFilter, customStart, customEnd]);

  const handleSendEmailReport = async () => {
    if (!rawExcelData || rawExcelData.length === 0) { alert("Chưa có dữ liệu gốc!"); return; }
    const weekRange = getDateRange('week', 0); if (!weekRange.start || !weekRange.end) { alert("Lỗi thời gian."); return; }
    const snapPhacoVL = calculatePhacoStats(rawExcelData.filter(d => d.type === 'vanglai'), weekRange, null);
    const snapPhacoTuyen = calculatePhacoStats(rawExcelData.filter(d => d.type === 'tuyen'), weekRange, null);
    const snapPhacoPKVT = calculatePhacoStats(rawExcelData.filter(d => d.type === 'phaco_pkvt'), weekRange, null);
    const snapPhacoDT = calculatePhacoStats(rawExcelData.filter(d => d.type === 'phaco_doitac'), weekRange, null);
    const snapMongVL = calculatePhacoStats(rawExcelData.filter(d => d.type === 'mong_vanglai'), weekRange, null);
    const snapMongTuyen = calculatePhacoStats(rawExcelData.filter(d => d.type === 'mong_tuyen'), weekRange, null);
    const snapMongPKVT = calculatePhacoStats(rawExcelData.filter(d => d.type === 'mong_pkvt'), weekRange, null);
    const snapMongDT = calculatePhacoStats(rawExcelData.filter(d => d.type === 'mong_doitac'), weekRange, null);
    const snapKhucXa = calculatePhacoStats(rawExcelData.filter(d => d.type === 'khucxa'), weekRange, null);
    const snapDV = calculateServices(rawExcelData.filter(d => d.type === 'dichvu'), weekRange, null);
    const fDate = (d) => `${(d.getDate()+'').padStart(2,'0')}/${(d.getMonth()+1+'').padStart(2,'0')}`;
    const dateRangeLabel = `${fDate(weekRange.start)} - ${fDate(weekRange.end)} (Năm ${weekRange.start.getFullYear()})`;
    const emailData = { dateRange: dateRangeLabel, totalAll: (snapPhacoVL.totalRevenue || 0) + (snapPhacoTuyen.totalRevenue || 0) + (snapPhacoPKVT.totalRevenue || 0) + (snapPhacoDT.totalRevenue || 0) + (snapMongVL.totalRevenue || 0) + (snapMongTuyen.totalRevenue || 0) + (snapKhucXa.totalRevenue || 0) + (snapDV.totalRevenue || 0), vanglai: snapPhacoVL, tuyen: snapPhacoTuyen, dichvu: snapDV };
    const result = await sendEmailReport(emailData); if (result.success) { setSuccessMessage(`Đã gửi báo cáo TUẦN (${dateRangeLabel}) thành công!`); setIsSuccessModalOpen(true); } else { alert("❌ Gửi thất bại."); }
  };

  useEffect(() => {
    const rangeCurrent = getDateRange(timeFilter, 0); if (timeFilter === 'custom' && (!rangeCurrent.start || !rangeCurrent.end)) return;
    let rangePrevious = timeFilter !== 'custom' ? getDateRange(timeFilter, 1) : null;
    if (rangePrevious && timeFilter !== 'custom') { const today = new Date(); if (today >= rangeCurrent.start && today <= rangeCurrent.end) { const timePassed = today.getTime() - rangeCurrent.start.getTime(); const newPrevEnd = new Date(rangePrevious.start.getTime() + timePassed); if (newPrevEnd < rangePrevious.end) { rangePrevious.end = newPrevEnd; rangePrevious.end.setHours(23, 59, 59, 999); } } }
    setViewData({
        vanglai: calculatePhacoStats(rawExcelData.filter(d => d.type === 'vanglai'), rangeCurrent, rangePrevious),
        tuyen: calculatePhacoStats(rawExcelData.filter(d => d.type === 'tuyen'), rangeCurrent, rangePrevious),
        phaco_pkvt: calculatePhacoStats(rawExcelData.filter(d => d.type === 'phaco_pkvt'), rangeCurrent, rangePrevious),
        phaco_doitac: calculatePhacoStats(rawExcelData.filter(d => d.type === 'phaco_doitac'), rangeCurrent, rangePrevious),
        mong_vanglai: calculatePhacoStats(rawExcelData.filter(d => d.type === 'mong_vanglai'), rangeCurrent, rangePrevious),
        mong_tuyen: calculatePhacoStats(rawExcelData.filter(d => d.type === 'mong_tuyen'), rangeCurrent, rangePrevious),
        mong_pkvt: calculatePhacoStats(rawExcelData.filter(d => d.type === 'mong_pkvt'), rangeCurrent, rangePrevious),
        mong_doitac: calculatePhacoStats(rawExcelData.filter(d => d.type === 'mong_doitac'), rangeCurrent, rangePrevious),
        khucxa: calculatePhacoStats(rawExcelData.filter(d => d.type === 'khucxa'), rangeCurrent, rangePrevious), 
        dichvu: calculateServices(rawExcelData.filter(d => d.type === 'dichvu'), rangeCurrent, rangePrevious)
    });
  }, [rawExcelData, timeFilter, customStart, customEnd]);

  const formatCurrency = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  const getSafeData = (data) => data || { totalRevenue: 0, percent: 0, compareRevenue: 0, chart: [], basic: {}, premium: {} };

  if (isLoading) return <div className="flex h-screen bg-[#0F1115] text-white items-center justify-center">Đang tải dữ liệu...</div>;

  return (
    <Router>
      <Routes>
        <Route path="/" element={ <MainLayout onClearData={handleOpenClearModal} onSendEmail={handleSendEmailReport} activeMenuTitle="Báo Cáo Tổng Hợp" category="report" onUpload={() => {}} timeFilter={timeFilter} setTimeFilter={setTimeFilter} customStart={customStart} setCustomStart={setCustomStart} customEnd={customEnd} setCustomEnd={setCustomEnd} dateLabel={dateLabel} hideFilters={true}> <MonthlyReport data={rawExcelData} formatCurrency={formatCurrency} /> </MainLayout> } />
        <Route path="/phaco-vang-lai" element={ <MainLayout onClearData={handleOpenClearModal} onSendEmail={handleSendEmailReport} activeMenuTitle="Phaco Vãng Lai" category="vanglai" onUpload={handleUpload} timeFilter={timeFilter} setTimeFilter={setTimeFilter} customStart={customStart} setCustomStart={setCustomStart} customEnd={customEnd} setCustomEnd={setCustomEnd} dateLabel={dateLabel}> <PhacoVangLai data={{ summary: { label: dateLabel, ...getSafeData(viewData.vanglai) }, packages: getSafeData(viewData.vanglai) }} formatCurrency={formatCurrency} /> </MainLayout> } />
        <Route path="/phaco-tuyen" element={ <MainLayout onClearData={handleOpenClearModal} onSendEmail={handleSendEmailReport} activeMenuTitle="Phaco Tuyến" category="tuyen" onUpload={handleUpload} timeFilter={timeFilter} setTimeFilter={setTimeFilter} customStart={customStart} setCustomStart={setCustomStart} customEnd={customEnd} setCustomEnd={setCustomEnd} dateLabel={dateLabel}> <PhacoTuyen data={{ summary: { label: dateLabel, ...getSafeData(viewData.tuyen) }, phacoTuyen: getSafeData(viewData.tuyen) }} formatCurrency={formatCurrency} /> </MainLayout> } />
        <Route path="/phaco-pkvt" element={ <MainLayout onClearData={handleOpenClearModal} onSendEmail={handleSendEmailReport} activeMenuTitle="Phaco PKVT" category="phaco_pkvt" onUpload={handleUpload} timeFilter={timeFilter} setTimeFilter={setTimeFilter} customStart={customStart} setCustomStart={setCustomStart} customEnd={customEnd} setCustomEnd={setCustomEnd} dateLabel={dateLabel}> <PhacoPKVT data={getSafeData(viewData.phaco_pkvt)} formatCurrency={formatCurrency} /> </MainLayout> } />
        <Route path="/phaco-doitac" element={ <MainLayout onClearData={handleOpenClearModal} onSendEmail={handleSendEmailReport} activeMenuTitle="Phaco Đối Tác" category="phaco_doitac" onUpload={handleUpload} timeFilter={timeFilter} setTimeFilter={setTimeFilter} customStart={customStart} setCustomStart={setCustomStart} customEnd={customEnd} setCustomEnd={setCustomEnd} dateLabel={dateLabel}> <PhacoDoiTac data={getSafeData(viewData.phaco_doitac)} formatCurrency={formatCurrency} /> </MainLayout> } />
        <Route path="/mong-vang-lai" element={ <MainLayout onClearData={handleOpenClearModal} onSendEmail={handleSendEmailReport} activeMenuTitle="Mộng Vãng Lai" category="mong_vanglai" onUpload={handleUpload} timeFilter={timeFilter} setTimeFilter={setTimeFilter} customStart={customStart} setCustomStart={setCustomStart} customEnd={customEnd} setCustomEnd={setCustomEnd} dateLabel={dateLabel}> <MongVangLai data={{ summary: { label: dateLabel, ...getSafeData(viewData.mong_vanglai) }, packages: getSafeData(viewData.mong_vanglai) }} formatCurrency={formatCurrency} /> </MainLayout> } />
        <Route path="/mong-tuyen" element={ <MainLayout onClearData={handleOpenClearModal} onSendEmail={handleSendEmailReport} activeMenuTitle="Mộng Tuyến" category="mong_tuyen" onUpload={handleUpload} timeFilter={timeFilter} setTimeFilter={setTimeFilter} customStart={customStart} setCustomStart={setCustomStart} customEnd={customEnd} setCustomEnd={setCustomEnd} dateLabel={dateLabel}> <MongTuyen data={{ summary: { label: dateLabel, ...getSafeData(viewData.mong_tuyen) }, packages: getSafeData(viewData.mong_tuyen) }} formatCurrency={formatCurrency} /> </MainLayout> } />
        <Route path="/mong-pkvt" element={ <MainLayout onClearData={handleOpenClearModal} onSendEmail={handleSendEmailReport} activeMenuTitle="Mộng PKVT" category="mong_pkvt" onUpload={handleUpload} timeFilter={timeFilter} setTimeFilter={setTimeFilter} customStart={customStart} setCustomStart={setCustomStart} customEnd={customEnd} setCustomEnd={setCustomEnd} dateLabel={dateLabel}> <MongPKVT data={getSafeData(viewData.mong_pkvt)} formatCurrency={formatCurrency} /> </MainLayout> } />
        <Route path="/mong-doitac" element={ <MainLayout onClearData={handleOpenClearModal} onSendEmail={handleSendEmailReport} activeMenuTitle="Mộng Đối Tác" category="mong_doitac" onUpload={handleUpload} timeFilter={timeFilter} setTimeFilter={setTimeFilter} customStart={customStart} setCustomStart={setCustomStart} customEnd={customEnd} setCustomEnd={setCustomEnd} dateLabel={dateLabel}> <MongDoiTac data={getSafeData(viewData.mong_doitac)} formatCurrency={formatCurrency} /> </MainLayout> } />
        <Route path="/khuc-xa" element={ <MainLayout onClearData={handleOpenClearModal} onSendEmail={handleSendEmailReport} activeMenuTitle="Phẫu thuật Khúc Xạ" category="khucxa" onUpload={handleUpload} timeFilter={timeFilter} setTimeFilter={setTimeFilter} customStart={customStart} setCustomStart={setCustomStart} customEnd={customEnd} setCustomEnd={setCustomEnd} dateLabel={dateLabel}> <KhucXa data={{ summary: { label: dateLabel, ...getSafeData(viewData.khucxa) }, packages: getSafeData(viewData.khucxa) }} formatCurrency={formatCurrency} /> </MainLayout> } />
        <Route path="/thu-thuat" element={ <MainLayout onClearData={handleOpenClearModal} onSendEmail={handleSendEmailReport} activeMenuTitle="Thủ Thuật" category="dichvu" onUpload={() => {}} timeFilter={timeFilter} setTimeFilter={setTimeFilter} customStart={customStart} setCustomStart={setCustomStart} customEnd={customEnd} setCustomEnd={setCustomEnd} dateLabel={dateLabel}> <ThuThuat /> </MainLayout> } />
        <Route path="/tieu-phau" element={ <MainLayout onClearData={handleOpenClearModal} onSendEmail={handleSendEmailReport} activeMenuTitle="Tiểu Phẫu" category="dichvu" onUpload={() => {}} timeFilter={timeFilter} setTimeFilter={setTimeFilter} customStart={customStart} setCustomStart={setCustomStart} customEnd={customEnd} setCustomEnd={setCustomEnd} dateLabel={dateLabel}> <TieuPhau /> </MainLayout> } />
        <Route path="/services" element={ <MainLayout onClearData={handleOpenClearModal} onSendEmail={handleSendEmailReport} activeMenuTitle="Combo" category="dichvu" onUpload={handleUpload} timeFilter={timeFilter} setTimeFilter={setTimeFilter} customStart={customStart} setCustomStart={setCustomStart} customEnd={customEnd} setCustomEnd={setCustomEnd} dateLabel={dateLabel}> <ServiceReport data={{ label: dateLabel, ...(viewData.dichvu || { totalRevenue: 0, compareRevenue: 0, percent: 0, items: [] }) }} formatCurrency={formatCurrency} /> </MainLayout> } />
        <Route path="/data" element={ <MainLayout onClearData={handleOpenClearModal} onSendEmail={handleSendEmailReport} activeMenuTitle="Dữ liệu chi tiết" category="vanglai" onUpload={handleUpload} timeFilter={timeFilter} setTimeFilter={setTimeFilter} customStart={customStart} setCustomStart={setCustomStart} customEnd={customEnd} setCustomEnd={setCustomEnd} dateLabel={dateLabel}> <DataManagement data={rawExcelData} formatCurrency={formatCurrency} /> </MainLayout> } />
        <Route path="/test-import" element={ <MainLayout onClearData={handleOpenClearModal} onSendEmail={handleSendEmailReport} activeMenuTitle="Test Nhập Liệu" category="test" onUpload={() => {}} timeFilter={timeFilter} setTimeFilter={setTimeFilter} customStart={customStart} setCustomStart={setCustomStart} customEnd={customEnd} setCustomEnd={setCustomEnd} dateLabel={dateLabel}> <TestImport formatCurrency={formatCurrency} /> </MainLayout> } />
      </Routes>
      
      {/* Modal xác nhận xóa */}
      <ConfirmModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConfirm={executeClearData} />
      
      {/* Modal thành công */}
      <SuccessModal isOpen={isSuccessModalOpen} onClose={() => { setIsSuccessModalOpen(false); window.location.reload(); }} message={successMessage} />
      
      {/* [MỚI] Modal nhập mật khẩu để xóa dữ liệu */}
      <PasswordModal 
          isOpen={isDeletePasswordOpen} 
          onClose={() => setIsDeletePasswordOpen(false)} 
          onSuccess={handleDeletePasswordSuccess}
          title="Xác thực Xóa dữ liệu"
      />
      
      <SpeedInsights />
    </Router>
  );
}

export default App;