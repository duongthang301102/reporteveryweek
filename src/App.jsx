import React, { useState, useMemo, useRef, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { Calendar, Upload, Menu, AlertCircle, X, Check, ChevronRight, CalendarDays, CalendarRange, Filter } from 'lucide-react';
import { saveTransactions, getAllTransactions, clearTransactions, clearTransactionsByType } from './db';
import { SpeedInsights } from "@vercel/speed-insights/react";
import { sendEmailReport } from './utils/emailService';

import TestGoogleSheet from './pages/TestGoogleSheet';

// COMPONENTS & PAGES
import Sidebar from './components/Sidebar';
import ConfirmModal from './components/ConfirmModal';
import SuccessModal from './components/SuccessModal';
import PasswordModal from './components/PasswordModal';
import LoginPage from './pages/LoginPage';
import UserManagement from './pages/UserManagement';

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

// --- [COMPONENT CHỌN KỲ MỚI] ---
const PeriodPicker = ({ isOpen, onClose, onApply, initialConfig }) => {
    const [localConfig, setLocalConfig] = useState(initialConfig);
    useEffect(() => { if (isOpen) setLocalConfig(initialConfig); }, [isOpen, initialConfig]);
    const handleApply = () => { onApply(localConfig); onClose(); };
    if (!isOpen) return null;
    return (
        <>
            <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
            <div className="z-50 bg-[#1C1E26] border border-gray-700 rounded-2xl shadow-2xl animate-fade-in-up fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-[340px]">
                <div className="bg-gradient-to-r from-blue-900/60 to-purple-900/60 p-4 border-b border-gray-700 flex justify-between items-center rounded-t-2xl">
                    <h3 className="text-white font-bold flex items-center gap-2 text-sm"><CalendarDays size={18} className="text-blue-400"/> Chọn Kỳ Báo Cáo</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition bg-white/5 p-1.5 rounded-full"><X size={16}/></button>
                </div>
                <div className="p-5 space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] uppercase font-bold text-gray-500 mb-1.5 block">Tháng</label>
                            <div className="relative">
                                <select className="w-full bg-[#13151A] border border-gray-700 text-white rounded-xl px-3 py-2.5 outline-none focus:border-blue-500 text-sm appearance-none cursor-pointer" value={localConfig.month} onChange={(e) => setLocalConfig({...localConfig, month: parseInt(e.target.value)})}>
                                    {Array.from({length: 12}, (_, i) => i).map(m => (<option key={m} value={m}>Tháng {m + 1}</option>))}
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500"><ChevronRight size={14} className="rotate-90"/></div>
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] uppercase font-bold text-gray-500 mb-1.5 block">Năm</label>
                            <div className="relative">
                                <select className="w-full bg-[#13151A] border border-gray-700 text-white rounded-xl px-3 py-2.5 outline-none focus:border-blue-500 text-sm appearance-none cursor-pointer" value={localConfig.year} onChange={(e) => setLocalConfig({...localConfig, year: parseInt(e.target.value)})}>
                                    {Array.from({length: 5}, (_, i) => new Date().getFullYear() - 2 + i).map(y => (<option key={y} value={y}>{y}</option>))}
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500"><ChevronRight size={14} className="rotate-90"/></div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] uppercase font-bold text-gray-500 mb-2 block">Chọn Kỳ (7 ngày/kỳ)</label>
                        <div className="grid grid-cols-2 gap-3">
                            {[1, 2, 3, 4].map(p => (
                                <button key={p} onClick={() => setLocalConfig({...localConfig, period: p})} className={`relative py-3 px-3 rounded-xl text-sm font-bold border transition-all flex flex-col items-center justify-center gap-1 ${localConfig.period === p ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/30' : 'bg-[#13151A] border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-200'}`}>
                                    {localConfig.period === p && <div className="absolute top-1.5 right-1.5"><Check size={12} strokeWidth={4}/></div>}
                                    <span>Kỳ {p}</span>
                                    <span className={`text-[10px] font-normal ${localConfig.period === p ? 'text-blue-100' : 'text-gray-600'}`}>{p === 1 ? '01 - 07' : p === 2 ? '08 - 14' : p === 3 ? '15 - 21' : '22 - Cuối'}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="pt-2">
                        <button onClick={handleApply} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-bold py-3 rounded-xl shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-all active:scale-95"><Check size={18} strokeWidth={3}/> XEM BÁO CÁO</button>
                    </div>
                </div>
            </div>
        </>
    );
};

// --- [COMPONENT LỊCH CŨ CỦA BẠN - ĐÃ SỬA Z-INDEX] ---
const CustomCalendar = ({ label, value, onChange }) => {
    const [showCalendar, setShowCalendar] = useState(false);
    const [viewDate, setViewDate] = useState(value ? new Date(value) : new Date());
    const daysOfWeek = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    useEffect(() => { if (value) setViewDate(new Date(value)); }, [value]);
    const getDaysInMonth = (date) => { const year = date.getFullYear(); const month = date.getMonth(); const days = new Date(year, month + 1, 0).getDate(); const firstDay = new Date(year, month, 1).getDay(); return { days, firstDay }; };
    const handlePrevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    const handleNextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    const handleSelectDate = (day) => { const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day); const formatted = `${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`; onChange(formatted); setShowCalendar(false); };
    const { days, firstDay } = getDaysInMonth(viewDate); const blanks = Array(firstDay).fill(null); const currentDays = Array.from({ length: days }, (_, i) => i + 1); const displayValue = value ? new Date(value).toLocaleDateString('vi-VN') : '';
    return (
        <div className="relative w-full">
            <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block pl-1">{label}</label>
            <div onClick={() => setShowCalendar(!showCalendar)} className="w-full bg-[#13151A] border border-gray-700 text-white text-sm rounded-xl px-3 py-3 outline-none flex items-center justify-between cursor-pointer hover:border-blue-500 transition-colors shadow-sm"><span className="truncate">{displayValue || "Chọn ngày..."}</span><Calendar size={16} className="text-gray-500 flex-shrink-0 ml-2"/></div>
            {showCalendar && ( <> <div className="fixed inset-0 z-[60]" onClick={() => setShowCalendar(false)}></div> <div className="absolute top-full left-0 mt-2 bg-[#252830] border border-gray-600 rounded-xl shadow-[0_20px_50px_-10px_rgba(0,0,0,0.9)] z-[70] p-3 w-[280px] animate-fade-in-up"> <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-600"> <button onClick={handlePrevMonth} className="p-1 hover:bg-gray-600 rounded text-gray-400 hover:text-white"><ChevronRight size={16} className="rotate-180"/></button> <span className="font-bold text-white text-sm">Tháng {viewDate.getMonth() + 1}, {viewDate.getFullYear()}</span> <button onClick={handleNextMonth} className="p-1 hover:bg-gray-600 rounded text-gray-400 hover:text-white"><ChevronRight size={16}/></button> </div> <div className="grid grid-cols-7 gap-1 mb-2 text-center"> {daysOfWeek.map(d => (<span key={d} className="text-[10px] font-bold text-gray-500">{d}</span>))} </div> <div className="grid grid-cols-7 gap-1"> {blanks.map((_, i) => <div key={`blank-${i}`} />)} {currentDays.map(day => { const d = new Date(viewDate.getFullYear(), viewDate.getMonth(), day); const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`; const isSelected = value === dateStr; const isToday = new Date().toLocaleDateString('en-CA') === dateStr; return ( <button key={day} onClick={() => handleSelectDate(day)} className={`h-8 w-8 rounded-lg text-xs font-medium flex items-center justify-center transition-all ${isSelected ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-gray-300 hover:bg-gray-600 hover:text-white'} ${isToday && !isSelected ? 'border border-blue-500/50 text-blue-400' : ''}`}>{day}</button> ); })} </div> </div> </> )}
        </div>
    );
};

const CustomDatePicker = ({ isOpen, onClose, onApply, initialStart, initialEnd }) => {
    const [localStart, setLocalStart] = useState(initialStart);
    const [localEnd, setLocalEnd] = useState(initialEnd);
    useEffect(() => { if (isOpen) { const today = new Date(); const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`; setLocalStart(initialStart || todayStr); setLocalEnd(initialEnd || todayStr); } }, [isOpen, initialStart, initialEnd]);
    const handleApply = () => { if (localStart && localEnd) { onApply(localStart, localEnd); onClose(); } };
    if (!isOpen) return null;
    return (
        <> <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm transition-opacity" onClick={onClose}></div> <div className="z-50 bg-[#1C1E26] border border-gray-700 rounded-2xl shadow-2xl animate-fade-in-up fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-[360px] overflow-visible"> <div className="bg-gradient-to-r from-blue-900/60 to-purple-900/60 p-4 border-b border-gray-700 flex justify-between items-center rounded-t-2xl"> <h3 className="text-white font-bold flex items-center gap-2 text-sm"> <CalendarRange size={18} className="text-blue-400"/> Tùy chọn thời gian </h3> <button onClick={onClose} className="text-gray-400 hover:text-white transition bg-white/5 p-1.5 rounded-full"><X size={16}/></button> </div> <div className="p-6"> <div className="flex flex-col gap-5 mb-6 relative"> <div className="relative z-20"><CustomCalendar label="Từ ngày" value={localStart} onChange={setLocalStart} /></div> <div className="relative z-10"><CustomCalendar label="Đến ngày" value={localEnd} onChange={setLocalEnd} /></div> </div> <div className="pt-2 border-t border-gray-700 flex justify-end gap-3"> <button onClick={onClose} className="px-4 py-2.5 text-xs font-bold text-gray-400 hover:text-white transition bg-gray-800 hover:bg-gray-700 rounded-xl">Hủy</button> <button onClick={handleApply} className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2.5 px-6 rounded-xl shadow-lg shadow-blue-500/20 flex items-center gap-2 transition-all active:scale-95"> <Check size={16} strokeWidth={3}/> ÁP DỤNG </button> </div> </div> </div> </>
    );
};

// --- [MAIN LAYOUT - ĐÃ SỬA: XÓA NÚT UPLOAD Ở ĐÂY, TRUYỀN XUỐNG SIDEBAR] ---
const MainLayout = ({ children, viewMode, setViewMode, periodConfig, setPeriodConfig, customStart, setCustomStart, customEnd, setCustomEnd, dateLabel, onUpload, uploadCategory, category, activeMenuTitle, onClearData, onSendEmail, hideFilters, onLogout, currentUser }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showPeriodPicker, setShowPeriodPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // [LOGIC] Ưu tiên dùng uploadCategory truyền vào, nếu không có thì dùng category
  const finalUploadType = uploadCategory || category;

  const handleClearClick = () => { if (onClearData) onClearData(finalUploadType); };

  const handlePeriodApply = (newConfig) => {
      setPeriodConfig(newConfig);
      setViewMode('period');
  };

  const handleDateApply = (start, end) => {
      setCustomStart(start);
      setCustomEnd(end);
      setViewMode('custom');
  };

  return (
    <div className="flex h-screen bg-[#0F1115] text-white overflow-hidden font-sans">
      {/* --- TRUYỀN onUpload VÀ uploadType XUỐNG SIDEBAR --- */}
      <Sidebar 
        onClearData={handleClearClick} 
        onSendEmail={onSendEmail} 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        onLogout={onLogout} 
        currentUser={currentUser}
        onUpload={onUpload}          // Truyền hàm upload
        uploadType={finalUploadType} // Truyền loại trang để Sidebar biết
      /> 
      
      <main className="flex-1 overflow-y-auto p-3 md:p-8 w-full relative">
        <header className="flex flex-col gap-3 md:gap-4 mb-4 md:mb-6 relative z-30">
          <div className="flex items-start gap-2">
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-1.5 bg-[#1C1E26] rounded-lg border border-gray-800 text-gray-300 active:scale-95 mt-0.5"><Menu size={20} /></button>
            <div className="flex flex-col">
                <div className="hidden md:flex items-center gap-2 text-sm text-gray-400 mb-1"><span>Trang chủ</span> / <span className="text-white">Dashboard</span></div>
                <h2 className="text-base sm:text-lg md:text-3xl font-bold truncate text-white leading-tight">{activeMenuTitle}</h2>
                {!hideFilters && (<div className="flex items-center gap-1.5 mt-0.5"><AlertCircle size={12} className="text-amber-500 flex-shrink-0" /><p className="text-[10px] md:text-xs text-amber-500/90 italic font-medium leading-relaxed pt-0.5">Lưu ý: Xem dữ liệu vào cuối ngày 7,14,21 và cuối tháng</p></div>)}
            </div>
          </div>

          {!hideFilters && (
              <div className="flex flex-col md:flex-row justify-end items-start md:items-end gap-3 md:gap-4 animate-fade-in">
                <div className="flex flex-wrap gap-3 w-full md:w-auto relative justify-end">
                    
                    {/* NÚT 1: CHỌN KỲ */}
                    <div className="relative">
                        <button 
                            onClick={() => setShowPeriodPicker(true)} 
                            className={`flex items-center gap-2 bg-[#1C1E26] px-4 py-2.5 rounded-xl border transition-all duration-200 ${viewMode === 'period' ? 'border-blue-500 text-white shadow-blue-500/20 shadow-md ring-1 ring-blue-500/50' : 'border-gray-800 text-gray-300 hover:bg-[#252830]'} text-xs md:text-sm font-semibold justify-center shadow-sm whitespace-nowrap active:scale-95`}
                        >
                            <CalendarDays size={18} className={viewMode === 'period' ? "text-blue-400" : "text-gray-500"}/> 
                            <span>{viewMode === 'period' ? dateLabel : "Chọn Kỳ Báo Cáo"}</span>
                        </button>
                        <PeriodPicker isOpen={showPeriodPicker} onClose={() => setShowPeriodPicker(false)} onApply={handlePeriodApply} initialConfig={periodConfig} />
                    </div>

                    {/* NÚT 2: TÙY CHỌN NGÀY */}
                    <div className="relative">
                        <button 
                            onClick={() => setShowDatePicker(true)} 
                            className={`flex items-center gap-2 bg-[#1C1E26] px-4 py-2.5 rounded-xl border transition-all duration-200 ${viewMode === 'custom' ? 'border-blue-500 text-white shadow-blue-500/20 shadow-md ring-1 ring-blue-500/50' : 'border-gray-800 text-gray-300 hover:bg-[#252830]'} text-xs md:text-sm font-semibold justify-center shadow-sm whitespace-nowrap active:scale-95`}
                        >
                            <CalendarRange size={18} className={viewMode === 'custom' ? "text-blue-400" : "text-gray-500"}/> 
                            <span>{viewMode === 'custom' ? dateLabel : "Tùy chọn ngày"}</span>
                        </button>
                        <CustomDatePicker isOpen={showDatePicker} onClose={() => setShowDatePicker(false)} onApply={handleDateApply} initialStart={customStart} initialEnd={customEnd} />
                    </div>

                    {/* [ĐÃ XÓA NÚT UPLOAD TẠI ĐÂY] */}
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
  const [currentUser, setCurrentUser] = useState(() => {
      const stored = localStorage.getItem('currentUser');
      return stored ? JSON.parse(stored) : null;
  });

  const handleLogin = (user) => {
      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
  };

  const handleLogout = () => {
      setCurrentUser(null);
      localStorage.removeItem('currentUser');
  };

  const [viewMode, setViewMode] = useState('period'); 
  const [periodConfig, setPeriodConfig] = useState(() => {
      const t = new Date();
      const d = t.getDate();
      let p = 1;
      if (d > 7) p = 2;
      if (d > 14) p = 3;
      if (d > 21) p = 4;
      return { period: p, month: t.getMonth(), year: t.getFullYear() };
  });
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [rawExcelData, setRawExcelData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
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

  const getDateRange = (mode, offset=0) => {
    if(mode === 'custom'){ 
        if(!customStart || !customEnd) return {start:null, end:null}; 
        const s=new Date(customStart); s.setHours(0,0,0,0); 
        const e=new Date(customEnd); e.setHours(23,59,59,999); 
        return {start:s,end:e}; 
    }
    if(mode === 'period'){ 
        let { period, month, year } = periodConfig;
        if (offset === 1) {
            if (period > 1) { period -= 1; } else { period = 4; month -= 1; if(month < 0) { month = 11; year -= 1; } }
        }
        if (period === 1) return { start: new Date(year, month, 1), end: new Date(year, month, 7, 23, 59, 59) }; 
        if (period === 2) return { start: new Date(year, month, 8), end: new Date(year, month, 14, 23, 59, 59) }; 
        if (period === 3) return { start: new Date(year, month, 15), end: new Date(year, month, 21, 23, 59, 59) }; 
        if (period === 4) return { start: new Date(year, month, 22), end: new Date(year, month + 1, 0, 23, 59, 59) }; 
    }
    return {start:null,end:null};
  };

  const dateLabel = useMemo(() => {
    if (viewMode === 'custom') return (!customStart || !customEnd) ? "Chọn khoảng ngày" : `${(new Date(customStart).getDate()+'').padStart(2,'0')}/${(new Date(customStart).getMonth()+1+'').padStart(2,'0')} - ${(new Date(customEnd).getDate()+'').padStart(2,'0')}/${(new Date(customEnd).getMonth()+1+'').padStart(2,'0')}`;
    const { start, end } = getDateRange(viewMode, 0); if (!start) return "";
    const f = (d) => `${(d.getDate()+'').padStart(2,'0')}/${(d.getMonth()+1+'').padStart(2,'0')}`;
    if (viewMode === 'period') { const { period, month } = periodConfig; return `Kỳ ${period} Tháng ${month+1} (${f(start)} - ${f(end)})`; }
    return `${f(start)} - ${f(end)}`;
  }, [viewMode, periodConfig, customStart, customEnd]);

  // --- [GIỮ NGUYÊN 100% LOGIC TÍNH TOÁN CŨ CỦA BẠN] ---
  const calculatePhacoStats = (dataSubset, rangeCurrent, rangePrevious) => {
    const initStats = () => ({ sales: 0, revenue: 0, insRev: 0, patRev: 0, details: {} });
    let current = { totalRevenue: 0, basic: initStats(), premium: initStats() };
    let prev = { totalRevenue: 0, basic: {insRev:0, patRev:0}, premium: {insRev:0, patRev:0} };
    dataSubset.forEach(row => {
        const rowDate = parseDateAllFormats(row['ngày']); if (!rowDate || isNaN(rowDate.getTime())) return; rowDate.setHours(0,0,0,0);
        const soLuong = safeParseNumber(row['số lượng']) || 1; const donGia = safeParseNumber(row['đơn giá']); const giaBaoHiem = safeParseNumber(row['giá bảo hiểm']);
        const loaiGoi = row['loại gói'] ? String(row['loại gói']).toLowerCase().trim() : ''; const tenGoi = row['tên gói'] ? String(row['tên gói']).trim() : 'Khác';
        const dtBaoHiem = giaBaoHiem * soLuong; const dtBenhNhan = (donGia - giaBaoHiem) * soLuong; const thanhTien = dtBaoHiem + dtBenhNhan;
        if (rangeCurrent.start && rowDate >= rangeCurrent.start && rowDate <= rangeCurrent.end) {
            current.totalRevenue += thanhTien;
            if (loaiGoi.includes('cơ bản')) { current.basic.sales += soLuong; current.basic.revenue += thanhTien; current.basic.insRev += dtBaoHiem; current.basic.patRev += dtBenhNhan; current.basic.details[tenGoi] = (current.basic.details[tenGoi] || 0) + soLuong; } 
            else { current.premium.sales += soLuong; current.premium.revenue += thanhTien; current.premium.insRev += dtBaoHiem; current.premium.patRev += dtBenhNhan; current.premium.details[tenGoi] = (current.premium.details[tenGoi] || 0) + soLuong; }
        } else if (rangePrevious && rangePrevious.start && rowDate >= rangePrevious.start && rowDate <= rangePrevious.end) {
            prev.totalRevenue += thanhTien;
            if (loaiGoi.includes('cơ bản')) { prev.basic.insRev += dtBaoHiem; prev.basic.patRev += dtBenhNhan; } else { prev.premium.insRev += dtBaoHiem; prev.premium.patRev += dtBenhNhan; }
        }
    });
    const calcGrowth = (curr, pre) => { if (viewMode === 'custom') return null; if (pre === 0) return curr > 0 ? 100 : 0; return ((curr - pre) / pre) * 100; };
    const formatDetails = (obj) => Object.keys(obj).map(k => ({ name: k, qty: obj[k] })).sort((a,b) => b.qty - a.qty);
    return { totalRevenue: current.totalRevenue, compareRevenue: viewMode === 'custom' ? null : prev.totalRevenue, percent: calcGrowth(current.totalRevenue, prev.totalRevenue), basic: { sales: current.basic.sales, insRev: current.basic.insRev, patRev: current.basic.patRev, details: formatDetails(current.basic.details) }, premium: { sales: current.premium.sales, insRev: current.premium.insRev, patRev: current.premium.patRev, details: formatDetails(current.premium.details) } };
  };

  const calculateServices = (dataSubset, rangeCurrent, rangePrevious) => {
      let totalRevenue = 0; let prevTotalRevenue = 0; let itemsMap = {}; 
      dataSubset.forEach(row => {
          const rowDate = parseDateAllFormats(row['ngày']); if (!rowDate || isNaN(rowDate.getTime())) return; rowDate.setHours(0,0,0,0);
          const qty = safeParseNumber(row['số lượng']); const price = safeParseNumber(row['đơn giá']); const total = qty * price;
          if (rangeCurrent.start && rowDate >= rangeCurrent.start && rowDate <= rangeCurrent.end) {
              const name = row['tên gói'] ? String(row['tên gói']).trim() : 'Dịch vụ khác'; totalRevenue += total;
              if (!itemsMap[name]) itemsMap[name] = { name: name, qty: 0, price: price, total: 0 };
              itemsMap[name].qty += qty; itemsMap[name].total += total; itemsMap[name].price = price; 
          } else if (rangePrevious && rangePrevious.start && rowDate >= rangePrevious.start && rowDate <= rangePrevious.end) { prevTotalRevenue += total; }
      });
      const items = Object.values(itemsMap).sort((a, b) => b.total - a.total);
      const calcGrowth = (curr, pre) => viewMode === 'custom' ? null : pre === 0 ? (curr > 0 ? 100 : 0) : ((curr - pre) / pre) * 100;
      return { totalRevenue, compareRevenue: viewMode === 'custom' ? null : prevTotalRevenue, percent: calcGrowth(totalRevenue, prevTotalRevenue), items };
  };

  const handleSendEmailReport = async () => {
    if (!rawExcelData || rawExcelData.length === 0) { alert("Chưa có dữ liệu gốc!"); return; }
    const weekRange = getDateRange('period', 0); if (!weekRange.start || !weekRange.end) { alert("Lỗi thời gian."); return; }
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
                if (isKhucXa) { finalType = 'khucxa'; donGia = Number(findVal(['đơn giá', 'giá']) || 0); if (lowerName.includes('phakic')) donGia = 90000000; else if (lowerName.includes('smile')) donGia = 45000000; else if (lowerName.includes('femto')) donGia = 29000000; else if (lowerName.includes('lasik')) donGia = 18000000; if (donGia >= 40000000) newRow['loại gói'] = 'Cao cấp'; else newRow['loại gói'] = 'Cơ bản'; } 
                else if (isMong) { const isMongKep = isMong && (lowerName.includes('kép') || lowerName.includes('ghép')); giaBaoHiem = 1223550; if (source === 'tuyen') { donGia = isMongKep ? 3300000 : 2800000; finalType = 'mong_tuyen'; } else if (source === 'pkvt') { donGia = isMongKep ? 4650000 : 4250000; finalType = 'mong_pkvt'; } else if (source === 'doitac') { donGia = isMongKep ? 4650000 : 4250000; finalType = 'mong_doitac'; } else { donGia = isMongKep ? 4650000 : 4250000; finalType = 'mong_vanglai'; } newRow['loại gói'] = isMongKep ? 'Cao cấp' : 'Cơ bản'; } 
                else { giaBaoHiem = 6146950; if (lowerName.includes('phaco 0') || lowerName.includes('phaco 500')) giaBaoHiem = 5946950; const normalizedName = nameStr.replace(/,/g, '.'); const priceMatch = normalizedName.match(/(\d+(\.\d+)?)/); let extracted = 0; if (priceMatch) { extracted = parseFloat(priceMatch[0]); if (extracted < 100) donGia = extracted * 1000000; else if (extracted >= 100 && extracted < 1000) donGia = extracted * 1000; else donGia = extracted; } else { donGia = Number(findVal(['đơn giá', 'giá']) || 0); } if (donGia === 0) donGia = giaBaoHiem; if (source === 'pkvt') finalType = 'phaco_pkvt'; else if (source === 'doitac') finalType = 'phaco_doitac'; else if (source === 'tuyen') finalType = 'tuyen'; else finalType = 'vanglai'; if (extracted >= 20 && extracted < 100) newRow['loại gói'] = 'Cao cấp'; else if ((String(findVal(['loại', 'phân loại']) || '') + nameStr).toLowerCase().includes('cao cấp')) newRow['loại gói'] = 'Cao cấp'; else newRow['loại gói'] = 'Cơ bản'; }
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

  useEffect(() => {
    const rangeCurrent = getDateRange(viewMode, 0); 
    if (viewMode === 'custom' && (!rangeCurrent.start || !rangeCurrent.end)) return;
    let rangePrevious = viewMode !== 'custom' ? getDateRange(viewMode, 1) : null;
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
  }, [rawExcelData, viewMode, periodConfig, customStart, customEnd]);

  const handleOpenClearModal = (category) => { setDeleteTarget(category); setIsDeletePasswordOpen(true); };
  const handleDeletePasswordSuccess = () => { setIsDeletePasswordOpen(false); setIsModalOpen(true); };
  const executeClearData = async (targetIdFromModal) => { if (!targetIdFromModal) return; if (targetIdFromModal === 'all') { await clearTransactions(); setSuccessMessage("Đã xóa sạch TOÀN BỘ dữ liệu!"); } else { await clearTransactionsByType(targetIdFromModal); setSuccessMessage(`Đã xóa dữ liệu của mục: ${targetIdFromModal}`); } setIsModalOpen(false); setIsSuccessModalOpen(true); };
  const formatCurrency = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(val) || 0);
  const getSafeData = (data) => data || { totalRevenue: 0, percent: 0, compareRevenue: 0, chart: [], basic: { sales: 0, revenue: 0, insRev: 0, patRev: 0 }, premium: { sales: 0, revenue: 0, insRev: 0, patRev: 0 } };

  // Nếu chưa có user thì hiện form đăng nhập
if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
}
  if (isLoading) return <div className="flex h-screen bg-[#0F1115] text-white items-center justify-center">Đang tải dữ liệu...</div>;

  return (
    <Router>
      <Routes>
        <Route path="/" element={ <MainLayout currentUser={currentUser} onLogout={handleLogout} onClearData={handleOpenClearModal} onSendEmail={handleSendEmailReport} activeMenuTitle="Báo Cáo Tổng Hợp" category="report" onUpload={() => {}} viewMode={viewMode} setViewMode={setViewMode} periodConfig={periodConfig} setPeriodConfig={setPeriodConfig} customStart={customStart} setCustomStart={setCustomStart} customEnd={customEnd} setCustomEnd={setCustomEnd} dateLabel={dateLabel} hideFilters={true}> <MonthlyReport data={rawExcelData} formatCurrency={formatCurrency} /> </MainLayout> } />
        
        {/* === ĐÃ CẬP NHẬT TRUYỀN PROPS ĐÚNG CHO TẤT CẢ CÁC TRANG === */}
        <Route path="/phaco-vang-lai" element={ <MainLayout currentUser={currentUser} onLogout={handleLogout} onClearData={handleOpenClearModal} onSendEmail={handleSendEmailReport} activeMenuTitle="Phaco Vãng Lai" category="vanglai" uploadCategory="phau_thuat" onUpload={handleUpload} viewMode={viewMode} setViewMode={setViewMode} periodConfig={periodConfig} setPeriodConfig={setPeriodConfig} customStart={customStart} setCustomStart={setCustomStart} customEnd={customEnd} setCustomEnd={setCustomEnd} dateLabel={dateLabel}> <PhacoVangLai data={{ summary: { label: dateLabel, ...getSafeData(viewData.vanglai) }, packages: getSafeData(viewData.vanglai) }} formatCurrency={formatCurrency} /> </MainLayout> } />
        <Route path="/phaco-tuyen" element={ <MainLayout currentUser={currentUser} onLogout={handleLogout} onClearData={handleOpenClearModal} onSendEmail={handleSendEmailReport} activeMenuTitle="Phaco Tuyến" category="tuyen" uploadCategory="phau_thuat" onUpload={handleUpload} viewMode={viewMode} setViewMode={setViewMode} periodConfig={periodConfig} setPeriodConfig={setPeriodConfig} customStart={customStart} setCustomStart={setCustomStart} customEnd={customEnd} setCustomEnd={setCustomEnd} dateLabel={dateLabel}> <PhacoTuyen data={{ summary: { label: dateLabel, ...getSafeData(viewData.tuyen) }, phacoTuyen: getSafeData(viewData.tuyen) }} formatCurrency={formatCurrency} /> </MainLayout> } />
        
        <Route path="/phaco-pkvt" element={ <MainLayout currentUser={currentUser} onLogout={handleLogout} onClearData={handleOpenClearModal} onSendEmail={handleSendEmailReport} activeMenuTitle="Phaco PKVT" category="phaco_pkvt" uploadCategory="phau_thuat" onUpload={handleUpload} viewMode={viewMode} setViewMode={setViewMode} periodConfig={periodConfig} setPeriodConfig={setPeriodConfig} customStart={customStart} setCustomStart={setCustomStart} customEnd={customEnd} setCustomEnd={setCustomEnd} dateLabel={dateLabel}> <PhacoPKVT data={{ summary: { label: dateLabel, ...getSafeData(viewData.phaco_pkvt) }, ...getSafeData(viewData.phaco_pkvt) }} formatCurrency={formatCurrency} /> </MainLayout> } />
        <Route path="/phaco-doitac" element={ <MainLayout currentUser={currentUser} onLogout={handleLogout} onClearData={handleOpenClearModal} onSendEmail={handleSendEmailReport} activeMenuTitle="Phaco Đối Tác" category="phaco_doitac" uploadCategory="phau_thuat" onUpload={handleUpload} viewMode={viewMode} setViewMode={setViewMode} periodConfig={periodConfig} setPeriodConfig={setPeriodConfig} customStart={customStart} setCustomStart={setCustomStart} customEnd={customEnd} setCustomEnd={setCustomEnd} dateLabel={dateLabel}> <PhacoDoiTac data={{ summary: { label: dateLabel, ...getSafeData(viewData.phaco_doitac) }, ...getSafeData(viewData.phaco_doitac) }} formatCurrency={formatCurrency} /> </MainLayout> } />
        
        <Route path="/mong-vang-lai" element={ <MainLayout currentUser={currentUser} onLogout={handleLogout} onClearData={handleOpenClearModal} onSendEmail={handleSendEmailReport} activeMenuTitle="Mộng Vãng Lai" category="mong_vanglai" uploadCategory="phau_thuat" onUpload={handleUpload} viewMode={viewMode} setViewMode={setViewMode} periodConfig={periodConfig} setPeriodConfig={setPeriodConfig} customStart={customStart} setCustomStart={setCustomStart} customEnd={customEnd} setCustomEnd={setCustomEnd} dateLabel={dateLabel}> <MongVangLai data={{ summary: { label: dateLabel, ...getSafeData(viewData.mong_vanglai) }, packages: getSafeData(viewData.mong_vanglai) }} formatCurrency={formatCurrency} /> </MainLayout> } />
        <Route path="/mong-tuyen" element={ <MainLayout currentUser={currentUser} onLogout={handleLogout} onClearData={handleOpenClearModal} onSendEmail={handleSendEmailReport} activeMenuTitle="Mộng Tuyến" category="mong_tuyen" uploadCategory="phau_thuat" onUpload={handleUpload} viewMode={viewMode} setViewMode={setViewMode} periodConfig={periodConfig} setPeriodConfig={setPeriodConfig} customStart={customStart} setCustomStart={setCustomStart} customEnd={customEnd} setCustomEnd={setCustomEnd} dateLabel={dateLabel}> <MongTuyen data={{ summary: { label: dateLabel, ...getSafeData(viewData.mong_tuyen) }, packages: getSafeData(viewData.mong_tuyen) }} formatCurrency={formatCurrency} /> </MainLayout> } />
        <Route path="/mong-pkvt" element={ <MainLayout currentUser={currentUser} onLogout={handleLogout} onClearData={handleOpenClearModal} onSendEmail={handleSendEmailReport} activeMenuTitle="Mộng PKVT" category="mong_pkvt" uploadCategory="phau_thuat" onUpload={handleUpload} viewMode={viewMode} setViewMode={setViewMode} periodConfig={periodConfig} setPeriodConfig={setPeriodConfig} customStart={customStart} setCustomStart={setCustomStart} customEnd={customEnd} setCustomEnd={setCustomEnd} dateLabel={dateLabel}> <MongPKVT data={{ summary: { label: dateLabel, ...getSafeData(viewData.mong_pkvt) }, ...getSafeData(viewData.mong_pkvt) }} formatCurrency={formatCurrency} /> </MainLayout> } />
        <Route path="/mong-doitac" element={ <MainLayout currentUser={currentUser} onLogout={handleLogout} onClearData={handleOpenClearModal} onSendEmail={handleSendEmailReport} activeMenuTitle="Mộng Đối Tác" category="mong_doitac" uploadCategory="phau_thuat" onUpload={handleUpload} viewMode={viewMode} setViewMode={setViewMode} periodConfig={periodConfig} setPeriodConfig={setPeriodConfig} customStart={customStart} setCustomStart={setCustomStart} customEnd={customEnd} setCustomEnd={setCustomEnd} dateLabel={dateLabel}> <MongDoiTac data={{ summary: { label: dateLabel, ...getSafeData(viewData.mong_doitac) }, ...getSafeData(viewData.mong_doitac) }} formatCurrency={formatCurrency} /> </MainLayout> } />
        
        <Route path="/khuc-xa" element={ <MainLayout currentUser={currentUser} onLogout={handleLogout} onClearData={handleOpenClearModal} onSendEmail={handleSendEmailReport} activeMenuTitle="Phẫu thuật Khúc Xạ" category="khucxa" uploadCategory="phau_thuat" onUpload={handleUpload} viewMode={viewMode} setViewMode={setViewMode} periodConfig={periodConfig} setPeriodConfig={setPeriodConfig} customStart={customStart} setCustomStart={setCustomStart} customEnd={customEnd} setCustomEnd={setCustomEnd} dateLabel={dateLabel}> <KhucXa data={{ summary: { label: dateLabel, ...getSafeData(viewData.khucxa) }, packages: getSafeData(viewData.khucxa) }} formatCurrency={formatCurrency} /> </MainLayout> } />
        
        <Route path="/thu-thuat" element={ <MainLayout currentUser={currentUser} onLogout={handleLogout} onClearData={handleOpenClearModal} onSendEmail={handleSendEmailReport} activeMenuTitle="Thủ Thuật" category="dichvu" uploadCategory="dichvu" onUpload={() => {}} viewMode={viewMode} setViewMode={setViewMode} periodConfig={periodConfig} setPeriodConfig={setPeriodConfig} customStart={customStart} setCustomStart={setCustomStart} customEnd={customEnd} setCustomEnd={setCustomEnd} dateLabel={dateLabel}> <ThuThuat /> </MainLayout> } />
        <Route path="/tieu-phau" element={ <MainLayout currentUser={currentUser} onLogout={handleLogout} onClearData={handleOpenClearModal} onSendEmail={handleSendEmailReport} activeMenuTitle="Tiểu Phẫu" category="dichvu" uploadCategory="dichvu" onUpload={() => {}} viewMode={viewMode} setViewMode={setViewMode} periodConfig={periodConfig} setPeriodConfig={setPeriodConfig} customStart={customStart} setCustomStart={setCustomStart} customEnd={customEnd} setCustomEnd={setCustomEnd} dateLabel={dateLabel}> <TieuPhau /> </MainLayout> } />
        <Route path="/services" element={ <MainLayout currentUser={currentUser} onLogout={handleLogout} onClearData={handleOpenClearModal} onSendEmail={handleSendEmailReport} activeMenuTitle="Combo" category="dichvu" uploadCategory="dichvu" onUpload={handleUpload} viewMode={viewMode} setViewMode={setViewMode} periodConfig={periodConfig} setPeriodConfig={setPeriodConfig} customStart={customStart} setCustomStart={setCustomStart} customEnd={customEnd} setCustomEnd={setCustomEnd} dateLabel={dateLabel}> <ServiceReport data={{ label: dateLabel, ...(viewData.dichvu || { totalRevenue: 0, compareRevenue: 0, percent: 0, items: [] }) }} formatCurrency={formatCurrency} /> </MainLayout> } />
        <Route path="/data" element={ <MainLayout currentUser={currentUser} onLogout={handleLogout} onClearData={handleOpenClearModal} onSendEmail={handleSendEmailReport} activeMenuTitle="Dữ liệu chi tiết" category="vanglai" uploadCategory="phau_thuat" onUpload={handleUpload} viewMode={viewMode} setViewMode={setViewMode} periodConfig={periodConfig} setPeriodConfig={setPeriodConfig} customStart={customStart} setCustomStart={setCustomStart} customEnd={customEnd} setCustomEnd={setCustomEnd} dateLabel={dateLabel}> <DataManagement data={rawExcelData} formatCurrency={formatCurrency} /> </MainLayout> } />
        
        <Route path="/user-management" element={ currentUser?.role === 'admin' ? <MainLayout currentUser={currentUser} onLogout={handleLogout} onClearData={handleOpenClearModal} onSendEmail={handleSendEmailReport} activeMenuTitle="Quản Lý Tài Khoản" category="admin" onUpload={() => {}} viewMode={viewMode} setViewMode={setViewMode} periodConfig={periodConfig} setPeriodConfig={setPeriodConfig} customStart={customStart} setCustomStart={setCustomStart} customEnd={customEnd} setCustomEnd={setCustomEnd} dateLabel={dateLabel} hideFilters={true}> <UserManagement /> </MainLayout> : <Navigate to="/" replace /> } />
        <Route path="/test-import" element={ <MainLayout currentUser={currentUser} onLogout={handleLogout} onClearData={handleOpenClearModal} onSendEmail={handleSendEmailReport} activeMenuTitle="Test Nhập Liệu" category="test" onUpload={() => {}} viewMode={viewMode} setViewMode={setViewMode} periodConfig={periodConfig} setPeriodConfig={setPeriodConfig} customStart={customStart} setCustomStart={setCustomStart} customEnd={customEnd} setCustomEnd={setCustomEnd} dateLabel={dateLabel}> <TestImport formatCurrency={formatCurrency} /> </MainLayout> } />
        <Route path="/test-sheet" element={<TestGoogleSheet />} />
      </Routes>
      <ConfirmModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConfirm={executeClearData} />
      <SuccessModal isOpen={isSuccessModalOpen} onClose={() => { setIsSuccessModalOpen(false); window.location.reload(); }} message={successMessage} />
      <PasswordModal isOpen={isDeletePasswordOpen} onClose={() => setIsDeletePasswordOpen(false)} onSuccess={handleDeletePasswordSuccess} title="Xác thực Xóa dữ liệu" />
      <SpeedInsights />
    </Router>
  );
}

export default App;