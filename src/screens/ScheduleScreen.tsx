import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Calendar as CalendarIcon, Clock, MapPin, ChevronRight, Filter } from 'lucide-react';

interface ScheduleScreenProps {
  onBack: () => void;
}

export const ScheduleScreen: React.FC<ScheduleScreenProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'unit' | 'personal'>('unit');
  const [selectedDate, setSelectedDate] = useState('2026-04-02');

  const unitSchedules = [
    { id: '1', time: '05:30', title: 'Báo thức, thể dục sáng', location: 'Sân vận động', type: 'routine' },
    { id: '2', time: '07:30', title: 'Huấn luyện kỹ thuật chiến đấu bộ binh', location: 'Bãi tập số 1', type: 'training' },
    { id: '3', time: '13:30', title: 'Học tập chính trị: Nghị quyết Đại hội XIII', location: 'Hội trường', type: 'study' },
    { id: '4', time: '16:30', title: 'Thể thao, tăng gia sản xuất', location: 'Khu vực đơn vị', type: 'routine' },
  ];

  return (
    <div className="flex flex-col h-full bg-army-bg">
      {/* Header */}
      <div className="bg-white p-4 sticky top-0 z-10 zalo-shadow flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 text-army-gray hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft size={22} />
          </button>
          <h1 className="text-lg font-bold text-army-gray">Lịch công tác</h1>
        </div>
        <button className="p-2 text-army-green bg-army-green/10 rounded-xl">
          <Filter size={20} />
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white flex border-b border-gray-100">
        <button 
          onClick={() => setActiveTab('unit')} 
          className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-colors relative ${activeTab === 'unit' ? 'text-army-green' : 'text-gray-400'}`}
        >
          Lịch đơn vị
          {activeTab === 'unit' && <motion.div layoutId="activeTabSched" className="absolute bottom-0 left-0 right-0 h-0.5 bg-army-green" />}
        </button>
        <button 
          onClick={() => setActiveTab('personal')} 
          className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-colors relative ${activeTab === 'personal' ? 'text-army-green' : 'text-gray-400'}`}
        >
          Lịch cá nhân
          {activeTab === 'personal' && <motion.div layoutId="activeTabSched" className="absolute bottom-0 left-0 right-0 h-0.5 bg-army-green" />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Date Selector */}
        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
          {[
            { day: 'T2', date: '30', full: '2026-03-30' },
            { day: 'T3', date: '31', full: '2026-03-31' },
            { day: 'T4', date: '01', full: '2026-04-01' },
            { day: 'T5', date: '02', full: '2026-04-02' },
            { day: 'T6', date: '03', full: '2026-04-03' },
            { day: 'T7', date: '04', full: '2026-04-04' },
            { day: 'CN', date: '05', full: '2026-04-05' },
          ].map(d => (
            <button
              key={d.full}
              onClick={() => setSelectedDate(d.full)}
              className={`flex flex-col items-center gap-1 min-w-[50px] py-3 rounded-2xl transition-all ${
                selectedDate === d.full ? 'bg-army-green text-white shadow-lg scale-110' : 'bg-white text-gray-400'
              }`}
            >
              <span className="text-[10px] font-bold uppercase">{d.day}</span>
              <span className="text-sm font-black">{d.date}</span>
            </button>
          ))}
        </div>

        {/* Timeline */}
        <div className="space-y-4 relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-100 -z-10" />
          
          {unitSchedules.map((item, idx) => (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex gap-4"
            >
              <div className="w-8 h-8 bg-white border-2 border-army-green rounded-full flex items-center justify-center z-10 shadow-sm">
                <div className="w-2 h-2 bg-army-green rounded-full" />
              </div>
              
              <div className="flex-1 bg-white p-4 rounded-3xl shadow-sm border border-gray-50 active:scale-[0.98] transition-transform">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-army-green">
                    <Clock size={14} />
                    <span className="text-xs font-black">{item.time}</span>
                  </div>
                  <div className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                    item.type === 'training' ? 'bg-orange-50 text-orange-600' : 
                    item.type === 'study' ? 'bg-blue-50 text-blue-600' : 
                    'bg-gray-50 text-gray-500'
                  }`}>
                    {item.type === 'training' ? 'Huấn luyện' : item.type === 'study' ? 'Học tập' : 'Duy trì'}
                  </div>
                </div>
                
                <h4 className="text-sm font-bold text-army-gray leading-tight mb-2">{item.title}</h4>
                
                <div className="flex items-center gap-1.5 text-gray-400">
                  <MapPin size={12} />
                  <span className="text-[10px] font-medium">{item.location}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Add Personal Event FAB */}
        {activeTab === 'personal' && (
          <button className="fixed bottom-24 right-6 w-14 h-14 bg-army-green text-white rounded-full flex items-center justify-center shadow-xl active:scale-90 transition-transform z-20">
            <CalendarIcon size={24} />
          </button>
        )}
      </div>
    </div>
  );
};
