import React, { useEffect, useRef } from 'react';
import { ArrowLeft, Info } from 'lucide-react';
import { useChatStore } from '../../stores/chatStore';
import { useAuthStore } from '../../stores/authStore';
import Avatar from '../ui/Avatar';
import Message from './Message';
import MessageInput from './MessageInput';
import Button from '../ui/Button';
import Loader from '../ui/Loader';
import type { Message as MessageType, User } from '../../types/supabase';

type ChatWindowProps = {
  onBack: () => void;
};

const ChatWindow: React.FC<ChatWindowProps> = ({ onBack }) => {
  const { user } = useAuthStore();
  const { activeConversation, messages, loading } = useChatStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  if (!activeConversation) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-4 mb-4">
          <Info className="h-8 w-8 text-gray-500 dark:text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Select a conversation
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm">
          Choose an existing conversation or start a new one to begin chatting
        </p>
      </div>
    );
  }
  
  // Group messages by date
  const groupMessages = (messages: MessageType[]) => {
    return messages.reduce((groups, message, index) => {
      const currentDate = new Date(message.created_at).toDateString();
      const prevMessage = messages[index - 1];
      const prevSenderId = prevMessage?.sender_id;
      
      if (!groups[currentDate]) {
        groups[currentDate] = [];
      }
      
      message.showAvatar = message.sender_id !== prevSenderId;
      
      groups[currentDate].push(message);
      return groups;
    }, {} as Record<string, (MessageType & { showAvatar?: boolean })[]>);
  };
  
  const groupedMessages = groupMessages(messages);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-3 flex items-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="mr-2 sm:hidden"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        <Avatar 
          src={activeConversation.avatar_url} 
          alt={activeConversation.username} 
          online={activeConversation.last_seen ? new Date(activeConversation.last_seen).getTime() > Date.now() - 300000 : false}
        />
        
        <div className="ml-3">
          <h2 className="font-semibold text-gray-900 dark:text-white">
            {activeConversation.username}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {activeConversation.last_seen 
              ? `Last seen ${new Date(activeConversation.last_seen).toLocaleString()}`
              : 'Offline'}
          </p>
        </div>
      </div>
      
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-3 mb-3">
              <Info className="h-6 w-6 text-gray-500 dark:text-gray-400" />
            </div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-1">
              No messages yet
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
              Start the conversation by sending a message to {activeConversation.username}
            </p>
          </div>
        ) : (
          Object.entries(groupedMessages).map(([date, messagesForDate]) => (
            <div key={date}>
              <div className="flex justify-center my-4">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-full px-3 py-1 text-xs text-gray-500 dark:text-gray-400">
                  {new Date(date).toLocaleDateString()}
                </div>
              </div>
              
              {messagesForDate.map((message) => (
                <Message
                  key={message.id}
                  message={message}
                  isOwn={message.sender_id === user?.id}
                  sender={activeConversation as User}
                  showAvatar={message.showAvatar}
                />
              ))}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Message input */}
      <MessageInput receiverId={activeConversation.id} />
    </div>
  );
};

export default ChatWindow;