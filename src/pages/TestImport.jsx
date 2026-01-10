import React, { useState, useRef, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { Upload, FileSpreadsheet, Trash2, Calendar, Users, ShieldCheck, Eye, Activity, FilterX, Info } from 'lucide-react';
import ProductCard from '../components/ProductCard'; 

const TestImport = ({ formatCurrency }) => {
    const [previewData, setPreviewData] = useState([]);
    const [tableHeaders, setTableHeaders] = useState([]);
    const fileInputRef = useRef(null);

    // --- CẤU HÌNH GIÁ ---
    const GIA_BH_PHACO_DEFAULT = 6146950;
    const GIA_BH_MONG = 1223550; 
    const PRICE_MONG_TUYEN = 2800000;
    const PRICE_MONG_KEP_TUYEN = 3300000;
    const PRICE_MONG_VL = 4250000;
    const PRICE_MONG_KEP_VL = 4650000;

    // --- 1. HELPERS ---
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

    // --- 2. LOGIC XỬ LÝ (STRICT MODE + FIX GIÁ CAO) ---
    const processRow = (row) => {
        // A. LỌC TÊN GÓI
        const rawTen = findColumnValue(row, ['tên gói', 'ten goi', 'tên gói mổ']) || '';
        const nameStr = String(rawTen).trim();
        const lowerName = nameStr.toLowerCase();

        const isPhaco = lowerName.includes('phaco');
        const isMong = lowerName.includes('mộng') || lowerName.includes('pterygium') || lowerName.includes('ghép');

        if (!isPhaco && !isMong) return null; 

        // B. XÁC ĐỊNH TUYẾN
        const rawTuyen = findColumnValue(row, ['tuyến', 'tuyen', 'đối tượng']) || '';
        const valTuyen = String(rawTuyen).trim().toLowerCase();
        
        let isTuyen = false;
        let isVangLai = false;

        if (valTuyen.includes('vãng') || valTuyen.includes('vang')) {
            isVangLai = true;
        } else if (valTuyen.includes('tuyến') || valTuyen.includes('tuyen')) {
            isTuyen = true;
        }

        if (!isVangLai && !isTuyen) return null; 

        // C. PHÂN LOẠI CHI TIẾT
        const isMongKep = isMong && (lowerName.includes('kép') || lowerName.includes('ghép') || lowerName.includes('double'));

        // D. TÍNH GIÁ TIỀN (FIX LỖI 55.01)
        let donGia = 0;
        let giaBaoHiem = 0;
        let isPremium = false;

        if (isMong) {
            giaBaoHiem = GIA_BH_MONG;
            if (isTuyen) {
                donGia = isMongKep ? PRICE_MONG_KEP_TUYEN : PRICE_MONG_TUYEN;
            } else {
                donGia = isMongKep ? PRICE_MONG_KEP_VL : PRICE_MONG_VL;
            }
            if (isMongKep) isPremium = true;

        } else {
            // LOGIC PHACO
            giaBaoHiem = GIA_BH_PHACO_DEFAULT;
            const lowPricePackages = ['phaco 0 đồng', 'phaco 0', 'phaco 500'];
            if (lowPricePackages.some(p => lowerName.includes(p))) {
                giaBaoHiem = 5946950;
            }

            const normalizedName = nameStr.replace(/,/g, '.');
            const priceMatch = normalizedName.match(/(\d+(\.\d+)?)/);
            
            let extractedNumber = 0;
            if (priceMatch) {
                extractedNumber = parseFloat(priceMatch[0]);
                
                // [FIX QUAN TRỌNG Ở ĐÂY]
                // Trước đây là < 50, giờ nâng lên < 100 để bắt được Phaco 55.01, 80...
                if (extractedNumber < 100) { 
                    donGia = extractedNumber * 1000000;
                } else if (extractedNumber >= 100 && extractedNumber < 1000) {
                    donGia = extractedNumber * 1000; // Case Phaco 500
                } else {
                    donGia = extractedNumber; 
                }
            } else {
                donGia = Number(findColumnValue(row, ['đơn giá', 'giá']) || 0);
            }

            if (donGia === 0) donGia = giaBaoHiem;

            if (extractedNumber >= 20 && extractedNumber < 100) {
                isPremium = true;
            } else {
                const rawLoai = findColumnValue(row, ['loại gói', 'loai goi', 'phân loại']) || '';
                const checkStr = (String(rawLoai) + ' ' + nameStr).toLowerCase();
                if (checkStr.includes('cao cấp') || checkStr.includes('premium')) {
                    isPremium = true;
                }
            }
        }

        const soLuong = Number(findColumnValue(row, ['số lượng', 'sl']) || 1);
        const doanhThuBH = giaBaoHiem * soLuong;
        let doanhThuBN = 0;
        
        if (donGia > giaBaoHiem) {
            doanhThuBN = (donGia - giaBaoHiem) * soLuong;
        }

        return {
            ...row,
            'LOẠI (AUTO)': isMong ? (isMongKep ? 'MỘNG KÉP' : 'MỘNG') : 'PHACO',
            'TUYẾN (AUTO)': isTuyen ? 'TUYẾN' : 'VÃNG LAI',
            'GIÁ BH (AUTO)': giaBaoHiem,
            'ĐƠN GIÁ (AUTO)': donGia,
            'DT BỆNH NHÂN (AUTO)': doanhThuBN,
            _calculated: { 
                isTuyen, 
                isPremium, 
                isMong, 
                soLuong,
                packageName: nameStr,
                doanhThuBH,
                doanhThuBN,
                tongTien: (donGia * soLuong)
            }
        };
    };

    // --- 3. TỔNG HỢP ---
    const summary = useMemo(() => {
        const createGroupStats = () => ({ sales: 0, revenue: 0, insRev: 0, patRev: 0, detailsMap: {} });
        const stats = {
            phaco: { vanglai: { basic: createGroupStats(), premium: createGroupStats() }, tuyen: { basic: createGroupStats(), premium: createGroupStats() } },
            mong: { vanglai: { basic: createGroupStats(), premium: createGroupStats() }, tuyen: { basic: createGroupStats(), premium: createGroupStats() } }
        };

        previewData.forEach(row => {
            const calc = row._calculated;
            if (!calc) return;

            const mainCategory = calc.isMong ? stats.mong : stats.phaco;
            const group = calc.isTuyen ? mainCategory.tuyen : mainCategory.vanglai;
            const type = calc.isPremium ? group.premium : group.basic;

            type.sales += calc.soLuong;
            type.revenue += calc.tongTien;
            type.insRev += calc.doanhThuBH;
            type.patRev += calc.doanhThuBN;
            
            const name = calc.packageName;
            type.detailsMap[name] = (type.detailsMap[name] || 0) + calc.soLuong;
        });

        const formatDetails = (groupStats) => {
            const arr = Object.keys(groupStats.detailsMap).map(key => ({ name: key, qty: groupStats.detailsMap[key] }));
            return { ...groupStats, details: arr.sort((a, b) => b.qty - a.qty) };
        };

        ['phaco', 'mong'].forEach(cat => {
            ['vanglai', 'tuyen'].forEach(route => {
                stats[cat][route].basic = formatDetails(stats[cat][route].basic);
                stats[cat][route].premium = formatDetails(stats[cat][route].premium);
            });
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
                const processed = jsonData.map(processRow).filter(item => item !== null);
                setPreviewData(processed);
                if (processed.length > 0) {
                    const firstRowKeys = Object.keys(processed[0]).filter(k => k !== '_calculated');
                    setTableHeaders(firstRowKeys);
                } else {
                    alert("Không tìm thấy dữ liệu hợp lệ!");
                    setPreviewData([]);
                }
            }
        };
        reader.readAsBinaryString(file);
    };

    const RenderSection = ({ title, icon: Icon, data, color, isMongSection = false }) => (
        <div className="mb-8 animate-fade-in-up">
            <div className="flex items-center gap-2 mb-3 border-b border-gray-800 pb-2">
                <Icon className={`text-${color}-400`} size={20}/>
                <h3 className="text-lg font-bold text-white uppercase tracking-wider">{title}</h3>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                <ProductCard 
                    title={isMongSection ? "Mộng Đơn (Thường)" : "Gói Cơ bản"} 
                    subtitle="Dữ liệu Test" 
                    count={data.basic.sales} 
                    val1={data.basic.insRev} 
                    val2={data.basic.patRev} 
                    color={color} 
                    formatCurrency={formatCurrency} 
                    badge={isMongSection ? "MỘNG ĐƠN" : "TIÊU CHUẨN"}
                    details={data.basic.details} 
                />
                <ProductCard 
                    title={isMongSection ? "Mộng Kép" : "Gói Cao cấp"} 
                    subtitle="Dữ liệu Test" 
                    count={data.premium.sales} 
                    val1={data.premium.insRev} 
                    val2={data.premium.patRev} 
                    color="purple" 
                    formatCurrency={formatCurrency} 
                    badge={isMongSection ? "MỘNG KÉP" : "CAO CẤP"}
                    details={data.premium.details}
                />
            </div>
        </div>
    );

    return (
        <div className="pb-10">
            <div className="bg-[#1C1E26] p-6 rounded-2xl border border-gray-800 mb-6">
                <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                    <FilterX className="text-purple-500"/> Test Nhập Liệu (Strict & Fix 55.01)
                </h2>
                <div className="flex items-start gap-2 bg-green-500/10 p-3 rounded-lg border border-green-500/20 text-xs text-green-200">
                    <Info size={16} className="mt-0.5 shrink-0"/>
                    <div>
                        <p className="font-bold mb-1">Cập nhật Logic v4:</p>
                        <ul className="list-disc pl-4 space-y-1">
                            <li>Fix lỗi Phaco 55.01 bị hiểu nhầm thành 55 đồng (Đã nâng hạn mức lên 100).</li>
                            <li>Dữ liệu "Vãng lai" chỉ nhận chữ "Vãng/Vang".</li>
                            <li>Dữ liệu "Tuyến" chỉ nhận chữ "Tuyến/Tuyen".</li>
                        </ul>
                    </div>
                </div>
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".xlsx, .xls" />
                <button onClick={() => fileInputRef.current.click()} className="mt-4 bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition"><Upload size={18} /> Chọn file Excel</button>
            </div>

            {previewData.length > 0 && (
                <>
                    <RenderSection title="1. Phaco - Vãng Lai" icon={Users} data={summary.phaco.vanglai} color="blue" />
                    <RenderSection title="2. Phaco - Tuyến" icon={ShieldCheck} data={summary.phaco.tuyen} color="green" />
                    <RenderSection title="3. Mộng - Vãng Lai" icon={Eye} data={summary.mong.vanglai} color="teal" isMongSection={true} />
                    <RenderSection title="4. Mộng - Tuyến" icon={Activity} data={summary.mong.tuyen} color="orange" isMongSection={true} />

                    <div className="bg-[#1C1E26] rounded-2xl border border-gray-800 overflow-hidden flex flex-col max-h-[80vh] mt-8">
                        <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-[#15171e]">
                            <h3 className="font-bold text-white">Kết quả đã lọc ({previewData.length} dòng)</h3>
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
                                                
                                                if (['GIÁ BH (AUTO)', 'DT BỆNH NHÂN (AUTO)', 'ĐƠN GIÁ (AUTO)'].includes(colKey)) {
                                                    let colorClass = 'text-gray-300';
                                                    if (colKey === 'GIÁ BH (AUTO)') colorClass = 'text-emerald-400 bg-emerald-500/5';
                                                    if (colKey === 'DT BỆNH NHÂN (AUTO)') colorClass = 'text-orange-400 bg-orange-500/5';
                                                    if (colKey === 'ĐƠN GIÁ (AUTO)') colorClass = 'text-blue-400 bg-blue-500/5';
                                                    return (<td key={colIndex} className={`px-4 py-2 font-bold border-r border-gray-800/50 text-right ${colorClass}`}>{formatCurrency(cellValue)}</td>);
                                                }
                                                
                                                if (colKey === 'LOẠI (AUTO)') {
                                                    const isMong = cellValue.includes('MỘNG');
                                                    return (<td key={colIndex} className={`px-4 py-2 font-bold border-r border-gray-800/50 ${isMong ? 'text-teal-400 bg-teal-500/10' : 'text-blue-400 bg-blue-500/10'}`}>{cellValue}</td>);
                                                }

                                                if (colKey === 'TUYẾN (AUTO)') {
                                                    return (<td key={colIndex} className={`px-4 py-2 font-bold border-r border-gray-800/50 ${cellValue === 'VÃNG LAI' ? 'text-purple-400 bg-purple-500/10' : 'text-green-400'}`}>{cellValue}</td>);
                                                }

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