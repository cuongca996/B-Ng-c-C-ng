import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Calendar, Clock, User as UserIcon, Send, AlertCircle, X, Users, UserCheck, Paperclip, Image as ImageIcon, FileText } from 'lucide-react';
import { Task, TaskStatus, NotificationType, TaskAssignee, User } from '../types';

interface CreateTaskScreenProps {
  currentUser: User;
  onBack: () => void;
  onCreate: (task: Task) => void;
  units: { id: string, name: string }[];
  users: { id: string, name: string, rank: string }[];
}

export const CreateTaskScreen: React.FC<CreateTaskScreenProps> = ({ currentUser, onBack, onCreate, units, users }) => {
  const [title, setTitle] = useState('');
  const [prefix, setPrefix] = useState('ALL');
  const [description, setDescription] = useState('');
  const [deadlineDate, setDeadlineDate] = useState('');
  const [deadlineTime, setDeadlineTime] = useState('08:00');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [assigneeType, setAssigneeType] = useState<'unit' | 'individual'>('unit');
  const [selectedAssigneeIds, setSelectedAssigneeIds] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadType, setUploadType] = useState<'image' | 'file' | 'doc'>('file');

  const prefixes = ['ĐT', 'QS', 'CT', 'HK', 'ALL'];

  const handleFileClick = (type: 'image' | 'file' | 'doc') => {
    setUploadType(type);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newFiles = Array.from(files).map((f: File) => f.name);
      setAttachments(prev => [...prev, ...newFiles]);
    }
    // Reset input so same file can be selected again
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const toggleAssignee = (id: string) => {
    setSelectedAssigneeIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !deadlineDate || selectedAssigneeIds.length === 0) return;

    setIsSubmitting(true);
    
    const deadline = new Date(`${deadlineDate}T${deadlineTime}`).toISOString();
    
    let taskAssignees: TaskAssignee[] = [];
    
    if (assigneeType === 'individual') {
      selectedAssigneeIds.forEach(id => {
        const user = users.find(u => u.id === id);
        if (user) {
          taskAssignees.push({ userId: user.id, userName: user.name, rank: user.rank, status: TaskStatus.PENDING });
        }
      });
    } else {
      // For units, we'd typically assign to all members of all selected units
      // Mocking: assigning to all users if any unit is selected, or specific logic
      selectedAssigneeIds.forEach(unitId => {
        // In a real app, we'd fetch members of unitId
        // For mock, we'll just add all users as assignees for simplicity
        users.forEach(u => {
          if (!taskAssignees.find(a => a.userId === u.id)) {
            taskAssignees.push({ userId: u.id, userName: u.name, rank: u.rank, status: TaskStatus.PENDING });
          }
        });
      });
    }

    const newTask: Task = {
      id: Date.now().toString(),
      title: `[${prefix}] ${title}`,
      description,
      deadline,
      status: TaskStatus.PENDING,
      assignedBy: currentUser.id,
      assignedTo: selectedAssigneeIds.join(','),
      assignees: taskAssignees,
      createdAt: new Date().toISOString(),
      priority,
      attachments,
      nudgeCount: 0
    };

    // Simulate API call
    setTimeout(() => {
      onCreate(newTask);
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-full bg-army-bg">
      {/* Header */}
      <div className="bg-white p-4 sticky top-0 z-10 zalo-shadow flex items-center gap-4">
        <button onClick={onBack} className="p-2 text-army-gray hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-lg font-bold text-army-gray">Giao nhiệm vụ mới</h1>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-6">
        <div className="space-y-4">
          {/* Title with Prefix */}
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block">Tên nhiệm vụ</label>
            <div className="flex gap-2">
              <select 
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
                className="bg-white border-none rounded-2xl px-3 py-3 text-sm shadow-sm focus:ring-2 focus:ring-army-green outline-none font-bold text-army-green"
              >
                {prefixes.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ví dụ: Báo cáo tuần 14"
                className="flex-1 bg-white border-none rounded-2xl px-4 py-3 text-sm shadow-sm focus:ring-2 focus:ring-army-green outline-none"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block">Mô tả chi tiết</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Nội dung cụ thể cần thực hiện..."
              className="w-full bg-white border-none rounded-2xl px-4 py-3 text-sm shadow-sm focus:ring-2 focus:ring-army-green outline-none min-h-[120px] resize-none"
            />
          </div>

          {/* Deadline */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block">Ngày hoàn thành</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="date" 
                  value={deadlineDate}
                  onChange={(e) => setDeadlineDate(e.target.value)}
                  className="w-full bg-white border-none rounded-2xl pl-12 pr-4 py-3 text-sm shadow-sm focus:ring-2 focus:ring-army-green outline-none"
                  required
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block">Giờ hoàn thành</label>
              <div className="relative">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="time" 
                  value={deadlineTime}
                  onChange={(e) => setDeadlineTime(e.target.value)}
                  className="w-full bg-white border-none rounded-2xl pl-12 pr-4 py-3 text-sm shadow-sm focus:ring-2 focus:ring-army-green outline-none"
                  required
                />
              </div>
            </div>
          </div>

          {/* Assignee Selection */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block">Đối tượng nhận nhiệm vụ</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setAssigneeType('unit'); setSelectedAssigneeIds([]); }}
                className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-wider border-2 flex items-center justify-center gap-2 transition-all ${
                  assigneeType === 'unit' 
                    ? 'bg-army-green/10 border-army-green text-army-green' 
                    : 'bg-white border-transparent text-gray-400 shadow-sm'
                }`}
              >
                <Users size={14} /> Đơn vị
              </button>
              <button
                type="button"
                onClick={() => { setAssigneeType('individual'); setSelectedAssigneeIds([]); }}
                className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-wider border-2 flex items-center justify-center gap-2 transition-all ${
                  assigneeType === 'individual' 
                    ? 'bg-army-green/10 border-army-green text-army-green' 
                    : 'bg-white border-transparent text-gray-400 shadow-sm'
                }`}
              >
                <UserCheck size={14} /> Cá nhân
              </button>
            </div>

            <div className="bg-white rounded-2xl p-2 shadow-sm max-h-[200px] overflow-y-auto space-y-1">
              {assigneeType === 'unit' ? (
                units.map(u => (
                  <label key={u.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors">
                    <input 
                      type="checkbox"
                      checked={selectedAssigneeIds.includes(u.id)}
                      onChange={() => toggleAssignee(u.id)}
                      className="w-5 h-5 rounded-md border-gray-300 text-army-green focus:ring-army-green"
                    />
                    <span className="text-sm font-bold text-army-gray">{u.name}</span>
                  </label>
                ))
              ) : (
                users.map(u => (
                  <label key={u.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors">
                    <input 
                      type="checkbox"
                      checked={selectedAssigneeIds.includes(u.id)}
                      onChange={() => toggleAssignee(u.id)}
                      className="w-5 h-5 rounded-md border-gray-300 text-army-green focus:ring-army-green"
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-army-gray">{u.name}</span>
                      <span className="text-[10px] text-gray-400 font-bold uppercase">{u.rank}</span>
                    </div>
                  </label>
                ))
              )}
              {((assigneeType === 'unit' && units.length === 0) || (assigneeType === 'individual' && users.length === 0)) && (
                <p className="text-center py-4 text-xs text-gray-400 font-bold italic">Không có dữ liệu</p>
              )}
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block">Mức độ ưu tiên</label>
            <div className="grid grid-cols-2 gap-2">
              {(['low', 'medium', 'high', 'urgent'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`py-3 rounded-2xl text-[10px] font-black uppercase tracking-wider border-2 transition-all ${
                    priority === p 
                      ? p === 'urgent' 
                        ? 'bg-red-500 text-white border-red-500 shadow-lg shadow-red-200' 
                        : 'bg-army-green text-white border-army-green shadow-lg shadow-army-green/20'
                      : 'bg-white border-gray-100 text-gray-400'
                  }`}
                >
                  {p === 'low' ? 'Thấp' : p === 'medium' ? 'Trung bình' : p === 'high' ? 'Cao' : 'Khẩn cấp'}
                </button>
              ))}
            </div>
          </div>

          {/* Attachments */}
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block">Tài liệu đính kèm</label>
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              multiple
              accept={
                uploadType === 'image' ? 'image/*' : 
                uploadType === 'doc' ? '.doc,.docx,.pdf,.xls,.xlsx,.ppt,.pptx' : 
                '*'
              }
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleFileClick('image')}
                className="flex-1 bg-white p-4 rounded-2xl flex flex-col items-center justify-center gap-2 shadow-sm active:scale-95 transition-transform border border-gray-50"
              >
                <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center">
                  <ImageIcon size={20} />
                </div>
                <span className="text-[10px] font-bold text-gray-500 uppercase">Ảnh</span>
              </button>
              <button
                type="button"
                onClick={() => handleFileClick('file')}
                className="flex-1 bg-white p-4 rounded-2xl flex flex-col items-center justify-center gap-2 shadow-sm active:scale-95 transition-transform border border-gray-50"
              >
                <div className="w-10 h-10 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center">
                  <FileText size={20} />
                </div>
                <span className="text-[10px] font-bold text-gray-500 uppercase">File</span>
              </button>
              <button
                type="button"
                onClick={() => handleFileClick('doc')}
                className="flex-1 bg-white p-4 rounded-2xl flex flex-col items-center justify-center gap-2 shadow-sm active:scale-95 transition-transform border border-gray-50"
              >
                <div className="w-10 h-10 bg-purple-50 text-purple-500 rounded-full flex items-center justify-center">
                  <Paperclip size={20} />
                </div>
                <span className="text-[10px] font-bold text-gray-500 uppercase">Tài liệu</span>
              </button>
            </div>
            
            {attachments.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {attachments.map((file, idx) => (
                  <div key={idx} className="bg-army-green/10 text-army-green px-3 py-1.5 rounded-full text-[10px] font-bold flex items-center gap-2">
                    {file}
                    <button type="button" onClick={() => setAttachments(prev => prev.filter((_, i) => i !== idx))}>
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </form>

      {/* Footer Action */}
      <div className="p-4 bg-white border-t border-gray-100">
        <button 
          onClick={handleSubmit}
          disabled={isSubmitting || !title.trim() || !deadlineDate || selectedAssigneeIds.length === 0}
          className="w-full bg-army-green text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform disabled:opacity-70"
        >
          {isSubmitting ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Send size={20} />
              PHÁT LỆNH GIAO NHIỆM VỤ
            </>
          )}
        </button>
      </div>
    </div>
  );
};
