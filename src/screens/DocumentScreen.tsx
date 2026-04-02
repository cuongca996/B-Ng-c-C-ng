import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Plus, Search, FileText, Download, ChevronRight, File, X, Upload, CheckCircle2, Loader2 } from 'lucide-react';
import { db } from '../firebase';
import { collection, onSnapshot, addDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { MilitaryDocument, User } from '../types';

interface DocumentScreenProps {
  onBack: () => void;
  currentUser: User;
}

export const DocumentScreen: React.FC<DocumentScreenProps> = ({ onBack, currentUser }) => {
  const [showUpload, setShowUpload] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('Tất cả');
  const [docs, setDocs] = useState<MilitaryDocument[]>([]);
  const [loading, setLoading] = useState(true);

  const [newDocData, setNewDocData] = useState({
    title: '',
    category: 'Văn bản',
    type: 'PDF'
  });

  useEffect(() => {
    const q = query(collection(db, 'documents'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setDocs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MilitaryDocument)));
      setLoading(false);
    }, (error) => {
      console.error('Firestore Documents Error:', error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocData.title.trim()) {
      console.error('Document title is required');
      return;
    }
    
    setIsUploading(true);
    console.log('Attempting to upload document:', newDocData);
    try {
      const docRef = await addDoc(collection(db, 'documents'), {
        title: newDocData.title.trim(),
        category: newDocData.category,
        type: newDocData.type,
        size: '1.2 MB', // Mock size for now
        date: new Date().toLocaleDateString('vi-VN'),
        uploaderId: currentUser.id,
        uploaderName: currentUser.name,
        createdAt: serverTimestamp()
      });
      console.log('Document uploaded successfully with ID:', docRef.id);
      setUploadSuccess(true);
      setTimeout(() => {
        setShowUpload(false);
        setUploadSuccess(false);
        setNewDocData({ title: '', category: 'Văn bản', type: 'PDF' });
      }, 2000);
    } catch (error) {
      console.error('Error uploading document to Firestore:', error);
      // Alert the user if possible or show error in UI
    } finally {
      setIsUploading(false);
    }
  };

  const filteredDocs = docs.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'Tất cả' || doc.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col h-full bg-army-bg relative">
      {/* Header */}
      <div className="bg-white p-4 sticky top-0 z-10 zalo-shadow flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 text-army-gray hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft size={22} />
          </button>
          <h1 className="text-lg font-bold text-army-gray">Thư viện Tài liệu</h1>
        </div>
        <button 
          onClick={() => setShowUpload(true)}
          className="p-2 text-army-green bg-army-green/10 rounded-xl"
        >
          <Plus size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text"
            placeholder="Tìm kiếm tài liệu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border-none rounded-2xl pl-10 pr-4 py-3 text-sm shadow-sm focus:ring-2 focus:ring-army-green outline-none"
          />
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {['Tất cả', 'Văn bản', 'Hướng dẫn', 'Kế hoạch', 'Biểu mẫu'].map(cat => (
            <button 
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-colors ${
                activeCategory === cat ? 'bg-army-green text-white' : 'bg-white text-gray-400 border border-gray-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Danh sách tài liệu</h3>
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <Loader2 className="animate-spin mb-2" size={24} />
              <p className="text-xs font-bold uppercase">Đang tải tài liệu...</p>
            </div>
          ) : filteredDocs.length > 0 ? (
            filteredDocs.map(doc => (
              <div key={doc.id} className="bg-white p-4 rounded-3xl flex items-center gap-4 shadow-sm active:scale-[0.98] transition-transform cursor-pointer">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  doc.type === 'PDF' ? 'bg-red-50 text-red-500' : 
                  doc.type === 'DOCX' ? 'bg-blue-50 text-blue-500' : 
                  'bg-green-50 text-green-500'
                }`}>
                  <File size={24} />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-army-gray leading-tight">{doc.title}</h4>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] font-black text-gray-400">{doc.type}</span>
                    <span className="text-[10px] text-gray-400 font-medium">{doc.size}</span>
                    <span className="text-[10px] text-gray-400 font-medium">{doc.date}</span>
                  </div>
                </div>
                <button className="p-2 text-army-green hover:bg-army-green/5 rounded-full transition-colors">
                  <Download size={20} />
                </button>
              </div>
            ))
          ) : (
            <div className="bg-white p-12 rounded-3xl text-center border border-dashed border-gray-200">
              <FileText className="mx-auto text-gray-200 mb-4" size={48} />
              <p className="text-sm font-bold text-gray-400">Không tìm thấy tài liệu nào</p>
            </div>
          )}
        </div>

        {/* Suggestion Section */}
        <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100">
          <h4 className="text-xs font-black text-blue-500 uppercase tracking-widest mb-2">Đề xuất tài liệu mới</h4>
          <p className="text-xs text-army-gray/70 leading-relaxed mb-4">
            Bạn có tài liệu quan trọng muốn chia sẻ với đơn vị? Hãy đăng tải ngay để mọi người cùng tham khảo.
          </p>
          <button 
            onClick={() => setShowUpload(true)}
            className="w-full bg-blue-500 text-white text-xs font-black py-3 rounded-xl shadow-md"
          >
            ĐĂNG TẢI TÀI LIỆU
          </button>
        </div>
      </div>

      {/* Upload Overlay */}
      <AnimatePresence>
        {showUpload && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/40 flex items-end"
          >
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="w-full bg-white rounded-t-[40px] p-8 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-black text-army-gray">ĐĂNG TẢI TÀI LIỆU</h2>
                <button onClick={() => setShowUpload(false)} className="p-2 text-gray-400"><X size={24} /></button>
              </div>

              {uploadSuccess ? (
                <div className="py-12 flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 size={48} />
                  </div>
                  <h3 className="text-lg font-bold text-army-gray mb-1">TẢI LÊN THÀNH CÔNG</h3>
                  <p className="text-xs text-gray-400">Tài liệu của bạn đã được lưu vào thư viện.</p>
                </div>
              ) : (
                <form onSubmit={handleUpload} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Tên tài liệu</label>
                    <input 
                      type="text" 
                      placeholder="Nhập tên tài liệu..."
                      value={newDocData.title}
                      onChange={(e) => setNewDocData({...newDocData, title: e.target.value})}
                      className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-army-green outline-none"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Loại tài liệu</label>
                      <select 
                        value={newDocData.category}
                        onChange={(e) => setNewDocData({...newDocData, category: e.target.value})}
                        className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-army-green outline-none"
                      >
                        <option>Văn bản</option>
                        <option>Hướng dẫn</option>
                        <option>Kế hoạch</option>
                        <option>Biểu mẫu</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Định dạng</label>
                      <select 
                        value={newDocData.type}
                        onChange={(e) => setNewDocData({...newDocData, type: e.target.value})}
                        className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-army-green outline-none"
                      >
                        <option>PDF</option>
                        <option>DOCX</option>
                        <option>XLSX</option>
                        <option>PPTX</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Chọn tệp tin</label>
                    <div className="w-full h-32 border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center gap-2 bg-gray-50">
                      <Upload className="text-army-green" size={32} />
                      <span className="text-xs text-gray-400 font-medium">Nhấp để chọn hoặc kéo thả tệp</span>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={isUploading || !newDocData.title.trim()}
                    className="w-full bg-army-green text-white font-black py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isUploading ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      <>
                        <Upload size={20} />
                        <span>TẢI LÊN NGAY</span>
                      </>
                    )}
                  </button>
                  {isUploading && (
                    <p className="text-[10px] text-army-green font-bold text-center animate-pulse uppercase">Đang xử lý dữ liệu...</p>
                  )}
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
