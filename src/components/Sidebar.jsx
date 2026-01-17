import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, Table2, Database, Mail, 
  Activity, Glasses, Users, BarChart3,
  ChevronRight, Scissors, Syringe,
  Box, Orbit, Eclipse, Satellite,
  EqualApproximately, Merge, Upload, 
  LogOut, UserCog, Handshake, FileSpreadsheet,FlaskConical,X // [ĐÃ SỬA] Thêm import X vào đây
} from 'lucide-react';
import logoImage from '../assets/logo.png'; 
import PasswordModal from './PasswordModal';

// --- CSS CHO THANH CUỘN TÙY CHỈNH ---
const scrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 5px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: #2D3039;
    border-radius: 20px;
  }
  .custom-scrollbar:hover::-webkit-scrollbar-thumb {
    background-color: #4B5563;
  }
`;

// --- COMPONENT MENU ITEM ---
const MenuItem = ({ icon, label, onClick, active, hasChildren, isExpanded, isChild, className }) => (
  <div 
    onClick={onClick} 
    className={`
      flex items-center justify-between px-3 py-2.5 mx-2 rounded-lg cursor-pointer transition-all duration-200 select-none group
      ${active 
        ? 'bg-blue-600/10 text-blue-400' 
        : 'text-gray-400 hover:bg-[#1C1E26] hover:text-gray-100'
      } 
      ${isChild ? 'pl-10 text-[13px]' : 'text-sm font-medium'} 
      ${className || ''}
    `}
  >
    <div className="flex items-center gap-3">
      {/* Icon có hiệu ứng sáng lên khi hover */}
      {icon && <span className={`transition-colors duration-200 ${active ? 'text-blue-400' : 'text-gray-500 group-hover:text-gray-300'}`}>{icon}</span>}
      <span>{label}</span>
    </div>
    {hasChildren && (
      <span className={`text-gray-600 transition-transform duration-300 ease-in-out ${isExpanded ? 'rotate-90' : ''}`}>
        <ChevronRight size={14} />
      </span>
    )}
  </div>
);

// --- COMPONENT TIÊU ĐỀ NHÓM ---
const GroupHeader = ({ label }) => (
    <div className="px-5 mt-6 mb-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest opacity-80">
        {label}
    </div>
);

const Sidebar = ({ onClearData, onSendEmail, isOpen, onClose, onUpload, uploadType, onLogout, currentUser }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSending, setIsSending] = useState(false);
  const [showEmailAuth, setShowEmailAuth] = useState(false);
  const fileInputRef = useRef(null);

  // State mở rộng menu con
  const [expandedMenus, setExpandedMenus] = useState({ phaco: false, mong: false });

  useEffect(() => {
    setExpandedMenus({
        phaco: location.pathname.includes('/phaco'),
        mong: location.pathname.includes('/mong')
    });
  }, [location.pathname]);

  const toggleSubMenu = (key) => { setExpandedMenus(prev => ({ ...prev, [key]: !prev[key] })); };
  const handleNavigate = (path) => { navigate(path); if (onClose) onClose(); };
  
  const handleSendClick = () => { setShowEmailAuth(true); };
  const handleEmailAuthSuccess = async () => { setIsSending(true); await onSendEmail(); setIsSending(false); if(onClose) onClose(); };
  
  const handleUploadClick = () => { if (fileInputRef.current) fileInputRef.current.click(); };
  const handleFileChange = (e) => {
      const file = e.target.files[0];
      if (file && onUpload) { onUpload(file, uploadType); e.target.value = ''; if (onClose) onClose(); }
  };

  const isActive = (path) => location.pathname === path;

  // Cấu hình nút upload (Style mới)
  const getUploadConfig = () => {
      const baseStyle = "border border-dashed bg-opacity-5 transition-all duration-300 font-semibold";
      if (location.pathname === '/khuc-xa') return { label: "Nhập File Khúc Xạ", icon: FileSpreadsheet, colorClass: `${baseStyle} text-indigo-400 border-indigo-500/30 bg-indigo-500 hover:bg-indigo-500/10` };
      if (location.pathname === '/services') return { label: "Nhập File Combo", icon: FileSpreadsheet, colorClass: `${baseStyle} text-orange-400 border-orange-500/30 bg-orange-500 hover:bg-orange-500/10` };
      if (uploadType === 'phau_thuat') return { label: "Nhập File Phẫu Thuật", icon: FileSpreadsheet, colorClass: `${baseStyle} text-purple-400 border-purple-500/30 bg-purple-500 hover:bg-purple-500/10` };
      if (uploadType === 'dichvu') return { label: "Nhập File Dịch Vụ", icon: FileSpreadsheet, colorClass: `${baseStyle} text-emerald-400 border-emerald-500/30 bg-emerald-500 hover:bg-emerald-500/10` };
      return null;
  };

  const uploadConfig = getUploadConfig();
  const UploadIcon = uploadConfig?.icon || Upload;
  
  // Kiểm tra quyền
  const hasPermission = (permissionKey) => {
      if (!currentUser) return false;
      if (currentUser.role === 'admin') return true;
      return currentUser.permissions?.includes(permissionKey);
  };
  const canImport = hasPermission('import');

  return (
    <>
      <style>{scrollbarStyles}</style>
      <div className={`fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`} onClick={onClose}></div>
      
      <aside className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-[#0F1115] flex flex-col border-r border-gray-800 transition-transform duration-300 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 shadow-2xl`}>
        
        {/* LOGO AREA */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-gray-800/50 bg-[#0F1115]">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleNavigate('/')}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 p-0.5 shadow-lg shadow-blue-500/20">
                <div className="w-full h-full bg-[#0F1115] rounded-md flex items-center justify-center">
                    <img src={logoImage} alt="Logo" className="w-5 h-5 object-contain" />
                </div>
            </div>
            <div>
                <h1 className="font-bold text-sm text-white tracking-tight">Báo Cáo EW</h1>
                <p className="text-[10px] text-gray-500 font-medium">Bệnh viện mắt Bình Thuận</p>
            </div>
          </div>
          {/* Nút đóng menu trên mobile */}
          <button onClick={onClose} className="md:hidden text-gray-500 hover:text-white"><X size={20} /></button>
        </div>

        {/* SCROLLABLE CONTENT */}
        <nav className="flex-1 overflow-y-auto custom-scrollbar pb-6">
          
          <GroupHeader label="Danh mục chính" />
{/* <MenuItem 
    icon={<FlaskConical size={18} className="text-green-400" />} 
    label="Test Google Sheet" 
    onClick={() => handleNavigate('/test-sheet')} 
    active={isActive('/test-sheet')}
/> */}
          {/* NHÓM PHACO */}
          {hasPermission('view_phaco') && (
              <>
                <MenuItem icon={<Orbit size={18} />} label="Phẫu thuật Phaco" hasChildren isExpanded={expandedMenus.phaco} onClick={() => toggleSubMenu('phaco')} active={expandedMenus.phaco} />
                <div className={`overflow-hidden transition-[max-height] duration-300 ease-in-out ${expandedMenus.phaco ? 'max-h-60' : 'max-h-0'}`}>
                    <div className="border-l border-gray-800 ml-6 pl-1 my-1 space-y-1">
                        <MenuItem label="Vãng lai" icon={<div className="w-1 h-1 rounded-full bg-blue-500"/>} active={isActive('/phaco-vang-lai')} onClick={() => handleNavigate('/phaco-vang-lai')} className="!pl-3 !mx-1" />
                        <MenuItem label="Tuyến" icon={<div className="w-1 h-1 rounded-full bg-indigo-500"/>} active={isActive('/phaco-tuyen')} onClick={() => handleNavigate('/phaco-tuyen')} className="!pl-3 !mx-1" />
                        <MenuItem label="PKVT" icon={<div className="w-1 h-1 rounded-full bg-purple-500"/>} active={isActive('/phaco-pkvt')} onClick={() => handleNavigate('/phaco-pkvt')} className="!pl-3 !mx-1" />
                        <MenuItem label="Đối Tác" icon={<div className="w-1 h-1 rounded-full bg-pink-500"/>} active={isActive('/phaco-doitac')} onClick={() => handleNavigate('/phaco-doitac')} className="!pl-3 !mx-1" />
                    </div>
                </div>
              </>
          )}

          {/* NHÓM MỘNG */}
          {hasPermission('view_mong') && (
              <>
                <MenuItem icon={<Eclipse size={18} />} label="Phẫu thuật Mộng" hasChildren isExpanded={expandedMenus.mong} onClick={() => toggleSubMenu('mong')} active={expandedMenus.mong} />
                <div className={`overflow-hidden transition-[max-height] duration-300 ease-in-out ${expandedMenus.mong ? 'max-h-60' : 'max-h-0'}`}>
                    <div className="border-l border-gray-800 ml-6 pl-1 my-1 space-y-1">
                        <MenuItem label="Vãng lai" icon={<div className="w-1 h-1 rounded-full bg-teal-500"/>} active={isActive('/mong-vang-lai')} onClick={() => handleNavigate('/mong-vang-lai')} className="!pl-3 !mx-1" />
                        <MenuItem label="Tuyến" icon={<div className="w-1 h-1 rounded-full bg-green-500"/>} active={isActive('/mong-tuyen')} onClick={() => handleNavigate('/mong-tuyen')} className="!pl-3 !mx-1" />
                        <MenuItem label="PKVT" icon={<div className="w-1 h-1 rounded-full bg-emerald-500"/>} active={isActive('/mong-pkvt')} onClick={() => handleNavigate('/mong-pkvt')} className="!pl-3 !mx-1" />
                        <MenuItem label="Đối Tác" icon={<div className="w-1 h-1 rounded-full bg-lime-500"/>} active={isActive('/mong-doitac')} onClick={() => handleNavigate('/mong-doitac')} className="!pl-3 !mx-1" />
                    </div>
                </div>
              </>
          )}

          {hasPermission('view_khucxa') && <MenuItem icon={<Glasses size={18} />} label="Khúc Xạ" active={isActive('/khuc-xa')} onClick={() => handleNavigate('/khuc-xa')}/>}
          {hasPermission('view_thuthuat') && <MenuItem icon={<Syringe size={18} />} label="Thủ Thuật" active={isActive('/thu-thuat')} onClick={() => handleNavigate('/thu-thuat')}/>}
          {hasPermission('view_tieuphau') && <MenuItem icon={<Scissors size={18} />} label="Tiểu Phẫu" active={isActive('/tieu-phau')} onClick={() => handleNavigate('/tieu-phau')}/>}
          {hasPermission('view_combo') && <MenuItem icon={<Box size={18} />} label="Combo Dịch Vụ" active={isActive('/services')} onClick={() => handleNavigate('/services')} />}

          {/* === VÙNG NHẬP LIỆU NỔI BẬT === */}
          {uploadConfig && canImport && (
              <div className="px-4 mt-6 mb-2 animate-fade-in">
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".xlsx, .xls" className="hidden" />
                <button 
                    onClick={handleUploadClick} 
                    className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm transition-all duration-200 shadow-lg active:scale-95 ${uploadConfig.colorClass}`}
                >
                    <UploadIcon size={18} />
                    <span>{uploadConfig.label}</span>
                </button>
              </div>
          )}

          <GroupHeader label="Hệ thống" />
          
          {/* BÁO CÁO */}
          {hasPermission('view_report') && <MenuItem icon={<BarChart3 size={18} />} label="Báo Cáo Tổng Hợp" active={isActive('/')} onClick={() => handleNavigate('/')} className={isActive('/') ? "" : "text-gray-400"} />}
          {hasPermission('view_data') && <MenuItem icon={<Table2 size={18} />} label="Dữ liệu chi tiết" active={isActive('/data')} onClick={() => handleNavigate('/data')} className={isActive('/data') ? "" : "text-gray-400"} />}
          
          {/* ADMIN ONLY */}
          {currentUser?.role === 'admin' && (
             <MenuItem icon={<UserCog size={18} />} label="Quản Lý Tài Khoản" active={isActive('/user-management')} onClick={() => handleNavigate('/user-management')} className={isActive('/user-management') ? "" : "text-purple-400"} />
          )}

          {/* TIỆN ÍCH */}
          {hasPermission('send_email') && (
             <MenuItem icon={<Mail size={18} className={isSending ? "animate-pulse" : ""} />} label={isSending ? "Đang gửi..." : "Gửi Báo Cáo Email"} onClick={handleSendClick} />
          )}
        </nav>

        {/* FOOTER AREA */}
        <div className="p-3 border-t border-gray-800 bg-[#0F1115]">
          {currentUser?.role === 'admin' && (
            <div 
                onClick={() => { onClearData(); if(onClose) onClose(); }} 
                className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer text-gray-500 hover:text-red-400 hover:bg-red-500/5 transition-colors mb-1"
            >
                <Database size={16} />
                <span className="text-xs font-semibold">Xóa dữ liệu</span>
            </div>
          )}
          
          <div 
            onClick={() => { onLogout(); if(onClose) onClose(); }} 
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <LogOut size={18} />
            <div className="flex flex-col">
                <span className="text-xs font-bold">Đăng Xuất</span>
                <span className="text-[10px] text-gray-600">{currentUser?.username}</span>
            </div>
          </div>
        </div>
      </aside>
      <PasswordModal isOpen={showEmailAuth} onClose={() => setShowEmailAuth(false)} onSuccess={handleEmailAuthSuccess} title="Xác thực gửi Email" />
    </>
  );
};
export default Sidebar;