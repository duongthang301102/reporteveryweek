import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, Table2, Database, ClipboardList, X, Mail, 
  Eye, Activity, Glasses, Building2, Handshake, Users, BarChart3,
  ChevronRight, LayoutGrid, Scissors, Syringe,
  Box,
  Circle,
  Orbit,
  Eclipse,
  Satellite,
  EqualApproximately,
  Merge
} from 'lucide-react';
import logoImage from '../assets/logo.png'; 
import PasswordModal from './PasswordModal';

const MenuItem = ({ icon, label, onClick, active, hasChildren, isExpanded, isChild, className }) => (
  <div onClick={onClick} className={`flex items-center justify-between px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 select-none ${active ? 'bg-[#2D3039] text-blue-400 border-l-4 border-blue-500' : 'text-gray-400 hover:bg-[#1C1E26] hover:text-gray-200'} ${isChild ? 'pl-11 text-sm' : ''} ${className || ''}`}>
    <div className="flex items-center gap-3">
      {icon && <span className={active ? 'text-blue-400' : ''}>{icon}</span>}
      <span className={`font-medium ${isChild ? 'font-normal' : 'font-bold'}`}>{label}</span>
    </div>
    {hasChildren && (<span className={`text-gray-500 transition-transform duration-300 ease-in-out ${isExpanded ? 'rotate-90' : ''}`}><ChevronRight size={16} /></span>)}
  </div>
);

