import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { Message, ReplyTo } from '../../types';
import { StickerGifDrawer } from './StickerGifDrawer';
import { ForwardModal } from './ForwardModal';
import {
  Zap, Send, Paperclip, Smile, Shield, Check, CheckCheck, Heart,
  Reply, CornerDownRight, Share2, Trash2, ArrowLeft, Image as ImageIcon,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ChatAreaProps {
  onBackMobile?: () => void;
}

export const ChatArea: React.FC<ChatAreaProps> = ({ onBackMobile }) => {
  const { user, isE2EEEnabled } = useAuth();
  const {
    activeConversation, activeMessages, activeContact, typingUser,
    sendMessage, sendPing, addEmojiReaction, setTyping, deleteConversation
  } = useChat();

  const [text, setText] = useState('');
  const [replyTo, setReplyTo] = useState<ReplyTo | null>(null);
  const [forwardMessage, setForwardMessage] = useState<Message | null>(null);
  const [showStickerDrawer, setShowStickerDrawer] = useState(false);
  const [hoveredMsgId, setHoveredMsgId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages, typingUser]);

  if (!activeConversation || !activeContact) {
    return (
      <div className="flex-1 hidden md:flex flex-col items-center justify-center p-8 bg-slate-950 text-center text-slate-400">
        <div className="w-20 h-20 mb-4 rounded-3xl bg-gradient-to-tr from-pink-500/20 to-indigo-500/20 border border-pink-500/30 flex items-center justify-center shadow-2xl shadow-pink-500/10">
          <span className="text-4xl animate-bounce">⚡</span>
        </div>
        <h3 className="text-xl font-bold text-slate-200 mb-1">Select a Conversation</h3>
        <p className="text-xs text-slate-500 max-w-sm">
          Pick a contact from the sidebar or tap <span className="text-pink-400 font-bold">⚡ Quick Ping</span> to get someone's attention instantly.
        </p>
      </div>
    );
  }

  // Handle Send Text Message
  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!text.trim()) return;

    const currentText = text;
    const currentReply = replyTo;

    setText('');
    setReplyTo(null);
    setTyping(false);

    await sendMessage(currentText, 'text', undefined, currentReply || undefined);
  };

  // Handle Image Upload
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        sendMessage('Image Attachment', 'image', dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 relative overflow-hidden">
      {/* Top Conversation Header */}
      <div className="p-3 md:p-4 border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md flex items-center justify-between z-10 shadow-sm">
        <div className="flex items-center gap-3">
          {onBackMobile && (
            <button
              onClick={onBackMobile}
              className="md:hidden p-2 text-slate-400 hover:text-white bg-slate-800 rounded-xl"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          <div className="relative">
            <img
              src={activeContact.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
              alt={activeContact.displayName}
              className="w-11 h-11 rounded-2xl object-cover ring-2 ring-pink-500/40"
            />
            <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-slate-900 ${
              activeContact.status === 'online' ? 'bg-emerald-500' : 'bg-slate-500'
            }`} />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-white tracking-wide">
                {activeContact.displayName}
              </h3>
              {isE2EEEnabled && (
                <span className="px-2 py-0.5 text-[10px] font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-500/40 rounded-full flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  <span>E2EE</span>
                </span>
              )}
            </div>

            <div className="text-xs text-slate-400 flex items-center gap-2">
              {typingUser ? (
                <span className="text-pink-400 font-bold animate-pulse">typing...</span>
              ) : (
                <span>@{activeContact.username} • {activeContact.bio || 'Ready to chat'}</span>
              )}
            </div>
          </div>
        </div>

        {/* Action Header Buttons */}
        <div className="flex items-center gap-2">
          {/* Instant Ping Button */}
          <button
            onClick={() => sendPing(activeContact.id)}
            title="Send Instant Ping!"
            className="px-3.5 py-2 bg-gradient-to-r from-pink-500 via-rose-500 to-indigo-600 hover:from-pink-600 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-pink-500/30 transition-all flex items-center gap-1.5 active:scale-95"
          >
            <Zap className="w-4 h-4 fill-current text-white animate-pulse" />
            <span className="hidden sm:inline">PING!</span>
          </button>

          <button
            onClick={() => deleteConversation(activeConversation.id)}
            title="Delete Chat"
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages Timeline */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeMessages.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-3">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-pink-400" />
            </div>
            <p className="text-sm font-semibold text-slate-300">This is the start of your encrypted chat history with {activeContact.displayName}.</p>
            <p className="text-xs text-slate-500">Send a text, sticker, or tap PING to get their attention!</p>
          </div>
        ) : (
          activeMessages.map((msg) => {
            const isMe = msg.senderId === user?.id;
            const isPingCard = msg.type === 'ping';

            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onMouseEnter={() => setHoveredMsgId(msg.id)}
                onMouseLeave={() => setHoveredMsgId(null)}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} relative group`}
              >
                {/* Reply To Preview snippet */}
                {msg.replyTo && (
                  <div className={`mb-1 p-2 rounded-xl text-xs bg-slate-800/80 border border-slate-700 max-w-xs flex items-center gap-1.5 text-slate-300`}>
                    <CornerDownRight className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                    <div>
                      <span className="font-bold text-pink-300 block">{msg.replyTo.senderName}</span>
                      <span className="line-clamp-1">{msg.replyTo.text}</span>
                    </div>
                  </div>
                )}

                {/* Forwarded Tag */}
                {msg.forwardedFrom && (
                  <span className="text-[10px] text-slate-400 mb-1 flex items-center gap-1">
                    <Share2 className="w-3 h-3 text-indigo-400" /> Forwarded message
                  </span>
                )}

                {/* SPECIAL CARD: INSTANT PING ALERT */}
                {isPingCard ? (
                  <div className="p-4 rounded-3xl bg-gradient-to-r from-pink-600/30 via-purple-600/30 to-indigo-600/30 border-2 border-pink-500/50 shadow-xl shadow-pink-500/20 text-center max-w-xs space-y-1">
                    <div className="flex items-center justify-center gap-1 text-pink-300 font-extrabold text-sm">
                      <Zap className="w-5 h-5 fill-current animate-bounce" />
                      <span>Instant Ping Alert!</span>
                    </div>
                    <p className="text-xs text-slate-200">
                      {isMe ? 'You sent an instant Ping alert.' : `${activeContact.displayName} sent you an instant Ping!` }
                    </p>
                  </div>
                ) : (
                  /* STANDARD MESSAGE BUBBLE */
                  <div
                    className={`relative p-3.5 rounded-3xl max-w-md shadow-md transition-all ${
                      isMe
                        ? 'bg-gradient-to-r from-pink-500 via-rose-500 to-indigo-600 text-white rounded-br-none'
                        : 'bg-slate-800 border border-slate-700/80 text-slate-100 rounded-bl-none'
                    }`}
                  >
                    {/* TYPE: TEXT */}
                    {msg.type === 'text' && (
                      <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                        {msg.text}
                      </p>
                    )}

                    {/* TYPE: IMAGE */}
                    {msg.type === 'image' && (
                      <div className="rounded-2xl overflow-hidden border border-white/20 my-1">
                        <img src={msg.mediaUrl} alt="Attachment" className="max-h-64 object-cover w-full" />
                      </div>
                    )}

                    {/* TYPE: GIF */}
                    {msg.type === 'gif' && (
                      <div className="rounded-2xl overflow-hidden border border-pink-400/40 my-1">
                        <img src={msg.mediaUrl} alt="GIF" className="max-h-56 object-cover w-full" />
                      </div>
                    )}

                    {/* TYPE: STICKER */}
                    {msg.type === 'sticker' && (
                      <div className="p-2 flex flex-col items-center justify-center">
                        <span className="text-6xl">{msg.mediaUrl}</span>
                        <span className="text-xs font-bold mt-1 opacity-90">{msg.text}</span>
                      </div>
                    )}

                    {/* Footer Timestamp & Read Receipts */}
                    <div className="flex items-center justify-end gap-1.5 mt-1 text-[10px] opacity-80 font-mono">
                      {msg.encrypted && <Shield className="w-3 h-3 text-emerald-300" />}
                      <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {isMe && (
                        <span>
                          {msg.status === 'seen' ? (
                            <Heart className="w-3.5 h-3.5 fill-pink-300 text-pink-300 inline" />
                          ) : (
                            <CheckCheck className="w-3.5 h-3.5 inline text-slate-300" />
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* EMOJI REACTIONS ROW */}
                {msg.emojiReactions && Object.keys(msg.emojiReactions).length > 0 && (
                  <div className="flex gap-1 mt-1">
                    {Object.entries(msg.emojiReactions).map(([userId, emoji]) => (
                      <span
                        key={userId}
                        className="px-2 py-0.5 text-xs bg-slate-800 border border-slate-700 rounded-full shadow-sm text-pink-300 font-bold"
                      >
                        {emoji}
                      </span>
                    ))}
                  </div>
                )}

                {/* HOVER ACTION BAR */}
                {hoveredMsgId === msg.id && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`absolute -top-7 ${isMe ? 'right-0' : 'left-0'} bg-slate-800 border border-slate-700 rounded-2xl px-2 py-1 flex items-center gap-1 shadow-lg z-10`}
                  >
                    {['❤️', '👍', '🔥', '😂', '⚡'].map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => addEmojiReaction(msg.id, emoji)}
                        className="hover:scale-125 transition-transform text-xs"
                      >
                        {emoji}
                      </button>
                    ))}
                    <div className="w-px h-3 bg-slate-700 mx-1" />
                    <button
                      onClick={() => setReplyTo({ id: msg.id, text: msg.text, senderName: isMe ? 'You' : activeContact.displayName, type: msg.type })}
                      title="Reply"
                      className="p-1 hover:text-pink-400 text-slate-400"
                    >
                      <Reply className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setForwardMessage(msg)}
                      title="Forward"
                      className="p-1 hover:text-indigo-400 text-slate-400"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                )}
              </motion.div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 md:p-4 border-t border-slate-800/80 bg-slate-900/90 backdrop-blur-md relative z-20">
        {/* Reply Preview Bar */}
        {replyTo && (
          <div className="mb-2 p-2.5 bg-slate-800/90 border-l-4 border-pink-500 rounded-r-xl flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-pink-400 block">Replying to {replyTo.senderName}:</span>
              <span className="text-slate-300 line-clamp-1">{replyTo.text || `[${replyTo.type}]`}</span>
            </div>
            <button
              onClick={() => setReplyTo(null)}
              className="text-slate-400 hover:text-white p-1"
            >
              ✕
            </button>
          </div>
        )}

        <form onSubmit={handleSend} className="flex items-center gap-2">
          {/* File Attachment Input (hidden) */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageSelect}
            accept="image/*"
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Attach Photo"
            className="p-2.5 text-slate-400 hover:text-pink-400 hover:bg-slate-800 rounded-2xl transition-colors"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => setShowStickerDrawer(!showStickerDrawer)}
            title="Stickers & GIFs"
            className="p-2.5 text-slate-400 hover:text-pink-400 hover:bg-slate-800 rounded-2xl transition-colors"
          >
            <Smile className="w-5 h-5" />
          </button>

          <input
            type="text"
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setTyping(true);
            }}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2.5 text-sm bg-slate-800/90 border border-slate-700/80 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-pink-500/80 transition-colors"
          />

          <button
            type="submit"
            disabled={!text.trim()}
            className="p-3 text-white bg-gradient-to-r from-pink-500 to-indigo-600 hover:from-pink-600 hover:to-indigo-700 rounded-2xl shadow-lg shadow-pink-500/30 transition-all disabled:opacity-40 disabled:shadow-none active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        {/* Sticker & GIF Drawer Popup */}
        <AnimatePresence>
          {showStickerDrawer && (
            <StickerGifDrawer
              onSelectSticker={(stk) => {
                sendMessage(stk.name, 'sticker', stk.emoji);
              }}
              onSelectGif={(gif) => {
                sendMessage(gif.title, 'gif', gif.url);
              }}
              onClose={() => setShowStickerDrawer(false)}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Forward Modal */}
      {forwardMessage && (
        <ForwardModal
          message={forwardMessage}
          onClose={() => setForwardMessage(null)}
        />
      )}
    </div>
  );
};
