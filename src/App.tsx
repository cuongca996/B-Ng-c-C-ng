import React, { useState, useEffect, Component, ErrorInfo, ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Home, ClipboardList, MessageCircle, Trophy, User as UserIcon, BookOpen, Shield, AlertTriangle } from 'lucide-react';
import { Task, TaskStatus, ChatItem, Contact, Unit, NotificationSettings, NotificationType, AppNotification, UnitLevel, User } from './types';
import { auth, db } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, onSnapshot, query, where, orderBy, doc, getDoc, addDoc, serverTimestamp, updateDoc } from 'firebase/firestore';

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean, error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-6 bg-red-50 text-center">
          <AlertTriangle size={48} className="text-red-500 mb-4" />
          <h2 className="text-lg font-bold text-red-900 mb-2">Đã xảy ra lỗi hiển thị</h2>
          <p className="text-sm text-red-700 mb-4">{this.state.error?.message}</p>
          <button 
            onClick={() => this.setState({ hasError: false })}
            className="px-6 py-2 bg-red-500 text-white rounded-xl font-bold"
          >
            Thử lại
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Import Screens
import { SplashScreen } from './screens/SplashScreen';
import { LoginScreen } from './screens/LoginScreen';
import { HomeScreen } from './screens/HomeScreen';
import { TaskScreen } from './screens/TaskScreen';
import { ChatScreen } from './screens/ChatScreen';
import { ChatDetailScreen } from './screens/ChatDetailScreen';
import { LeaderboardScreen } from './screens/LeaderboardScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { AdminScreen } from './screens/AdminScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { ContactsScreen } from './screens/ContactsScreen';
import { SearchFriendsScreen } from './screens/SearchFriendsScreen';
import { TaskDetailScreen } from './screens/TaskDetailScreen';
import { UnitDetailScreen } from './screens/UnitDetailScreen';
import { FriendRequestsScreen } from './screens/FriendRequestsScreen';
import { TaskReportScreen } from './screens/TaskReportScreen';
import { CreateTaskScreen } from './screens/CreateTaskScreen';
import { TestScreen } from './screens/TestScreen';
import { DocumentScreen } from './screens/DocumentScreen';
import { QuickReportScreen } from './screens/QuickReportScreen';
import { ScheduleScreen } from './screens/ScheduleScreen';
import { LegalScreen } from './screens/LegalScreen';

import { QRModal } from './components/QRModal';
import { NotificationSettingsModal } from './components/NotificationSettingsModal';
import { NotificationListModal } from './components/NotificationListModal';

// --- Mock Data ---
const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'n1',
    type: NotificationType.TASK_COMBAT,
    title: 'Mệnh lệnh khẩn cấp',
    content: 'Báo cáo tình hình đấu tranh trên không gian mạng của trung đội 1.',
    timestamp: 'Vừa xong',
    isRead: false,
    targetId: '1'
  }
];

type TabId = 'home' | 'tasks' | 'chat' | 'contacts' | 'rank' | 'profile' | 'admin';

