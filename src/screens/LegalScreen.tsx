import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Search, Scale, ChevronRight, BookOpen, ShieldCheck, Gavel } from 'lucide-react';

interface LegalScreenProps {
  onBack: () => void;
}

export const LegalScreen: React.FC<LegalScreenProps> = ({ onBack }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Tất cả');

  const categories = ['Tất cả', 'Điều lệnh', 'Kỷ luật', 'Hình sự', 'Dân sự'];

  const legalDocs = [
    { id: '1', title: 'Điều lệnh Quản lý bộ đội Quân đội nhân dân Việt Nam', category: 'Điều lệnh', year: '2024', icon: <BookOpen size={20} /> },
    { id: '2', title: 'Luật Nghĩa vụ quân sự 2015 (Sửa đổi 2024)', category: 'Điều lệnh', year: '2024', icon: <Gavel size={20} /> },
    { id: '3', title: 'Quy định về xử lý kỷ luật trong Quân đội', category: 'Kỷ luật', year: '2023', icon: <ShieldCheck size={20} /> },
    { id: '4', title: 'Bộ luật Hình sự (Chương các tội xâm phạm nghĩa vụ quân sự)', category: 'Hình sự', year: '2017', icon: <Scale size={20} /> },
    { id: '5', title: 'Thông tư hướng dẫn về chế độ chính sách quân nhân', category: 'Dân sự', year: '2025', icon: <BookOpen size={20} /> },
  ];

  const filteredDocs = legalDocs.filter(doc => 
    (activeCategory === 'Tất cả' || doc.category === activeCategory) &&
    doc.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-army-bg">
      {/* Header */}
      <div className="bg-white p-4 sticky top-0 z-10 zalo-shadow flex items-center gap-4">
        <button onClick={onBack} className="p-2 text-army-gray hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-lg font-bold text-army-gray">Thư viện Pháp luật</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm văn bản pháp luật..."
            className="w-full bg-white border-none rounded-2xl pl-12 pr-4 py-4 text-sm shadow-sm focus:ring-2 focus:ring-army-green outline-none"
          />
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-all ${
                activeCategory === cat ? 'bg-army-green text-white shadow-md' : 'bg-white text-gray-400 border border-gray-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Legal List */}
        <div className="space-y-3">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Văn bản hiện hành</h3>
          {filteredDocs.length > 0 ? (
            filteredDocs.map(doc => (
              <motion.div 
                key={doc.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-4 rounded-3xl flex items-center gap-4 shadow-sm active:scale-[0.98] transition-transform cursor-pointer"
              >
                <div className="w-12 h-12 bg-army-green/5 text-army-green rounded-2xl flex items-center justify-center">
                  {doc.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-army-gray leading-tight mb-1">{doc.title}</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black text-army-green bg-army-green/10 px-2 py-0.5 rounded uppercase">{doc.category}</span>
                    <span className="text-[10px] text-gray-400 font-medium">Năm {doc.year}</span>
                  </div>
                </div>
                <ChevronRight size={18} className="text-gray-300" />
              </motion.div>
            ))
          ) : (
            <div className="py-12 text-center">
              <p className="text-sm text-gray-400">Không tìm thấy văn bản phù hợp</p>
            </div>
          )}
        </div>

        {/* Legal Tip */}
        <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100">
          <div className="flex items-center gap-2 mb-2">
            <Scale size={18} className="text-amber-600" />
            <h4 className="text-xs font-black text-amber-600 uppercase tracking-widest">Góc tìm hiểu pháp luật</h4>
          </div>
          <p className="text-xs text-army-gray/70 leading-relaxed">
            "Quân nhân phải gương mẫu chấp hành pháp luật của Nhà nước, kỷ luật của Quân đội, phục tùng sự lãnh đạo của Đảng, sự quản lý của Nhà nước."
          </p>
        </div>
      </div>
    </div>
  );
};
