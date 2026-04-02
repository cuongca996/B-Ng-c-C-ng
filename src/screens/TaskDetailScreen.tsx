import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Clock, 
  User as UserIcon, 
  Paperclip, 
  Send, 
  CheckCircle2, 
  AlertCircle,
  MoreVertical,
  MessageSquare,
  BellRing,
  Users,
  CheckCircle
} from 'lucide-react';
import { Task, TaskStatus, NotificationType, TaskAssignee, User } from '../types';
import { db } from '../firebase';
import { doc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';

interface TaskDetailScreenProps {
  task: Task;
  currentUser: User;
  onBack: () => void;
  onReport: () => void;
  onNudge?: (taskId: string) => void;
}

export const TaskDetailScreen: React.FC<TaskDetailScreenProps> = ({ task, currentUser, onBack, onReport, onNudge }) => {
  const [comment, setComment] = useState('');
  const [isNudging, setIsNudging] = useState(false);

  const safeFormatDate = (dateStr: string | undefined | null, format: 'date' | 'time' | 'datetime' = 'date') => {
    if (!dateStr) return '...';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return '...';
      
      if (format === 'time') return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      if (format === 'datetime') return date.toLocaleString('vi-VN');
      return date.toLocaleDateString('vi-VN');
    } catch (e) {
      return '...';
    }
  };

  const handleNudge = async () => {
    if (!onNudge) return;
    setIsNudging(true);
    try {
      await updateDoc(doc(db, 'tasks', task.id), {
        nudgeCount: (task.nudgeCount || 0) + 1,
        lastNudgedAt: new Date().toISOString()
      });
      onNudge(task.id);
    } catch (error) {
      console.error('Error nudging task:', error);
    }
    setTimeout(() => setIsNudging(false), 2000);
  };

  const handleSendComment = async () => {
    if (!comment.trim()) return;
    try {
      const newComment = {
        id: Date.now().toString(),
        userId: currentUser.id,
        userName: currentUser.name,
        text: comment,
        timestamp: new Date().toISOString()
      };
      
      await updateDoc(doc(db, 'tasks', task.id), {
        comments: arrayUnion(newComment)
      });
      
      setComment('');
    } catch (error) {
      console.error('Error sending comment:', error);
    }
  };

  const getStatusConfig = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.PENDING: return { color: 'text-orange-500', bg: 'bg-orange-50', label: 'Chờ xử lý' };
      case TaskStatus.IN_PROGRESS: return { color: 'text-blue-500', bg: 'bg-blue-50', label: 'Đang làm' };
      case TaskStatus.COMPLETED: return { color: 'text-green-500', bg: 'bg-green-50', label: 'Hoàn thành' };
      case TaskStatus.OVERDUE: return { color: 'text-red-500', bg: 'bg-red-50', label: 'Quá hạn' };
      default: return { color: 'text-gray-500', bg: 'bg-gray-50', label: 'Không xác định' };
    }
  };

  const statusConfig = getStatusConfig(task.status);

  return (
    <div className="flex flex-col h-full bg-army-bg">
      {/* Header */}
      <div className="bg-white p-4 sticky top-0 z-10 zalo-shadow flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 text-army-gray hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft size={22} />
          </button>
          <h1 className="text-lg font-bold text-army-gray">Chi tiết nhiệm vụ</h1>
        </div>
        <button className="p-2 text-gray-400">
          <MoreVertical size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Task Info Card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex justify-between items-start">
            <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${statusConfig.bg} ${statusConfig.color}`}>
              {statusConfig.label}
            </div>
            {task.priority && (task.priority === 'high' || task.priority === 'urgent') && (
              <div className={`flex items-center gap-1 ${task.priority === 'urgent' ? 'text-red-600 animate-pulse' : 'text-red-500'}`}>
                <AlertCircle size={14} />
                <span className="text-[10px] font-black uppercase tracking-wider">
                  {task.priority === 'urgent' ? 'KHẨN CẤP' : 'Ưu tiên cao'}
                </span>
              </div>
            )}
          </div>

          <div>
            <h2 className="text-xl font-black text-army-gray mb-2">{task.title}</h2>
            <p className="text-sm text-gray-500 leading-relaxed">{task.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Người giao</p>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-army-green/10 rounded-full flex items-center justify-center">
                  <UserIcon size={12} className="text-army-green" />
                </div>
                <span className="text-xs font-bold text-army-gray">{task.assignedBy === 'admin' ? 'Đại đội trưởng' : task.assignedBy}</span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Thời hạn</p>
              <div className="flex items-center gap-2 text-army-gray">
                <Clock size={14} className="text-gray-400" />
                <span className="text-xs font-bold">{safeFormatDate(task.deadline, 'date')}</span>
              </div>
            </div>
          </div>

          {task.nudgeCount && task.nudgeCount > 0 && (
            <div className="bg-red-50 p-3 rounded-2xl border border-red-100 flex items-center gap-3">
              <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center text-red-500 shadow-sm animate-pulse">
                <BellRing size={16} />
              </div>
              <div>
                <p className="text-[10px] font-black text-red-900 uppercase">Đã nhắc nhở {task.nudgeCount} lần</p>
                <p className="text-[9px] text-red-500 font-medium">Lần cuối: {task.lastNudgedAt ? safeFormatDate(task.lastNudgedAt, 'time') : 'Vừa xong'}</p>
              </div>
            </div>
          )}

          {task.attachments && task.attachments.length > 0 && (
            <div className="space-y-2 pt-4 border-t border-gray-50">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tệp đính kèm</p>
              <div className="flex flex-wrap gap-2">
                {task.attachments.map((file, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl border border-gray-100">
                    <Paperclip size={14} className="text-army-green" />
                    <span className="text-xs font-medium text-army-gray">{file}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Progress Section */}
        {task.assignees && task.assignees.length > 0 && (
          <div className="bg-white rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users size={18} className="text-army-green" />
                <h3 className="text-xs font-black text-army-gray uppercase tracking-widest">Tiến độ thực hiện</h3>
              </div>
              <div className="text-[10px] font-black text-army-green bg-army-green/10 px-2 py-1 rounded-lg">
                {task.assignees.filter(a => a.status === TaskStatus.COMPLETED).length}/{task.assignees.length} HOÀN THÀNH
              </div>
            </div>

            <div className="space-y-3">
              {task.assignees.map((assignee) => (
                <div key={assignee.userId} className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
                      <span className="text-[10px] font-black text-army-green">{(assignee.userName || 'U').substring(0, 2).toUpperCase()}</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-army-gray">{assignee.rank} {assignee.userName}</p>
                      <p className="text-[9px] text-gray-400 uppercase font-black tracking-tighter">
                        {assignee.status === TaskStatus.COMPLETED ? `Xong lúc: ${assignee.completedAt ? safeFormatDate(assignee.completedAt, 'time') : '...'}` : 'Đang thực hiện'}
                      </p>
                    </div>
                  </div>
                  {assignee.status === TaskStatus.COMPLETED ? (
                    <CheckCircle className="text-green-500" size={18} />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-gray-200" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Comments Section */}
        <div className="bg-white rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare size={18} className="text-army-green" />
            <h3 className="text-xs font-black text-army-gray uppercase tracking-widest">Thảo luận</h3>
          </div>

          <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
            {task.comments?.map(c => (
              <div key={c.id} className="flex gap-3">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-black text-army-green">{(c.userName || 'U').substring(0, 2).toUpperCase()}</span>
                </div>
                <div className="flex-1 bg-gray-50 p-3 rounded-2xl rounded-tl-none">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-black text-army-gray">{c.userName || 'Người dùng'}</span>
                    <span className="text-[9px] text-gray-400">{c.timestamp ? safeFormatDate(c.timestamp, 'time') : '...'}</span>
                  </div>
                  <p className="text-xs text-gray-600">{c.text}</p>
                </div>
              </div>
            ))}
            {(!task.comments || task.comments.length === 0) && (
              <p className="text-center text-xs text-gray-400 py-4 italic">Chưa có bình luận nào</p>
            )}
          </div>
        </div>
      </div>

      {/* Footer - Comment Input */}
      <div className="bg-white p-4 border-t border-gray-100 flex items-center gap-3">
        <button className="p-2 text-gray-400 hover:text-army-green transition-colors">
          <Paperclip size={20} />
        </button>
        <div className="flex-1 relative">
          <input 
            type="text"
            placeholder="Nhập bình luận..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full bg-gray-100 border-none rounded-2xl pl-4 pr-10 py-3 text-sm focus:ring-2 focus:ring-army-green outline-none"
          />
          <button 
            onClick={handleSendComment}
            disabled={!comment.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-army-green disabled:text-gray-300 transition-colors"
          >
            <Send size={20} />
          </button>
        </div>
      </div>

      {/* Action Button */}
      <div className="p-4 bg-white border-t border-gray-50 flex gap-3">
        {(currentUser.isAdmin || task.assignedBy === currentUser.id) && task.status !== TaskStatus.COMPLETED && (
          <button 
            onClick={handleNudge}
            disabled={isNudging}
            className={`flex-1 font-black py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all ${
              isNudging ? 'bg-red-100 text-red-500' : 'bg-red-500 text-white'
            }`}
          >
            {isNudging ? (
              <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <BellRing size={20} />
                GIỤC LÀM
              </>
            )}
          </button>
        )}
        <button 
          onClick={onReport}
          className="flex-[2] bg-army-green text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform"
        >
          <CheckCircle2 size={20} />
          BÁO CÁO KẾT QUẢ
        </button>
      </div>
    </div>
  );
};
