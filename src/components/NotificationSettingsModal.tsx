import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Bell, BellOff, MessageSquare, Phone, Megaphone, ClipboardList, ShieldAlert, Clock } from 'lucide-react';
import { NotificationSettings, NotificationType } from '../types';

interface NotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: NotificationSettings;
  onUpdateSettings: (settings: NotificationSettings) => void;
}

export const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings
}) => {
  const toggleMuteType = (type: NotificationType) => {
    if (type === NotificationType.TASK_COMBAT) return; // Cannot mute combat tasks

    const isMuted = settings.mutedTypes.includes(type);
    let newMutedTypes: NotificationType[];
    
    if (isMuted) {
      newMutedTypes = settings.mutedTypes.filter(t => t !== type);
    } else {
      newMutedTypes = [...settings.mutedTypes, type];
    }
    
    onUpdateSettings({ ...settings, mutedTypes: newMutedTypes });
  };

  const setMuteUntil = (hours: number | null) => {
    if (hours === null) {
      onUpdateSettings({ ...settings, muteUntil: null });
    } else {
      const date = new Date();
      date.setHours(date.getHours() + hours);
      onUpdateSettings({ ...settings, muteUntil: date.toISOString() });
    }
  };

  const isMuted = (type: NotificationType) => settings.mutedTypes.includes(type);
  
  const isTemporarilyMuted = settings.muteUntil && new Date(settings.muteUntil) > new Date();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          key="notification-settings-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-white w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="bg-army-green p-6 text-white relative">
              <button 
                onClick={onClose}
                className="absolute right-4 top-4 p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-white/20 rounded-2xl">
                  <Bell size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black uppercase tracking-tight">Thông báo</h2>
                  <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest">Cấu hình nhận tin</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Temporary Mute */}
              <section>
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Clock size={12} /> Tạm tắt tất cả
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 4, 8].map(hours => (
                    <button
                      key={hours}
                      onClick={() => setMuteUntil(hours)}
                      className={`py-2.5 rounded-xl text-[10px] font-bold transition-all ${
                        settings.muteUntil && new Date(settings.muteUntil).getHours() === new Date(Date.now() + hours * 3600000).getHours()
                        ? 'bg-army-green text-white shadow-lg shadow-army-green/20'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      {hours} GIỜ
                    </button>
                  ))}
                  <button
                    onClick={() => setMuteUntil(null)}
                    className={`col-span-3 py-2.5 rounded-xl text-[10px] font-bold transition-all ${
                      !settings.muteUntil ? 'bg-army-green text-white shadow-lg shadow-army-green/20' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    BẬT LẠI NGAY
                  </button>
                </div>
                {isTemporarilyMuted && (
                  <p className="text-[9px] text-red-500 font-bold mt-2 text-center uppercase italic">
                    Đang tạm tắt đến: {(() => {
                      try {
                        const date = new Date(settings.muteUntil!);
                        return isNaN(date.getTime()) ? '...' : date.toLocaleString('vi-VN');
                      } catch (e) {
                        return '...';
                      }
                    })()}
                  </p>
                )}
              </section>

              {/* Granular Settings */}
              <section className="space-y-3">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Tùy chỉnh theo loại</h3>
                
                <NotificationItem 
                  icon={<MessageSquare size={18} />}
                  label="Tin nhắn"
                  isMuted={isMuted(NotificationType.MESSAGE)}
                  onToggle={() => toggleMuteType(NotificationType.MESSAGE)}
                />
                
                <NotificationItem 
                  icon={<Phone size={18} />}
                  label="Cuộc gọi"
                  isMuted={isMuted(NotificationType.CALL)}
                  onToggle={() => toggleMuteType(NotificationType.CALL)}
                />

                <NotificationItem 
                  icon={<Megaphone size={18} />}
                  label="Thông báo đơn vị"
                  isMuted={isMuted(NotificationType.ANNOUNCEMENT)}
                  onToggle={() => toggleMuteType(NotificationType.ANNOUNCEMENT)}
                />

                <NotificationItem 
                  icon={<ClipboardList size={18} />}
                  label="Nhiệm vụ thường"
                  isMuted={isMuted(NotificationType.TASK_REGULAR)}
                  onToggle={() => toggleMuteType(NotificationType.TASK_REGULAR)}
                />

                <div className="flex items-center justify-between p-4 bg-red-50 rounded-2xl border border-red-100">
                  <div className="flex items-center gap-3">
                    <div className="text-red-500"><ShieldAlert size={18} /></div>
                    <div>
                      <p className="text-xs font-bold text-red-900">Nhiệm vụ Đấu tranh</p>
                      <p className="text-[9px] text-red-500 font-medium">Bắt buộc nhận thông báo</p>
                    </div>
                  </div>
                  <div className="w-10 h-5 bg-red-500 rounded-full relative opacity-50 cursor-not-allowed">
                    <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
                  </div>
                </div>
              </section>
            </div>

            <div className="p-6 pt-0">
              <button 
                onClick={onClose}
                className="w-full bg-army-green text-white font-black py-4 rounded-2xl shadow-lg active:scale-95 transition-transform uppercase text-xs tracking-widest"
              >
                XÁC NHẬN
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

interface NotificationItemProps {
  icon: React.ReactNode;
  label: string;
  isMuted: boolean;
  onToggle: () => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ icon, label, isMuted, onToggle }) => (
  <div className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
    isMuted ? 'bg-gray-50 border-gray-100' : 'bg-white border-gray-100 shadow-sm'
  }`}>
    <div className="flex items-center gap-3">
      <div className={isMuted ? 'text-gray-400' : 'text-army-green'}>{icon}</div>
      <span className={`text-xs font-bold ${isMuted ? 'text-gray-400' : 'text-army-gray'}`}>{label}</span>
    </div>
    <button 
      onClick={onToggle}
      className={`w-10 h-5 rounded-full relative transition-colors ${isMuted ? 'bg-gray-300' : 'bg-army-green'}`}
    >
      <motion.div 
        animate={{ x: isMuted ? 4 : 24 }}
        className="absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm"
      />
    </button>
  </div>
);
