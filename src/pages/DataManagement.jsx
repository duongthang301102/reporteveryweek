import React from 'react';
import { Database } from 'lucide-react';

const DataManagement = ({ data, formatCurrency }) => {
  const formatDate = (dateVal) => {
    if (!dateVal) return "-";
    let d;
    if (typeof dateVal === 'string' && dateVal.includes('/')) {
        const parts = dateVal.split('/');
        if (parts.length === 3) d = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    }
    if (!d || isNaN(d.getTime())) d = new Date(dateVal);
    if (isNaN(d.getTime())) return String(dateVal);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  };

  return (
    <div className="bg-[#1C1E26] rounded-2xl border border-gray-800 overflow-hidden shadow-lg animate-fade-in-up">
      <div className="p-4 md:p-6 border-b border-gray-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
        <div>
          <h3 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
            <Database className="text-blue-500" size={20} /> 
            Kho dữ liệu tổng hợp
          </h3>
          <p className="text-xs md:text-sm text-gray-500 mt-1">
            Tổng cộng: <span className="text-white font-bold">{data.length}</span> dòng giao dịch
          </p>
        </div>
      </div>

      {/* Bảng dữ liệu: Scroll Horizontal + Max Height */}
      <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
        <table className="w-full text-[11px] md:text-sm text-left whitespace-nowrap">
          <thead className="text-gray-400 uppercase bg-[#0F1115] sticky top-0 z-10">
            <tr>
              <th className="px-4 md:px-6 py-3">Ngày</th>
              <th className="px-4 md:px-6 py-3">Nguồn</th>
              <th className="px-4 md:px-6 py-3">Tên gói</th>
              <th className="px-4 md:px-6 py-3 text-center">Loại</th>
              <th className="px-4 md:px-6 py-3 text-right">SL</th>
              <th className="px-4 md:px-6 py-3 text-right">Đơn giá</th>
              <th className="px-4 md:px-6 py-3 text-right">Bảo hiểm</th>
              <th className="px-4 md:px-6 py-3 text-right">Thành tiền</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {data.length === 0 ? (
              <tr><td colSpan="8" className="px-6 py-8 text-center text-gray-500 italic">Chưa có dữ liệu nào. Hãy nhập file Excel!</td></tr>
            ) : (
              data.map((row, index) => {
                const ngay = row['ngày'] || row['Ngày'];
                const tenGoi = row['tên gói'] || row['Tên gói'];
                const loaiGoi = row['loại gói'] || row['Loại gói'];
                const sl = Number(String(row['số lượng'] || row['Số lượng'] || 0).replace(/[^0-9.-]+/g,""));
                const gia = Number(String(row['đơn giá'] || row['Đơn giá'] || 0).replace(/[^0-9.-]+/g,""));
                const bh = Number(String(row['giá bảo hiểm'] || row['Giá bảo hiểm'] || 0).replace(/[^0-9.-]+/g,""));
                const thanhTien = gia * sl; 

                let badgeClass = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
                let sourceLabel = 'Vãng Lai';
                if (row.type === 'tuyen') { badgeClass = 'bg-teal-500/10 text-teal-400 border-teal-500/20'; sourceLabel = 'Phaco Tuyến'; }
                else if (row.type === 'dichvu') { badgeClass = 'bg-purple-500/10 text-purple-400 border-purple-500/20'; sourceLabel = 'Dịch vụ'; }

                return (
                  <tr key={index} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 md:px-6 py-3 md:py-4 font-medium text-gray-300">{formatDate(ngay)}</td>
                    <td className="px-4 md:px-6 py-3 md:py-4"><span className={`px-1.5 py-0.5 md:px-2 md:py-1 rounded text-[9px] md:text-[10px] font-bold uppercase border ${badgeClass}`}>{sourceLabel}</span></td>
                    <td className="px-4 md:px-6 py-3 md:py-4 text-white font-medium max-w-[150px] md:max-w-none truncate">{tenGoi}</td>
                    <td className="px-4 md:px-6 py-3 md:py-4 text-center text-gray-400 capitalize">{loaiGoi || '-'}</td>
                    <td className="px-4 md:px-6 py-3 md:py-4 text-right font-mono text-white">{sl}</td>
                    <td className="px-4 md:px-6 py-3 md:py-4 text-right font-mono text-gray-400">{formatCurrency(gia)}</td>
                    <td className="px-4 md:px-6 py-3 md:py-4 text-right font-mono text-emerald-400">{bh > 0 ? formatCurrency(bh) : '-'}</td>
                    <td className="px-4 md:px-6 py-3 md:py-4 text-right font-mono font-bold text-blue-400">{formatCurrency(thanhTien)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataManagement;