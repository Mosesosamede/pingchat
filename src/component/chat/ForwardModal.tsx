import React from 'react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { Message } from '../../types';
import { X, Send, User } from 'lucide-react';
import { motion } from 'motion/react';

interface ForwardModalProps {
  message: Message;
  onClose: () => void;
}

export const ForwardModal: React.FC<ForwardModalProps> = ({ message, onClose }) => {
  const { user } = useAuth();
  const { conversations, createOrGetConversation, sendMessage, setActiveConversationId } = useChat();

  const handleForwardToUser = async (otherUserId: string) => {
    const convId = await createOrGetConversation(otherUserId);
    setActiveConversationId(convId);
    await sendMessage(
      message.text,
      message.type,
      message.mediaUrl,
      undefined,
      message.senderId
    );
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
          <h3 className="font-bold text-lg text-white">Forward Message</h3>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message snippet preview */}
        <div className="my-4 p-3 bg-slate-800/80 border border-slate-700/60 rounded-2xl text-xs text-slate-300">
          <span className="text-[10px] text-pink-400 font-bold uppercase block mb-1">Forwarding:</span>
          <p className="line-clamp-2">{message.text || `[${message.type.toUpperCase()}]`}</p>
        </div>

        {/* Recipient Conversations */}
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {conversations.map((conv) => {
            const otherParticipantId = conv.participants.find(p => p !== user?.id) || '';
            const info = conv.participantInfo?.[otherParticipantId] || { displayName: 'User', photoURL: '' };

            return (
              <button
                key={conv.id}
                onClick={() => handleForwardToUser(otherParticipantId)}
                className="w-full p-3 rounded-2xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/40 flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={info.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
                    alt={info.displayName}
                    className="w-9 h-9 rounded-xl object-cover"
                  />
                  <span className="font-bold text-sm text-slate-200 group-hover:text-pink-300">
                    {info.displayName}
                  </span>
                </div>
                <Send className="w-4 h-4 text-pink-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};
