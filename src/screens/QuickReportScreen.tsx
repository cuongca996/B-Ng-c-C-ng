import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Send, Camera, MapPin, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface QuickReportScreenProps {
  onBack: () => void;
}

export const QuickReportScreen: React.FC<QuickReportScreenProps> = ({ onBack }) => {
  const [type, setType] = useState('incident');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(onBack, 2000);
    }, 1500);
  };

  if (isSuccess) {
    return (
      <div className="h-full bg-white flex flex-col items-center justify-center p-8 text-center">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6"
        >
          <CheckCircle2 size={48} />
        </motion.div>
        <h2 className="text-xl font-black text-army-gray mb-2">BÁO CÁO THÀNH CÔNG</h2>
        <p className="text-sm text-gray-500">Thông tin đã được gửi đến chỉ huy đơn vị xử lý.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-army-bg">
      {/* Header */}
      <div className="bg-white p-4 sticky top-0 z-10 zalo-shadow flex items-center gap-4">
        <button onClick={onBack} className="p-2 text-army-gray hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-lg font-bold text-army-gray">Báo cáo nhanh</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Report Type */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Loại báo cáo</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'incident', label: 'Sự cố/Vấn đề', icon: <AlertTriangle size={18} />, color: 'text-red-500 bg-red-50' },
                { id: 'status', label: 'Tình hình đơn vị', icon: <CheckCircle2 size={18} />, color: 'text-blue-500 bg-blue-50' },
              ].map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setType(item.id)}
                  className={`p-4 rounded-2xl flex flex-col items-center gap-2 border-2 transition-all ${
                    type === item.id ? 'border-army-green bg-white shadow-md' : 'border-transparent bg-white/50'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.color}`}>
                    {item.icon}
                  </div>
                  <span className="text-[10px] font-bold text-army-gray">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nội dung báo cáo</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Nhập chi tiết nội dung cần báo cáo..."
              className="w-full bg-white border-none rounded-2xl p-4 text-sm shadow-sm focus:ring-2 focus:ring-army-green outline-none min-h-[150px] resize-none"
              required
            />
          </div>

          {/* Attachments */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Hình ảnh/Vị trí</label>
            <div className="flex gap-3">
              <button type="button" className="flex-1 bg-white p-4 rounded-2xl flex items-center justify-center gap-2 text-army-gray shadow-sm border border-dashed border-gray-200">
                <Camera size={20} className="text-army-green" />
                <span className="text-xs font-bold">Chụp ảnh</span>
              </button>
              <button type="button" className="flex-1 bg-white p-4 rounded-2xl flex items-center justify-center gap-2 text-army-gray shadow-sm border border-dashed border-gray-200">
                <MapPin size={20} className="text-blue-500" />
                <span className="text-xs font-bold">Vị trí</span>
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting || !content}
            className="w-full bg-army-green text-white font-black py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 transition-all active:scale-95"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Send size={20} />
                <span>GỬI BÁO CÁO</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
