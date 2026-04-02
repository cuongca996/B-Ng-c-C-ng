import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Users, Building2, User as UserIcon, Phone, MessageSquare, ChevronRight, BarChart3, Network } from 'lucide-react';
import { Unit, Contact } from '../types';

interface UnitDetailScreenProps {
  unit: Unit;
  onBack: () => void;
  onSelectMember: (member: Contact) => void;
}

// Mock members for the unit
const MOCK_MEMBERS: Contact[] = [
  {
    id: 'm1',
    name: 'Hoàng Văn Thái',
    rank: 'Đại úy',
    unit: 'Đại đội 1',
    role: 'Đại đội trưởng',
    avatarInitials: 'VT',
    isFriend: true,
    status: 'online'
  },
  {
    id: 'm2',
    name: 'Nguyễn Chí Thanh',
    rank: 'Thượng úy',
    unit: 'Đại đội 1',
    role: 'Chính trị viên',
    avatarInitials: 'CT',
    isFriend: true,
    status: 'busy'
  },
  {
    id: 'm3',
    name: 'Võ Nguyên Giáp',
    rank: 'Trung úy',
    unit: 'Đại đội 1',
    role: 'Trung đội trưởng',
    avatarInitials: 'NG',
    isFriend: false,
    status: 'offline'
  }
];

