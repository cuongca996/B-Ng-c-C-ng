import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Users, Settings, Plus, Trash2, Edit2, CheckCircle2, X, AlertTriangle, Upload, Image as ImageIcon, LayoutGrid, ChevronRight as ChevronRightIcon, UserCheck, UserMinus, MessageSquare, Loader2 } from 'lucide-react';
import { User, Unit, UnitLevel, UnitType } from '../types';
import { RankIcon, RankAvatar } from '../components/RankIcon';
import { db, auth, config } from '../firebase';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy, setDoc } from 'firebase/firestore';
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, updateProfile, signOut } from 'firebase/auth';

interface AdminScreenProps {
  slogan: string;
  onUpdateSlogan: (slogan: string) => void;
  subSlogan: string;
  onUpdateSubSlogan: (subSlogan: string) => void;
  bannerUrl: string;
  onUpdateBannerUrl: (bannerUrl: string) => void;
  users: User[];
  units: Unit[];
}

export const AdminScreen: React.FC<AdminScreenProps> = ({ 
  slogan, 
  onUpdateSlogan,
  subSlogan,
  onUpdateSubSlogan,
  bannerUrl,
  onUpdateBannerUrl,
  users,
  units
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'units' | 'app'>('users');
  const [showAddUser, setShowAddUser] = useState(false);
  const [showAddUnit, setShowAddUnit] = useState(false);
  const [showAppointCommander, setShowAppointCommander] = useState(false);
  const [selectedUnitForCommander, setSelectedUnitForCommander] = useState<Unit | null>(null);
  const [unitToDelete, setUnitToDelete] = useState<Unit | null>(null);
  const [unitToEdit, setUnitToEdit] = useState<Unit | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  
  // Add Unit Form State
  const [newUnitData, setNewUnitData] = useState({
    name: '',
    parentId: '',
    level: UnitLevel.SQUAD,
    type: UnitType.REGULAR
  });
  
  // Add User Form State
  const [newUserData, setNewUserData] = useState({
    username: '',
    password: '',
    fullName: '',
    rank: 'Binh nhì',
    role: '',
    unit: 'Đại đội 1',
    isAdmin: false,
    readinessScore: 0,
    trainingScore: 0,
    completedTasksCount: 0,
    awardsCount: 0,
    enlistmentDate: '',
    hometown: '',
    phone: '',
    email: ''
  });
  
  // App Settings State
  const [isEditingApp, setIsEditingApp] = useState(false);
  const [tempSlogan, setTempSlogan] = useState(slogan);
  const [tempSubSlogan, setTempSubSlogan] = useState(subSlogan);
  const [tempBannerUrl, setTempBannerUrl] = useState(bannerUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempBannerUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const [isAddingUser, setIsAddingUser] = useState(false);
  const [addUserError, setAddUserError] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleResetAllStats = async () => {
    setIsResetting(true);
    try {
      const promises = users.map(user => 
        updateDoc(doc(db, 'users', user.id), {
          readinessScore: 0,
          trainingScore: 0,
          completedTasksCount: 0,
          awardsCount: 0,
          enlistmentDate: '',
          hometown: '',
          phone: '',
          email: ''
        })
      );
      await Promise.all(promises);
      setShowResetConfirm(false);
    } catch (error) {
      console.error('Error resetting stats:', error);
    } finally {
      setIsResetting(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddingUser(true);
    setAddUserError(null);
    try {
      // 1. Initialize secondary app to create user without logging out admin
      const secondaryAppName = `secondary-${Date.now()}`;
      const secondaryApp = initializeApp(config, secondaryAppName);
      const secondaryAuth = getAuth(secondaryApp);

      // 2. Create Auth account
      const email = `${newUserData.username.trim().toLowerCase()}@ll47.internal`;
      const userCredential = await createUserWithEmailAndPassword(
        secondaryAuth, 
        email,
        newUserData.password
      );
      const authUser = userCredential.user;

      // 3. Update profile display name
      await updateProfile(authUser, { displayName: newUserData.fullName });

      // 4. Create Firestore document with the SAME UID
      const newUser = {
        uid: authUser.uid,
        name: newUserData.fullName || 'Thành viên mới',
        rank: newUserData.rank,
        unit: newUserData.unit,
        role: newUserData.role || 'Chiến sĩ',
        avatarInitials: newUserData.fullName ? newUserData.fullName.split(' ').pop()?.substring(0, 2).toUpperCase() || 'TM' : 'TM',
        isAdmin: newUserData.isAdmin,
        isCommander: false,
        status: 'offline',
        readinessScore: Number(newUserData.readinessScore) || 0,
        trainingScore: Number(newUserData.trainingScore) || 0,
        completedTasksCount: Number(newUserData.completedTasksCount) || 0,
        awardsCount: Number(newUserData.awardsCount) || 0,
        enlistmentDate: newUserData.enlistmentDate,
        hometown: newUserData.hometown,
        phone: newUserData.phone,
        email: newUserData.email,
        createdAt: serverTimestamp()
      };
      
      await setDoc(doc(db, 'users', authUser.uid), newUser);
      
      // 5. Cleanup secondary app
      await signOut(secondaryAuth);
      // Note: We don't strictly need to delete the app but it's good practice if creating many
      
      setShowAddUser(false);
      setNewUserData({ 
        username: '', password: '', fullName: '', rank: 'Binh nhì', role: '', unit: 'Đại đội 1', isAdmin: false,
        readinessScore: 0, trainingScore: 0, completedTasksCount: 0, awardsCount: 0, enlistmentDate: '', hometown: '', phone: '', email: ''
      });
    } catch (error: any) {
      console.error('Error adding user:', error);
      setAddUserError(error.message || 'Lỗi khi tạo tài khoản');
    } finally {
      setIsAddingUser(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      await deleteDoc(doc(db, 'users', userToDelete.id));
      setUserToDelete(null);
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userToEdit) return;
    try {
      await updateDoc(doc(db, 'users', userToEdit.id), {
        name: newUserData.fullName,
        rank: newUserData.rank,
        unit: newUserData.unit,
        role: newUserData.role,
        isAdmin: newUserData.isAdmin,
        readinessScore: Number(newUserData.readinessScore) || 0,
        trainingScore: Number(newUserData.trainingScore) || 0,
        completedTasksCount: Number(newUserData.completedTasksCount) || 0,
        awardsCount: Number(newUserData.awardsCount) || 0,
        enlistmentDate: newUserData.enlistmentDate,
        hometown: newUserData.hometown,
        phone: newUserData.phone,
        email: newUserData.email,
        avatarInitials: newUserData.fullName.split(' ').pop()?.substring(0, 2).toUpperCase() || 'TM'
      });
      setUserToEdit(null);
      setNewUserData({ 
        username: '', password: '', fullName: '', rank: 'Binh nhì', role: '', unit: 'Đại đội 1', isAdmin: false,
        readinessScore: 0, trainingScore: 0, completedTasksCount: 0, awardsCount: 0, enlistmentDate: '', hometown: '', phone: '', email: ''
      });
    } catch (error) {
      console.error('Error editing user:', error);
    }
  };

  const handleAddUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newUnit = {
        name: newUnitData.name,
        parentId: newUnitData.parentId || null,
        level: newUnitData.level,
        type: newUnitData.type,
        membersCount: 0,
        scores: { combat: 0, inspection: 0, hygiene: 0, tasks: 0, total: 0 },
        createdAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, 'units'), newUnit);
      
      // Create automatic group chat for the unit
      await addDoc(collection(db, 'chats'), {
        name: `Nhóm chat ${newUnitData.name}`,
        isGroup: true,
        unitId: docRef.id,
        memberIds: [],
        lastMsg: 'Nhóm chat đã được khởi tạo',
        lastMsgTime: serverTimestamp()
      });

      setShowAddUnit(false);
      setNewUnitData({ name: '', parentId: '', level: UnitLevel.SQUAD, type: UnitType.REGULAR });
    } catch (error) {
      console.error('Error adding unit:', error);
    }
  };

  const handleEditUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unitToEdit) return;
    try {
      await updateDoc(doc(db, 'units', unitToEdit.id), {
        name: newUnitData.name,
        parentId: newUnitData.parentId || null,
        level: newUnitData.level,
        type: newUnitData.type,
      });
      setUnitToEdit(null);
      setNewUnitData({ name: '', parentId: '', level: UnitLevel.SQUAD, type: UnitType.REGULAR });
    } catch (error) {
      console.error('Error editing unit:', error);
    }
  };

  const handleDeleteUnit = async () => {
    if (!unitToDelete) return;
    try {
      await deleteDoc(doc(db, 'units', unitToDelete.id));
      setUnitToDelete(null);
    } catch (error) {
      console.error('Error deleting unit:', error);
    }
  };

  const handleAppointCommander = async (userId: string) => {
    if (!selectedUnitForCommander) return;
    try {
      // Update unit
      await updateDoc(doc(db, 'units', selectedUnitForCommander.id), {
        commanderId: userId
      });
      
      // Update user
      await updateDoc(doc(db, 'users', userId), {
        isCommander: true,
        isAdmin: true,
        unit: selectedUnitForCommander.name
      });

      setShowAppointCommander(false);
      setSelectedUnitForCommander(null);
    } catch (error) {
      console.error('Error appointing commander:', error);
    }
  };

  const handleDismissCommander = async (unitId: string) => {
    const unit = units.find(u => u.id === unitId);
    if (!unit || !unit.commanderId) return;
    try {
      const commanderId = unit.commanderId;
      
      // Update unit
      await updateDoc(doc(db, 'units', unitId), {
        commanderId: null
      });
      
      // Update user
      await updateDoc(doc(db, 'users', commanderId), {
        isCommander: false,
        isAdmin: false
      });
    } catch (error) {
      console.error('Error dismissing commander:', error);
    }
  };

  const handleSaveAppSettings = () => {
    onUpdateSlogan(tempSlogan);
    onUpdateSubSlogan(tempSubSlogan);
    onUpdateBannerUrl(tempBannerUrl);
    setIsEditingApp(false);
  };

  return (
    <div className="flex flex-col h-full bg-army-bg">
      {/* Header */}
      <div className="bg-white px-4 py-4 border-b border-gray-100 flex items-center gap-3">
        <div className="w-10 h-10 bg-red-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-red-500/20">
          <Shield size={20} />
        </div>
        <h1 className="text-xl font-black text-army-gray">Quản trị hệ thống</h1>
      </div>

      {/* Tabs */}
      <div className="bg-white flex border-b border-gray-100">
        <button 
          onClick={() => setActiveTab('users')}
          className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-colors relative ${activeTab === 'users' ? 'text-army-green' : 'text-gray-400'}`}
        >
          Thành viên
          {activeTab === 'users' && <motion.div layoutId="adminTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-army-green" />}
        </button>
        <button 
          onClick={() => setActiveTab('units')}
          className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-colors relative ${activeTab === 'units' ? 'text-army-green' : 'text-gray-400'}`}
        >
          Đơn vị
          {activeTab === 'units' && <motion.div layoutId="adminTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-army-green" />}
        </button>
        <button 
          onClick={() => setActiveTab('app')}
          className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-colors relative ${activeTab === 'app' ? 'text-army-green' : 'text-gray-400'}`}
        >
          Quản lý App
          {activeTab === 'app' && <motion.div layoutId="adminTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-army-green" />}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <AnimatePresence mode="wait">
          {activeTab === 'users' ? (
            <motion.div 
              key="users"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between px-2">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Danh sách quân nhân ({users.length})</h3>
                <button 
                  onClick={() => setShowAddUser(true)}
                  className="flex items-center gap-1.5 bg-army-green text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-md"
                >
                  <Plus size={14} /> Thêm mới
                </button>
              </div>

              <div className="bg-white rounded-3xl overflow-hidden army-shadow">
                {users.map((user, idx) => (
                  <div key={user.id} className={`p-4 flex items-center gap-4 ${idx !== users.length - 1 ? 'border-b border-gray-50' : ''}`}>
                    <RankAvatar rank={user.rank} initials={user.avatarInitials} size="sm" status={user.status} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-army-gray">{user.rank} {user.name}</h4>
                      </div>
                      <p className="text-[10px] text-gray-400 font-medium uppercase">{user.role} • {user.unit}</p>
                    </div>
                    <div className="flex gap-1">
                      <button 
                        onClick={() => {
                          setUserToEdit(user);
                          setNewUserData({
                            username: '', // Mock
                            password: '', // Mock
                            fullName: user.name,
                            rank: user.rank,
                            role: user.role,
                            unit: user.unit,
                            isAdmin: user.isAdmin || false,
                            readinessScore: user.readinessScore || 0,
                            trainingScore: user.trainingScore || 0,
                            completedTasksCount: user.completedTasksCount || 0,
                            awardsCount: user.awardsCount || 0,
                            enlistmentDate: user.enlistmentDate || '',
                            hometown: user.hometown || '',
                            phone: user.phone || '',
                            email: user.email || ''
                          });
                        }}
                        className="p-2 text-gray-400 hover:text-army-green transition-colors"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => setUserToDelete(user)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : activeTab === 'units' ? (
            <motion.div 
              key="units"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between px-2">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Cơ cấu tổ chức ({units.length})</h3>
                <button 
                  onClick={() => setShowAddUnit(true)}
                  className="flex items-center gap-1.5 bg-army-green text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-md"
                >
                  <Plus size={14} /> Tạo đơn vị
                </button>
              </div>

              <div className="bg-white rounded-3xl overflow-hidden army-shadow">
                {units.map((unit, idx) => (
                  <div key={unit.id} className={`p-4 flex items-center gap-4 ${idx !== units.length - 1 ? 'border-b border-gray-50' : ''}`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      unit.type === UnitType.OFFICE ? 'bg-blue-50 text-blue-500' : 
                      unit.type === UnitType.DIRECT ? 'bg-purple-50 text-purple-500' : 
                      'bg-army-green/10 text-army-green'
                    }`}>
                      <LayoutGrid size={20} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-army-gray">{unit.name}</h4>
                        <span className="px-1.5 py-0.5 bg-gray-100 text-gray-400 text-[7px] font-black uppercase rounded-md">
                          {unit.level}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-400 font-medium uppercase">
                        {unit.type === UnitType.OFFICE ? 'Khối Cơ quan' : unit.type === UnitType.DIRECT ? 'Trực thuộc' : 'Đơn vị cơ sở'}
                        {unit.parentId && ` • Thuộc ${units.find(u => u.id === unit.parentId)?.name}`}
                      </p>
                      {unit.commanderId && (
                        <div className="mt-1 flex items-center gap-1.5">
                          <UserCheck size={10} className="text-army-green" />
                          <span className="text-[9px] font-black text-army-green uppercase">
                            Chỉ huy: {users.find(u => u.id === unit.commanderId)?.rank} {users.find(u => u.id === unit.commanderId)?.name}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-1">
                      {unit.commanderId ? (
                        <button 
                          onClick={() => handleDismissCommander(unit.id)}
                          className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                          title="Bãi miễn chỉ huy"
                        >
                          <X size={18} />
                        </button>
                      ) : (
                        <button 
                          onClick={() => {
                            setSelectedUnitForCommander(unit);
                            setShowAppointCommander(true);
                          }}
                          className="p-2 text-army-green hover:bg-army-green/5 rounded-lg transition-colors"
                          title="Bổ nhiệm chỉ huy"
                        >
                          <UserCheck size={18} />
                        </button>
                      )}
                      <button 
                        onClick={() => {
                          setUnitToEdit(unit);
                          setNewUnitData({
                            name: unit.name,
                            parentId: unit.parentId || '',
                            level: unit.level,
                            type: unit.type
                          });
                        }}
                        className="p-2 text-gray-400 hover:text-army-green transition-colors"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => setUnitToDelete(unit)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="app"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-6"
            >
              <section>
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-2">📢 Truyền thông & Thi đua</h3>
                <div className="bg-white rounded-3xl p-6 army-shadow space-y-6">
                  {isEditingApp ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Khẩu hiệu chính</label>
                        <input 
                          type="text"
                          value={tempSlogan}
                          onChange={(e) => setTempSlogan(e.target.value)}
                          className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold italic focus:ring-2 focus:ring-army-green outline-none"
                          placeholder="Nhập khẩu hiệu chính..."
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Câu cổ vũ / Phụ đề</label>
                        <input 
                          type="text"
                          value={tempSubSlogan}
                          onChange={(e) => setTempSubSlogan(e.target.value)}
                          className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-army-green outline-none"
                          placeholder="Nhập câu cổ vũ..."
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ảnh nền (Banner)</label>
                        <div className="flex gap-2">
                          <input 
                            type="text"
                            value={tempBannerUrl}
                            onChange={(e) => setTempBannerUrl(e.target.value)}
                            className="flex-1 bg-gray-50 border-none rounded-2xl p-4 text-[10px] focus:ring-2 focus:ring-army-green outline-none truncate"
                            placeholder="Dán link ảnh hoặc tải lên..."
                          />
                          <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="w-14 bg-army-green/10 text-army-green rounded-2xl flex items-center justify-center hover:bg-army-green/20 transition-colors"
                            title="Tải ảnh từ máy"
                          >
                            <Upload size={20} />
                          </button>
                          <input 
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            className="hidden"
                          />
                        </div>
                        
                        {/* Image Preview in Edit Mode */}
                        <div className="relative h-20 rounded-xl overflow-hidden border border-gray-100 bg-gray-50 mt-2">
                          {tempBannerUrl ? (
                            <img src={tempBannerUrl} className="w-full h-full object-cover" alt="Preview" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <ImageIcon size={24} />
                            </div>
                          )}
                        </div>
                        <p className="text-[8px] text-gray-400 italic ml-1">Bạn có thể dán link ảnh trực tiếp hoặc nhấn nút tải lên để chọn ảnh từ máy tính.</p>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button 
                          onClick={() => {
                            setIsEditingApp(false);
                            setTempSlogan(slogan);
                            setTempSubSlogan(subSlogan);
                            setTempBannerUrl(bannerUrl);
                          }}
                          className="flex-1 bg-gray-100 text-gray-500 font-black py-3 rounded-xl text-xs uppercase"
                        >
                          HỦY
                        </button>
                        <button 
                          onClick={handleSaveAppSettings}
                          className="flex-1 bg-army-green text-white font-black py-3 rounded-xl text-xs uppercase shadow-md"
                        >
                          LƯU THAY ĐỔI
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="relative h-24 rounded-2xl overflow-hidden mb-2">
                        <img src={bannerUrl} className="w-full h-full object-cover opacity-60" alt="Preview" referrerPolicy="no-referrer" />
                        <div className="absolute inset-0 flex flex-col justify-center p-4 bg-black/20">
                          <p className="text-white text-sm font-black italic uppercase">"{slogan}"</p>
                          <p className="text-white/80 text-[8px] font-bold uppercase mt-1">{subSlogan}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setIsEditingApp(true)}
                        className="w-full flex items-center justify-center gap-2 bg-army-green/10 text-army-green font-black py-3 rounded-xl text-xs uppercase hover:bg-army-green/20 transition-colors"
                      >
                        <Edit2 size={14} /> CHỈNH SỬA BANNER
                      </button>
                    </div>
                  )}
                  <p className="text-[10px] text-gray-400 italic">Các thay đổi sẽ được cập nhật tức thì trên trang chủ của toàn bộ quân nhân.</p>
                </div>
              </section>

              <section>
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-2">⚙️ Hệ thống</h3>
                <div className="bg-white rounded-3xl overflow-hidden army-shadow">
                  <button 
                    onClick={() => setShowResetConfirm(true)}
                    className="w-full p-4 flex items-center justify-between border-b border-gray-50 active:bg-gray-50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center">
                        <Trash2 size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-army-gray">Cài đặt lại thông số thực</p>
                        <p className="text-[9px] text-gray-400 uppercase font-bold">Xóa toàn bộ thông số ảo của quân nhân</p>
                      </div>
                    </div>
                    <ChevronRightIcon size={18} className="text-gray-300" />
                  </button>
                  <button className="w-full p-4 flex items-center justify-between border-b border-gray-50 active:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center"><Settings size={20} /></div>
                      <p className="text-sm font-bold text-army-gray">Cấu hình máy chủ</p>
                    </div>
                    <ChevronRightIcon size={18} className="text-gray-300" />
                  </button>
                  <button className="w-full p-4 flex items-center justify-between active:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-purple-50 text-purple-500 rounded-xl flex items-center justify-center"><Shield size={20} /></div>
                      <p className="text-sm font-bold text-army-gray">Nhật ký bảo mật</p>
                    </div>
                    <ChevronRightIcon size={18} className="text-gray-300" />
                  </button>
                </div>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Appoint Commander Modal */}
      <AnimatePresence>
        {showAppointCommander && selectedUnitForCommander && (
          <motion.div 
            key="appoint-commander"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/40 flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm bg-white rounded-[40px] p-8 max-h-[90vh] overflow-y-auto"
            >
              <h2 className="text-xl font-black text-army-gray mb-2">BỔ NHIỆM CHỈ HUY</h2>
              <p className="text-[10px] text-gray-400 font-bold uppercase mb-6 tracking-widest">ĐƠN VỊ: {selectedUnitForCommander.name}</p>
              
              <div className="space-y-2 mb-8">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 block">Chọn quân nhân</label>
                <div className="space-y-1">
                  {users.filter(u => !u.isCommander).map(user => (
                    <button
                      key={user.id}
                      onClick={() => handleAppointCommander(user.id)}
                      className="w-full p-3 flex items-center gap-3 bg-gray-50 hover:bg-army-green/5 rounded-2xl border border-transparent hover:border-army-green/20 transition-all text-left group"
                    >
                      <RankAvatar rank={user.rank} initials={user.avatarInitials} size="xs" />
                      <div className="flex-1">
                        <p className="text-xs font-bold text-army-gray group-hover:text-army-green">{user.rank} {user.name}</p>
                        <p className="text-[9px] text-gray-400 font-medium uppercase">{user.unit} • {user.role}</p>
                      </div>
                      <ChevronRightIcon size={14} className="text-gray-300" />
                    </button>
                  ))}
                  {users.filter(u => !u.isCommander).length === 0 && (
                    <p className="text-center py-4 text-xs text-gray-400 italic">Không có quân nhân khả dụng</p>
                  )}
                </div>
              </div>

              <button 
                onClick={() => {
                  setShowAppointCommander(false);
                  setSelectedUnitForCommander(null);
                }} 
                className="w-full bg-gray-100 text-gray-500 font-black py-4 rounded-2xl text-xs uppercase"
              >
                HỦY BỎ
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add/Edit Unit Modal */}
      <AnimatePresence>
        {(showAddUnit || unitToEdit) && (
          <motion.div 
            key="add-edit-unit"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/40 flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm bg-white rounded-[40px] p-8 max-h-[90vh] overflow-y-auto"
            >
              <h2 className="text-xl font-black text-army-gray mb-6">{unitToEdit ? 'CHỈNH SỬA ĐƠN VỊ' : 'TẠO ĐƠN VỊ MỚI'}</h2>
              <form onSubmit={unitToEdit ? handleEditUnit : handleAddUnit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Tên đơn vị</label>
                  <input 
                    type="text" required 
                    value={newUnitData.name}
                    onChange={(e) => setNewUnitData({...newUnitData, name: e.target.value})}
                    className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-army-green outline-none" 
                    placeholder="Ví dụ: Đại đội 1, Ban Tham mưu..."
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Đơn vị cấp trên</label>
                  <select 
                    value={newUnitData.parentId}
                    onChange={(e) => setNewUnitData({...newUnitData, parentId: e.target.value})}
                    className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-army-green outline-none"
                  >
                    <option value="">Không có (Cấp cao nhất)</option>
                    {units.filter(u => u.id !== unitToEdit?.id).map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Cấp bậc đơn vị</label>
                  <select 
                    value={newUnitData.level}
                    onChange={(e) => setNewUnitData({...newUnitData, level: e.target.value as UnitLevel})}
                    className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-army-green outline-none"
                  >
                    <option value={UnitLevel.SQUAD}>Tiểu đội</option>
                    <option value={UnitLevel.PLATOON}>Trung đội</option>
                    <option value={UnitLevel.COMPANY}>Đại đội</option>
                    <option value={UnitLevel.BATTALION}>Tiểu đoàn</option>
                    <option value={UnitLevel.REGIMENT}>Trung đoàn</option>
                    <option value={UnitLevel.DIVISION}>Sư đoàn</option>
                    <option value={UnitLevel.REGION}>Quân khu</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Loại hình đơn vị</label>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { id: UnitType.REGULAR, label: 'Đơn vị cơ sở (Đại đội, Tiểu đoàn...)' },
                      { id: UnitType.OFFICE, label: 'Khối Cơ quan (Ban, Phòng...)' },
                      { id: UnitType.DIRECT, label: 'Đơn vị Trực thuộc' },
                    ].map(t => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setNewUnitData({...newUnitData, type: t.id})}
                        className={`p-4 rounded-2xl text-left text-xs font-bold border-2 transition-all ${
                          newUnitData.type === t.id ? 'border-army-green bg-army-green/5 text-army-green' : 'border-gray-50 text-gray-400'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button 
                    type="button" 
                    onClick={() => {
                      setShowAddUnit(false);
                      setUnitToEdit(null);
                      setNewUnitData({ name: '', parentId: '', level: UnitLevel.SQUAD, type: UnitType.REGULAR });
                    }} 
                    className="flex-1 bg-gray-100 text-gray-500 font-black py-4 rounded-2xl text-xs uppercase"
                  >
                    HỦY
                  </button>
                  <button type="submit" className="flex-1 bg-army-green text-white font-black py-4 rounded-2xl text-xs uppercase shadow-lg">XÁC NHẬN</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Add/Edit User Modal */}
      <AnimatePresence>
        {(showAddUser || userToEdit) && (
          <motion.div 
            key="add-edit-user"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/40 flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm bg-white rounded-[40px] p-8 max-h-[90vh] overflow-y-auto"
            >
              <h2 className="text-xl font-black text-army-gray mb-6">{userToEdit ? 'CHỈNH SỬA QUÂN NHÂN' : 'THÊM QUÂN NHÂN'}</h2>
              
              {addUserError && (
                <div className="bg-red-50 text-red-500 text-[10px] font-bold p-3 rounded-xl border border-red-100 mb-4">
                  {addUserError}
                </div>
              )}

              <form onSubmit={userToEdit ? handleEditUser : handleAddUser} className="space-y-4">
                {!userToEdit && (
                  <>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Tên đăng nhập</label>
                      <input 
                        type="text" 
                        required 
                        value={newUserData.username}
                        onChange={(e) => setNewUserData({...newUserData, username: e.target.value})}
                        className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-army-green outline-none" 
                        placeholder="Nhập tên đăng nhập (ví dụ: nguyenvanan)..."
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Mật khẩu</label>
                      <input 
                        type="password" 
                        required 
                        value={newUserData.password}
                        onChange={(e) => setNewUserData({...newUserData, password: e.target.value})}
                        className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-army-green outline-none" 
                        placeholder="Nhập mật khẩu..."
                      />
                    </div>
                  </>
                )}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Họ và tên</label>
                  <input 
                    type="text" 
                    required 
                    value={newUserData.fullName}
                    onChange={(e) => setNewUserData({...newUserData, fullName: e.target.value})}
                    className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-army-green outline-none" 
                    placeholder="Nhập họ và tên..."
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Cấp bậc</label>
                  <select 
                    value={newUserData.rank}
                    onChange={(e) => setNewUserData({...newUserData, rank: e.target.value})}
                    className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-army-green outline-none"
                  >
                    <optgroup label="Chiến sĩ">
                      <option>Binh nhì</option>
                      <option>Binh nhất</option>
                    </optgroup>
                    <optgroup label="Hạ sĩ quan">
                      <option>Hạ sĩ</option>
                      <option>Trung sĩ</option>
                      <option>Thượng sĩ</option>
                    </optgroup>
                    <optgroup label="Cấp Úy">
                      <option>Thiếu úy</option>
                      <option>Trung úy</option>
                      <option>Thượng úy</option>
                      <option>Đại úy</option>
                    </optgroup>
                    <optgroup label="Cấp Tá">
                      <option>Thiếu tá</option>
                      <option>Trung tá</option>
                      <option>Thượng tá</option>
                      <option>Đại tá</option>
                    </optgroup>
                    <optgroup label="Cấp Tướng">
                      <option>Thiếu tướng</option>
                      <option>Trung tướng</option>
                      <option>Thượng tướng</option>
                      <option>Đại tướng</option>
                    </optgroup>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Chức vụ</label>
                  <input 
                    type="text" 
                    required 
                    value={newUserData.role}
                    onChange={(e) => setNewUserData({...newUserData, role: e.target.value})}
                    className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-army-green outline-none" 
                    placeholder="Nhập chức vụ..."
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Đơn vị</label>
                  <select 
                    value={newUserData.unit}
                    onChange={(e) => setNewUserData({...newUserData, unit: e.target.value})}
                    className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-army-green outline-none"
                  >
                    {units.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
                  </select>
                  <p className="text-[9px] text-army-green font-bold mt-1 ml-1 uppercase italic">
                    * Quân nhân sẽ tự động được thêm vào nhóm chat của đơn vị
                  </p>
                </div>
                <div className="space-y-1">
                  <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl cursor-pointer hover:bg-army-green/5 transition-colors">
                    <div className="flex-1">
                      <p className="text-xs font-bold text-army-gray">Quyền Quản trị (Admin)</p>
                      <p className="text-[9px] text-gray-400 uppercase font-bold">Cho phép truy cập bảng điều khiển này</p>
                    </div>
                    <input 
                      type="checkbox"
                      checked={newUserData.isAdmin}
                      onChange={(e) => setNewUserData({...newUserData, isAdmin: e.target.checked})}
                      className="w-5 h-5 rounded border-gray-300 text-army-green focus:ring-army-green"
                    />
                  </label>
                </div>

                <div className="bg-gray-50/50 p-4 rounded-3xl space-y-4 border border-gray-100">
                  <h3 className="text-[10px] font-black text-army-green uppercase tracking-widest">Thông số huấn luyện & Cá nhân</h3>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Sẵn sàng (%)</label>
                      <input 
                        type="number" 
                        value={newUserData.readinessScore}
                        onChange={(e) => setNewUserData({...newUserData, readinessScore: Number(e.target.value)})}
                        className="w-full bg-white border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-army-green outline-none" 
                        placeholder="0-100"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Điểm huấn luyện</label>
                      <input 
                        type="number" 
                        step="0.1"
                        value={newUserData.trainingScore}
                        onChange={(e) => setNewUserData({...newUserData, trainingScore: Number(e.target.value)})}
                        className="w-full bg-white border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-army-green outline-none" 
                        placeholder="0.0"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nhiệm vụ xong</label>
                      <input 
                        type="number" 
                        value={newUserData.completedTasksCount}
                        onChange={(e) => setNewUserData({...newUserData, completedTasksCount: Number(e.target.value)})}
                        className="w-full bg-white border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-army-green outline-none" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Khen thưởng</label>
                      <input 
                        type="number" 
                        value={newUserData.awardsCount}
                        onChange={(e) => setNewUserData({...newUserData, awardsCount: Number(e.target.value)})}
                        className="w-full bg-white border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-army-green outline-none" 
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Ngày nhập ngũ</label>
                    <input 
                      type="date" 
                      value={newUserData.enlistmentDate}
                      onChange={(e) => setNewUserData({...newUserData, enlistmentDate: e.target.value})}
                      className="w-full bg-white border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-army-green outline-none" 
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Quê quán</label>
                    <input 
                      type="text" 
                      value={newUserData.hometown}
                      onChange={(e) => setNewUserData({...newUserData, hometown: e.target.value})}
                      className="w-full bg-white border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-army-green outline-none" 
                      placeholder="Nhập quê quán..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">SĐT</label>
                      <input 
                        type="tel" 
                        value={newUserData.phone}
                        onChange={(e) => setNewUserData({...newUserData, phone: e.target.value})}
                        className="w-full bg-white border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-army-green outline-none" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email</label>
                      <input 
                        type="email" 
                        value={newUserData.email}
                        onChange={(e) => setNewUserData({...newUserData, email: e.target.value})}
                        className="w-full bg-white border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-army-green outline-none" 
                      />
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button 
                    type="button" 
                    onClick={() => {
                      setShowAddUser(false);
                      setUserToEdit(null);
                      setNewUserData({
                        username: '',
                        password: '',
                        fullName: '',
                        rank: 'Binh nhì',
                        role: '',
                        unit: 'Đại đội 1'
                      });
                    }} 
                    className="flex-1 bg-gray-100 text-gray-500 font-black py-4 rounded-2xl text-xs uppercase"
                  >
                    HỦY
                  </button>
                  <button 
                    type="submit" 
                    disabled={isAddingUser}
                    className="flex-1 bg-army-green text-white font-black py-4 rounded-2xl text-xs uppercase shadow-lg flex items-center justify-center gap-2"
                  >
                    {isAddingUser && <Loader2 size={14} className="animate-spin" />}
                    {isAddingUser ? 'ĐANG TẠO...' : 'XÁC NHẬN'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reset Confirmation */}
      <AnimatePresence>
        {showResetConfirm && (
          <motion.div 
            key="reset-confirm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-[60] bg-black/40 flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm bg-white rounded-[40px] p-8 text-center"
            >
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={32} />
              </div>
              <h2 className="text-lg font-black text-army-gray mb-2 text-center">XÁC NHẬN CÀI LẠI</h2>
              <p className="text-xs text-gray-400 mb-8 text-center">
                Bạn có chắc chắn muốn xóa toàn bộ thông số ảo và đưa về thông số thực (0)? Hành động này ảnh hưởng đến <span className="font-bold text-army-gray">{users.length} quân nhân</span>.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowResetConfirm(false)} 
                  className="flex-1 bg-gray-100 text-gray-500 font-black py-4 rounded-2xl text-xs uppercase"
                >
                  HỦY
                </button>
                <button 
                  onClick={handleResetAllStats} 
                  disabled={isResetting}
                  className="flex-1 bg-red-500 text-white font-black py-4 rounded-2xl text-xs uppercase shadow-lg shadow-red-500/20 flex items-center justify-center gap-2"
                >
                  {isResetting && <Loader2 size={14} className="animate-spin" />}
                  {isResetting ? 'ĐANG XỬ LÝ...' : 'XÁC NHẬN XÓA'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {(userToDelete || unitToDelete) && (
          <motion.div 
            key="delete-confirm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/40 flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm bg-white rounded-[40px] p-8 text-center"
            >
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={32} />
              </div>
              <h2 className="text-lg font-black text-army-gray mb-2">XÁC NHẬN XÓA</h2>
              <p className="text-xs text-gray-400 mb-8">
                Bạn có chắc chắn muốn xóa <span className="font-bold text-army-gray">
                  {userToDelete ? `${userToDelete.rank} ${userToDelete.name}` : unitToDelete?.name}
                </span>? Hành động này không thể hoàn tác.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    setUserToDelete(null);
                    setUnitToDelete(null);
                  }} 
                  className="flex-1 bg-gray-100 text-gray-500 font-black py-4 rounded-2xl text-xs uppercase"
                >
                  HỦY
                </button>
                <button 
                  onClick={userToDelete ? handleDeleteUser : handleDeleteUnit} 
                  className="flex-1 bg-red-500 text-white font-black py-4 rounded-2xl text-xs uppercase shadow-lg shadow-red-500/20"
                >
                  XÓA NGAY
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
