import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Bell, MoreHorizontal, MessageSquare, Phone, Megaphone, ClipboardList, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { AppNotification, NotificationType } from '../types';

interface NotificationListModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onNotificationClick: (notif: AppNotification) => void;
  onOpenSettings: () => void;
  onMarkAllRead: () => void;
}

export const NotificationListModal: React.FC<NotificationListModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onNotificationClick,
  onOpenSettings,
  onMarkAllRead
}) => {
  const getIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.MESSAGE: return <MessageSquare size={16} className="text-blue-500" />;
      case NotificationType.CALL: return <Phone size={16} className="text-green-500" />;
      case NotificationType.ANNOUNCEMENT: return <Megaphone size={16} className="text-orange-500" />;
      case NotificationType.TASK_REGULAR: return <ClipboardList size={16} className="text-army-green" />;
      case NotificationType.TASK_COMBAT: return <ShieldAlert size={16} className="text-red-500" />;
      default: return <Bell size={16} />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          key="notification-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            className="bg-white w-full max-w-md h-[80vh] sm:h-auto sm:max-h-[70vh] rounded-t-[32px] sm:rounded-[32px] overflow-hidden shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="bg-army-green p-5 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <Bell size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-black uppercase tracking-tight">Thông báo mới</h2>
                  <p className="text-white/70 text-[9px] font-bold uppercase tracking-widest">Cập nhật quân sự</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={onOpenSettings}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                  title="Cài đặt thông báo"
                >
                  <MoreHorizontal size={20} />
                </button>
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 flex justify-between items-center shrink-0">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                {notifications.filter(n => !n.isRead).length} tin chưa đọc
              </span>
              <button 
                onClick={onMarkAllRead}
                className="text-army-green text-[10px] font-black uppercase tracking-wider flex items-center gap-1 hover:bg-army-green/5 px-2 py-1 rounded-lg transition-colors"
              >
                <CheckCircle2 size={12} />
                Đánh dấu đã đọc
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-hide">
              {notifications.length > 0 ? (
                notifications.map(notif => (
                  <button
                    key={notif.id}
                    onClick={() => onNotificationClick(notif)}
                    className={`w-full text-left p-4 rounded-2xl flex gap-3 transition-all active:scale-[0.98] ${
                      notif.isRead ? 'bg-white opacity-60' : 'bg-army-green/5 border border-army-green/10 shadow-sm'
                    }`}
                  >
                    <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                      notif.isRead ? 'bg-gray-100' : 'bg-white shadow-sm'
                    }`}>
                      {getIcon(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2 mb-0.5">
                        <h4 className={`text-xs font-black leading-tight truncate ${notif.isRead ? 'text-gray-500' : 'text-army-gray'}`}>
                          {notif.title}
                        </h4>
                        <span className="text-[9px] text-gray-400 font-bold whitespace-nowrap">{notif.timestamp}</span>
                      </div>
                      <p className={`text-[11px] leading-snug line-clamp-2 ${notif.isRead ? 'text-gray-400' : 'text-army-gray/70'}`}>
                        {notif.content}
                      </p>
                    </div>
                    {!notif.isRead && (
                      <div className="shrink-0 w-2 h-2 bg-army-green rounded-full mt-1.5" />
                    )}
                  </button>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-gray-300">
                  <Bell size={48} strokeWidth={1} className="mb-4 opacity-20" />
                  <p className="text-xs font-black uppercase tracking-widest">Không có thông báo nào</p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