export const UnitDetailScreen: React.FC<UnitDetailScreenProps> = ({ unit, onBack, onSelectMember }) => {
  const [activeTab, setActiveTab] = useState<'info' | 'hierarchy' | 'stats'>('info');

  return (
    <div className="flex flex-col h-full bg-army-bg">
      {/* Header */}
      <div className="bg-white p-4 sticky top-0 z-10 zalo-shadow flex items-center gap-4">
        <button onClick={onBack} className="p-2 text-army-gray hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-lg font-bold text-army-gray">Chi tiết đơn vị</h1>
      </div>

      {/* Tabs */}
      <div className="bg-white flex border-b border-gray-100">
        <button 
          onClick={() => setActiveTab('info')} 
          className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-colors relative ${activeTab === 'info' ? 'text-army-green' : 'text-gray-400'}`}
        >
          Thông tin
          {activeTab === 'info' && <motion.div layoutId="activeTabUnit" className="absolute bottom-0 left-0 right-0 h-0.5 bg-army-green" />}
        </button>
        <button 
          onClick={() => setActiveTab('hierarchy')} 
          className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-colors relative ${activeTab === 'hierarchy' ? 'text-army-green' : 'text-gray-400'}`}
        >
          Sơ đồ
          {activeTab === 'hierarchy' && <motion.div layoutId="activeTabUnit" className="absolute bottom-0 left-0 right-0 h-0.5 bg-army-green" />}
        </button>
        <button 
          onClick={() => setActiveTab('stats')} 
          className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-colors relative ${activeTab === 'stats' ? 'text-army-green' : 'text-gray-400'}`}
        >
          Thống kê
          {activeTab === 'stats' && <motion.div layoutId="activeTabUnit" className="absolute bottom-0 left-0 right-0 h-0.5 bg-army-green" />}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <AnimatePresence mode="wait">
          {activeTab === 'info' && (
            <motion.div 
              key="info"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Unit Info Card */}
              <div className="bg-white rounded-3xl p-6 shadow-sm flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-army-green/10 rounded-full flex items-center justify-center mb-4">
                  <Building2 size={40} className="text-army-green" />
                </div>
                <h2 className="text-xl font-black text-army-gray mb-1">{unit.name}</h2>
                <p className="text-xs font-bold text-army-green uppercase tracking-widest mb-4">Cấp bậc: {unit.level === 1 ? 'Tiểu đoàn' : unit.level === 2 ? 'Đại đội' : 'Trung đội'}</p>
                
                <div className="grid grid-cols-2 gap-4 w-full pt-4 border-t border-gray-50">
                  <div className="flex flex-col items-center">
                    <span className="text-lg font-black text-army-gray">{unit.membersCount}</span>
                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Quân số</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-lg font-black text-army-gray">{unit.children?.length || 0}</span>
                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Đơn vị trực thuộc</span>
                  </div>
                </div>
              </div>

              {/* Members List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Danh sách quân nhân ({MOCK_MEMBERS.length})</h3>
                  <button className="text-[10px] font-black text-army-green uppercase tracking-widest">Xem tất cả</button>
                </div>

                <div className="bg-white rounded-3xl p-2 shadow-sm">
                  {MOCK_MEMBERS.map(member => (
                    <div 
                      key={member.id}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-2xl cursor-pointer transition-colors"
                      onClick={() => onSelectMember(member)}
                    >
                      <div className="relative">
                        <div className="w-12 h-12 bg-army-green/10 rounded-full flex items-center justify-center">
                          <span className="text-lg font-black text-army-green">{member.avatarInitials}</span>
                        </div>
                        {member.status === 'online' && (
                          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-army-gray">{member.rank} {member.name}</h4>
                        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{member.role}</p>
                      </div>
                      <div className="flex gap-1">
                        <button className="p-2 text-gray-400 hover:text-army-green transition-colors">
                          <Phone size={18} />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-army-green transition-colors">
                          <MessageSquare size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'hierarchy' && (
            <motion.div 
              key="hierarchy"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6 py-4"
            >
              <div className="flex flex-col items-center">
                <div className="bg-army-green text-white p-4 rounded-2xl shadow-lg text-center min-w-[150px]">
                  <p className="text-[10px] font-black opacity-70 uppercase">Đơn vị hiện tại</p>
                  <p className="text-sm font-bold">{unit.name}</p>
                </div>
                
                <div className="w-0.5 h-8 bg-army-green/20 my-2" />
                
                <div className="grid grid-cols-2 gap-8 w-full">
                  <div className="flex flex-col items-center">
                    <div className="w-full h-0.5 bg-army-green/20 mb-4" />
                    <div className="bg-white p-3 rounded-xl shadow-sm border border-army-green/10 text-center w-full">
                      <p className="text-[9px] font-black text-army-green uppercase">Chỉ huy</p>
                      <p className="text-xs font-bold text-army-gray">Đ/c Thái</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-full h-0.5 bg-army-green/20 mb-4" />
                    <div className="bg-white p-3 rounded-xl shadow-sm border border-army-green/10 text-center w-full">
                      <p className="text-[9px] font-black text-army-green uppercase">Chính trị</p>
                      <p className="text-xs font-bold text-army-gray">Đ/c Thanh</p>
                    </div>
                  </div>
                </div>

                <div className="w-0.5 h-8 bg-army-green/20 my-2" />

                <div className="space-y-4 w-full">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Các phân đội trực thuộc</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {unit.children?.map((child, idx) => (
                      <div key={idx} className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-center">
                        <p className="text-[10px] font-bold text-army-gray">{child.name}</p>
                        <p className="text-[8px] text-gray-400 font-black uppercase mt-1">{child.membersCount} QS</p>
                      </div>
                    )) || (
                      <div className="col-span-3 py-8 text-center text-xs text-gray-400 italic">Không có đơn vị trực thuộc</div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'stats' && (
            <motion.div 
              key="stats"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6 py-4"
            >
              <div className="bg-white p-6 rounded-3xl shadow-sm space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <h4 className="text-xs font-bold text-army-gray uppercase tracking-widest">Tỷ lệ quân số khỏe</h4>
                    <span className="text-sm font-black text-army-green">98.5%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-army-green w-[98.5%]" />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <h4 className="text-xs font-bold text-army-gray uppercase tracking-widest">Hoàn thành nhiệm vụ</h4>
                    <span className="text-sm font-black text-blue-500">92.0%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 w-[92%]" />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <h4 className="text-xs font-bold text-army-gray uppercase tracking-widest">Kỷ luật đơn vị</h4>
                    <span className="text-sm font-black text-orange-500">Tốt</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-500 w-[100%]" />
                  </div>
                </div>
              </div>

              <div className="bg-army-green/5 p-6 rounded-3xl border border-army-green/10 text-center">
                <BarChart3 className="text-army-green mx-auto mb-2" size={32} />
                <h4 className="text-xs font-black text-army-green uppercase tracking-widest mb-1">Đánh giá thi đua</h4>
                <p className="text-[10px] text-army-gray/70">Đơn vị dẫn đầu phong trào thi đua quyết thắng quý I/2026</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
