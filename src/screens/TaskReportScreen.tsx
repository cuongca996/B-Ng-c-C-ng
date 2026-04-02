import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Camera, Image as ImageIcon, Paperclip, Send, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react';
import { Task } from '../types';

interface TaskReportScreenProps {
  task: Task;
  onBack: () => void;
  onReport: (report: any) => void;
}

export const TaskReportScreen: React.FC<TaskReportScreenProps> = ({ task, onBack, onReport }) => {
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddImage = () => {
    // Simulate adding an image
    const newImage = `https://picsum.photos/seed/${Date.now()}/400/300`;
    setImages([...images, newImage]);
  };

  const handleRemoveImage = (idx: number) => {
    setImages(images.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    // Simulate submission
    setTimeout(() => {
      onReport({ content, images, timestamp: new Date().toISOString() });
      setIsSubmitting(false);
      onBack();
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full bg-army-bg">
      {/* Header */}
      <div className="bg-white p-4 sticky top-0 z-10 zalo-shadow flex items-center gap-4">
        <button onClick={onBack} className="p-2 text-army-gray hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-lg font-bold text-army-gray">Báo cáo kết quả</h1>
      </div>

      {/* Content */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Task Summary */}
        <div className="bg-white/50 p-4 rounded-2xl border border-gray-100">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Nhiệm vụ</p>
          <h3 className="text-sm font-bold text-army-gray">{task.title}</h3>
        </div>

        {/* Report Content */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Nội dung báo cáo</label>
          <textarea 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Mô tả chi tiết kết quả thực hiện nhiệm vụ..."
            className="w-full bg-white border-none rounded-3xl p-4 text-sm min-h-[150px] shadow-sm focus:ring-2 focus:ring-army-green outline-none resize-none"
            required
          />
        </div>

        {/* Evidence Images */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Hình ảnh minh chứng ({images.length}/5)</label>
            <button 
              type="button"
              onClick={handleAddImage}
              disabled={images.length >= 5}
              className="text-army-green text-[10px] font-black uppercase tracking-widest flex items-center gap-1 disabled:text-gray-300"
            >
              <Camera size={14} /> Thêm ảnh
            </button>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {images.map((img, idx) => (
              <div key={idx} className="relative shrink-0">
                <img 
                  src={img} 
                  alt="Evidence" 
                  className="w-24 h-24 object-cover rounded-2xl border border-gray-100"
                  referrerPolicy="no-referrer"
                />
                <button 
                  type="button"
                  onClick={() => handleRemoveImage(idx)}
                  className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center border-2 border-white shadow-sm"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
            {images.length === 0 && (
              <button 
                type="button"
                onClick={handleAddImage}
                className="w-24 h-24 bg-white border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-gray-400 gap-1 hover:border-army-green hover:text-army-green transition-colors"
              >
                <ImageIcon size={24} />
                <span className="text-[9px] font-bold uppercase">Tải lên</span>
              </button>
            )}
          </div>
        </div>

        {/* Attachments */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Tệp đính kèm (PDF, DOCX)</label>
          <button 
            type="button"
            className="w-full bg-white p-4 rounded-2xl flex items-center justify-center gap-2 text-gray-400 border-2 border-dashed border-gray-200 hover:border-army-green hover:text-army-green transition-colors"
          >
            <Paperclip size={20} />
            <span className="text-xs font-bold uppercase tracking-wider">Chọn tệp tài liệu</span>
          </button>
        </div>
      </form>

      {/* Footer Action */}
      <div className="p-4 bg-white border-t border-gray-100">
        <button 
          onClick={handleSubmit}
          disabled={isSubmitting || !content.trim()}
          className="w-full bg-army-green text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform disabled:opacity-70"
        >
          {isSubmitting ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Send size={20} />
              GỬI BÁO CÁO
            </>
          )}
        </button>
      </div>
    </div>
  );
};
