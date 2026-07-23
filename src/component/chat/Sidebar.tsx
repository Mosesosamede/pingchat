import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { Search, Plus, Settings, Lock, Zap, Shield, MessageSquare, Circle } from 'lucide-react';
import { motion } from 'motion/react';

interface SidebarProps {
  onOpenSettings: () => void;
  onOpenNewChat: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onOpenSettings,
  onOpenNewChat,
  isMobileOpen,
  onCloseMobile
}) => {
  const { user, lockApp, isE2EEEnabled } = useAuth();
  const { conversations, activeConversation, setActiveConversationId, allUsers, sendPing, unreadTotal } = useChat();

  const [searchQuery, setSearchQuery] = useState('');

  // Filter conversations
  const filteredConvs = conversations.filter(conv => {
    if (!user?.id) return false;
    const otherParticipantId = conv.participants.find(p => p !== user.id) || '';
    const info = conv.participantInfo?.[otherParticipantId];
    if (!info) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      info.displayName.toLowerCase().includes(searchLower) ||
      info.username.toLowerCase().includes(searchLower)
    );
  });

  return (
    <aside
      className={`w-full md:w-80 xl:w-96 flex flex-col h-full bg-slate-900 border-r border-slate-800/80 transition-all duration-300 z-20 ${
        isMobileOpen ? 'fixed inset-0 z-40 bg-slate-900' : 'hidden md:flex'
      }`}
    >
      {/* Top Bar Branding & User Profile */}
      <div className="p-4 border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={user?.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
              alt={user?.displayName}
              className="w-10 h-10 rounded-xl object-cover ring-2 ring-pink-500/50"
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-slate-900" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm text-slate-100 tracking-wide line-clamp-1">
                {user?.displayName}
              </span>
              <span className="px-1.5 py-0.2 text-[10px] font-extrabold bg-gradient-to-r from-pink-500 to-indigo-500 text-white rounded-md">
                ⚡
              </span>
            </div>
            <span className="text-xs text-slate-400 font-mono">@{user?.username}</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onOpenNewChat}
            title="New Chat"
            className="p-2 text-pink-400 hover:text-white bg-pink-500/10 hover:bg-pink-500/20 rounded-xl transition-all"
          >
            <Plus className="w-5 h-5" />
          </button>
          <button
            onClick={onOpenSettings}
            title="Settings"
            className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-xl transition-all"
          >
            <Settings className="w-5 h-5" />
          </button>
          <button
            onClick={lockApp}
            title="PIN Lock App"
            className="p-2 text-slate-400 hover:text-pink-400 hover:bg-slate-800 rounded-xl transition-all"
          >
            <Lock className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="p-3">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations & users..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-800/80 border border-slate-700/60 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-pink-500/80 transition-colors"
          />
        </div>
      </div>

      {/* Quick Ping Contacts Strip */}
      {allUsers.length > 0 && (
        <div className="px-3 py-2 border-b border-slate-800/60">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Zap className="w-3 h-3 text-pink-400 fill-current" />
              Quick Ping Contacts
            </span>
            <span className="text-[10px] text-pink-400 font-semibold">Tap ⚡ to Ping</span>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {allUsers.slice(0, 8).map((u) => (
              <div key={u.id} className="flex flex-col items-center shrink-0 group">
                <div className="relative">
                  <img
                    src={u.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
                    alt={u.displayName}
                    className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-700 group-hover:ring-pink-500 transition-all"
                  />
                  <button
                    onClick={() => sendPing(u.id)}
                    title={`Instant Ping ${u.displayName}`}
                    className="absolute -bottom-1 -right-1 p-1 bg-gradient-to-r from-pink-500 to-sky-400 hover:scale-110 rounded-lg text-white shadow-md transition-all"
                  >
                    <Zap className="w-3 h-3 fill-current" />
                  </button>
                </div>
                <span className="text-[10px] text-slate-300 font-medium truncate max-w-[50px] mt-1">
                  {u.displayName.split(' ')[0]}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
        {filteredConvs.length === 0 ? (
          <div className="p-8 text-center text-slate-500 space-y-2">
            <MessageSquare className="w-8 h-8 mx-auto text-slate-600 opacity-60" />
            <p className="text-xs">No active chats yet.</p>
            <button
              onClick={onOpenNewChat}
              className="text-xs font-semibold text-pink-400 hover:underline"
            >
              Start a new conversation
            </button>
          </div>
        ) : (
          filteredConvs.map((conv) => {
            if (!user?.id) return null;
            const otherParticipantId = conv.participants.find(p => p !== user.id) || '';
            const info = conv.participantInfo?.[otherParticipantId] || {
              displayName: 'User',
              photoURL: '',
              username: ''
            };

            const isSelected = activeConversation?.id === conv.id;
            const unreadCount = conv.unreadCount?.[user.id] || 0;

            let lastMsgText = conv.lastMessage?.text || 'No messages yet';
            if (conv.lastMessage?.type === 'image') lastMsgText = '📷 Photo';
            if (conv.lastMessage?.type === 'gif') lastMsgText = '👾 Animated GIF';
            if (conv.lastMessage?.type === 'sticker') lastMsgText = '💖 Sticker';
            if (conv.lastMessage?.type === 'ping') lastMsgText = '⚡ Instant Ping Alert';

            return (
              <button
                key={conv.id}
                onClick={() => {
                  setActiveConversationId(conv.id);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`w-full p-3 rounded-2xl flex items-center gap-3 transition-all text-left relative group ${
                  isSelected
                    ? 'bg-gradient-to-r from-pink-500/20 to-indigo-500/20 border border-pink-500/40 text-white shadow-lg'
                    : 'hover:bg-slate-800/60 text-slate-300 hover:text-slate-100'
                }`}
              >
                <div className="relative shrink-0">
                  <img
                    src={info.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
                    alt={info.displayName}
                    className="w-12 h-12 rounded-2xl object-cover ring-2 ring-slate-800 group-hover:ring-pink-400/50 transition-all"
                  />
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-bold text-sm truncate text-slate-100">
                      {info.displayName}
                    </span>
                    {conv.updatedAt && (
                      <span className="text-[10px] text-slate-500 shrink-0 font-mono">
                        {new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-1">
                    <p className={`text-xs truncate ${unreadCount > 0 ? 'font-semibold text-pink-300' : 'text-slate-400'}`}>
                      {lastMsgText}
                    </p>
                    {unreadCount > 0 && (
                      <span className="shrink-0 px-2 py-0.5 text-[10px] font-black text-white bg-gradient-to-r from-pink-500 to-indigo-600 rounded-full shadow-md shadow-pink-500/30">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Footer info badge */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-900/90 text-[11px] text-slate-400 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-pink-400" />
          <span>{isE2EEEnabled ? 'E2EE Encrypted' : 'Standard Protection'}</span>
        </div>
        {unreadTotal > 0 && (
          <span className="text-pink-400 font-bold">{unreadTotal} Unread</span>
        )}
      </div>
    </aside>
  );
};
