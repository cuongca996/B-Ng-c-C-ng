import React, { useState, useEffect } from 'react';
import { QrCode, PartyPopper, Search, Plus, ChevronRight, Bell, BellOff, Clock, ShieldCheck, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Task, TaskStatus, Announcement, NotificationSettings, User } from '../types';
import { RankIcon, RankAvatar } from '../components/RankIcon';
import { motion } from 'motion/react';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy, doc, updateDoc } from 'firebase/firestore';

interface HomeScreenProps {
  currentUser: User;
  tasks: Task[];
  onTabChange: (tabId: any) => void;
  onCreateTask: () => void;
  onShowQR: () => void;
  onShowNotifications: () => void;
  notificationSettings: NotificationSettings;
  unreadNotificationsCount: number;
  slogan?: string;
  subSlogan?: string;
  bannerUrl?: string;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ 
  currentUser,
  tasks, 
  onTabChange, 
  onCreateTask, 
  onShowQR, 
  onShowNotifications,
  notificationSettings,
  unreadNotificationsCount,
  slogan = 'QUYẾT CHIẾN - QUYẾT THẮNG',
  subSlogan = 'Phong trào thi đua quyết thắng 2026',
  bannerUrl = 'https://picsum.photos/seed/military-banner/800/400'
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'announcements'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setAnnouncements(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Announcement)));
      setLoadingAnnouncements(false);
    }, (error) => {
      console.error('Firestore Announcements Error:', error);
      setLoadingAnnouncements(false);
    });
    return () => unsubscribe();
  }, []);

  const handleReadAnnouncement = async (id: string) => {
    try {
      await updateDoc(doc(db, 'announcements', id), {
        isRead: true
      });
    } catch (error) {
      console.error('Error marking announcement as read:', error);
    }
  };

  const isMuted = notificationSettings.muteUntil && new Date(notificationSettings.muteUntil) > new Date();

  const getGreeting = () => {
    const hour = new Date().getHours();
    const name = (currentUser?.name || 'Đồng chí').split(' ').pop(); // Get only the last name
    
    let timeGreeting = '';
    if (hour >= 5 && hour < 11) timeGreeting = 'buổi sáng';
    else if (hour >= 11 && hour < 14) timeGreeting = 'buổi trưa';
    else if (hour >= 14 && hour < 18) timeGreeting = 'buổi chiều';
    else timeGreeting = 'buổi tối';

    return `Chào ${name}! Chúc bạn ${timeGreeting} vui vẻ!`;
  };

  const menuItems = [
    { id: 'tasks', icon: '📋', label: 'Nhiệm vụ', color: '#2E7D32' },
    { id: 'rank', icon: '🏆', label: 'Xếp hạng', color: '#FFA000' },
    { id: 'test', icon: '📝', label: 'Kiểm tra', color: '#7B1FA2' },
    { id: 'docs', icon: '📚', label: 'Tài liệu', color: '#5D4037' },
    { id: 'report', icon: '⚡', label: 'Báo cáo', color: '#D32F2F' },
    { id: 'schedule', icon: '📅', label: 'Lịch CT', color: '#303F9F' },
    { id: 'legal', icon: '⚖️', label: 'Pháp luật', color: '#455A64' },
    { id: 'contacts', icon: '👥', label: 'Danh bạ', color: '#0288D1' },
  ];

  const handleMenuClick = (itemId: string) => {
    if (itemId === 'create_task') {
      onCreateTask();
    } else {
      onTabChange(itemId);
    }
  };

  const filteredAnnouncements = announcements.filter(ann => 
    (ann.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
    (ann.content || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (ann.author || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col bg-army-bg overflow-hidden">
      {/* Header */}
      <div className="bg-white px-4 py-3 flex items-center gap-3 border-b border-gray-100 zalo-shadow shrink-0 z-20">
        <RankAvatar rank={currentUser.rank} initials={currentUser.avatarInitials} size="sm" />
        <div className="flex-1 min-w-0">
          <h1 className="text-[13px] font-black text-army-gray leading-tight truncate">
            {getGreeting()}
          </h1>
          <div className="relative mt-1.5 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-army-green transition-colors" size={14} />
            <input 
              type="text"
              placeholder="Tìm kiếm nhiệm vụ, quân nhân..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 border-none rounded-2xl pl-9 pr-10 py-2 text-[10px] font-bold focus:ring-2 focus:ring-army-green outline-none transition-all"
            />
            <button 
              onClick={onShowQR}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-army-green transition-colors"
            >
              <QrCode size={16} />
            </button>
          </div>
        </div>
        <button 
          onClick={onShowNotifications}
          className={`p-2 relative hover:bg-gray-50 rounded-full transition-colors ${isMuted ? 'text-red-500' : 'text-army-gray'}`}
        >
          {isMuted ? <BellOff size={20} /> : <Bell size={20} />}
          {!isMuted && unreadNotificationsCount > 0 && (
            <div className="absolute top-1 right-1 w-4 h-4 bg-red-500 border-2 border-white rounded-full flex items-center justify-center">
              <span className="text-[7px] text-white font-black">{unreadNotificationsCount}</span>
            </div>
          )}
          {isMuted && (
            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[7px] font-black px-1 rounded-full border border-white">
              OFF
            </div>
          )}
        </button>
      </div>

      <div className="flex-1 p-3 space-y-3 flex flex-col min-h-0">
        {/* Slogan / Banner */}
        <div className="relative h-28 shrink-0 rounded-[24px] overflow-hidden army-shadow">
          <img 
            src={bannerUrl} 
            className="w-full h-full object-cover"
            alt="Banner"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-army-green/90 via-army-green/40 to-transparent flex flex-col justify-end p-4">
            <motion.h3 
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-white text-lg font-black italic tracking-tighter uppercase leading-tight"
            >
              {slogan}
            </motion.h3>
            <p className="text-white/80 text-[8px] font-black uppercase mt-1 tracking-widest border-l-2 border-army-light pl-2">
              {subSlogan}
            </p>
          </div>
        </div>

        {/* Unit Bulletin Board */}
        <div className="bg-white p-4 rounded-[24px] army-shadow border border-gray-50 flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-3 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-army-green/10 rounded-lg flex items-center justify-center text-army-green">
                <Bell size={14} />
              </div>
              <h3 className="text-[10px] font-black text-army-gray uppercase tracking-widest">Bảng tin {currentUser.unit}</h3>
            </div>
            <span className="bg-red-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase shadow-sm">
              {announcements.filter(a => !a.isRead).length} Mới
            </span>
          </div>
          <div className="space-y-2 overflow-y-auto pr-1 scrollbar-hide">
            {loadingAnnouncements ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <Loader2 className="animate-spin mb-2" size={24} />
                <p className="text-[10px] font-bold uppercase">Đang tải thông báo...</p>
              </div>
            ) : filteredAnnouncements.length > 0 ? (
              filteredAnnouncements.map(ann => (
                <div 
                  key={ann.id} 
                  className={`p-3 rounded-xl border transition-all ${
                    ann.isRead ? 'bg-gray-50 border-gray-100 opacity-70' : 'bg-white border-army-green/10 shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className={`text-[11px] font-bold leading-tight ${ann.isRead ? 'text-gray-400' : 'text-army-gray'}`}>
                      {ann.priority === 'urgent' && <span className="text-red-500 mr-1">●</span>}
                      {ann.title}
                    </h4>
                    <span className="text-[9px] text-gray-400 font-bold whitespace-nowrap">{ann.timestamp}</span>
                  </div>
                  <p className={`text-[10px] leading-snug mb-2 ${ann.isRead ? 'text-gray-400' : 'text-army-gray/70'}`}>
                    {ann.content}
                  </p>
                  <div className="flex items-center justify-between pt-1.5 border-t border-gray-50">
                    <span className="text-[8px] text-gray-400 font-black uppercase italic">-- {ann.author}</span>
                    {!ann.isRead && (
                      <button 
                        onClick={() => handleReadAnnouncement(ann.id)}
                        className="flex items-center gap-1 text-army-green text-[8px] font-black uppercase tracking-wider bg-army-green/10 px-2 py-1 rounded-lg active:scale-95 transition-transform"
                      >
                        <CheckCircle2 size={10} />
                        Đã rõ
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-gray-300">
                <Search size={32} strokeWidth={1} />
                <p className="text-[10px] font-bold uppercase mt-2">Không tìm thấy thông báo</p>
              </div>
            )}
          </div>
        </div>

        {/* Grid Menu - Function Icons */}
        <div className="bg-white p-4 rounded-[24px] army-shadow border border-gray-50 shrink-0">
          <h3 className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Chức năng hệ thống</h3>
          <div className="grid grid-cols-4 gap-y-4">
            {menuItems.map((item, idx) => (
              <button 
                key={idx} 
                className="flex flex-col items-center gap-1.5 group"
                onClick={() => handleMenuClick(item.id)}
              >
                <div className="w-11 h-11 bg-gray-50 rounded-[16px] flex items-center justify-center text-xl army-shadow group-active:scale-90 transition-transform relative overflow-hidden">
                  <div className="absolute inset-0 bg-army-green/0 group-hover:bg-army-green/5 transition-colors" />
                  {item.icon}
                </div>
                <span className="text-[9px] font-black text-army-gray text-center leading-tight uppercase tracking-tighter group-hover:text-army-green transition-colors">
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