export default function App() {
  const [appState, setAppState] = useState<'splash' | 'login' | 'main'>('splash');
  const [currentTab, setCurrentTab] = useState<TabId>('home');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  
  // Overlays State
  const [selectedChat, setSelectedChat] = useState<ChatItem | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [showSearchFriends, setShowSearchFriends] = useState(false);
  const [showFriendRequests, setShowFriendRequests] = useState(false);
  const [reportingTask, setReportingTask] = useState<Task | null>(null);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showTestScreen, setShowTestScreen] = useState(false);
  const [showDocumentScreen, setShowDocumentScreen] = useState(false);
  const [showQuickReport, setShowQuickReport] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [showLegalScreen, setShowLegalScreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showMyQR, setShowMyQR] = useState(false);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const [showNotificationList, setShowNotificationList] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const [totalUnreadChats, setTotalUnreadChats] = useState(0);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    mutedTypes: [],
    muteUntil: null
  });
  const [slogan, setSlogan] = useState('QUYẾT CHIẾN - QUYẾT THẮNG');
  const [subSlogan, setSubSlogan] = useState('Phong trào thi đua quyết thắng 2026');
  const [bannerUrl, setBannerUrl] = useState('https://picsum.photos/seed/military-banner/800/400');
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');

  // Firebase Auth Listener
  useEffect(() => {
    let unsubscribeProfile: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = undefined;
      }

      if (user) {
        // Listen for user profile changes in real-time
        const userDocRef = doc(db, 'users', user.uid);
        unsubscribeProfile = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            setCurrentUser({ id: docSnap.id, ...docSnap.data() } as User);
            setAppState('main');
          } else {
            // If profile doesn't exist yet, set a basic one
            setCurrentUser({
              id: user.uid,
              name: user.displayName || 'Quân nhân mới',
              rank: 'Binh nhì',
              unit: 'Đang cập nhật',
              role: 'Chiến sĩ',
              avatarInitials: user.displayName?.charAt(0) || 'U',
              isAdmin: user.email === 'bengoccuong@ll47.internal' || user.email === '96nothingg@gmail.com',
              status: 'online'
            });
            setAppState('main');
          }
          setIsAuthReady(true);
        }, (error) => {
          console.error('Firestore Profile Error:', error);
          setIsAuthReady(true);
        });
      } else {
        if (unsubscribeProfile) {
          unsubscribeProfile();
          unsubscribeProfile = undefined;
        }
        setCurrentUser(null);
        setAppState('login');
        setIsAuthReady(true);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) {
        unsubscribeProfile();
      }
    };
  }, []);

  // Firebase Real-time Listeners
  useEffect(() => {
    if (!currentUser) return;

    // Listen for tasks
    const tasksQuery = query(
      collection(db, 'tasks'),
      orderBy('createdAt', 'desc')
    );
    const unsubscribeTasks = onSnapshot(tasksQuery, (snapshot) => {
      const tasksData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
      setTasks(tasksData);
    }, (error) => {
      console.error('Firestore Tasks Error:', error);
    });

    // Listen for units
    const unsubscribeUnits = onSnapshot(collection(db, 'units'), (snapshot) => {
      setUnits(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Unit)));
    }, (error) => {
      console.error('Firestore Units Error:', error);
    });

    // Listen for users
    const unsubscribeUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User)));
    }, (error) => {
      console.error('Firestore Users Error:', error);
    });

    // Listen for chats to calculate total unread
    const chatsQuery = query(
      collection(db, 'chats'),
      where('memberIds', 'array-contains', currentUser.id),
      orderBy('lastMsgTime', 'desc')
    );
    const unsubscribeChats = onSnapshot(chatsQuery, (snapshot) => {
      const chatsData = snapshot.docs.map(doc => {
        const data = doc.data();
        let timeStr = '...';
        if (data.lastMsgTime) {
          try {
            if (typeof data.lastMsgTime.toDate === 'function') {
              timeStr = new Date(data.lastMsgTime.toDate()).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
            } else if (data.lastMsgTime.seconds) {
              timeStr = new Date(data.lastMsgTime.seconds * 1000).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
            } else {
              timeStr = new Date(data.lastMsgTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
            }
          } catch (e) {
            console.error("Error parsing time:", e);
          }
        }

        return {
          id: doc.id,
          name: data.name || 'Cuộc trò chuyện',
          avatar: data.avatar || (data.name ? data.name.charAt(0) : 'C'),
          lastMsg: data.lastMsg || 'Chưa có tin nhắn',
          time: timeStr,
          unread: data.unread || 0,
          online: data.online || false,
          isPinned: data.isPinned || false,
          isGroup: data.isGroup || false,
          ...data
        } as ChatItem;
      });
      setChats(chatsData);
      const total = chatsData.reduce((acc, chat) => acc + (chat.unread || 0), 0);
      setTotalUnreadChats(total);
    }, (error) => {
      console.error('Firestore Total Unread Error:', error);
    });

    return () => {
      unsubscribeTasks();
      unsubscribeUnits();
      unsubscribeUsers();
      unsubscribeChats();
    };
  }, [currentUser?.id]);

  const handleCreateTask = async (newTask: any) => {
    try {
      await addDoc(collection(db, 'tasks'), {
        ...newTask,
        createdAt: serverTimestamp(),
        status: TaskStatus.PENDING,
        assignedBy: currentUser?.id || 'admin'
      });
      setShowCreateTask(false);
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleNudgeTask = async (taskId: string) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      await updateDoc(doc(db, 'tasks', taskId), {
        nudgeCount: (task.nudgeCount || 0) + 1,
        lastNudgedAt: new Date().toISOString()
      });

      // Add a notification for the nudge
      const newNotif: AppNotification = {
        id: `nudge-${Date.now()}`,
        type: task.type || NotificationType.TASK_REGULAR,
        title: 'NHẮC NHỞ NHIỆM VỤ',
        content: `Cấp trên đang giục bạn hoàn thành nhiệm vụ: ${task.title}`,
        timestamp: 'Vừa xong',
        isRead: false,
        targetId: task.id
      };
      setNotifications([newNotif, ...notifications]);
    } catch (error) {
      console.error('Error nudging task:', error);
    }
  };

  const handleHomeScreenTabChange = (tabId: any) => {
    if (tabId === 'test') {
      setShowTestScreen(true);
    } else if (tabId === 'docs') {
      setShowDocumentScreen(true);
    } else if (tabId === 'report') {
      setShowQuickReport(true);
    } else if (tabId === 'schedule') {
      setShowSchedule(true);
    } else if (tabId === 'legal') {
      setShowLegalScreen(true);
    } else {
      setCurrentTab(tabId);
    }
  };

  const handleNotificationClick = (notif: AppNotification) => {
    // Mark as read
    setNotifications(notifications.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
    setShowNotificationList(false);

    if (!notif.targetId) return;

    // Navigate based on type
    switch (notif.type) {
      case NotificationType.TASK_REGULAR:
      case NotificationType.TASK_COMBAT:
        const task = tasks.find(t => t.id === notif.targetId);
        if (task) setSelectedTask(task);
        break;
      case NotificationType.MESSAGE:
        // Mock chat navigation
        const chatItem: ChatItem = {
          id: notif.targetId,
          name: notif.title,
          avatar: notif.title.charAt(0),
          lastMsg: notif.content,
          time: notif.timestamp,
          unread: 0,
          online: true,
          isPinned: false,
          isGroup: false
        };
        setSelectedChat(chatItem);
        break;
      case NotificationType.ANNOUNCEMENT:
        // For announcements, we just mark as read on home screen usually
        setCurrentTab('home');
        break;
    }
  };

  const handleMarkAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const renderTabContent = () => {
    switch (currentTab) {
      case 'home': return (
        <HomeScreen 
          currentUser={currentUser!}
          tasks={tasks} 
          onTabChange={handleHomeScreenTabChange} 
          onCreateTask={() => setShowCreateTask(true)} 
          onShowQR={() => setShowMyQR(true)}
          onShowNotifications={() => setShowNotificationList(true)}
          notificationSettings={notificationSettings}
          unreadNotificationsCount={notifications.filter(n => !n.isRead).length}
          slogan={slogan}
          subSlogan={subSlogan}
          bannerUrl={bannerUrl}
        />
      );
      case 'tasks': return (
        <TaskScreen 
          tasks={tasks} 
          onSelectTask={setSelectedTask} 
          onCreateTask={() => setShowCreateTask(true)}
          onNudgeAll={() => {
            const pendingTasks = tasks.filter(t => t.status !== TaskStatus.COMPLETED);
            pendingTasks.forEach(t => handleNudgeTask(t.id));
          }}
          isAdmin={currentUser?.isAdmin}
        />
      );
      case 'chat': return <ChatScreen chats={chats} onSelectChat={setSelectedChat} />;
      case 'contacts': return (
        <ContactsScreen 
          isAdmin={currentUser?.isAdmin || false}
          onSearchFriends={() => setShowSearchFriends(true)} 
          onSelectContact={(contact) => {
            const chatItem: ChatItem = {
              id: contact.id,
              name: contact.name,
              avatar: contact.avatarInitials,
              lastMsg: 'Bắt đầu trò chuyện',
              time: 'Vừa xong',
              unread: 0,
              online: contact.status === 'online',
              isPinned: false,
              isGroup: false
            };
            setSelectedChat(chatItem);
          }}
          onSelectUnit={setSelectedUnit}
          onShowFriendRequests={() => setShowFriendRequests(true)}
        />
      );
      case 'rank': return <LeaderboardScreen />;
      case 'profile': return (
        <ProfileScreen 
          currentUser={currentUser!}
          onLogout={() => auth.signOut()} 
          onOpenSettings={() => setShowSettings(true)}
          onShowQR={() => setShowMyQR(true)}
        />
      );
      case 'admin': return (
        <AdminScreen 
          slogan={slogan}
          onUpdateSlogan={setSlogan}
          subSlogan={subSlogan}
          onUpdateSubSlogan={setSubSlogan}
          bannerUrl={bannerUrl}
          onUpdateBannerUrl={setBannerUrl}
          users={users}
          units={units}
        />
      );
      default: return <HomeScreen tasks={tasks} onTabChange={setCurrentTab} onCreateTask={() => setShowCreateTask(true)} />;
    }
  };

  const renderMainContent = () => {
    if (appState === 'splash') {
      return <SplashScreen onFinish={() => setAppState('login')} />;
    }

    if (appState === 'login') {
      return <LoginScreen onLogin={() => setAppState('main')} />;
    }

    return (
      <main className="flex-1 relative overflow-hidden">
        <div className="h-full w-full">
          {renderTabContent()}
        </div>
      </main>
    );
  };

  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'small': return 'text-[0.9em]';
      case 'large': return 'text-[1.1em]';
      default: return 'text-[1em]';
    }
  };

  return (
    <div className={`h-screen bg-army-bg flex flex-col md:flex-row max-w-screen-2xl mx-auto relative shadow-2xl overflow-hidden border-x border-gray-100 ${getFontSizeClass()}`}>
      {appState === 'main' && (
        <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-100 zalo-shadow z-40">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-army-green rounded-xl flex items-center justify-center army-shadow">
                <Shield size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-sm font-black text-army-green tracking-tighter uppercase">Lực Lượng 47</h1>
                <p className="text-[9px] text-army-brown font-bold uppercase opacity-70">Hệ thống tác chiến</p>
              </div>
            </div>
          </div>
          
          <nav className="flex-1 p-4 space-y-2">
            <SidebarButton 
              active={currentTab === 'home'} 
              onClick={() => setCurrentTab('home')} 
              icon={<Home size={20} />} 
              label="Trang chủ" 
            />
            <SidebarButton 
              active={currentTab === 'contacts'} 
              onClick={() => setCurrentTab('contacts')} 
              icon={<BookOpen size={20} />} 
              label="Danh bạ" 
            />
            <SidebarButton 
              active={currentTab === 'chat'} 
              onClick={() => setCurrentTab('chat')} 
              icon={<MessageCircle size={20} />} 
              label="Tin nhắn" 
              badge={totalUnreadChats > 0 ? totalUnreadChats : undefined}
            />
            <SidebarButton 
              active={currentTab === 'tasks'} 
              onClick={() => setCurrentTab('tasks')} 
              icon={<ClipboardList size={20} />} 
              label="Nhiệm vụ" 
            />
            <SidebarButton 
              active={currentTab === 'rank'} 
              onClick={() => setCurrentTab('rank')} 
              icon={<Trophy size={20} />} 
              label="Bảng xếp hạng" 
            />
            <SidebarButton 
              active={currentTab === 'profile'} 
              onClick={() => setCurrentTab('profile')} 
              icon={<UserIcon size={20} />} 
              label="Trang cá nhân" 
            />
            {currentUser?.isAdmin && (
              <SidebarButton 
                active={currentTab === 'admin'} 
                onClick={() => setCurrentTab('admin')} 
                icon={<Shield size={20} />} 
                label="Quản trị hệ thống" 
              />
            )}
          </nav>

          <div className="p-4 border-t border-gray-100">
            <div className="flex items-center gap-3 p-3 bg-army-green/5 rounded-2xl">
              <div className="w-10 h-10 bg-army-green rounded-full flex items-center justify-center text-white font-bold">
                {currentUser?.avatarInitials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-army-green truncate">{currentUser?.name}</p>
                <p className="text-[9px] text-army-brown font-medium">{currentUser?.rank}</p>
              </div>
            </div>
          </div>
        </aside>
      )}

      <div className="flex-1 flex flex-col h-full relative overflow-hidden">
        <ErrorBoundary>
          {renderMainContent()}
        </ErrorBoundary>
        
        {/* Bottom Navigation - Only on Mobile */}
        {appState === 'main' && (
          <nav className="md:hidden bg-white border-t border-gray-100 flex justify-around items-center py-2 px-1 sticky bottom-0 z-40 zalo-shadow">
            <NavButton 
              active={currentTab === 'home'} 
              onClick={() => setCurrentTab('home')} 
              icon={<Home size={22} />} 
              label="Trang chủ" 
            />
            <NavButton 
              active={currentTab === 'contacts'} 
              onClick={() => setCurrentTab('contacts')} 
              icon={<BookOpen size={22} />} 
              label="Danh bạ" 
            />
            <NavButton 
              active={currentTab === 'chat'} 
              onClick={() => setCurrentTab('chat')} 
              icon={<MessageCircle size={22} />} 
              label="Chat" 
              unreadCount={totalUnreadChats}
            />
            <NavButton 
              active={currentTab === 'tasks'} 
              onClick={() => setCurrentTab('tasks')} 
              icon={<ClipboardList size={22} />} 
              label="Nhiệm vụ" 
            />
            <NavButton 
              active={currentTab === 'profile'} 
              onClick={() => setCurrentTab('profile')} 
              icon={<UserIcon size={22} />} 
              label="Tôi" 
            />
            {currentUser?.isAdmin && (
              <NavButton 
                active={currentTab === 'admin'} 
                onClick={() => setCurrentTab('admin')} 
                icon={<Shield size={22} />} 
                label="Admin" 
              />
            )}
          </nav>
        )}
      </div>
      <QRModal isOpen={showMyQR} onClose={() => setShowMyQR(false)} currentUser={currentUser} />
      <NotificationListModal 
        isOpen={showNotificationList}
        onClose={() => setShowNotificationList(false)}
        notifications={notifications}
        onNotificationClick={handleNotificationClick}
        onOpenSettings={() => {
          setShowNotificationList(false);
          setShowNotificationSettings(true);
        }}
        onMarkAllRead={handleMarkAllRead}
      />
      <NotificationSettingsModal 
        isOpen={showNotificationSettings} 
        onClose={() => setShowNotificationSettings(false)}
        settings={notificationSettings}
        onUpdateSettings={setNotificationSettings}
      />
      <ErrorBoundary>
        <AnimatePresence>
          {showSettings && (
          <motion.div
            key="settings"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute inset-0 z-50"
          >
            <SettingsScreen 
              onBack={() => setShowSettings(false)} 
              fontSize={fontSize}
              onFontSizeChange={setFontSize}
            />
          </motion.div>
        )}
        {selectedChat && (
          <motion.div
            key="chat-detail"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute inset-0 z-50"
          >
            <ChatDetailScreen 
              chat={selectedChat} 
              onBack={() => setSelectedChat(null)} 
            />
          </motion.div>
        )}

        {showSearchFriends && (
          <motion.div
            key="search-friends"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute inset-0 z-50"
          >
            <SearchFriendsScreen 
              currentUser={currentUser!}
              onBack={() => setShowSearchFriends(false)} 
            />
          </motion.div>
        )}

        {showFriendRequests && (
          <motion.div
            key="friend-requests"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute inset-0 z-50"
          >
            <FriendRequestsScreen onBack={() => setShowFriendRequests(false)} />
          </motion.div>
        )}

        {selectedTask && (
          <motion.div
            key="task-detail"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute inset-0 z-50"
          >
            <TaskDetailScreen 
              task={selectedTask} 
              currentUser={currentUser!}
              onBack={() => setSelectedTask(null)} 
              onReport={() => {
                setReportingTask(selectedTask);
                setSelectedTask(null);
              }}
              onNudge={handleNudgeTask}
            />
          </motion.div>
        )}

        {reportingTask && (
          <motion.div
            key="task-report"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute inset-0 z-50"
          >
            <TaskReportScreen 
              task={reportingTask} 
              onBack={() => setReportingTask(null)} 
              onReport={(report) => {
                console.log('Task reported:', report);
                setReportingTask(null);
              }}
            />
          </motion.div>
        )}

        {selectedUnit && (
          <motion.div
            key="unit-detail"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute inset-0 z-50"
          >
            <UnitDetailScreen 
              unit={selectedUnit} 
              onBack={() => setSelectedUnit(null)} 
              onSelectMember={(member) => {
                const chatItem: ChatItem = {
                  id: member.id,
                  name: member.name,
                  avatar: member.avatarInitials,
                  lastMsg: 'Bắt đầu trò chuyện',
                  time: 'Vừa xong',
                  unread: 0,
                  online: member.status === 'online',
                  isPinned: false,
                  isGroup: false
                };
                setSelectedChat(chatItem);
                setSelectedUnit(null);
              }}
            />
          </motion.div>
        )}

        {showCreateTask && (
          <motion.div
            key="create-task"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute inset-0 z-50"
          >
            <CreateTaskScreen 
              currentUser={currentUser!}
              onBack={() => setShowCreateTask(false)}
              onCreate={handleCreateTask}
              units={units}
              users={users}
            />
          </motion.div>
        )}

        {showTestScreen && (
          <motion.div
            key="test-screen"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute inset-0 z-50"
          >
            <TestScreen 
              onBack={() => setShowTestScreen(false)} 
            />
          </motion.div>
        )}

        {showDocumentScreen && (
          <motion.div
            key="document-screen"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute inset-0 z-50"
          >
            <DocumentScreen 
              onBack={() => setShowDocumentScreen(false)} 
              currentUser={currentUser!}
            />
          </motion.div>
        )}

        {showQuickReport && (
          <motion.div
            key="quick-report"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute inset-0 z-50"
          >
            <QuickReportScreen 
              onBack={() => setShowQuickReport(false)} 
            />
          </motion.div>
        )}

        {showSchedule && (
          <motion.div
            key="schedule-screen"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute inset-0 z-50"
          >
            <ScheduleScreen 
              onBack={() => setShowSchedule(false)} 
            />
          </motion.div>
        )}

        {showLegalScreen && (
          <motion.div
            key="legal-screen"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute inset-0 z-50"
          >
            <LegalScreen 
              onBack={() => setShowLegalScreen(false)} 
            />
          </motion.div>
        )}
      </AnimatePresence>
      </ErrorBoundary>
    </div>
  );
}

interface NavButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  unreadCount?: number;
}

const NavButton: React.FC<NavButtonProps> = ({ active, onClick, icon, label, unreadCount }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1 flex-1 py-1 transition-colors ${
      active ? 'text-army-green' : 'text-gray-400'
    }`}
  >
    <div className="relative">
      {icon}
      {unreadCount !== undefined && unreadCount > 0 && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border border-white">
          {unreadCount}
        </div>
      )}
    </div>
    <span className={`text-[9px] font-bold uppercase tracking-tighter ${active ? 'opacity-100' : 'opacity-70'}`}>
      {label}
    </span>
  </button>
);

interface SidebarButtonProps extends NavButtonProps {
  badge?: number;
}

const SidebarButton: React.FC<SidebarButtonProps> = ({ active, onClick, icon, label, badge }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all ${
      active 
        ? 'bg-army-green text-white shadow-lg shadow-army-green/20' 
        : 'text-gray-500 hover:bg-gray-50'
    }`}
  >
    <div className="relative">
      {icon}
      {badge && (
        <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white">
          {badge}
        </div>
      )}
    </div>
    <span className="text-sm font-bold">{label}</span>
  </button>
);
