import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ChatProvider, useChat } from './context/ChatContext';
import { PinAuthModal } from './components/auth/PinAuthModal';
import { Sidebar } from './components/chat/Sidebar';
import { ChatArea } from './components/chat/ChatArea';
import { PingOverlay } from './components/chat/PingOverlay';
import { SettingsModal } from './components/settings/SettingsModal';
import { NewChatModal } from './components/contacts/NewChatModal';

const AppContent: React.FC = () => {
  const { user, isPinLocked } = useAuth();
  const { activeConversation, setActiveConversationId } = useChat();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 font-sans antialiased text-slate-100 selection:bg-pink-500 selection:text-white">
      {/* Security PIN Authentication Modal */}
      <PinAuthModal />

      {/* Real-Time Live Ping Radar Overlay */}
      <PingOverlay />

      {/* Main App Layout */}
      {!isPinLocked && user && (
        <div className="flex w-full h-full relative">
          {/* Left Navigation Sidebar */}
          <Sidebar
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenNewChat={() => setIsNewChatOpen(true)}
            isMobileOpen={isMobileSidebarOpen}
            onCloseMobile={() => setIsMobileSidebarOpen(false)}
          />

          {/* Right Active Chat Workspace */}
          <ChatArea
            onBackMobile={() => setIsMobileSidebarOpen(true)}
          />

          {/* Modals */}
          {isSettingsOpen && (
            <SettingsModal onClose={() => setIsSettingsOpen(false)} />
          )}

          {isNewChatOpen && (
            <NewChatModal onClose={() => setIsNewChatOpen(false)} />
          )}
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <ChatProvider>
        <AppContent />
      </ChatProvider>
    </AuthProvider>
  );
}
