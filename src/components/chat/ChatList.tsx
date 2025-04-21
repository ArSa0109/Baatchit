import React, { useEffect, useState } from 'react';
import { MessageSquare, Search, Plus } from 'lucide-react';
import { useChatStore } from '../../stores/chatStore';
import { useAuthStore } from '../../stores/authStore';
import Avatar from '../ui/Avatar';
import Input from '../ui/Input';
import Loader from '../ui/Loader';
import Button from '../ui/Button';
import { formatMessageTime } from '../../lib/utils';
import type { User } from '../../types/supabase';

type ChatListProps = {
  onStartNewChat: () => void;
};

const ChatList: React.FC<ChatListProps> = ({ onStartNewChat }) => {
  const { user } = useAuthStore();
  const { 
    conversations, 
    activeConversation, 
    fetchConversations, 
    setActiveConversation, 
    loading 
  } = useChatStore();
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);
  
  const filteredConversations = searchQuery
    ? conversations.filter(conv => 
        conv.username.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : conversations;

  if (loading && !conversations.length) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full border-r border-gray-200 dark:border-gray-700">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="h-9 w-9 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mr-2">
              <MessageSquare className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Chats</h1>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onStartNewChat}
            className="rounded-full h-9 w-9 p-0 flex items-center justify-center"
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="relative">
          <Input
            placeholder="Search conversations"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            fullWidth
            className="pl-9"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-3 mb-3">
              <MessageSquare className="h-6 w-6 text-gray-500 dark:text-gray-400" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 mb-2">No conversations yet</p>
            <Button size="sm" onClick={onStartNewChat}>
              Start a new chat
            </Button>
          </div>
        ) : (
          <ul>
            {filteredConversations.map((conv) => (
              <li key={conv.id}>
                <button
                  onClick={() => setActiveConversation(conv)}
                  className={`w-full flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-800 ${
                    activeConversation?.id === conv.id
                      ? 'bg-gray-100 dark:bg-gray-800'
                      : ''
                  }`}
                >
                  <div className="relative">
                    <Avatar 
                      src={conv.avatar_url} 
                      alt={conv.username} 
                      online={conv.last_seen ? new Date(conv.last_seen).getTime() > Date.now() - 300000 : false}
                    />
                    {conv.unread_count > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-xs text-white">
                        {conv.unread_count}
                      </span>
                    )}
                  </div>
                  
                  <div className="ml-3 flex-1 overflow-hidden">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-900 dark:text-white truncate">
                        {conv.username}
                      </span>
                      {conv.last_message && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatMessageTime(conv.last_message.created_at)}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-0.5">
                      {conv.last_message?.file_url
                        ? `[File shared]`
                        : conv.last_message?.content || 'Start a conversation'}
                    </p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ChatList;