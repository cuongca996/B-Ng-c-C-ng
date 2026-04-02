import React, { useState } from 'react';
import { Shield, User as UserIcon, Lock, Eye, EyeOff, Fingerprint } from 'lucide-react';
import { auth, db, config } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, getAuth, signOut } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';

interface LoginScreenProps {
  onLogin: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isRegister, setIsRegister] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Map username to internal email
      const email = `${username.trim().toLowerCase()}@ll47.internal`;
      
      if (isRegister) {
        console.log('Registering:', email);
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          name: username,
          rank: 'Binh nhì',
          unit: 'Đang cập nhật',
          role: 'Chiến sĩ',
          avatarInitials: username.substring(0, 2).toUpperCase(),
          isAdmin: email === 'quanlilucluong47@ll47.internal' || email === 'bengoccuong@ll47.internal',
          status: 'online',
          createdAt: new Date().toISOString()
        });
      } else {
        console.log('Logging in:', email);
        await signInWithEmailAndPassword(auth, email, password);
      }
      onLogin();
    } catch (err: any) {
      console.error('Auth Error:', err.code, err.message);
      if (err.code === 'auth/email-already-in-use') {
        setError('Tên đăng nhập này đã tồn tại');
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Tên đăng nhập hoặc mật khẩu không chính xác');
      } else if (err.code === 'auth/weak-password') {
        setError('Mật khẩu quá yếu (tối thiểu 6 ký tự)');
      } else if (err.code === 'auth/invalid-email') {
        setError('Tên đăng nhập không hợp lệ');
      } else {
        setError(`Lỗi: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full bg-army-bg flex flex-col items-center justify-center p-6 overflow-y-auto">
      <div className="w-full max-w-md bg-white/50 backdrop-blur-sm p-8 rounded-[40px] shadow-2xl border border-white/50">
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 bg-army-green rounded-full flex items-center justify-center army-shadow mb-4">
            <Shield size={44} className="text-white" />
          </div>
          <h1 className="text-2xl font-black text-army-green tracking-tighter mb-1 uppercase">LỰC LƯỢNG 47</h1>
          <p className="text-army-brown text-[10px] font-bold text-center uppercase tracking-wider opacity-70">
            Hệ thống Quản lý & Tác chiến Nội bộ
          </p>
        </div>
        
        <form onSubmit={handleAuth} className="w-full space-y-4">
          {error && (
            <div className="bg-red-50 text-red-500 text-[10px] font-bold p-3 rounded-xl border border-red-100 mb-2">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-army-brown uppercase ml-1">Tên đăng nhập</label>
            <div className="relative">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-white border-none rounded-2xl pl-12 pr-4 py-3.5 text-sm focus:ring-2 focus:ring-army-green outline-none army-shadow"
                placeholder="Nhập tên đăng nhập"
                required
              />
            </div>
          </div>
          
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-army-brown uppercase ml-1">Mật khẩu</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white border-none rounded-2xl pl-12 pr-12 py-3.5 text-sm focus:ring-2 focus:ring-army-green outline-none army-shadow"
                placeholder="••••••••"
                required
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between px-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-3.5 h-3.5 rounded border-gray-300 text-army-green focus:ring-army-green" />
              <span className="text-[10px] text-gray-600">Ghi nhớ</span>
            </label>
            <button 
              type="button" 
              onClick={() => setIsRegister(!isRegister)}
              className="text-[10px] text-army-green font-bold hover:underline"
            >
              {isRegister ? 'Đã có tài khoản? Đăng nhập' : 'Chưa có tài khoản? Đăng ký'}
            </button>
          </div>
          
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-army-green text-white font-black py-4 rounded-2xl mt-4 army-shadow active:scale-95 transition-transform disabled:opacity-70"
          >
            {loading ? 'ĐANG XỬ LÝ...' : (isRegister ? 'ĐĂNG KÝ TÀI KHOẢN' : 'ĐĂNG NHẬP HỆ THỐNG')}
          </button>
        </form>

        <div className="mt-8 flex flex-col items-center gap-1">
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-gray-500">Bạn gặp sự cố?</span>
            <button className="text-[10px] text-army-green font-bold">Báo cáo sự cố</button>
          </div>
          <p className="text-center text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-2">
            Phiên bản 2.0.36 - Bảo mật bởi LL47
          </p>
        </div>
      </div>
    </div>
  );
};
