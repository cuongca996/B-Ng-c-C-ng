import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Plus, Pin, User as UserIcon, Users, MessageCircle } from 'lucide-react';
import { ChatItem } from '../types';

interface ChatScreenProps {
  chats: ChatItem[];
  onSelectChat: (chat: ChatItem) => void;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({ chats, onSelectChat }) => {
  const [activeTab, setActiveTab] = useState<'group' | 'private' | 'pinned'>('group');
  const [loading, setLoading] = useState(false);

  const filteredChats = chats.filter(c => {
    if (activeTab === 'pinned') return c.isPinned;
    if (activeTab === 'group') return c.isGroup;
    return !c.isGroup;
  });

  return (
    <div className="flex flex-col h-full bg-army-bg">
      {/* Header */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-army-green rounded-full flex items-center justify-center text-white font-bold text-sm">
            {auth.currentUser?.displayName?.charAt(0) || 'U'}
          </div>
          <h1 className="text-lg font-bold text-army-gray">Chat</h1>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-2 text-army-gray"><Search size={22} /></button>
          <button className="p-2 text-army-gray"><Plus size={24} /></button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white flex border-b border-gray-100">
        <button onClick={() => setActiveTab('group')} className={`flex-1 py-3 text-[11px] font-bold uppercase tracking-wider transition-colors relative flex items-center justify-center gap-1.5 ${activeTab === 'group' ? 'text-army-green' : 'text-gray-400'}`}>
          <Users size={14} /> 👥 Nhóm
          {activeTab === 'group' && <motion.div layoutId="activeTabChat" className="absolute bottom-0 left-0 right-0 h-0.5 bg-army-green" />}
        </button>
        <button onClick={() => setActiveTab('private')} className={`flex-1 py-3 text-[11px] font-bold uppercase tracking-wider transition-colors relative flex items-center justify-center gap-1.5 ${activeTab === 'private' ? 'text-army-green' : 'text-gray-400'}`}>
          <UserIcon size={14} /> 💬 Cá nhân
          {activeTab === 'private' && <motion.div layoutId="activeTabChat" className="absolute bottom-0 left-0 right-0 h-0.5 bg-army-green" />}
        </button>
        <button onClick={() => setActiveTab('pinned')} className={`flex-1 py-3 text-[11px] font-bold uppercase tracking-wider transition-colors relative flex items-center justify-center gap-1.5 ${activeTab === 'pinned' ? 'text-army-green' : 'text-gray-400'}`}>
          <Pin size={14} className="rotate-45" /> ⭐ Đã ghim
          {activeTab === 'pinned' && <motion.div layoutId="activeTabChat" className="absolute bottom-0 left-0 right-0 h-0.5 bg-army-green" />}
        </button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full gap-2">
            <div className="w-8 h-8 border-4 border-army-green border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[10px] text-gray-400 font-bold uppercase">Đang tải tin nhắn...</p>
          </div>
        ) : filteredChats.length > 0 ? (
          filteredChats.map(chat => (
            <button 
              key={chat.id} 
              onClick={() => onSelectChat(chat)}
              className="w-full bg-white px-4 py-3 flex items-center gap-3 active:bg-gray-50 transition-colors border-b border-gray-50"
            >
              <div className="relative">
                <div className="w-14 h-14 bg-army-green/10 rounded-full flex items-center justify-center text-army-green font-bold text-lg">
                  {chat.avatar || chat.name.charAt(0)}
                </div>
                {chat.online && (
                  <div className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white"></div>
                )}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div className="flex justify-between items-center mb-0.5">
                  <h3 className="font-bold text-army-gray truncate">{chat.name}</h3>
                  <span className="text-[10px] text-gray-400 font-medium">{chat.time}</span>
                </div>
                <div className="flex items-center gap-1">
                  {chat.isPinned && <Pin size={10} className="text-army-green rotate-45 shrink-0" />}
                  <p className={`text-xs truncate ${chat.unread > 0 ? 'text-army-gray font-bold' : 'text-gray-400 font-medium'}`}>
                    {chat.lastMsg}
                  </p>
                </div>
              </div>
              {chat.unread > 0 && (
                <div className="bg-army-green text-white text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1">
                  {chat.unread}
                </div>
              )}
            </button>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4">
              <MessageCircle size={32} />
            </div>
            <h3 className="text-sm font-bold text-army-gray mb-1">Chưa có cuộc hội thoại nào</h3>
            <p className="text-xs text-gray-400">Bắt đầu trò chuyện với đồng đội ngay.</p>
          </div>
        )}
      </div>
    </div>
  );
};
