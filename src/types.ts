export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'inProgress',
  COMPLETED = 'completed',
  OVERDUE = 'overdue',
  REPORTED = 'reported'
}

export interface TaskAssignee {
  userId: string;
  userName: string;
  rank: string;
  status: TaskStatus;
  completedAt?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedBy: string;
  assignedTo: string; // "all", "unit_id", or "user_id"
  assignees: TaskAssignee[];
  deadline: string;
  status: TaskStatus; // Overall status
  createdAt: string;
  reportContent?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  type?: NotificationType;
  nudgeCount?: number;
  lastNudgedAt?: string;
  attachments?: string[];
  comments?: TaskComment[];
}

export interface TaskComment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: string;
}

export interface User {
  id: string;
  name: string;
  rank: string;
  unit: string;
  role: string;
  avatarInitials: string;
  avatarUrl?: string;
  status?: 'online' | 'offline' | 'busy';
  phone?: string;
  email?: string;
  isAdmin?: boolean;
  isCommander?: boolean;
  readinessScore?: number; // 0-100
  trainingScore?: number;
  completedTasksCount?: number;
  awardsCount?: number;
  medals?: string[];
  enlistmentDate?: string;
  hometown?: string;
  createdAt?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  unit: string;
  author: string;
  timestamp: string;
  isRead?: boolean;
  priority: 'normal' | 'urgent';
}

export interface ChatMessage {
  id: string;
  text: string;
  isMe: boolean;
  time: string;
  seen: boolean;
  type?: 'text' | 'image' | 'file' | 'voice';
}

export interface ChatItem {
  id: string;
  name: string;
  avatar: string;
  lastMsg: string;
  time: string;
  unread: number;
  online: boolean;
  isPinned?: boolean;
  isGroup?: boolean;
  unitId?: string; // Link to unit for automatic group chats
}

export interface RankingItem {
  rank: number;
  name: string;
  unit: string;
  score: number;
  avatar?: string;
  trend?: 'up' | 'down' | 'stable';
  type?: UnitType;
  level?: UnitLevel;
}

export enum UnitType {
  OFFICE = 'coquan',
  DIRECT = 'tructhuoc',
  REGULAR = 'donvi'
}

export enum UnitLevel {
  SQUAD = 'tieudoi',
  PLATOON = 'trungdoi',
  COMPANY = 'daidoi',
  BATTALION = 'tieudoan',
  REGIMENT = 'trungdoan',
  DIVISION = 'sudoan',
  REGION = 'quankhu'
}

export interface UnitScores {
  combat: number;      // Đấu tranh
  inspection: number;  // Kiểm tra
  hygiene: number;     // Nội vụ vệ sinh
  tasks: number;       // Thực hiện nhiệm vụ
  total: number;       // Tổng điểm
}

export interface Unit {
  id: string;
  name: string;
  parentId: string | null;
  level: UnitLevel;
  type: UnitType;
  membersCount: number;
  scores: UnitScores;
  commanderId?: string;
  children?: Unit[];
}

export interface Contact extends User {
  isFriend: boolean;
  isPinned?: boolean;
}

export interface FriendRequest {
  id: string;
  fromUserId: string;
  fromUserName: string;
  fromUserRank: string;
  status: 'pending' | 'accepted' | 'declined';
  timestamp: string;
}

export enum NotificationType {
  MESSAGE = 'message',
  CALL = 'call',
  ANNOUNCEMENT = 'announcement',
  TASK_REGULAR = 'task_regular',
  TASK_COMBAT = 'task_combat',
}

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  targetId?: string; // Task ID, Chat ID, etc.
}

export interface NotificationSettings {
  mutedTypes: NotificationType[];
  muteUntil?: string | null; // ISO string
}

export interface MilitaryDocument {
  id: string;
  title: string;
  type: string;
  size: string;
  date: string;
  category: string;
  url?: string;
  content?: string;
  uploaderId: string;
  uploaderName: string;
  createdAt: any;
}
