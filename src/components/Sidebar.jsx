import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck, Table2, Database, ClipboardList, X } from 'lucide-react';
import logoImage from '../assets/logo.png'; 

const MenuItem = ({ icon, label, path, active, onClick, className }) => (
  <div 
    onClick={onClick} 
    className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 ${
      active 
        ? 'bg-[#2D3039] text-blue-400 border-l-4 border-blue-500' 
        : 'text-gray-400 hover:bg-[#1C1E26] hover:text-gray-200'
    } ${className || ''}`}
  >
    {icon} 
    <span className={`font-medium text-sm ${active ? 'font-bold' : ''}`}>{label}</span>
  </div>
);

const Sidebar = ({ onClearData, isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { label: 'Phaco Vãng lai', path: '/', icon: <div className="w-5 h-5 flex items-center justify-center border border-current rounded bg-transparent text-[10px] font-bold">VL</div> },
    { label: 'Phaco Tuyến', path: '/phaco-tuyen', icon: <ShieldCheck size={20} /> },
    { label: 'Báo cáo Dịch vụ', path: '/services', icon: <ClipboardList size={20} /> },
    { label: 'Dữ liệu chi tiết', path: '/data', icon: <Table2 size={20} /> },
  ];

  const handleNavigate = (path) => {
    navigate(path);
    if (onClose) onClose(); 
  };

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/60 z-40 md:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        onClick={onClose}
      ></div>

      <aside 
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-[#0F1115] flex flex-col border-r border-gray-800 transition-transform duration-300 transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
      >
        <div className="p-4 md:p-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="p-1 rounded-lg flex-shrink-0">
                <img src={logoImage} alt="Logo" className="w-8 h-8 object-contain" />
            </div>
            <div className="flex-1 min-w-0">
                <h1 className="font-bold text-sm md:text-lg leading-tight text-white truncate">Báo cáo EW</h1>
                <p className="text-[10px] md:text-xs text-gray-400 font-medium truncate leading-tight mt-0.5">Bệnh viện mắt Bình Thuận</p>
            </div>
          </div>
          <button onClick={onClose} className="md:hidden text-gray-500 hover:text-white transition-colors p-1">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-3 md:px-4 space-y-1 md:space-y-2 mt-2 overflow-y-auto">
          <p className="text-[10px] md:text-xs text-gray-500 uppercase font-semibold px-4 mb-2 tracking-wider">Menu Chính</p>
          {menuItems.map((item) => (
            <MenuItem key={item.label} icon={item.icon} label={item.label} active={location.pathname === item.path} onClick={() => handleNavigate(item.path)} />
          ))}
        </nav>

        <div className="p-4 border-t border-gray-800 space-y-2 mb-safe">
          <MenuItem icon={<Database size={20} />} label="Xóa dữ liệu" onClick={() => { onClearData(); if(onClose) onClose(); }} className="text-red-400 hover:text-red-300 hover:bg-red-900/10" />
        </div>
      </aside>
    </>
  );
};

export default Sidebar;