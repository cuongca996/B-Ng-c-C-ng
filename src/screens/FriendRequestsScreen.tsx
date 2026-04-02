import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, UserPlus, UserCheck, UserX, Clock, User as UserIcon } from 'lucide-react';
import { FriendRequest } from '../types';

interface FriendRequestsScreenProps {
  onBack: () => void;
}

const MOCK_REQUESTS: FriendRequest[] = [
  {
    id: 'r1',
    fromUserId: 'u101',
    fromUserName: 'Lê Văn Tám',
    fromUserRank: 'Trung sĩ',
    status: 'pending',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
  },
  {
    id: 'r2',
    fromUserId: 'u102',
    fromUserName: 'Nguyễn Văn Trỗi',
    fromUserRank: 'Hạ sĩ',
    status: 'pending',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
  }
];

export const FriendRequestsScreen: React.FC<FriendRequestsScreenProps> = ({ onBack }) => {
  const [requests, setRequests] = useState<FriendRequest[]>(MOCK_REQUESTS);

  const handleAccept = (requestId: string) => {
    setRequests(requests.filter(r => r.id !== requestId));
  };

  const handleDecline = (requestId: string) => {
    setRequests(requests.filter(r => r.id !== requestId));
  };

  return (
    <div className="flex flex-col h-full bg-army-bg">
      {/* Header */}
      <div className="bg-white p-4 sticky top-0 z-10 zalo-shadow flex items-center gap-4">
        <button onClick={onBack} className="p-2 text-army-gray hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-lg font-bold text-army-gray">Lời mời kết bạn</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <AnimatePresence mode="popLayout">
          {requests.length > 0 ? (
            requests.map(request => (
              <motion.div 
                key={request.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-white p-4 rounded-3xl mb-4 shadow-sm flex items-center gap-4"
              >
                <div className="w-14 h-14 bg-army-green/10 rounded-full flex items-center justify-center">
                  <span className="text-xl font-black text-army-green">{request.fromUserName.substring(0, 2).toUpperCase()}</span>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-army-gray">{request.fromUserRank} {request.fromUserName}</h4>
                  <div className="flex items-center gap-1 text-[10px] text-gray-400 font-medium uppercase mt-1">
                    <Clock size={10} />
                    <span>{(() => {
                      if (!request.timestamp) return '...';
                      try {
                        const date = new Date(request.timestamp);
                        return isNaN(date.getTime()) ? '...' : date.toLocaleDateString('vi-VN');
                      } catch (e) {
                        return '...';
                      }
                    })()}</span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button 
                      onClick={() => handleAccept(request.id)}
                      className="flex-1 bg-army-green text-white text-[10px] font-black py-2 rounded-xl uppercase tracking-wider shadow-sm active:scale-95 transition-transform"
                    >
                      Chấp nhận
                    </button>
                    <button 
                      onClick={() => handleDecline(request.id)}
                      className="flex-1 bg-gray-100 text-gray-500 text-[10px] font-black py-2 rounded-xl uppercase tracking-wider active:scale-95 transition-transform"
                    >
                      Từ chối
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div 
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 text-gray-400"
            >
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4 opacity-50">
                <UserPlus size={40} />
              </div>
              <p className="text-sm font-bold uppercase tracking-widest">Không có lời mời nào</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
