import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldCheck, Award, MapPin, Calendar, UserPlus, MessageCircle } from 'lucide-react';
import { User } from '../types';
import { RankAvatar } from './RankIcon';

interface QuickProfileModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onAddFriend?: (userId: string) => void;
  onChat?: (user: User) => void;
}

export const QuickProfileModal: React.FC<QuickProfileModalProps> = ({ user, isOpen, onClose, onAddFriend, onChat }) => {
  if (!user) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          key="quick-profile-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
          onClick={onClose}
        >
          <motion.div 
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            className="bg-white w-full max-w-sm rounded-[40px] overflow-hidden shadow-2xl relative"
            onClick={e => e.stopPropagation()}
          >
            {/* Header / Background */}
            <div className="h-24 bg-gradient-to-r from-army-green to-army-light relative">
               <button 
                onClick={onClose}
                className="absolute top-4 right-4 p-2 bg-black/10 text-white rounded-full backdrop-blur-md hover:bg-black/20 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="px-6 pb-8 -mt-12 flex flex-col items-center">
              <div className="relative mb-4 border-4 border-white rounded-full shadow-lg">
                <RankAvatar rank={user.rank} initials={user.avatarInitials} size="xl" status={user.status} />
              </div>

              <h3 className="text-xl font-black text-army-gray text-center">{user.rank} {user.name}</h3>
              <div className="mt-1 px-3 py-1 bg-army-green/10 rounded-full flex items-center gap-1.5">
                <ShieldCheck size={12} className="text-army-green" />
                <span className="text-[9px] font-black text-army-green uppercase tracking-widest">
                  {user.unit} • {user.role}
                </span>
              </div>

              {/* Stats/Medals */}
              <div className="w-full grid grid-cols-2 gap-3 mt-6">
                <div className="bg-gray-50 p-3 rounded-2xl flex flex-col items-center">
                   <span className="text-lg font-black text-army-green">{user.readinessScore || 90}%</span>
                   <span className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">Sẵn sàng</span>
                </div>
                <div className="bg-gray-50 p-3 rounded-2xl flex flex-col items-center">
                   <span className="text-lg font-black text-amber-500">{(user.medals || []).length + 2}</span>
                   <span className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">Huy chương</span>
                </div>
              </div>

              {/* Info List */}
              <div className="w-full mt-6 space-y-3">
                <div className="flex items-center gap-3 text-gray-500">
                  <MapPin size={16} />
                  <span className="text-xs font-bold">Hà Nội, Việt Nam</span>
                </div>
                <div className="flex items-center gap-3 text-gray-500">
                  <Calendar size={16} />
                  <span className="text-xs font-bold">Nhập ngũ: 15/02/2018</span>
                </div>
              </div>

              {/* Actions */}
              <div className="w-full grid grid-cols-2 gap-3 mt-8">
                <button 
                  onClick={() => onAddFriend?.(user.id)}
                  className="flex items-center justify-center gap-2 py-4 bg-army-green text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-army-green/20 active:scale-95 transition-transform"
                >
                  <UserPlus size={16} />
                  Kết bạn
                </button>
                <button 
                  onClick={() => onChat?.(user)}
                  className="flex items-center justify-center gap-2 py-4 bg-army-gray text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-army-gray/20 active:scale-95 transition-transform"
                >
                  <MessageCircle size={16} />
                  Nhắn tin
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
