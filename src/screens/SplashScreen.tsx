import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { Shield } from 'lucide-react';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  useEffect(() => {
    const timer = setTimeout(onFinish, 2000);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="h-full bg-army-bg flex flex-col items-center justify-center relative">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-32 h-32 bg-army-green rounded-full flex items-center justify-center army-shadow mb-6"
      >
        <Shield size={64} className="text-white" />
      </motion.div>
      <motion.h1 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-3xl font-black text-army-green tracking-tighter"
      >
        LỰC LƯỢNG 47
      </motion.h1>
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-army-brown text-sm font-medium mt-2"
      >
        Hệ thống Quản lý & Tác chiến Nội bộ
      </motion.p>
      
      <div className="absolute bottom-10 flex flex-col items-center">
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">
          PHÁT TRIỂN BỞI CỤC KỸ THUẬT
        </p>
        <p className="text-[10px] text-army-light font-bold uppercase tracking-widest">
          BẢO MẬT • KỶ LUẬT • QUYẾT THẮNG
        </p>
      </div>
    </div>
  );
};
