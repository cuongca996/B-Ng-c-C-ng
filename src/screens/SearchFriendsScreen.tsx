import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { QRCodeSVG } from 'qrcode.react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { 
  Search, 
  ArrowLeft, 
  UserPlus, 
  UserCheck, 
  Clock, 
  User as UserIcon,
  ShieldCheck,
  QrCode,
  ScanLine,
  X
} from 'lucide-react';
import { User } from '../types';
import { QuickProfileModal } from '../components/QuickProfileModal';

interface SearchFriendsScreenProps {
  currentUser: User;
  onBack: () => void;
}

const MOCK_SEARCH_RESULTS: User[] = [
  {
    id: 's1',
    name: 'Nguyễn Văn Hùng',
    rank: 'Thiếu úy',
    unit: 'Trung đội 1',
    role: 'Trung đội phó',
    avatarInitials: 'VH',
    readinessScore: 92,
    medals: ['Chiến sĩ thi đua'],
  },
  {
    id: 's2',
    name: 'Lê Minh Tâm',
    rank: 'Trung úy',
    unit: 'Đại đội 1',
    role: 'Chính trị viên',
    avatarInitials: 'MT',
    readinessScore: 88,
    medals: ['Huân chương hạng Ba'],
  },
  {
    id: 's3',
    name: 'Phạm Quốc Bảo',
    rank: 'Thượng sĩ',
    unit: 'Trung đội 2',
    role: 'Tiểu đội trưởng',
    avatarInitials: 'QB',
    readinessScore: 95,
    medals: ['Chiến sĩ thi đua', 'Bằng khen'],
  }
];

