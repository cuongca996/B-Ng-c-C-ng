import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Fingerprint, Lock, Shield, Bell, Award, BookOpen, ChevronRight, Moon, Globe, HelpCircle, Type } from 'lucide-react';

interface SettingsScreenProps {
  onBack: () => void;
  fontSize: 'small' | 'medium' | 'large';
  onFontSizeChange: (size: 'small' | 'medium' | 'large') => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack, fontSize, onFontSizeChange }) => {
  const [biometric, setBiometric] = useState(true);
  const [twoFA, setTwoFA] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className="flex flex-col h-full bg-army-bg">
      {/* Header */}
      <div className="bg-white p-4 sticky top-0 z-10 zalo-shadow flex items-center gap-4">
        <button onClick={onBack} className="p-2 text-army-gray hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-lg font-bold text-army-gray">Cài đặt ứng dụng</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <section>
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-2">🔐 Bảo mật & Tài khoản</h3>
          <div className="bg-white rounded-3xl overflow-hidden army-shadow">
            <div className="p-4 flex items-center justify-between border-b border-gray-50">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-army-green/10 rounded-xl flex items-center justify-center text-army-green"><Fingerprint size={20} /></div>
                <div>
                  <p className="text-sm font-bold text-army-gray">Face ID / Vân tay</p>
                  <p className="text-[10px] text-gray-400 font-medium">Đăng nhập nhanh an toàn</p>
                </div>
              </div>
              <input type="checkbox" checked={biometric} onChange={() => setBiometric(!biometric)} className="w-10 h-5 rounded-full bg-gray-200 checked:bg-army-green appearance-none cursor-pointer relative after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:w-4 after:h-4 after:rounded-full after:transition-all checked:after:translate-x-5" />
            </div>
            <button className="w-full p-4 flex items-center justify-between border-b border-gray-50 active:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-army-green/10 rounded-xl flex items-center justify-center text-army-green"><Lock size={20} /></div>
                <p className="text-sm font-bold text-army-gray">Đổi mật khẩu</p>
              </div>
              <ChevronRight size={18} className="text-gray-300" />
            </button>
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500"><Shield size={20} /></div>
                <div>
                  <p className="text-sm font-bold text-army-gray">Xác thực 2 lớp (2FA)</p>
                  <p className="text-[10px] text-gray-400 font-medium">Bảo vệ tài khoản cấp cao</p>
                </div>
              </div>
              <input type="checkbox" checked={twoFA} onChange={() => setTwoFA(!twoFA)} className="w-10 h-5 rounded-full bg-gray-200 checked:bg-army-green appearance-none cursor-pointer relative after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:w-4 after:h-4 after:rounded-full after:transition-all checked:after:translate-x-5" />
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-2">⚙️ Tùy chỉnh ứng dụng</h3>
          <div className="bg-white rounded-3xl overflow-hidden army-shadow">
            <div className="p-4 flex items-center justify-between border-b border-gray-50">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-500"><Bell size={20} /></div>
                <p className="text-sm font-bold text-army-gray">Thông báo đẩy</p>
              </div>
              <input type="checkbox" checked={notifications} onChange={() => setNotifications(!notifications)} className="w-10 h-5 rounded-full bg-gray-200 checked:bg-army-green appearance-none cursor-pointer relative after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:w-4 after:h-4 after:rounded-full after:transition-all checked:after:translate-x-5" />
            </div>
            <div className="p-4 flex items-center justify-between border-b border-gray-50">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500"><Moon size={20} /></div>
                <p className="text-sm font-bold text-army-gray">Chế độ tối</p>
              </div>
              <input type="checkbox" checked={darkMode} onChange={() => setDarkMode(!darkMode)} className="w-10 h-5 rounded-full bg-gray-200 checked:bg-army-green appearance-none cursor-pointer relative after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:w-4 after:h-4 after:rounded-full after:transition-all checked:after:translate-x-5" />
            </div>
            <button className="w-full p-4 flex items-center justify-between border-b border-gray-50 active:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500"><Globe size={20} /></div>
                <p className="text-sm font-bold text-army-gray">Ngôn ngữ</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">Tiếng Việt</span>
                <ChevronRight size={18} className="text-gray-300" />
              </div>
            </button>
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-500"><Type size={20} /></div>
                <p className="text-sm font-bold text-army-gray">Cỡ chữ</p>
              </div>
              <div className="flex bg-gray-100 p-1 rounded-xl">
                {(['small', 'medium', 'large'] as const).map((size) => (
                  <button
                    key={size}
                    onClick={() => onFontSizeChange(size)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${
                      fontSize === size 
                        ? 'bg-white text-army-green shadow-sm' 
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    {size === 'small' ? 'Nhỏ' : size === 'medium' ? 'Vừa' : 'Lớn'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-2">💬 Hỗ trợ & Thông tin</h3>
          <div className="bg-white rounded-3xl overflow-hidden army-shadow">
            <button className="w-full p-4 flex items-center justify-between border-b border-gray-50 active:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500"><HelpCircle size={20} /></div>
                <p className="text-sm font-bold text-army-gray">Trung tâm trợ giúp</p>
              </div>
              <ChevronRight size={18} className="text-gray-300" />
            </button>
            <button className="w-full p-4 flex items-center justify-between active:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-500"><BookOpen size={20} /></div>
                <p className="text-sm font-bold text-army-gray">Điều khoản sử dụng</p>
              </div>
              <ChevronRight size={18} className="text-gray-300" />
            </button>
          </div>
        </section>

        <div className="pt-4 pb-10 text-center space-y-1">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Phiên bản 2.0.4 (Bản dựng 2026)</p>
          <p className="text-[10px] text-gray-400 font-medium uppercase">Phát triển bởi Cục Kỹ thuật - Lực lượng 47</p>
        </div>
      </div>
    </div>
  );
};
