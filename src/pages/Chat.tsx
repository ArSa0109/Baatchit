import React, { useState, useEffect } from 'react';
import { Moon, Sun, LogOut } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useChatStore, initializeRealtime } from '../stores/chatStore';
import ChatList from '../components/chat/ChatList';
import ChatWindow from '../components/chat/ChatWindow';
import UserSearch from '../components/chat/UserSearch';
import Button from '../components/ui/Button';
import type { User } from '../types/supabase';

const Chat: React.FC = () => {
  const { signOut } = useAuthStore();
  const { setActiveConversation } = useChatStore();
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
  
  useEffect(() => {
    const cleanupRealtime = initializeRealtime();
    
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      cleanupRealtime();
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  const toggleDarkMode = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
    setIsDarkMode(!isDarkMode);
  };
  
  const handleSelectUser = (user: User) => {
    setActiveConversation({
      id: user.id,
      username: user.username,
      avatar_url: user.avatar_url,
      last_seen: user.last_seen,
      unread_count: 0
    });
    setShowUserSearch(false);
  };
  
  const handleStartNewChat = () => {
    setShowUserSearch(true);
  };
  
  const handleBack = () => {
    if (isMobileView) {
      setActiveConversation(null);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 py-2 px-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-primary-600 dark:text-primary-400">
          Baatchit
        </h1>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            onClick={toggleDarkMode}
            className="rounded-full h-9 w-9 p-0 flex items-center justify-center"
          >
            {isDarkMode ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
          
          <Button
            variant="ghost"
            onClick={signOut}
            className="rounded-full h-9 w-9 p-0 flex items-center justify-center"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>
      
      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {showUserSearch ? (
          <div className="w-full md:w-96 h-full">
            <UserSearch
              onClose={() => setShowUserSearch(false)}
              onSelectUser={handleSelectUser}
            />
          </div>
        ) : (
          <>
            {/* Chat list - hide on mobile when a chat is active */}
            {(!isMobileView || !useChatStore.getState().activeConversation) && (
              <div className="w-full md:w-96 h-full">
                <ChatList onStartNewChat={handleStartNewChat} />
              </div>
            )}
            
            {/* Chat window - show on mobile only when a chat is active */}
            {(!isMobileView || useChatStore.getState().activeConversation) && (
              <div className="hidden md:block md:flex-1 h-full md:border-l md:border-gray-200 md:dark:border-gray-700">
                <ChatWindow onBack={handleBack} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Chat;