export const SearchFriendsScreen: React.FC<SearchFriendsScreenProps> = ({ currentUser, onBack }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<User[]>([]);
  const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());
  const [showMyQR, setShowMyQR] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [scannedUser, setScannedUser] = useState<User | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    if (showScanner) {
      // Initialize scanner after modal is rendered
      const timer = setTimeout(() => {
        const scanner = new Html5QrcodeScanner(
          "qr-reader",
          { fps: 10, qrbox: { width: 250, height: 250 } },
          /* verbose= */ false
        );
        
        scanner.render(
          (decodedText) => {
            // Success callback
            console.log(`QR Code decoded: ${decodedText}`);
            setSearchQuery(decodedText);
            setShowScanner(false);
            scanner.clear();
            
            // Check if scanned text is a user ID
            const foundUser = MOCK_SEARCH_RESULTS.find(u => u.id === decodedText);
            if (foundUser) {
              setScannedUser(foundUser);
            } else {
              // Trigger search automatically if not a direct ID match
              handleSearchManual(decodedText);
            }
          },
          (error) => {
            // Error callback (usually just "QR code not found" while scanning)
            // console.warn(error);
          }
        );
        
        scannerRef.current = scanner;
      }, 500);

      return () => {
        clearTimeout(timer);
        if (scannerRef.current) {
          scannerRef.current.clear().catch(err => console.error("Failed to clear scanner", err));
        }
      };
    }
  }, [showScanner]);

  const handleSearchManual = (query: string) => {
    if (!query.trim()) return;

    setIsSearching(true);
    setTimeout(() => {
      const filtered = MOCK_SEARCH_RESULTS.filter(u => 
        u.name.toLowerCase().includes(query.toLowerCase()) ||
        u.unit.toLowerCase().includes(query.toLowerCase()) ||
        u.id.toLowerCase() === query.toLowerCase()
      );
      setResults(filtered);
      setIsSearching(false);
    }, 800);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearchManual(searchQuery);
  };

  const toggleRequest = (userId: string) => {
    const newSent = new Set(sentRequests);
    if (newSent.has(userId)) {
      newSent.delete(userId);
    } else {
      newSent.add(userId);
    }
    setSentRequests(newSent);
  };

  return (
    <div className="flex flex-col h-full bg-army-bg relative">
      {/* Header */}
      <div className="bg-white p-4 sticky top-0 z-10 zalo-shadow">
        <div className="flex items-center gap-4 mb-4">
          <button onClick={onBack} className="p-2 text-army-gray hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft size={22} />
          </button>
          <h1 className="text-lg font-bold text-army-gray">Tìm kiếm bạn bè</h1>
        </div>

        <form onSubmit={handleSearch} className="relative flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder="Nhập tên, đơn vị, số điện thoại..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              className="w-full bg-gray-100 border-none rounded-xl pl-10 pr-20 py-3 text-sm focus:ring-2 focus:ring-army-green outline-none"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <button 
                type="button"
                onClick={() => setShowMyQR(true)}
                className="p-2 text-army-gray hover:bg-gray-200 rounded-lg transition-colors"
                title="Mã QR của tôi"
              >
                <QrCode size={18} />
              </button>
              <button 
                type="button"
                onClick={() => setShowScanner(true)}
                className="p-2 text-army-gray hover:bg-gray-200 rounded-lg transition-colors"
                title="Quét mã QR"
              >
                <ScanLine size={18} />
              </button>
            </div>
          </div>
          {searchQuery && (
            <button 
              type="submit"
              className="bg-army-green text-white text-[10px] font-black px-4 py-3 rounded-xl uppercase tracking-wider shadow-sm active:scale-95 transition-transform"
            >
              Tìm
            </button>
          )}
        </form>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <AnimatePresence mode="wait">
          {isSearching ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <div className="w-10 h-10 border-4 border-army-green border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Đang tìm kiếm...</p>
            </motion.div>
          ) : results.length > 0 ? (
            <motion.div 
              key="results"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-2">Kết quả tìm kiếm</h3>
              {results.map(user => (
                <div key={user.id} className="bg-white p-4 rounded-3xl flex items-center gap-4 shadow-sm">
                  <div className="w-14 h-14 bg-army-green/10 rounded-full flex items-center justify-center">
                    <span className="text-xl font-black text-army-green">{user.avatarInitials}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-army-gray">{user.rank} {user.name}</h4>
                    <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{user.unit} • {user.role}</p>
                  </div>
                  <button 
                    onClick={() => toggleRequest(user.id)}
                    className={`p-3 rounded-2xl transition-all active:scale-95 ${
                      sentRequests.has(user.id) 
                        ? 'bg-gray-100 text-gray-400' 
                        : 'bg-army-green text-white shadow-sm'
                    }`}
                  >
                    {sentRequests.has(user.id) ? <Clock size={20} /> : <UserPlus size={20} />}
                  </button>
                </div>
              ))}
            </motion.div>
          ) : searchQuery && !isSearching ? (
            <motion.div 
              key="no-results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 text-gray-400"
            >
              <UserIcon size={48} className="mb-4 opacity-20" />
              <p className="text-sm font-bold uppercase tracking-widest">Không tìm thấy kết quả</p>
            </motion.div>
          ) : (
            <motion.div 
              key="initial"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {/* Suggestions */}
              <div className="bg-white p-6 rounded-3xl shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <ShieldCheck size={18} className="text-army-green" />
                  <h3 className="text-xs font-black text-army-gray uppercase tracking-widest">Gợi ý kết bạn</h3>
                </div>
                <div className="space-y-4">
                  {MOCK_SEARCH_RESULTS.slice(0, 2).map(user => (
                    <div key={user.id} className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-army-green/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-black text-army-green">{user.avatarInitials}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-army-gray">{user.name}</p>
                        <p className="text-[9px] text-gray-400 font-medium uppercase">{user.unit}</p>
                      </div>
                      <button className="text-army-green text-[10px] font-black uppercase tracking-wider px-3 py-1.5 bg-army-green/5 rounded-lg">
                        Kết bạn
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* QR Code Modal */}
      <AnimatePresence>
        {showMyQR && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
            onClick={() => setShowMyQR(false)}
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
                onClick={() => setShowMyQR(false)}
                className="w-full py-4 bg-army-green text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-army-green/20 active:scale-95 transition-transform"
              >
                Đóng
              </button>
            </motion.div>
          </motion.div>
        )}

        {showScanner && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[60] bg-black flex flex-col"
          >
            <div className="p-6 flex items-center justify-between text-white relative z-10">
              <button onClick={() => setShowScanner(false)} className="p-2 bg-white/10 rounded-full backdrop-blur-md">
                <ArrowLeft size={24} />
              </button>
              <h3 className="text-sm font-black uppercase tracking-widest text-army-green">Quét mã QR thật</h3>
              <div className="w-10" />
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-6">
              <div id="qr-reader" className="w-full max-w-sm overflow-hidden rounded-3xl border-2 border-army-green/30 bg-gray-900 shadow-2xl">
                {/* Html5QrcodeScanner will render here */}
              </div>
              
              <div className="mt-8 text-center px-10">
                <p className="text-white/70 text-xs font-bold uppercase tracking-widest leading-relaxed">
                  Cấp quyền Camera và đưa mã QR<br/>vào khung để quét tự động
                </p>
              </div>
            </div>

            <div className="p-10 flex justify-center">
              <button 
                onClick={() => setShowScanner(false)}
                className="px-8 py-4 bg-white/10 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] backdrop-blur-md border border-white/10"
              >
                Hủy bỏ
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Profile Modal for Scanned User */}
      <QuickProfileModal 
        user={scannedUser}
        isOpen={!!scannedUser}
        onClose={() => setScannedUser(null)}
        onAddFriend={(id) => {
          toggleRequest(id);
          setScannedUser(null);
        }}
      />
    </div>
  );
};
