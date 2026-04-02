import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode } from 'lucide-react';
import { User } from '../types';

interface QRModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
}

export const QRModal: React.FC<QRModalProps> = ({ isOpen, onClose, currentUser }) => {
  if (!currentUser) return null;
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          key="qr-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
          onClick={onClose}
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white w-full max-w-xs rounded-[40px] p-8 flex flex-col items-center text-center shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-16 h-16 bg-army-green/10 rounded-full flex items-center justify-center mb-4">
              <QrCode size={32} className="text-army-green" />
            </div>
            <h3 className="text-lg font-black text-army-gray mb-1">Mã QR của tôi</h3>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-6">Quét để kết bạn nhanh</p>
            
            <div className="w-full aspect-square bg-white rounded-3xl border-4 border-gray-100 flex items-center justify-center relative overflow-hidden mb-6 p-4">
              <QRCodeSVG 
                value={currentUser.id} 
                size={240}
                level="H"
                includeMargin={true}
                imageSettings={{
                  src: "https://picsum.photos/seed/army/100/100",
                  x: undefined,
                  y: undefined,
                  height: 40,
                  width: 40,
                  excavate: true,
                }}
              />
            </div>

            <button 
              onClick={onClose}
              className="w-full py-4 bg-army-green text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-army-green/20 active:scale-95 transition-transform"
            >
              Đóng
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
