import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Plus, Clock, ChevronRight, BellRing, MessageSquare, Phone, Megaphone, ClipboardList, ShieldAlert, Shield } from 'lucide-react';
import { Task, TaskStatus, NotificationType } from '../types';
import { auth } from '../firebase';

interface TaskScreenProps {
  tasks: Task[];
  onSelectTask: (task: Task) => void;
  onCreateTask: () => void;
  onNudgeAll?: () => void;
  isAdmin?: boolean;
}

export const TaskScreen: React.FC<TaskScreenProps> = ({ tasks, onSelectTask, onCreateTask, onNudgeAll, isAdmin }) => {
  const [activeTab, setActiveTab] = useState<TaskStatus>(TaskStatus.IN_PROGRESS);
  const [searchQuery, setSearchQuery] = useState('');

  const getTaskIcon = (task: Task) => {
    const title = task.title || '';
    if (title.startsWith('[ĐT]')) return <ShieldAlert size={14} className="text-red-500" />;
    if (title.startsWith('[QS]')) return <Shield size={14} className="text-army-green" />;
    if (title.startsWith('[CT]')) return <MessageSquare size={14} className="text-blue-500" />;
    if (title.startsWith('[HK]')) return <ClipboardList size={14} className="text-orange-500" />;

    switch (task.type) {
      case NotificationType.MESSAGE: return <MessageSquare size={14} className="text-blue-500" />;
      case NotificationType.CALL: return <Phone size={14} className="text-green-500" />;
      case NotificationType.ANNOUNCEMENT: return <Megaphone size={14} className="text-orange-500" />;
      case NotificationType.TASK_REGULAR: return <ClipboardList size={14} className="text-army-green" />;
      case NotificationType.TASK_COMBAT: return <ShieldAlert size={14} className="text-red-500" />;
      default: return <ClipboardList size={14} className="text-gray-400" />;
    }
  };

  const tabs = [
    { id: TaskStatus.IN_PROGRESS, label: '🟢 Đang làm' },
    { id: TaskStatus.PENDING, label: '🟡 Chờ' },
    { id: TaskStatus.OVERDUE, label: '🔴 Quá hạn' },
    { id: TaskStatus.REPORTED, label: '⚪ Đã báo' },
  ];

  const filteredTasks = tasks.filter(t => {
    const matchesTab = t.status === activeTab;
    const matchesSearch = (t.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                         (t.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="flex flex-col h-full bg-army-bg">
      {/* Header */}
      <div className="bg-white p-4 sticky top-0 z-10 zalo-shadow">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-bold text-army-gray">Nhiệm vụ</h1>
          <div className="flex items-center gap-1">
            <button className="p-2 text-army-gray hover:bg-gray-100 rounded-full transition-colors"><Search size={22} /></button>
            <button className="p-2 text-army-gray hover:bg-gray-100 rounded-full transition-colors"><Plus size={24} /></button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text"
            placeholder="Tìm kiếm nhiệm vụ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-100 border-none rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-army-green outline-none"
          />
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-100 p-1 rounded-xl">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all relative ${
                activeTab === tab.id ? 'bg-white text-army-green shadow-sm' : 'text-gray-500'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isAdmin && filteredTasks.length > 0 && activeTab !== TaskStatus.COMPLETED && (
          <button 
            onClick={onNudgeAll}
            className="w-full bg-red-50 border border-red-100 p-3 rounded-2xl flex items-center justify-center gap-2 text-red-500 text-[10px] font-black uppercase tracking-widest active:scale-95 transition-transform mb-2"
          >
            <BellRing size={14} />
            GIỤC TẤT CẢ ĐỒNG CHÍ CHƯA XONG
          </button>
        )}

        {filteredTasks.length > 0 ? (
          filteredTasks.map(task => (
            <div 
              key={task.id} 
              onClick={() => onSelectTask(task)}
              className="bg-white rounded-2xl overflow-hidden flex shadow-sm active:scale-[0.98] transition-transform cursor-pointer relative"
            >
              <div className={`w-1.5 ${
                task.priority === 'urgent' ? 'bg-red-600' :
                task.status === TaskStatus.OVERDUE ? 'bg-red-500' : 
                task.status === TaskStatus.IN_PROGRESS ? 'bg-army-green' : 
                'bg-orange-500'
              }`} />
              <div className="flex-1 p-4">
                <div className="flex justify-between items-start mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gray-50 rounded-lg flex items-center justify-center">
                      {getTaskIcon(task)}
                    </div>
                    <h3 className="font-bold text-army-gray text-sm">{task.title}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    {task.priority === 'urgent' && (
                      <div className="bg-red-600 text-white text-[7px] font-black px-1.5 py-0.5 rounded-full animate-pulse">
                        KHẨN
                      </div>
                    )}
                    {task.nudgeCount && task.nudgeCount > 0 && (
                      <div className="bg-red-500 text-white text-[7px] font-black px-1.5 py-0.5 rounded-full animate-pulse">
                        GIỤC {task.nudgeCount}
                      </div>
                    )}
                    <ChevronRight size={16} className="text-gray-300" />
                  </div>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1 text-army-green">
                    <Clock size={12} />
                    <span className="text-[11px] font-bold">Hạn: {(() => {
                      if (!task.deadline) return '...';
                      try {
                        const date = new Date(task.deadline);
                        return isNaN(date.getTime()) ? '...' : date.toLocaleDateString('vi-VN');
                      } catch (e) {
                        return '...';
                      }
                    })()}</span>
                  </div>
                  {task.assignees && task.assignees.length > 1 && (
                    <div className="text-[9px] font-black text-army-green bg-army-green/10 px-1.5 py-0.5 rounded-md">
                      {task.assignees.filter(a => a.status === TaskStatus.COMPLETED).length}/{task.assignees.length} XONG
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-gray-400 font-medium">Giao bởi: {task.assignedBy === 'admin' ? 'Đ/c Trung tá B' : task.assignedBy}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4 opacity-50">
              <Clock size={40} />
            </div>
            <p className="text-xs font-bold uppercase tracking-widest">Không có nhiệm vụ</p>
          </div>
        )}
      </div>

      {/* FAB */}
      <button 
        onClick={onCreateTask}
        className="absolute right-6 bottom-24 w-14 h-14 bg-army-green text-white rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform z-10"
      >
        <Plus size={32} />
      </button>
    </div>
  );
};
