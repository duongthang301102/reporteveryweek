import React, { useState, useEffect } from 'react';
import { Users, Plus, Trash2, Edit, Save, X, Shield, CheckCircle, Mail, FileUp, MoreVertical } from 'lucide-react';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    
    // Form dữ liệu
    const [formData, setFormData] = useState({ 
        username: '', 
        password: '', 
        name: '', 
        role: 'user', 
        permissions: [] 
    });

    useEffect(() => {
        const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
        if (storedUsers.length === 0) {
            const defaultAdmin = { username: 'admin', password: '123', name: 'Quản Trị Viên', role: 'admin', permissions: [] };
            setUsers([defaultAdmin]);
            localStorage.setItem('users', JSON.stringify([defaultAdmin]));
        } else {
            setUsers(storedUsers);
        }
    }, []);

    const saveToLocal = (newUsers) => {
        setUsers(newUsers);
        localStorage.setItem('users', JSON.stringify(newUsers));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingUser) {
            const updated = users.map(u => u.username === editingUser.username ? { ...formData } : u);
            saveToLocal(updated);
        } else {
            if (users.some(u => u.username === formData.username)) {
                alert('Tên đăng nhập đã tồn tại!');
                return;
            }
            saveToLocal([...users, formData]);
        }
        closeModal();
    };

    const handleDelete = (username) => {
        if (username === 'admin') { alert('Không thể xóa tài khoản Admin gốc!'); return; }
        if (window.confirm(`Bạn chắc chắn muốn xóa tài khoản: ${username}?`)) {
            const updated = users.filter(u => u.username !== username);
            saveToLocal(updated);
        }
    };

    const openModal = (user = null) => {
        if (user) {
            setEditingUser(user);
            setFormData(user);
        } else {
            setEditingUser(null);
            setFormData({ username: '', password: '', name: '', role: 'user', permissions: [] });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => setIsModalOpen(false);

    const togglePermission = (perm) => {
        setFormData(prev => {
            const currentPerms = prev.permissions || [];
            if (currentPerms.includes(perm)) return { ...prev, permissions: currentPerms.filter(p => p !== perm) };
            return { ...prev, permissions: [...currentPerms, perm] };
        });
    };

    const menuPermissions = [
        { key: 'view_phaco', label: 'Xem Phaco' },
        { key: 'view_mong', label: 'Xem Mộng Thịt' },
        { key: 'view_khucxa', label: 'Xem Khúc Xạ' },
        { key: 'view_thuthuat', label: 'Xem Thủ Thuật' },
        { key: 'view_tieuphau', label: 'Xem Tiểu Phẫu' },
        { key: 'view_combo', label: 'Xem Combo Dịch Vụ' },
        { key: 'view_report', label: 'Xem Báo Cáo Tổng Hợp' },
        { key: 'view_data', label: 'Xem Dữ Liệu Chi Tiết' },
    ];

    // --- COMPONENT HIỂN THỊ QUYỀN HẠN ---
    const PermissionsTags = ({ user }) => {
        if (user.role === 'admin') return <span className="text-xs text-purple-400 font-medium italic">Toàn quyền hệ thống</span>;
        
        const countMenu = user.permissions?.filter(p => p.startsWith('view_')).length || 0;
        
        return (
            <div className="flex flex-wrap gap-2">
                {user.permissions?.includes('import') && (
                    <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold flex items-center gap-1">
                        <FileUp size={10} /> Import
                    </span>
                )}
                {user.permissions?.includes('send_email') && (
                    <span className="px-2 py-1 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20 text-[10px] font-bold flex items-center gap-1">
                        <Mail size={10} /> Email
                    </span>
                )}
                <span className="px-2 py-1 rounded bg-gray-700/50 text-gray-300 border border-gray-600/30 text-[10px] font-medium">
                    Xem {countMenu} menu
                </span>
            </div>
        );
    };

    return (
        <div className="animate-fade-in-up pb-20">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                   <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-3">
                       <span className="bg-blue-500/20 p-2 rounded-lg text-blue-400"><Users size={20} md:size={24} /></span> 
                       Quản Lý Tài Khoản
                   </h2>
                   <p className="text-gray-400 text-xs md:text-sm mt-1 ml-1">Danh sách nhân sự & phân quyền</p>
                </div>
                <button onClick={() => openModal()} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 active:scale-95 transition-all text-sm">
                    <Plus size={18} strokeWidth={3} /> Thêm Tài Khoản
                </button>
            </div>

            {/* --- VIEW 1: DESKTOP TABLE (Hidden on Mobile) --- */}
            <div className="hidden md:block bg-[#1C1E26] border border-gray-800 rounded-xl overflow-hidden shadow-lg">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-[#13151A] text-gray-400 uppercase text-xs font-bold">
                        <tr>
                            <th className="p-4 border-b border-gray-800">Họ Tên</th>
                            <th className="p-4 border-b border-gray-800">Username</th>
                            <th className="p-4 border-b border-gray-800 text-center">Vai Trò</th>
                            <th className="p-4 border-b border-gray-800">Quyền Hạn</th>
                            <th className="p-4 border-b border-gray-800 text-right">Thao Tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800 text-sm">
                        {users.map((user) => (
                            <tr key={user.username} className="hover:bg-white/[0.02] transition-colors group">
                                <td className="p-4 font-bold text-white flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${user.role === 'admin' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300'}`}>
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    {user.name}
                                </td>
                                <td className="p-4 text-gray-400 font-mono">{user.username}</td>
                                <td className="p-4 text-center">
                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${user.role === 'admin' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>
                                        {user.role === 'admin' ? 'Quản Trị' : 'Nhân Viên'}
                                    </span>
                                </td>
                                <td className="p-4 text-gray-400"><PermissionsTags user={user} /></td>
                                <td className="p-4 text-right">
                                    <div className="flex justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => openModal(user)} className="p-2 hover:bg-blue-500/20 text-blue-400 rounded-lg transition" title="Sửa"><Edit size={16}/></button>
                                        <button onClick={() => handleDelete(user.username)} className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition" title="Xóa"><Trash2 size={16}/></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* --- VIEW 2: MOBILE CARDS (Visible on Mobile) --- */}
            <div className="md:hidden space-y-4">
                {users.map((user) => (
                    <div key={user.username} className="bg-[#1C1E26] border border-gray-800 rounded-xl p-4 shadow-md flex flex-col gap-3">
                        {/* Card Header */}
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-md ${user.role === 'admin' ? 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white' : 'bg-gray-700 text-gray-300'}`}>
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-base leading-tight">{user.name}</h3>
                                    <p className="text-gray-500 text-xs font-mono">@{user.username}</p>
                                </div>
                            </div>
                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${user.role === 'admin' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>
                                {user.role === 'admin' ? 'Admin' : 'Staff'}
                            </span>
                        </div>

                        {/* Permissions */}
                        <div className="bg-[#13151A] rounded-lg p-3 border border-gray-800/50">
                            <p className="text-[10px] uppercase font-bold text-gray-500 mb-2">Quyền hạn</p>
                            <PermissionsTags user={user} />
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-1">
                            <button onClick={() => openModal(user)} className="flex-1 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-600/20 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors">
                                <Edit size={14} /> Chỉnh sửa
                            </button>
                            <button onClick={() => handleDelete(user.username)} className="flex-1 bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-600/20 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors">
                                <Trash2 size={14} /> Xóa
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* MODAL FORM (Responsive) */}
            {isModalOpen && (
                <>
                    <div className="fixed inset-0 bg-black/80 z-50 backdrop-blur-sm transition-opacity" onClick={closeModal}></div>
                    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#1C1E26] border border-gray-700 rounded-2xl shadow-2xl z-50 w-[95vw] max-w-lg p-5 md:p-6 animate-fade-in-up max-h-[90vh] overflow-y-auto custom-scrollbar">
                        <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-4 sticky top-0 bg-[#1C1E26] z-10 pt-1">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                {editingUser ? <Edit size={18} className="text-blue-400"/> : <Plus size={18} className="text-blue-400"/>}
                                {editingUser ? 'Cập nhật tài khoản' : 'Thêm tài khoản mới'}
                            </h3>
                            <button onClick={closeModal} className="text-gray-400 hover:text-white bg-white/5 p-1 rounded-full"><X size={18}/></button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-bold text-gray-500 block mb-1.5 uppercase tracking-wider">Họ và tên</label>
                                    <input type="text" required className="w-full bg-[#13151A] border border-gray-700 rounded-xl p-3 text-white focus:border-blue-500 outline-none transition-colors text-sm" 
                                        value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Vd: Nguyễn Văn A" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-gray-500 block mb-1.5 uppercase tracking-wider">Tên đăng nhập</label>
                                    <input type="text" required disabled={!!editingUser} className="w-full bg-[#13151A] border border-gray-700 rounded-xl p-3 text-white focus:border-blue-500 outline-none disabled:opacity-50 text-sm disabled:cursor-not-allowed" 
                                        value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} placeholder="username" />
                                </div>
                            </div>
                            
                            <div>
                                <label className="text-[10px] font-bold text-gray-500 block mb-1.5 uppercase tracking-wider">Mật khẩu</label>
                                <input type="text" required className="w-full bg-[#13151A] border border-gray-700 rounded-xl p-3 text-white focus:border-blue-500 outline-none text-sm" 
                                    value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="******" />
                            </div>
                            
                            <div>
                                <label className="text-[10px] font-bold text-gray-500 block mb-1.5 uppercase tracking-wider">Vai trò</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button type="button" onClick={() => setFormData({...formData, role: 'user'})} 
                                        className={`p-3 rounded-xl border text-sm font-medium transition-all flex items-center justify-center gap-2 ${formData.role === 'user' ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20' : 'bg-[#13151A] border-gray-700 text-gray-400 hover:border-gray-500'}`}>
                                        <Users size={16}/> Nhân viên
                                    </button>
                                    <button type="button" onClick={() => setFormData({...formData, role: 'admin'})}
                                        className={`p-3 rounded-xl border text-sm font-medium transition-all flex items-center justify-center gap-2 ${formData.role === 'admin' ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/20' : 'bg-[#13151A] border-gray-700 text-gray-400 hover:border-gray-500'}`}>
                                        <Shield size={16}/> Admin
                                    </button>
                                </div>
                            </div>

                            {formData.role === 'user' && (
                                <div className="space-y-4 pt-2">
                                    {/* Quyền chức năng */}
                                    <div className="bg-[#13151A] p-4 rounded-xl border border-gray-800">
                                        <label className="text-[10px] font-bold text-emerald-500 block mb-3 uppercase tracking-wider">Chức năng đặc biệt</label>
                                        <div className="flex flex-col gap-3">
                                            <label className="flex items-center gap-3 cursor-pointer hover:text-white text-gray-300 text-sm transition-colors">
                                                <input type="checkbox" checked={formData.permissions?.includes('import')} onChange={() => togglePermission('import')} className="accent-emerald-500 w-4 h-4 rounded"/>
                                                Được phép Nhập file Excel
                                            </label>
                                            <label className="flex items-center gap-3 cursor-pointer hover:text-white text-gray-300 text-sm transition-colors">
                                                <input type="checkbox" checked={formData.permissions?.includes('send_email')} onChange={() => togglePermission('send_email')} className="accent-orange-500 w-4 h-4 rounded"/>
                                                Được phép Gửi Email Báo Cáo
                                            </label>
                                        </div>
                                    </div>

                                    {/* Quyền xem Menu */}
                                    <div className="bg-[#13151A] p-4 rounded-xl border border-gray-800">
                                        <label className="text-[10px] font-bold text-blue-500 block mb-3 uppercase tracking-wider">Menu được phép xem</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {menuPermissions.map(perm => (
                                                <label key={perm.key} className="flex items-center gap-2 cursor-pointer hover:text-white text-gray-300 text-xs transition-colors p-1 rounded hover:bg-white/5">
                                                    <input type="checkbox" checked={formData.permissions?.includes(perm.key)} onChange={() => togglePermission(perm.key)} className="accent-blue-500 w-3.5 h-3.5 rounded"/>
                                                    {perm.label}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="pt-4 border-t border-gray-700 flex justify-end gap-3 sticky bottom-0 bg-[#1C1E26] z-10 pb-1">
                                <button type="button" onClick={closeModal} className="px-5 py-2.5 text-sm font-bold text-gray-400 hover:text-white transition bg-white/5 hover:bg-white/10 rounded-xl">Hủy bỏ</button>
                                <button type="submit" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 active:scale-95 flex items-center gap-2 transition-all">
                                    <Save size={16} /> Lưu Thông Tin
                                </button>
                            </div>
                        </form>
                    </div>
                </>
            )}
        </div>
    );
};

export default UserManagement;