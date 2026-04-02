import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Share2, Filter, TrendingUp, ChevronDown, Target, CheckSquare, Sparkles, ShieldCheck } from 'lucide-react';
import { RankingItem, UnitLevel, UnitType } from '../types';

type RankingCategory = 'total' | 'combat' | 'inspection' | 'hygiene' | 'tasks';

export const LeaderboardScreen: React.FC = () => {
  const [category, setCategory] = useState<RankingCategory>('total');
  const [period, setPeriod] = useState('Tuần này');
  const [selectedLevel, setSelectedLevel] = useState<UnitLevel>(UnitLevel.COMPANY);
  const [selectedType, setSelectedType] = useState<UnitType | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);

  const rankings: RankingItem[] = [
    { rank: 1, name: 'Đại đội 1', unit: 'Tiểu đoàn 1', score: 985, avatar: 'C1', trend: 'up', level: UnitLevel.COMPANY, type: UnitType.REGULAR },
    { rank: 2, name: 'Đại đội 3', unit: 'Tiểu đoàn 1', score: 972, avatar: 'C3', trend: 'stable', level: UnitLevel.COMPANY, type: UnitType.REGULAR },
    { rank: 3, name: 'Đại đội 2', unit: 'Tiểu đoàn 1', score: 945, avatar: 'C2', trend: 'down', level: UnitLevel.COMPANY, type: UnitType.REGULAR },
    { rank: 4, name: 'Đại đội Cối', unit: 'Trực thuộc TĐ', score: 930, avatar: 'CC', trend: 'up', level: UnitLevel.COMPANY, type: UnitType.DIRECT },
    { rank: 5, name: 'Ban Tham mưu', unit: 'Khối Cơ quan', score: 925, avatar: 'TM', trend: 'stable', level: UnitLevel.COMPANY, type: UnitType.OFFICE },
    { rank: 6, name: 'Ban Chính trị', unit: 'Khối Cơ quan', score: 910, avatar: 'CT', trend: 'up', level: UnitLevel.COMPANY, type: UnitType.OFFICE },
    { rank: 7, name: 'Đại đội 4', unit: 'Tiểu đoàn 2', score: 895, avatar: 'C4', trend: 'down', level: UnitLevel.COMPANY, type: UnitType.REGULAR },
    { rank: 8, name: 'Đại đội 5', unit: 'Tiểu đoàn 2', score: 880, avatar: 'C5', trend: 'stable', level: UnitLevel.COMPANY, type: UnitType.REGULAR },
  ];

  const categories = [
    { id: 'total', label: 'Tổng hợp', icon: <Sparkles size={14} /> },
    { id: 'combat', label: 'Đấu tranh', icon: <Target size={14} /> },
    { id: 'inspection', label: 'Kiểm tra', icon: <ShieldCheck size={14} /> },
    { id: 'hygiene', label: 'Nội vụ', icon: <CheckSquare size={14} /> },
    { id: 'tasks', label: 'Nhiệm vụ', icon: <TrendingUp size={14} /> },
  ];

  const levels = [
    { id: UnitLevel.SQUAD, label: 'Tiểu đội' },
    { id: UnitLevel.PLATOON, label: 'Trung đội' },
    { id: UnitLevel.COMPANY, label: 'Đại đội' },
    { id: UnitLevel.BATTALION, label: 'Tiểu đoàn' },
    { id: UnitLevel.REGIMENT, label: 'Trung đoàn' },
  ];

  const top3 = [rankings[1], rankings[0], rankings[2]];

  return (
    <div className="flex flex-col h-full bg-army-bg relative overflow-hidden">
      {/* Header */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-100 zalo-shadow shrink-0 z-20">
        <h1 className="text-lg font-black text-army-gray uppercase tracking-tight">Bảng xếp hạng thi đua</h1>
        <button className="p-2 text-army-gray hover:bg-gray-50 rounded-full transition-colors"><Share2 size={20} /></button>
      </div>

      {/* Category Selector */}
      <div className="bg-white border-b border-gray-100 shrink-0 z-10">
        <div className="flex overflow-x-auto no-scrollbar px-2 py-2 gap-2">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id as RankingCategory)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                category === cat.id 
                  ? 'bg-army-green text-white shadow-lg shadow-army-green/20 scale-105' 
                  : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
              }`}
            >
              {cat.icon}
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white px-4 py-2 flex items-center justify-between border-b border-gray-100 shrink-0 z-10">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1.5 bg-gray-100 text-army-gray px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider"
          >
            <Filter size={12} /> {levels.find(l => l.id === selectedLevel)?.label}
          </button>
          <div className="h-4 w-[1px] bg-gray-200" />
          {['Tuần này', 'Tháng này', 'Quý này'].map(p => (
            <button 
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors whitespace-nowrap ${
                period === p ? 'text-army-green' : 'text-gray-400'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Dropdown */}
      <AnimatePresence>
        {showFilters && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-white border-b border-gray-100 overflow-hidden shrink-0 z-10"
          >
            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Cấp bậc so sánh</p>
                <div className="grid grid-cols-3 gap-2">
                  {levels.map(l => (
                    <button
                      key={l.id}
                      onClick={() => {
                        setSelectedLevel(l.id);
                        setShowFilters(false);
                      }}
                      className={`py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border-2 transition-all ${
                        selectedLevel === l.id ? 'border-army-green bg-army-green/5 text-army-green' : 'border-gray-100 text-gray-400'
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Khối đơn vị</p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'all', label: 'Tất cả' },
                    { id: UnitType.REGULAR, label: 'Đơn vị' },
                    { id: UnitType.OFFICE, label: 'Cơ quan' },
                    { id: UnitType.DIRECT, label: 'Trực thuộc' },
                  ].map(t => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setSelectedType(t.id as any);
                        setShowFilters(false);
                      }}
                      className={`py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border-2 transition-all ${
                        selectedType === t.id ? 'border-army-green bg-army-green/5 text-army-green' : 'border-gray-100 text-gray-400'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-y-auto pb-32 scroll-smooth">
        {/* Podium */}
        <div className="bg-gradient-to-b from-white to-gray-50 p-6 flex items-end justify-center gap-4 border-b border-gray-100">
          {top3.map((item, idx) => {
            const isFirst = idx === 1;
            const isSecond = idx === 0;
            return (
              <div key={idx} className={`flex flex-col items-center ${isFirst ? 'mb-6' : ''}`}>
                <div className="relative">
                  <div className={`rounded-3xl flex items-center justify-center font-black army-shadow border-4 transition-transform hover:scale-105 ${
                    isFirst ? 'w-24 h-24 bg-amber-50 border-amber-400 text-amber-600 text-3xl' : 
                    isSecond ? 'w-20 h-20 bg-slate-50 border-slate-300 text-slate-500 text-2xl' : 
                    'w-20 h-20 bg-orange-50 border-orange-300 text-orange-600 text-2xl'
                  }`}>
                    {item.avatar}
                  </div>
                  <div className={`absolute -bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-black text-white shadow-lg ${
                    isFirst ? 'bg-amber-400' : isSecond ? 'bg-slate-400' : 'bg-orange-400'
                  }`}>
                    #{isFirst ? 1 : isSecond ? 2 : 3}
                  </div>
                </div>
                <div className="mt-6 text-center">
                  <p className="text-lg font-black text-army-gray leading-tight">{item.score.toLocaleString()}</p>
                  <p className="text-[11px] font-black text-army-gray truncate w-24 mt-1">{item.name}</p>
                  <p className="text-[9px] text-gray-400 font-black uppercase tracking-tighter">{item.unit}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* List */}
        <div className="p-4 space-y-3">
          {rankings.slice(3).map(item => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              key={item.rank} 
              className="bg-white p-4 rounded-[24px] flex items-center gap-4 army-shadow border border-gray-50"
            >
              <div className="w-8 text-center">
                <span className="text-xs font-black text-gray-300">#{item.rank}</span>
              </div>
              <div className="w-12 h-12 bg-army-green/5 rounded-2xl flex items-center justify-center text-army-green font-black text-sm border border-army-green/10">
                {item.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-black text-army-gray truncate">{item.name}</h4>
                  {item.type === UnitType.OFFICE && (
                    <span className="px-1.5 py-0.5 bg-blue-50 text-blue-500 text-[7px] font-black uppercase rounded-md">Cơ quan</span>
                  )}
                  {item.type === UnitType.DIRECT && (
                    <span className="px-1.5 py-0.5 bg-purple-50 text-purple-500 text-[7px] font-black uppercase rounded-md">Trực thuộc</span>
                  )}
                </div>
                <p className="text-[9px] text-gray-400 font-black uppercase tracking-wider">{item.unit}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-black text-army-green">{item.score.toLocaleString()}</p>
                <div className={`flex items-center justify-end gap-0.5 ${
                  item.trend === 'up' ? 'text-green-500' : item.trend === 'down' ? 'text-red-500' : 'text-gray-300'
                }`}>
                  {item.trend === 'up' ? <TrendingUp size={10} /> : item.trend === 'down' ? <TrendingUp size={10} className="rotate-180" /> : <div className="w-2 h-0.5 bg-gray-200 rounded-full" />}
                  <span className="text-[8px] font-black uppercase">{item.trend === 'up' ? 'Tăng' : item.trend === 'down' ? 'Giảm' : 'Ổn định'}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer - Your Unit Rank */}
      <div className="absolute bottom-4 left-4 right-4 bg-white p-4 rounded-[28px] zalo-shadow flex items-center gap-4 border-2 border-army-green/20 z-30">
        <div className="w-12 h-12 bg-army-green rounded-2xl flex items-center justify-center text-white font-black text-sm shadow-lg shadow-army-green/20">
          C1
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-black text-army-gray uppercase tracking-tight">Đại đội 1 (Của bạn)</h4>
          <div className="flex items-center gap-1.5 text-green-500">
            <TrendingUp size={12} />
            <span className="text-[10px] font-black uppercase tracking-wider">Hạng 1 toàn tiểu đoàn</span>
          </div>
        </div>
        <div className="bg-army-green/10 text-army-green px-4 py-2 rounded-2xl font-black text-sm">
          985
        </div>
      </div>
    </div>
  );
};
