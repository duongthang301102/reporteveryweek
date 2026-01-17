import React, { useState } from 'react';
import { ShieldCheck, User, Lock } from 'lucide-react'; // Thêm icon User và Lock cho input đẹp hơn

const LoginPage = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    
    // Lấy danh sách user từ LocalStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // [CƠ CHẾ AN TOÀN] Nếu chưa có user nào, tạo user mặc định: admin / admin123
    if (users.length === 0) {
        const defaultAdmin = { username: 'admin', password: '123', role: 'admin', name: 'Quản Trị Viên', permissions: [] };
        localStorage.setItem('users', JSON.stringify([defaultAdmin]));
        if (username === 'admin' && password === '123') {
            onLogin(defaultAdmin);
            return;
        }
    }

    // Kiểm tra đăng nhập
    const foundUser = users.find(u => u.username === username && u.password === password);
    
    if (foundUser) {
        onLogin(foundUser);
    } else {
        setError('Tên đăng nhập hoặc mật khẩu không đúng!');
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#0F1115] relative overflow-hidden px-4 sm:px-6 lg:px-8">
      {/* Background Effects - Responsive */}
      <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[40%] md:w-[40%] md:h-[40%] bg-blue-600/20 rounded-full blur-[80px] md:blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[40%] md:w-[40%] md:h-[40%] bg-purple-600/20 rounded-full blur-[80px] md:blur-[120px] animate-pulse delay-1000"></div>

      {/* Login Card */}
      <div className="bg-[#1C1E26]/90 backdrop-blur-xl p-6 md:p-10 rounded-2xl shadow-2xl border border-gray-800 w-full max-w-[420px] relative z-10 animate-fade-in-up transition-all duration-300">
        
        {/* Header Section */}
        <div className="text-center mb-8 md:mb-10">
            <div className="bg-gradient-to-tr from-blue-500/20 to-purple-500/20 p-4 rounded-full w-20 h-20 md:w-24 md:h-24 flex items-center justify-center mx-auto mb-5 border border-blue-500/30 shadow-inner">
                <ShieldCheck className="text-blue-400 w-10 h-10 md:w-12 md:h-12" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 tracking-tight">Hệ Thống Báo Cáo EW</h2>
            <p className="text-gray-500 text-xs md:text-sm font-medium">Đăng nhập để truy cập dữ liệu nội bộ</p>
        </div>

        {/* Form Section */}
        <form onSubmit={handleLogin} className="space-y-5 md:space-y-6">
            
            {/* Username Input */}
            <div className="space-y-1.5">
                <label className="block text-gray-400 text-[10px] md:text-xs uppercase font-bold ml-1 tracking-wider">Tài khoản</label>
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 group-focus-within:text-blue-500 transition-colors">
                        <User size={18} />
                    </div>
                    <input 
                        type="text" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full bg-[#13151A] border border-gray-700 text-white pl-10 pr-4 py-3 md:py-3.5 rounded-xl text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder-gray-600"
                        placeholder="Nhập tên đăng nhập..."
                    />
                </div>
            </div>
            
            {/* Password Input */}
            <div className="space-y-1.5">
                <label className="block text-gray-400 text-[10px] md:text-xs uppercase font-bold ml-1 tracking-wider">Mật khẩu</label>
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 group-focus-within:text-blue-500 transition-colors">
                        <Lock size={18} />
                    </div>
                    <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-[#13151A] border border-gray-700 text-white pl-10 pr-4 py-3 md:py-3.5 rounded-xl text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder-gray-600"
                        placeholder="Nhập mật khẩu..."
                    />
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-xs md:text-sm p-3 rounded-lg text-center font-medium animate-shake">
                    {error}
                </div>
            )}

            {/* Submit Button */}
            <button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3.5 md:py-4 rounded-xl shadow-lg shadow-blue-500/25 transition-all transform active:scale-[0.98] mt-2 text-sm md:text-base tracking-wide"
            >
                ĐĂNG NHẬP HỆ THỐNG
            </button>
        </form>
        
        {/* Footer Note */}
        <div className="mt-8 md:mt-10 pt-6 border-t border-gray-800 text-center">
            <p className="text-[10px] text-gray-600 px-4 leading-relaxed">
                <span className="block text-gray-500 font-bold mb-1">LƯU Ý BẢO MẬT</span>
                Dữ liệu này là TỐI MẬT. Vui lòng không chia sẻ tài khoản cho người không có phận sự.
            </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;