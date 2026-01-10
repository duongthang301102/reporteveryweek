import React, { useState } from 'react';
import { Search, Database } from 'lucide-react';

const DataManagement = ({ data, formatCurrency }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Lọc dữ liệu theo từ khóa tìm kiếm
  const filteredData = data.filter(row => 
    Object.values(row).some(val => 
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Hàm format ngày tháng an toàn
  const formatDate = (val) => {
    if (!val) return '-';
    try {
        const d = new Date(val);
        if (isNaN(d.getTime())) return String(val);
        return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth()+1).toString().padStart(2, '0')}/${d.getFullYear()}`;
    } catch (e) { return String(val); }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Database className="text-yellow-400"/> Dữ liệu Chi tiết
            </h2>
            <p className="text-gray-400 text-sm mt-1">
                Tổng cộng: <span className="text-white font-bold">{data.length}</span> dòng dữ liệu trong hệ thống.
            </p>
        </div>
        
        {/* Ô Tìm kiếm */}
        <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input 
                type="text" 
                placeholder="Tìm kiếm..." 
                className="w-full bg-[#1C1E26] border border-gray-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:border-yellow-500 focus:outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
      </div>

      {/* Bảng Dữ liệu */}
      <div className="bg-[#1C1E26] border border-gray-800 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="bg-[#0F1115] text-gray-400 uppercase text-xs">
                    <tr>
                        <th className="px-4 py-3 border-b border-gray-700">Ngày</th>
                        <th className="px-4 py-3 border-b border-gray-700">Tên Gói</th>
                        <th className="px-4 py-3 border-b border-gray-700 text-center">SL</th>
                        <th className="px-4 py-3 border-b border-gray-700 text-right">Đơn Giá</th>
                        <th className="px-4 py-3 border-b border-gray-700 text-right">Thành Tiền</th>
                        <th className="px-4 py-3 border-b border-gray-700 text-center">Loại (Menu)</th>
                        <th className="px-4 py-3 border-b border-gray-700 text-center">Phân Hạng</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                    {filteredData.length > 0 ? (
                        filteredData.map((row, index) => (
                            <tr key={index} className="hover:bg-white/5 transition">
                                <td className="px-4 py-3 text-gray-300">{formatDate(row['ngày'])}</td>
                                <td className="px-4 py-3 font-medium text-white">{row['tên gói']}</td>
                                <td className="px-4 py-3 text-center text-gray-300">{row['số lượng'] || 1}</td>
                                <td className="px-4 py-3 text-right text-gray-300">{formatCurrency(row['đơn giá'])}</td>
                                <td className="px-4 py-3 text-right text-yellow-400 font-bold">
                                    {formatCurrency((row['đơn giá'] || 0) * (row['số lượng'] || 1))}
                                </td>
                                
                                {/* Cột hiển thị loại menu (Quan trọng để debug) */}
                                <td className="px-4 py-3 text-center">
                                    <span className={`px-2 py-1 rounded text-xs font-bold 
                                        ${row.type === 'vanglai' ? 'bg-blue-500/20 text-blue-400' : 
                                          row.type === 'tuyen' ? 'bg-green-500/20 text-green-400' :
                                          row.type === 'mong_vanglai' ? 'bg-teal-500/20 text-teal-400' :
                                          row.type === 'mong_tuyen' ? 'bg-orange-500/20 text-orange-400' :
                                          'bg-gray-700 text-gray-400'}`}>
                                        {row.type === 'vanglai' ? 'Phaco VL' : 
                                         row.type === 'tuyen' ? 'Phaco Tuyến' :
                                         row.type === 'mong_vanglai' ? 'Mộng VL' :
                                         row.type === 'mong_tuyen' ? 'Mộng Tuyến' :
                                         row.type === 'dichvu' ? 'Combo' : row.type}
                                    </span>
                                </td>

                                <td className="px-4 py-3 text-center text-gray-400 text-xs">
                                    {row['loại gói'] || '-'}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="7" className="px-4 py-8 text-center text-gray-500 italic">
                                Chưa có dữ liệu nào. Hãy thử nhập Excel.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default DataManagement;