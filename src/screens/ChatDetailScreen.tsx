import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Phone, MoreVertical, Paperclip, Send, Smile, CheckCheck } from 'lucide-react';
import { ChatItem, ChatMessage } from '../types';
import { auth, db } from '../firebase';
import { collection, onSnapshot, query, orderBy, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';

interface ChatDetailScreenProps {
  chat: ChatItem;
  onBack: () => void;
}

export const ChatDetailScreen: React.FC<ChatDetailScreenProps> = ({ chat, onBack }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chat.id || !auth.currentUser) return;

    const resetUnread = async () => {
      try {
        await updateDoc(doc(db, 'chats', chat.id), {
          unread: 0
        });
      } catch (error) {
        console.error('Error resetting unread count:', error);
      }
    };

    resetUnread();
  }, [chat.id]);

  useEffect(() => {
    if (!chat.id) return;

    const messagesQuery = query(
      collection(db, 'chats', chat.id, 'messages'),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const msgs = snapshot.docs.map(doc => {
        const data = doc.data();
        let timeStr = '...';
        if (data.timestamp) {
          try {
            if (typeof data.timestamp.toDate === 'function') {
              timeStr = new Date(data.timestamp.toDate()).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
            } else if (data.timestamp.seconds) {
              timeStr = new Date(data.timestamp.seconds * 1000).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
            } else {
              timeStr = new Date(data.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
            }
          } catch (e) {
            console.error("Error parsing time:", e);
          }
        }

        return {
          id: doc.id,
          text: data.text,
          isMe: data.senderId === auth.currentUser?.uid,
          time: timeStr,
          seen: data.seen || false
        } as ChatMessage;
      });
      setMessages(msgs);
      setLoading(false);
    }, (error) => {
      console.error('Firestore Messages Error:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [chat.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !auth.currentUser) return;
    
    const text = message.trim();
    setMessage('');

    try {
      // Add message to subcollection
      await addDoc(collection(db, 'chats', chat.id, 'messages'), {
        text,
        senderId: auth.currentUser.uid,
        senderName: auth.currentUser.displayName || 'Quân nhân',
        timestamp: serverTimestamp(),
        seen: false
      });

      // Update last message in chat metadata
      await updateDoc(doc(db, 'chats', chat.id), {
        lastMsg: text,
        lastMsgTime: serverTimestamp()
      });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="flex flex-col h-full bg-army-bg">
      {/* Header */}
      <div className="bg-white px-2 py-2 flex items-center gap-1 border-b border-gray-100 zalo-shadow z-10">
        <button onClick={onBack} className="p-2 text-army-gray"><ArrowLeft size={24} /></button>
        <div className="flex flex-1 items-center gap-3">
          <div className="w-10 h-10 bg-army-green/10 rounded-full flex items-center justify-center text-army-green font-bold">
            {chat.avatar}
          </div>
          <div>
            <h2 className="text-sm font-bold text-army-gray leading-tight">{chat.name}</h2>
            <p className="text-[10px] text-green-500 font-bold">Đang hoạt động</p>
          </div>
        </div>
        <div className="flex items-center">
          <button className="p-2 text-army-gray"><Phone size={20} /></button>
          <button className="p-2 text-army-gray"><MoreVertical size={20} /></button>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full gap-2">
            <div className="w-8 h-8 border-4 border-army-green border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[10px] text-gray-400 font-bold uppercase">Đang tải tin nhắn...</p>
          </div>
        ) : (
          <>
            <div className="flex justify-center">
              <span className="bg-gray-200/50 text-[10px] text-gray-500 font-bold px-3 py-1 rounded-full uppercase tracking-widest">Hôm nay</span>
            </div>
            
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] group`}>
                  <div className={`px-4 py-2.5 rounded-2xl text-sm army-shadow ${
                    msg.isMe ? 'bg-army-green text-white rounded-tr-none' : 'bg-white text-army-gray rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                  <div className={`flex items-center gap-1 mt-1 px-1 ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                    <span className="text-[10px] text-gray-400 font-medium">{msg.time}</span>
                    {msg.isMe && <CheckCheck size={12} className={msg.seen ? 'text-army-green' : 'text-gray-300'} />}
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Input */}
      <div className="bg-white p-3 border-t border-gray-100 zalo-shadow">
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <button type="button" className="p-2 text-gray-400"><Paperclip size={22} /></button>
          <div className="flex-1 relative">
            <input 
              type="text" 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Nhập tin nhắn..."
              className="w-full bg-gray-50 border-none rounded-full pl-4 pr-10 py-2.5 text-sm focus:ring-1 focus:ring-army-green outline-none"
            />
            <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"><Smile size={20} /></button>
          </div>
          <button 
            type="submit" 
            disabled={!message.trim()}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
              message.trim() ? 'bg-army-green text-white' : 'bg-gray-100 text-gray-300'
            }`}
          >
            <Send size={20} />
          </button>
        </form>
        
        <div className="flex justify-around mt-3 pt-2 border-t border-gray-50">
          <button type="button" className="flex flex-col items-center gap-1">
            <div className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center text-gray-400"><span className="text-lg">📍</span></div>
            <span className="text-[9px] font-bold text-gray-400 uppercase">Vị trí</span>
          </button>
          <button type="button" className="flex flex-col items-center gap-1">
            <div className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center text-gray-400"><span className="text-lg">👤</span></div>
            <span className="text-[9px] font-bold text-gray-400 uppercase">Danh bạ</span>
          </button>
          <button type="button" className="flex flex-col items-center gap-1">
            <div className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center text-gray-400"><span className="text-lg">📁</span></div>
            <span className="text-[9px] font-bold text-gray-400 uppercase">Tài liệu</span>
          </button>
          <button type="button" className="flex flex-col items-center gap-1">
            <div className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center text-gray-400"><span className="text-lg">📊</span></div>
            <span className="text-[9px] font-bold text-gray-400 uppercase">Bình chọn</span>
          </button>
        </div>
      </div>
    </div>
  );
};