const Sidebar = ({ onClearData, onSendEmail, isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSending, setIsSending] = useState(false);
  const [showEmailAuth, setShowEmailAuth] = useState(false);
  
  const [expandedMenus, setExpandedMenus] = useState({
    phaco: location.pathname.includes('/phaco'), 
    mong: location.pathname.includes('/mong')
  });

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
  const isActive = (path) => location.pathname === path;

  return (
    <>
      <div className={`fixed inset-0 bg-black/60 z-40 md:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`} onClick={onClose}></div>
      <aside className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-[#0F1115] flex flex-col border-r border-gray-800 transition-transform duration-300 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        
        {/* LOGO */}
        <div className="p-4 md:p-6 flex items-center justify-between gap-3 cursor-pointer" onClick={() => handleNavigate('/')}>
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="p-1 rounded-lg flex-shrink-0"><img src={logoImage} alt="Logo" className="w-8 h-8 object-contain" /></div>
            <div className="flex-1 min-w-0"><h1 className="font-bold text-sm md:text-lg leading-tight text-white truncate">Báo cáo EW</h1><p className="text-[10px] md:text-xs text-gray-400 font-medium truncate leading-tight mt-0.5">Bệnh viện mắt Bình Thuận</p></div>
          </div>
          <button onClick={onClose} className="md:hidden text-gray-500 hover:text-white transition-colors p-1"><X size={20} /></button>
        </div>

        <nav className="flex-1 px-3 md:px-4 space-y-1 mt-2 overflow-y-auto custom-scrollbar">
          
          <p className="text-[10px] md:text-xs text-gray-500 uppercase font-semibold px-4 mb-2 tracking-wider mt-2">Phẫu thuật</p>

          {/* NHÓM PHACO */}
          <MenuItem icon={<Orbit size={20} />} label="Phaco" hasChildren isExpanded={expandedMenus.phaco} onClick={() => toggleSubMenu('phaco')} />
          <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${expandedMenus.phaco ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
            <div className="overflow-hidden">
                <div className="pb-2">
                    <MenuItem label="Vãng lai" icon={<EqualApproximately size={16}/>} active={isActive('/phaco-vang-lai')} onClick={() => handleNavigate('/phaco-vang-lai')} isChild />
                    <MenuItem label="Tuyến" icon={<Merge size={16}/>} active={isActive('/phaco-tuyen')} onClick={() => handleNavigate('/phaco-tuyen')} isChild />
                    <MenuItem label="PKVT" icon={<Satellite size={16}/>} active={isActive('/phaco-pkvt')} onClick={() => handleNavigate('/phaco-pkvt')} isChild />
                    <MenuItem label="Đối Tác" icon={<Handshake size={16}/>} active={isActive('/phaco-doitac')} onClick={() => handleNavigate('/phaco-doitac')} isChild />
                </div>
            </div>
          </div>

          {/* NHÓM MỘNG */}
          <MenuItem icon={<Eclipse size={20} />} label="Mộng thịt" hasChildren isExpanded={expandedMenus.mong} onClick={() => toggleSubMenu('mong')} />
          <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${expandedMenus.mong ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
            <div className="overflow-hidden">
                <div className="pb-2">
                    <MenuItem label="Vãng lai" icon={<EqualApproximately size={16}/>} active={isActive('/mong-vang-lai')} onClick={() => handleNavigate('/mong-vang-lai')} isChild />
                    <MenuItem label="Tuyến" icon={<Merge size={16}/>} active={isActive('/mong-tuyen')} onClick={() => handleNavigate('/mong-tuyen')} isChild />
                    <MenuItem label="PKVT" icon={<Satellite size={16}/>} active={isActive('/mong-pkvt')} onClick={() => handleNavigate('/mong-pkvt')} isChild />
                    <MenuItem label="Đối Tác" icon={<Handshake size={16}/>} active={isActive('/mong-doitac')} onClick={() => handleNavigate('/mong-doitac')} isChild />
                </div>
            </div>
          </div>

          <MenuItem icon={<Glasses size={20} />} label="Khúc Xạ" active={isActive('/khuc-xa')} onClick={() => handleNavigate('/khuc-xa')}/>
          <MenuItem icon={<Syringe size={20} />} label="Thủ Thuật" active={isActive('/thu-thuat')} onClick={() => handleNavigate('/thu-thuat')}/>
          <MenuItem icon={<Scissors size={20} />} label="Tiểu Phẫu" active={isActive('/tieu-phau')} onClick={() => handleNavigate('/tieu-phau')}/>
          <MenuItem icon={<Box size={20} />} label="Combo Dịch Vụ" active={isActive('/services')} onClick={() => handleNavigate('/services')} />

          {/* [ĐÃ SỬA] Tách nhóm Báo cáo ra, thêm đường kẻ và khoảng cách giống phần Tiện ích */}
          <div className="mt-4 pt-4 border-t border-gray-800">
            <p className="text-[10px] md:text-xs text-gray-500 uppercase font-semibold px-4 mb-2 tracking-wider">Báo cáo & Dữ liệu</p>
            
            <MenuItem icon={<BarChart3 size={20} />} label="Báo Cáo Tổng Hợp" active={isActive('/')} onClick={() => handleNavigate('/')} className="text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10" />
            
            {/* <MenuItem icon={<Table2 size={20} />} label="Dữ liệu chi tiết" active={isActive('/data')} onClick={() => handleNavigate('/data')} className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10" /> */}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-800">
             <p className="text-[10px] md:text-xs text-gray-500 uppercase font-semibold px-4 mb-2 tracking-wider">Tiện ích</p>
             <MenuItem icon={<Mail size={20} className={isSending ? "animate-pulse" : ""} />} label={isSending ? "Đang gửi..." : "Gửi Báo Cáo Email"} onClick={handleSendClick} className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10" />
          </div>
        </nav>

        <div className="p-4 border-t border-gray-800 space-y-2 mb-safe">
          <MenuItem icon={<Database size={20} />} label="Xóa dữ liệu" onClick={() => { onClearData(); if(onClose) onClose(); }} className="text-red-400 hover:text-red-300 hover:bg-red-900/10" />
        </div>
      </aside>
      <PasswordModal isOpen={showEmailAuth} onClose={() => setShowEmailAuth(false)} onSuccess={handleEmailAuthSuccess} title="Xác thực gửi Email" />
    </>
  );
};
export default Sidebar;