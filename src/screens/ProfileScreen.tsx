import React, { useState, useRef } from 'react';
import { Settings, Edit2, Verified, QrCode, Award, BookOpen, ChevronRight, MapPin, Calendar, Mail, Phone, ShieldCheck, Lock, X, Loader2, CheckCircle2, LogOut, Camera, Save } from 'lucide-react';
import { User } from '../types';
import { RankIcon, RankAvatar } from '../components/RankIcon';
import { auth, db } from '../firebase';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';

interface ProfileScreenProps {
  currentUser: User;
  onLogout: () => void;
  onOpenSettings: () => void;
  onShowQR: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ currentUser, onLogout, onOpenSettings, onShowQR }) => {
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Edit Profile State
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: currentUser.name,
    phone: currentUser.phone || '',
    email: currentUser.email || '',
    hometown: currentUser.hometown || '',
    enlistmentDate: currentUser.enlistmentDate || '',
    avatarUrl: currentUser.avatarUrl || ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const userDocRef = doc(db, 'users', currentUser.id);
      await updateDoc(userDocRef, {
        name: editData.name,
        phone: editData.phone,
        email: editData.email,
        hometown: editData.hometown,
        enlistmentDate: editData.enlistmentDate,
        avatarUrl: editData.avatarUrl,
        avatarInitials: editData.name.split(' ').pop()?.substring(0, 2).toUpperCase() || 'TM'
      });
      setIsEditing(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err: any) {
      console.error('Update Profile Error:', err);
      setError('Không thể cập nhật hồ sơ. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        setError('Ảnh quá lớn. Vui lòng chọn ảnh dưới 1MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditData({ ...editData, avatarUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }
    if (newPassword.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const user = auth.currentUser;
      if (!user || !user.email) throw new Error('Không tìm thấy thông tin người dùng');

      // Re-authenticate first
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, newPassword);
      
      setSuccess(true);
      setTimeout(() => {
        setShowChangePassword(false);
        setSuccess(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }, 2000);
    } catch (err: any) {
      console.error('Change Password Error:', err);
      if (err.code === 'auth/wrong-password') {
        setError('Mật khẩu hiện tại không chính xác');
      } else {
        setError(err.message || 'Đã xảy ra lỗi khi đổi mật khẩu');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-army-bg overflow-y-auto pb-24">
      {/* Header */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-100 sticky top-0 z-10">
        <button onClick={onOpenSettings} className="p-2 text-army-gray hover:bg-gray-100 rounded-full transition-colors">
          <Settings size={22} />
        </button>
        <h1 className="text-lg font-bold text-army-gray">Trang cá nhân</h1>
        <button 
          onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
          className={`p-2 rounded-full transition-colors ${isEditing ? 'text-army-green bg-army-green/10' : 'text-army-gray hover:bg-gray-100'}`}
        >
          {isEditing ? (loading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />) : <Edit2 size={20} />}
        </button>
      </div>

      {/* Profile Card */}
      <div className="bg-white pt-12 pb-8 px-8 flex flex-col items-center border-b border-gray-100 relative">
        {/* QR Code Mini */}
        <button 
          onClick={onShowQR}
          className="absolute top-4 left-4 text-army-gray/20 hover:text-army-gray transition-colors z-10"
        >
          <QrCode size={16} />
        </button>

        {/* Background Decoration */}
        <div className="absolute top-0 left-0 w-full h-32 bg-army-green/5 -skew-y-6 -translate-y-16 overflow-hidden w-full" />
        
        <div className="relative mb-4 group">
          <RankAvatar rank={currentUser.rank} initials={currentUser.avatarInitials} avatarUrl={isEditing ? editData.avatarUrl : currentUser.avatarUrl} size="xl" status="online">
            {isEditing && (
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity z-20"
              >
                <Camera size={24} className="-rotate-2" />
              </button>
            )}
          </RankAvatar>
          <input type="file" ref={fileInputRef} onChange={handleAvatarChange} accept="image/*" className="hidden" />
        </div>

        <div className="flex flex-col items-center gap-1 w-full max-w-xs text-center">
          {isEditing ? (
            <input 
              type="text" 
              value={editData.name}
              onChange={(e) => setEditData({...editData, name: e.target.value})}
              className="text-xl font-black text-army-gray text-center bg-gray-50 border-none rounded-xl p-2 w-full focus:ring-2 focus:ring-army-green outline-none"
              placeholder="Nhập họ tên..."
            />
          ) : (
            <h2 className="text-2xl font-black text-army-gray leading-tight">{currentUser.rank} {currentUser.name}</h2>
          )}
        </div>
        <div className="mt-2 px-4 py-1.5 bg-army-green/10 rounded-full flex items-center gap-2">
          <ShieldCheck size={14} className="text-army-green" />
          <span className="text-[10px] font-black text-army-green uppercase tracking-widest">
            {currentUser.unit} • {currentUser.role}
          </span>
        </div>

        <div className="mt-6 flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-blue-500 bg-blue-50 px-3 py-1.5 rounded-xl">
            <Verified size={16} />
            <span className="text-[10px] font-black uppercase tracking-wider">Chính chủ</span>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="p-4 grid grid-cols-2 gap-3">
        <div className="bg-white p-4 rounded-3xl flex flex-col items-center army-shadow border border-gray-50">
          <span className="text-2xl font-black text-army-green">{currentUser.readinessScore || 0}%</span>
          <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Sẵn sàng chiến đấu</span>
        </div>
        <div className="bg-white p-4 rounded-3xl flex flex-col items-center army-shadow border border-gray-50">
          <span className="text-2xl font-black text-blue-500">{currentUser.trainingScore || '0.0'}</span>
          <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Điểm TB huấn luyện</span>
        </div>
        <div className="bg-white p-4 rounded-3xl flex flex-col items-center army-shadow border border-gray-50">
          <span className="text-2xl font-black text-army-green">{currentUser.completedTasksCount || 0}</span>
          <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Nhiệm vụ hoàn thành</span>
        </div>
        <div className="bg-white p-4 rounded-3xl flex flex-col items-center army-shadow border border-gray-50">
          <span className="text-2xl font-black text-orange-500">{currentUser.awardsCount || 0}</span>
          <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Khen thưởng</span>
        </div>
      </div>

      {/* Personal Info Section */}
      <div className="px-4 space-y-4">
        {isEditing && error && (
          <div className="bg-red-50 text-red-500 text-[10px] font-bold p-3 rounded-xl border border-red-100">
            {error}
          </div>
        )}
        {success && !showChangePassword && (
          <div className="bg-army-green/10 text-army-green text-[10px] font-bold p-3 rounded-xl border border-army-green/20 flex items-center gap-2">
            <CheckCircle2 size={14} /> Cập nhật thành công!
          </div>
        )}

        <section className="bg-white rounded-[32px] p-6 army-shadow space-y-4">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Thông tin chi tiết</h3>
          
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400"><Calendar size={20} /></div>
            <div className="flex-1">
              <p className="text-[10px] text-gray-400 font-bold uppercase">Ngày nhập ngũ</p>
              {isEditing ? (
                <input 
                  type="date" 
                  value={editData.enlistmentDate}
                  onChange={(e) => setEditData({...editData, enlistmentDate: e.target.value})}
                  className="w-full bg-gray-50 border-none rounded-lg p-2 text-sm font-bold text-army-gray focus:ring-2 focus:ring-army-green outline-none mt-1"
                />
              ) : (
                <p className="text-sm font-bold text-army-gray">{currentUser.enlistmentDate || 'Chưa cập nhật'}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400"><MapPin size={20} /></div>
            <div className="flex-1">
              <p className="text-[10px] text-gray-400 font-bold uppercase">Quê quán</p>
              {isEditing ? (
                <input 
                  type="text" 
                  value={editData.hometown}
                  onChange={(e) => setEditData({...editData, hometown: e.target.value})}
                  className="w-full bg-gray-50 border-none rounded-lg p-2 text-sm font-bold text-army-gray focus:ring-2 focus:ring-army-green outline-none mt-1"
                  placeholder="Nhập quê quán..."
                />
              ) : (
                <p className="text-sm font-bold text-army-gray">{currentUser.hometown || 'Chưa cập nhật'}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400"><Mail size={20} /></div>
            <div className="flex-1">
              <p className="text-[10px] text-gray-400 font-bold uppercase">Email công vụ</p>
              {isEditing ? (
                <input 
                  type="email" 
                  value={editData.email}
                  onChange={(e) => setEditData({...editData, email: e.target.value})}
                  className="w-full bg-gray-50 border-none rounded-lg p-2 text-sm font-bold text-army-gray focus:ring-2 focus:ring-army-green outline-none mt-1"
                  placeholder="Nhập email..."
                />
              ) : (
                <p className="text-sm font-bold text-army-gray">{currentUser.email || 'Chưa cập nhật'}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400"><Phone size={20} /></div>
            <div className="flex-1">
              <p className="text-[10px] text-gray-400 font-bold uppercase">Số điện thoại</p>
              {isEditing ? (
                <input 
                  type="tel" 
                  value={editData.phone}
                  onChange={(e) => setEditData({...editData, phone: e.target.value})}
                  className="w-full bg-gray-50 border-none rounded-lg p-2 text-sm font-bold text-army-gray focus:ring-2 focus:ring-army-green outline-none mt-1"
                  placeholder="Nhập số điện thoại..."
                />
              ) : (
                <p className="text-sm font-bold text-army-gray">{currentUser.phone || 'Chưa cập nhật'}</p>
              )}
            </div>
          </div>
        </section>

        <section className="bg-white rounded-[32px] p-2 army-shadow">
          <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 rounded-2xl transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center"><Award size={20} /></div>
              <p className="text-sm font-bold text-army-gray">Thành tích & Khen thưởng</p>
            </div>
            <ChevronRight size={18} className="text-gray-300" />
          </button>
          <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 rounded-2xl transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-purple-50 text-purple-500 rounded-xl flex items-center justify-center"><BookOpen size={20} /></div>
              <p className="text-sm font-bold text-army-gray">Hồ sơ quân nhân điện tử</p>
            </div>
            <ChevronRight size={18} className="text-gray-300" />
          </button>
          <button 
            onClick={() => setShowChangePassword(true)}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 rounded-2xl transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gray-50 text-army-gray rounded-xl flex items-center justify-center"><Lock size={20} /></div>
              <p className="text-sm font-bold text-army-gray">Đổi mật khẩu</p>
            </div>
            <ChevronRight size={18} className="text-gray-300" />
          </button>
        </section>

        <button 
          onClick={onLogout}
          className="w-full bg-red-50 text-red-500 font-black py-5 rounded-[24px] flex items-center justify-center gap-2 active:scale-95 transition-transform border border-red-100"
        >
          <LogOut size={20} />
          ĐĂNG XUẤT TÀI KHOẢN
        </button>
      </div>

      {/* Change Password Modal */}
      <AnimatePresence>
        {showChangePassword && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm bg-white rounded-[40px] p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black text-army-gray">ĐỔI MẬT KHẨU</h2>
                <button onClick={() => setShowChangePassword(false)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full">
                  <X size={20} />
                </button>
              </div>

              {success ? (
                <div className="flex flex-col items-center py-8 space-y-4">
                  <div className="w-16 h-16 bg-army-green/10 text-army-green rounded-full flex items-center justify-center">
                    <CheckCircle2 size={40} />
                  </div>
                  <p className="text-sm font-bold text-army-green">Đổi mật khẩu thành công!</p>
                </div>
              ) : (
                <form onSubmit={handleChangePassword} className="space-y-4">
                  {error && (
                    <div className="bg-red-50 text-red-500 text-[10px] font-bold p-3 rounded-xl border border-red-100">
                      {error}
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Mật khẩu hiện tại</label>
                    <input 
                      type="password" required 
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-army-green outline-none" 
                      placeholder="••••••••"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Mật khẩu mới</label>
                    <input 
                      type="password" required 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-army-green outline-none" 
                      placeholder="••••••••"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Xác nhận mật khẩu mới</label>
                    <input 
                      type="password" required 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-army-green outline-none" 
                      placeholder="••••••••"
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-army-green text-white font-black py-4 rounded-2xl text-xs uppercase shadow-lg flex items-center justify-center gap-2 mt-4"
                  >
                    {loading && <Loader2 size={14} className="animate-spin" />}
                    {loading ? 'ĐANG XỬ LÝ...' : 'CẬP NHẬT MẬT KHẨU'}
                  </button>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
