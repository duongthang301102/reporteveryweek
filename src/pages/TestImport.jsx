import React, { useState, useRef, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { Upload, FileSpreadsheet, Trash2, Calendar, AlertCircle, ShieldCheck, Users } from 'lucide-react';
import ProductCard from '../components/ProductCard'; 

const TestImport = ({ formatCurrency }) => {
    const [previewData, setPreviewData] = useState([]);
    const [tableHeaders, setTableHeaders] = useState([]);
    const fileInputRef = useRef(null);

    // --- 1. XỬ LÝ NGÀY THÁNG ---
    const formatDate = (val) => {
        if (!val) return '';
        if (val instanceof Date) {
            const d = val.getDate().toString().padStart(2, '0');
            const m = (val.getMonth() + 1).toString().padStart(2, '0');
            const y = val.getFullYear();
            return `${d}/${m}/${y}`;
        }
        if (typeof val === 'number' && val > 20000) {
            const date = new Date((val - 25569) * 86400 * 1000);
            return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
        }
        return String(val);
    };

    const findColumnValue = (row, keywords) => {
        const keys = Object.keys(row);
        const foundKey = keys.find(k => keywords.some(w => k.toLowerCase().includes(w)));
        return foundKey ? row[foundKey] : null;
    };

    // --- 2. LOGIC XỬ LÝ THÔNG MINH (MỚI) ---
    const processRow = (row) => {
        // A. XÁC ĐỊNH TUYẾN HAY VÃNG LAI
        const rawTuyen = findColumnValue(row, ['tuyến', 'tuyen', 'đối tượng']) || '';
        const valTuyen = String(rawTuyen).trim().toLowerCase();
        const isTuyen = valTuyen.includes('tuyến') || valTuyen.includes('tuyen'); 

        // B. TÍNH ĐƠN GIÁ TỪ TÊN GÓI (LOGIC MỚI)
        const rawTen = findColumnValue(row, ['tên gói', 'ten goi', 'tên gói mổ']) || '';
        const nameStr = String(rawTen).trim();
        
        // Regex để tìm số trong chuỗi (Ví dụ: "Phaco 10.3" -> tìm thấy "10.3")
        // Tìm số thực (có dấu chấm hoặc không)
        const priceMatch = nameStr.match(/(\d+(\.\d+)?)/);
        
        let extractedNumber = 0;
        let donGia = 0;

        if (priceMatch) {
            extractedNumber = parseFloat(priceMatch[0]);
            // Nếu tìm thấy số -> Nhân với 1 triệu để ra đơn giá
            // (Trừ trường hợp số quá lớn như 500.000 thì thôi, nhưng tên gói thường là 6.8, 10.5...)
            if (extractedNumber < 1000) { 
                donGia = extractedNumber * 1000000;
            } else {
                // Trường hợp tên là "Phaco 500" -> extracted là 500 -> Có thể là 500k?
                // Tạm thời nếu số > 100 thì giữ nguyên hoặc xử lý riêng nếu cần. 
                // Với quy tắc bạn đưa (10.3, 20.1) thì logic < 1000 là an toàn.
                 donGia = extractedNumber; 
            }
        }
        
        // Nếu không tìm thấy số trong tên, thử lấy cột "Đơn giá" trong Excel
        if (donGia === 0) {
             donGia = Number(findColumnValue(row, ['đơn giá', 'giá']) || 0);
        }

        // C. XÁC ĐỊNH CAO CẤP HAY CƠ BẢN
        // Quy tắc: Nếu số trong tên gói >= 20 -> Cao cấp
        let isPremium = false;
        if (extractedNumber >= 20) {
            isPremium = true;
        } else {
            // Fallback: Nếu tên không có số >= 20, check cột "Loại gói" xem có chữ "Cao cấp" không
            const rawLoai = findColumnValue(row, ['loại gói', 'loai goi', 'phân loại']) || '';
            const checkStr = (String(rawLoai) + ' ' + nameStr).toLowerCase();
            if (checkStr.includes('cao cấp') || checkStr.includes('premium')) {
                isPremium = true;
            }
        }

        // D. TÍNH GIÁ BẢO HIỂM
        const lowerName = nameStr.toLowerCase();
        let giaBaoHiem = 6146950;
        const lowPricePackages = ['phaco 0 đồng', 'phaco 0', 'phaco 500'];
        if (lowPricePackages.some(p => lowerName.includes(p))) {
            giaBaoHiem = 5946950;
        }

        // E. TÍNH DOANH THU BỆNH NHÂN
        const soLuong = Number(findColumnValue(row, ['số lượng', 'sl']) || 1);
        
        const doanhThuBH = giaBaoHiem * soLuong;
        let doanhThuBN = 0;
        
        // Chỉ tính doanh thu BN nếu Đơn giá lớn hơn Giá BH
        if (donGia > giaBaoHiem) {
            doanhThuBN = (donGia - giaBaoHiem) * soLuong;
        }

        return {
            ...row,
            'GIÁ BH (AUTO)': giaBaoHiem,
            'ĐƠN GIÁ (AUTO)': donGia, // Hiển thị để check
            'DT BỆNH NHÂN (AUTO)': doanhThuBN,
            _calculated: { 
                isTuyen, 
                isPremium, 
                soLuong,
                doanhThuBH,
                doanhThuBN,
                tongTien: doanhThuBH + doanhThuBN
            }
        };
    };

    // --- 3. TỔNG HỢP (GIỮ NGUYÊN) ---
    const summary = useMemo(() => {
        const stats = {
            vanglai: { basic: { sales: 0, revenue: 0, insRev: 0, patRev: 0 }, premium: { sales: 0, revenue: 0, insRev: 0, patRev: 0 } },
            tuyen: { basic: { sales: 0, revenue: 0, insRev: 0, patRev: 0 }, premium: { sales: 0, revenue: 0, insRev: 0, patRev: 0 } }
        };

        previewData.forEach(row => {
            const calc = row._calculated;
            if (!calc) return;
            const group = calc.isTuyen ? stats.tuyen : stats.vanglai;
            const type = calc.isPremium ? group.premium : group.basic;
            type.sales += calc.soLuong;
            type.revenue += calc.tongTien;
            type.insRev += calc.doanhThuBH;
            type.patRev += calc.doanhThuBN;
        });
        return stats;
    }, [previewData]);

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
            const bstr = evt.target.result;
            const workbook = XLSX.read(bstr, { type: 'binary', cellDates: true });
            const ws = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(ws, { raw: true }); 
            if (jsonData.length > 0) {
                const processed = jsonData.map(processRow);
                setPreviewData(processed);
                const firstRowKeys = Object.keys(processed[0]).filter(k => k !== '_calculated');
                setTableHeaders(firstRowKeys);
            }
        };
        reader.readAsBinaryString(file);
    };

    return (
        <div className="animate-fade-in-up pb-10">
            <div className="bg-[#1C1E26] p-6 rounded-2xl border border-gray-800 mb-6">
                <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                    <FileSpreadsheet className="text-purple-500"/> Test Nhập Liệu
                </h2>
                <p className="text-gray-400 text-sm mb-4">
                    Logic mới: <b>Số trong tên gói</b> nhân 1 triệu = Đơn giá. Nếu số <b>&ge; 20</b> = Cao cấp.
                </p>
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".xlsx, .xls" />
                <button onClick={() => fileInputRef.current.click()} className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition"><Upload size={18} /> Chọn file Excel</button>
            </div>

            {previewData.length > 0 && (
                <>
                    {/* KHU VỰC 1: VÃNG LAI */}
                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-3 border-b border-gray-800 pb-2">
                            <Users className="text-blue-400" size={20}/>
                            <h3 className="text-lg font-bold text-white uppercase tracking-wider">1. Kết quả Phaco Vãng Lai</h3>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                            <ProductCard title="Vãng lai - Cơ bản" subtitle="Dữ liệu Test" count={summary.vanglai.basic.sales} val1={summary.vanglai.basic.insRev} val2={summary.vanglai.basic.patRev} color="blue" formatCurrency={formatCurrency} badge="TIÊU CHUẨN"/>
                            <ProductCard title="Vãng lai - Cao cấp" subtitle="Dữ liệu Test" count={summary.vanglai.premium.sales} val1={summary.vanglai.premium.insRev} val2={summary.vanglai.premium.patRev} color="purple" formatCurrency={formatCurrency} badge="CAO CẤP"/>
                        </div>
                    </div>

                    {/* KHU VỰC 2: TUYẾN */}
                    <div className="mb-8">
                         <div className="flex items-center gap-2 mb-3 border-b border-gray-800 pb-2">
                            <ShieldCheck className="text-green-400" size={20}/>
                            <h3 className="text-lg font-bold text-white uppercase tracking-wider">2. Kết quả Phaco Tuyến</h3>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                            <ProductCard title="Tuyến - Cơ bản" subtitle="Dữ liệu Test" count={summary.tuyen.basic.sales} val1={summary.tuyen.basic.insRev} val2={summary.tuyen.basic.patRev} color="blue" formatCurrency={formatCurrency} badge="TIÊU CHUẨN"/>
                            <ProductCard title="Tuyến - Cao cấp" subtitle="Dữ liệu Test" count={summary.tuyen.premium.sales} val1={summary.tuyen.premium.insRev} val2={summary.tuyen.premium.patRev} color="purple" formatCurrency={formatCurrency} badge="CAO CẤP"/>
                        </div>
                    </div>

                    {/* BẢNG CHI TIẾT */}
                    <div className="bg-[#1C1E26] rounded-2xl border border-gray-800 overflow-hidden flex flex-col max-h-[80vh]">
                        <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-[#15171e]">
                            <h3 className="font-bold text-white">Chi tiết ({previewData.length} dòng)</h3>
                            <button onClick={() => setPreviewData([])} className="text-red-400 hover:text-red-300 text-sm flex items-center gap-1"><Trash2 size={14}/> Xóa bảng</button>
                        </div>
                        <div className="overflow-auto flex-1 w-full">
                            <table className="w-full text-xs md:text-sm text-left whitespace-nowrap border-collapse">
                                <thead className="bg-[#0F1115] text-gray-400 uppercase sticky top-0 z-10 shadow-sm">
                                    <tr>
                                        {tableHeaders.map((head, index) => (
                                            <th key={index} className="px-4 py-3 border-b border-gray-700 bg-[#0F1115] font-semibold border-r border-gray-800 last:border-r-0">{head}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800">
                                    {previewData.map((row, rowIndex) => (
                                        <tr key={rowIndex} className="hover:bg-white/5 transition-colors">
                                            {tableHeaders.map((colKey, colIndex) => {
                                                const cellValue = row[colKey];
                                                if (colKey.toLowerCase().includes('ngày')) return (<td key={colIndex} className="px-4 py-2 text-gray-300 border-r border-gray-800/50"><div className="flex items-center gap-1.5"><Calendar size={12} className="text-gray-500"/>{formatDate(cellValue)}</div></td>);
                                                
                                                // TÔ MÀU CÁC CỘT TÍNH TOÁN
                                                if (colKey === 'GIÁ BH (AUTO)') return (<td key={colIndex} className="px-4 py-2 text-emerald-400 font-bold border-r border-gray-800/50 bg-emerald-500/5 text-right">{formatCurrency(cellValue)}</td>);
                                                if (colKey === 'DT BỆNH NHÂN (AUTO)') return (<td key={colIndex} className="px-4 py-2 text-orange-400 font-bold border-r border-gray-800/50 bg-orange-500/5 text-right">{formatCurrency(cellValue)}</td>);
                                                if (colKey === 'ĐƠN GIÁ (AUTO)') return (<td key={colIndex} className="px-4 py-2 text-blue-400 font-mono border-r border-gray-800/50 bg-blue-500/5 text-right">{formatCurrency(cellValue)}</td>);

                                                return (<td key={colIndex} className="px-4 py-2 text-gray-300 border-r border-gray-800/50 last:border-r-0">{cellValue}</td>);
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default TestImport;