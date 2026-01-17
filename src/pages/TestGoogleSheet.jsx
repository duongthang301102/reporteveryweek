import React, { useState } from 'react';
import { DownloadCloud, FileJson, Table, AlertCircle, CheckCircle2, Search, ArrowLeftRight } from 'lucide-react';

const TestGoogleSheet = () => {
  const [url, setUrl] = useState('');
  const [rawData, setRawData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [forceSwap, setForceSwap] = useState(false); // Nút bật tắt chế độ đảo ngày

  const fixGoogleSheetUrl = (inputUrl) => {
    let cleanUrl = inputUrl.trim();
    if (cleanUrl.includes('docs.google.com/spreadsheets')) {
        if (cleanUrl.includes('/edit')) return cleanUrl.replace(/\/edit.*$/, '/export?format=csv');
        if (cleanUrl.includes('/pubhtml')) return cleanUrl.replace('/pubhtml', '/pub?output=csv');
    }
    return cleanUrl;
  };

  // [HÀM MỚI] Tự phân tích CSV thủ công (Không dùng thư viện xlsx)
  const parseCSVLine = (line) => {
      // Logic tách dấu phẩy nhưng bỏ qua dấu phẩy trong ngoặc kép "..."
      const result = [];
      let start = 0;
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
          if (line[i] === '"') inQuotes = !inQuotes;
          else if (line[i] === ',' && !inQuotes) {
              result.push(line.substring(start, i).replace(/^"|"$/g, '').trim());
              start = i + 1;
          }
      }
      result.push(line.substring(start).replace(/^"|"$/g, '').trim());
      return result;
  };

  const handleFetch = async () => {
    if (!url) return;
    setLoading(true);
    setError('');
    setRawData(null);

    const finalUrl = fixGoogleSheetUrl(url);

    try {
      const response = await fetch(finalUrl);
      if (!response.ok) throw new Error("Không thể tải file!");

      const csvText = await response.text();
      
      // 1. Tách dòng thủ công
      const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== '');
      const rows = lines.map(parseCSVLine);

      if (rows.length === 0) throw new Error("File rỗng!");

      // 2. Tìm dòng tiêu đề
      let headerIdx = -1;
      for (let i = 0; i < Math.min(rows.length, 15); i++) {
          const rowStr = rows[i].join(' ').toLowerCase();
          if (rowStr.includes('ngày') && (rowStr.includes('tên gói') || rowStr.includes('gói mổ'))) {
              headerIdx = i;
              break;
          }
      }

      if (headerIdx === -1) throw new Error("Không tìm thấy dòng tiêu đề chứa 'Ngày' và 'Tên gói mổ'.");

      const headers = rows[headerIdx].map(h => h.toLowerCase());
      const colDate = headers.findIndex(h => h.includes('ngày') || h.includes('date'));
      const colName = headers.findIndex(h => h.includes('tên gói') || h.includes('gói mổ'));
      const colTuyen = headers.findIndex(h => h.includes('thuộc tuyến') || h.includes('tuyến'));

      // 3. Trích xuất
      const extractedData = [];
      for(let i = headerIdx + 1; i < rows.length; i++) {
          const row = rows[i];
          let rawDate = row[colDate] || '';
          const name = row[colName] || '';
          
          if (!rawDate || !name || rawDate.includes('KẾ')) continue;

          // Xử lý đảo ngày nếu nút "Force Swap" được bật hoặc tự động nhận diện
          if (rawDate.includes('/')) {
              const parts = rawDate.split('/');
              if (parts.length === 3) {
                  // Nếu người dùng tick vào "Sửa lỗi ngày Mỹ" -> Luôn đảo
                  if (forceSwap) {
                       rawDate = `${parts[1].padStart(2,'0')}/${parts[0].padStart(2,'0')}/${parts[2]}`;
                  } else {
                       // Mặc định: Chuẩn hóa 2026 (bỏ 2 số đầu nếu có) -> 4 số
                       let y = parts[2];
                       if (y.length === 2) y = '20' + y;
                       rawDate = `${parts[0].padStart(2,'0')}/${parts[1].padStart(2,'0')}/${y}`;
                  }
              }
          }

          extractedData.push({
              'Ngày': rawDate,
              'Tên gói mổ': name,
              'Thuộc tuyến': colTuyen > -1 ? row[colTuyen] : '---'
          });
      }

      setRawData(extractedData);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-[#0F1115] min-h-screen text-white">
      <div className="max-w-6xl mx-auto space-y-6">
        
        <div className="border-b border-gray-800 pb-4">
          <h1 className="text-2xl font-bold text-green-400 flex items-center gap-2">
            <Search /> Test Lab: Chế độ thủ công (Manual Parser)
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Đọc trực tiếp văn bản CSV, không qua bộ lọc Excel nào.
          </p>
        </div>

        <div className="bg-[#1C1E26] p-6 rounded-xl border border-gray-800 shadow-lg space-y-4">
            <div className="flex gap-4">
                <input type="text" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Dán link Google Sheet CSV..." className="flex-1 bg-[#13151A] border border-gray-700 p-3 rounded-lg text-white font-mono text-sm" />
                <button onClick={handleFetch} disabled={loading || !url} className="bg-green-600 hover:bg-green-500 px-6 py-3 rounded-lg font-bold flex items-center gap-2 whitespace-nowrap">
                    {loading ? 'Đang lọc...' : <><DownloadCloud size={18}/> Kiểm tra</>}
                </button>
            </div>

            {/* NÚT SỬA LỖI NGÀY MỸ */}
            <div className="flex items-center gap-3 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                <button 
                    onClick={() => { setForceSwap(!forceSwap); if(rawData) handleFetch(); }} // Fetch lại ngay khi bấm
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${forceSwap ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300'}`}
                >
                    <ArrowLeftRight size={14} />
                    {forceSwap ? "Đang BẬT: Đảo Tháng/Ngày" : "Đang TẮT: Giữ nguyên"}
                </button>
                <p className="text-xs text-gray-400">
                    Bấm vào đây nếu bạn thấy ngày <b>02/01</b> bị hiển thị thành <b>01/02</b>.
                </p>
            </div>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-lg text-red-400 font-bold flex items-center gap-2"><AlertCircle size={20} /> {error}</div>}

        {rawData && (
          <div className="animate-fade-in-up space-y-2">
            <div className="flex justify-between items-end">
                <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2"><CheckCircle2 size={16}/> Kết quả ({rawData.length} dòng)</h3>
            </div>
            <div className="bg-[#13151A] rounded-xl border border-gray-800 h-[600px] overflow-auto custom-scrollbar">
              <table className="w-full text-left border-collapse text-sm">
                <thead className="bg-[#252830] text-white sticky top-0 z-10 shadow-lg">
                  <tr>
                    <th className="p-4 border-b border-gray-700 bg-[#252830] w-12 text-center">#</th>
                    <th className="p-4 border-b border-gray-700 bg-[#252830] border-l border-gray-600">Ngày</th>
                    <th className="p-4 border-b border-gray-700 bg-[#252830] border-l border-gray-600">Tên Gói Mổ</th>
                    <th className="p-4 border-b border-gray-700 bg-[#252830] border-l border-gray-600">Thuộc Tuyến</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {rawData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-white/5 transition-colors">
                      <td className="p-3 text-center text-gray-500">{idx + 1}</td>
                      <td className="p-3 text-emerald-400 font-bold font-mono whitespace-nowrap border-l border-gray-800/50">{row['Ngày']}</td>
                      <td className="p-3 text-white font-medium border-l border-gray-800/50">{row['Tên gói mổ']}</td>
                      <td className="p-3 text-blue-300 border-l border-gray-800/50">{row['Thuộc tuyến']}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestGoogleSheet;