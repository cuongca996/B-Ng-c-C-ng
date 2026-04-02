import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  UserPlus, 
  Users, 
  ChevronRight, 
  ChevronDown, 
  Building2, 
  User as UserIcon,
  Phone,
  MessageSquare,
  MoreVertical,
  Plus,
  Trash2,
  X
} from 'lucide-react';
import { Unit, Contact, UnitLevel, UnitType } from '../types';

// --- Mock Data ---
const INITIAL_UNITS: Unit[] = [
  {
    id: 'u1',
    name: 'Tiểu đoàn 1',
    parentId: null,
    level: UnitLevel.BATTALION,
    type: UnitType.REGULAR,
    scores: { combat: 0, inspection: 0, hygiene: 0, tasks: 0, total: 0 },
    membersCount: 450,
    children: [
      {
        id: 'u1-1',
        name: 'Đại đội 1',
        parentId: 'u1',
        level: UnitLevel.COMPANY,
        type: UnitType.REGULAR,
        scores: { combat: 0, inspection: 0, hygiene: 0, tasks: 0, total: 0 },
        membersCount: 120,
        children: [
          { id: 'u1-1-1', name: 'Trung đội 1', parentId: 'u1-1', level: UnitLevel.PLATOON, type: UnitType.REGULAR, scores: { combat: 0, inspection: 0, hygiene: 0, tasks: 0, total: 0 }, membersCount: 35 },
          { id: 'u1-1-2', name: 'Trung đội 2', parentId: 'u1-1', level: UnitLevel.PLATOON, type: UnitType.REGULAR, scores: { combat: 0, inspection: 0, hygiene: 0, tasks: 0, total: 0 }, membersCount: 35 },
        ]
      },
      {
        id: 'u1-2',
        name: 'Đại đội 2',
        parentId: 'u1',
        level: UnitLevel.COMPANY,
        type: UnitType.REGULAR,
        scores: { combat: 0, inspection: 0, hygiene: 0, tasks: 0, total: 0 },
        membersCount: 115,
      }
    ]
  }
];

const MOCK_CONTACTS: Contact[] = [
  {
    id: 'c1',
    name: 'Nguyễn Văn Hùng',
    rank: 'Thiếu úy',
    unit: 'Trung đội 1',
    role: 'Trung đội phó',
    avatarInitials: 'VH',
    isFriend: true,
    status: 'online'
  },
  {
    id: 'c2',
    name: 'Lê Minh Tâm',
    rank: 'Trung úy',
    unit: 'Đại đội 1',
    role: 'Chính trị viên',
    avatarInitials: 'MT',
    isFriend: true,
    status: 'busy'
  },
  {
    id: 'c3',
    name: 'Phạm Quốc Bảo',
    rank: 'Thượng sĩ',
    unit: 'Trung đội 2',
    role: 'Tiểu đội trưởng',
    avatarInitials: 'QB',
    isFriend: false,
    status: 'offline'
  }
];

interface ContactsScreenProps {
  isAdmin: boolean;
  onSearchFriends: () => void;
  onSelectContact: (contact: Contact) => void;
  onSelectUnit: (unit: Unit) => void;
  onShowFriendRequests: () => void;
}

export const ContactsScreen: React.FC<ContactsScreenProps> = ({ 
  isAdmin,
  onSearchFriends, 
  onSelectContact, 
  onSelectUnit,
  onShowFriendRequests
}) => {
  const [activeTab, setActiveTab] = useState<'friends' | 'units'>('friends');
  const [units, setUnits] = useState<Unit[]>(INITIAL_UNITS);
  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set(['u1', 'u1-1']));
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUnitName, setNewUnitName] = useState('');
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);

  const toggleUnit = (unitId: string) => {
    const newExpanded = new Set(expandedUnits);
    if (newExpanded.has(unitId)) {
      newExpanded.delete(unitId);
    } else {
      newExpanded.add(unitId);
    }
    setExpandedUnits(newExpanded);
  };

  const handleAddUnit = () => {
    if (!newUnitName.trim()) return;

    const newUnit: Unit = {
      id: `u-${Date.now()}`,
      name: newUnitName,
      parentId: selectedParentId,
      level: selectedParentId ? UnitLevel.COMPANY : UnitLevel.BATTALION, // Simplified level logic
      type: UnitType.REGULAR,
      scores: { combat: 0, inspection: 0, hygiene: 0, tasks: 0, total: 0 },
      membersCount: 0
    };

    const updateUnits = (list: Unit[]): Unit[] => {
      if (!selectedParentId) return [...list, newUnit];
      return list.map(u => {
        if (u.id === selectedParentId) {
          return { ...u, children: [...(u.children || []), newUnit] };
        }
        if (u.children) {
          return { ...u, children: updateUnits(u.children) };
        }
        return u;
      });
    };

    setUnits(updateUnits(units));
    setNewUnitName('');
    setShowAddModal(false);
    setSelectedParentId(null);
  };

  const handleDeleteUnit = (unitId: string) => {
    const removeUnit = (list: Unit[]): Unit[] => {
      return list.filter(u => u.id !== unitId).map(u => ({
        ...u,
        children: u.children ? removeUnit(u.children) : undefined
      }));
    };
    setUnits(removeUnit(units));
  };

  const renderUnitTree = (units: Unit[]) => {
    return units.map(unit => (
      <div key={unit.id} className="ml-4">
        <div 
          className="flex items-center py-2 px-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors group"
          onClick={() => {
            if (unit.children) {
              toggleUnit(unit.id);
            } else {
              onSelectUnit(unit);
            }
          }}
        >
          {unit.children ? (
            expandedUnits.has(unit.id) ? <ChevronDown size={16} className="text-gray-400 mr-2" /> : <ChevronRight size={16} className="text-gray-400 mr-2" />
          ) : (
            <div className="w-4 mr-2" />
          )}
          <Building2 size={18} className="text-army-green mr-3" />
          <div className="flex-1">
            <p className="text-sm font-bold text-army-gray">{unit.name}</p>
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{unit.membersCount} quân số</p>
          </div>
          
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {isAdmin && (
              <>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedParentId(unit.id);
                    setShowAddModal(true);
                  }}
                  className="p-1.5 text-army-green hover:bg-army-green/10 rounded-lg"
                >
                  <Plus size={14} />
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteUnit(unit.id);
                  }}
                  className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 size={14} />
                </button>
              </>
            )}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onSelectUnit(unit);
              }}
              className="p-2 text-gray-300 hover:text-army-green transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
        {unit.children && expandedUnits.has(unit.id) && (
          <div className="border-l border-gray-100 ml-5 mt-1">
            {renderUnitTree(unit.children)}
          </div>
        )}
      </div>
    ));
  };

  const filteredContacts = MOCK_CONTACTS.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.unit.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-army-bg relative">
      {/* Header */}
      <div className="bg-white p-4 sticky top-0 z-10 zalo-shadow">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-bold text-army-gray">Danh bạ</h1>
          <button 
            onClick={onSearchFriends}
            className="p-2 text-army-green hover:bg-army-green/5 rounded-full transition-colors"
          >
            <UserPlus size={22} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text"
            placeholder="Tìm kiếm bạn bè, đơn vị..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-100 border-none rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-army-green outline-none"
          />
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button 
            onClick={() => setActiveTab('friends')}
            className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
              activeTab === 'friends' ? 'bg-white text-army-green shadow-sm' : 'text-gray-500'
            }`}
          >
            Bạn bè
          </button>
          <button 
            onClick={() => setActiveTab('units')}
            className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
              activeTab === 'units' ? 'bg-white text-army-green shadow-sm' : 'text-gray-500'
            }`}
          >
            Đơn vị
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <AnimatePresence mode="wait">
          {activeTab === 'friends' ? (
            <motion.div
              key="friends"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <button 
                  onClick={onShowFriendRequests}
                  className="bg-white p-3 rounded-2xl flex items-center gap-3 shadow-sm active:scale-95 transition-transform"
                >
                  <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center">
                    <UserPlus size={20} />
                  </div>
                  <span className="text-xs font-bold text-army-gray">Lời mời kết bạn</span>
                </button>
                <button className="bg-white p-3 rounded-2xl flex items-center gap-3 shadow-sm active:scale-95 transition-transform">
                  <div className="w-10 h-10 bg-army-green/10 text-army-green rounded-full flex items-center justify-center">
                    <Users size={20} />
                  </div>
                  <span className="text-xs font-bold text-army-gray">Danh sách nhóm</span>
                </button>
              </div>

              {/* Contacts List */}
              <div className="bg-white rounded-3xl p-2 shadow-sm">
                {filteredContacts.map(contact => (
                  <div 
                    key={contact.id}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-2xl cursor-pointer transition-colors"
                    onClick={() => onSelectContact(contact)}
                  >
                    <div className="relative">
                      <div className="w-12 h-12 bg-army-green/10 rounded-full flex items-center justify-center">
                        <span className="text-lg font-black text-army-green">{contact.avatarInitials}</span>
                      </div>
                      {contact.status === 'online' && (
                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full" />
                      )}
                      {contact.status === 'busy' && (
                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-red-500 border-2 border-white rounded-full" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-army-gray">{contact.rank} {contact.name}</h4>
                      <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{contact.unit} • {contact.role}</p>
                    </div>
                    <div className="flex gap-1">
                      <button className="p-2 text-gray-400 hover:text-army-green transition-colors">
                        <Phone size={18} />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-army-green transition-colors">
                        <MessageSquare size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="units"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white rounded-3xl p-2 shadow-sm"
            >
              <div className="p-2">
                <div className="flex items-center justify-between mb-4 ml-4 pr-2">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sơ đồ tổ chức</h3>
                  {isAdmin && (
                    <button 
                      onClick={() => {
                        setSelectedParentId(null);
                        setShowAddModal(true);
                      }}
                      className="p-1.5 bg-army-green/10 text-army-green rounded-lg hover:bg-army-green/20 transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  )}
                </div>
                {renderUnitTree(units)}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Add Unit Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white w-full max-w-xs rounded-3xl p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-black text-army-gray">Thêm đơn vị mới</h3>
                <button onClick={() => setShowAddModal(false)} className="text-gray-400"><X size={24} /></button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block">Tên đơn vị</label>
                  <input 
                    type="text" 
                    value={newUnitName}
                    onChange={(e) => setNewUnitName(e.target.value)}
                    placeholder="Ví dụ: Trung đội 3"
                    className="w-full bg-gray-100 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-army-green outline-none"
                    autoFocus
                  />
                </div>
                
                {selectedParentId && (
                  <div className="bg-army-green/5 p-3 rounded-2xl">
                    <p className="text-[10px] text-army-green font-bold uppercase">Đơn vị cha:</p>
                    <p className="text-xs font-bold text-army-gray">
                      {/* Find parent name logic could be added here */}
                      ID: {selectedParentId}
                    </p>
                  </div>
                )}

                <button 
                  onClick={handleAddUnit}
                  disabled={!newUnitName.trim()}
                  className="w-full bg-army-green text-white font-black py-4 rounded-2xl shadow-lg active:scale-95 transition-transform disabled:opacity-50"
                >
                  XÁC NHẬN THÊM
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
