import React, { useState } from 'react';
import { useChat } from '../../context/ChatContext';
import { Search, X, MessageSquarePlus, Zap, UserCheck, Bot } from 'lucide-react';
import { motion } from 'motion/react';

interface NewChatModalProps {
  onClose: () => void;
}

export const NewChatModal: React.FC<NewChatModalProps> = ({ onClose }) => {
  const { allUsers, createOrGetConversation, sendPing } = useChat();
  const [search, setSearch] = useState('');

  const filtered = allUsers.filter(u =>
    u.displayName.toLowerCase().includes(search.toLowerCase()) ||
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  const handleStartChat = async (userId: string) => {
    await createOrGetConversation(userId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-md bg-slate-900 border border-pink-500/30 rounded-3xl p-6 text-white shadow-2xl"
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-pink-500/20 text-pink-400 rounded-xl">
              <MessageSquarePlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Start New Conversation</h3>
              <p className="text-xs text-slate-400">Search users by name or @username</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="my-4 relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search contact or type username..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-pink-500"
          />
        </div>

        {/* Contact List */}
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <p className="text-sm">No users found matching "{search}"</p>
            </div>
          ) : (
            filtered.map((u) => (
              <div
                key={u.id}
                className="p-3 rounded-2xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/40 flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={u.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
                      alt={u.displayName}
                      className="w-10 h-10 rounded-xl object-cover"
                    />
                    {u.id === 'bot_pingbot' && (
                      <span className="absolute -top-1 -right-1 p-0.5 bg-indigo-500 text-white rounded-md">
                        <Bot className="w-3 h-3" />
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="font-bold text-sm text-slate-200 group-hover:text-pink-300">
                      {u.displayName}
                    </h4>
                    <p className="text-xs text-slate-400 font-mono">@{u.username}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => sendPing(u.id)}
                    title="Instant Ping"
                    className="p-2 text-white bg-gradient-to-r from-pink-500 to-sky-400 hover:scale-105 rounded-xl text-xs font-bold shadow-md"
                  >
                    <Zap className="w-4 h-4 fill-current" />
                  </button>
                  <button
                    onClick={() => handleStartChat(u.id)}
                    className="px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all"
                  >
                    Chat
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
};
