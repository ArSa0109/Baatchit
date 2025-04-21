import React from 'react';
import { Download, FileText, Image, Video, File } from 'lucide-react';
import { cn, formatMessageDateTime, getFileIcon, getFileTypeLabel } from '../../lib/utils';
import Avatar from '../ui/Avatar';
import type { Message as MessageType, User } from '../../types/supabase';

type MessageProps = {
  message: MessageType;
  isOwn: boolean;
  sender?: User;
  showAvatar?: boolean;
};

const Message: React.FC<MessageProps> = ({ 
  message, 
  isOwn, 
  sender, 
  showAvatar = true 
}) => {
  const fileIcon = message.file_type ? getFileIcon(message.file_type) : null;
  const fileLabel = message.file_type ? getFileTypeLabel(message.file_type) : null;
  const isImage = message.file_type?.startsWith('image/');
  const isVideo = message.file_type?.startsWith('video/');

  return (
    <div className={cn(
      'flex mb-4',
      isOwn ? 'justify-end' : 'justify-start'
    )}>
      {!isOwn && showAvatar && (
        <div className="flex-shrink-0 mr-2">
          <Avatar
            src={sender?.avatar_url}
            alt={sender?.username || 'User'}
            size="sm"
          />
        </div>
      )}

      <div className={cn(
        'max-w-[75%]',
        !showAvatar && !isOwn && 'ml-10'
      )}>
        <div className={cn(
          'rounded-lg py-2 px-3 inline-block',
          isOwn 
            ? 'bg-primary-600 text-white' 
            : 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white'
        )}>
          {/* File content */}
          {message.file_url && (
            <div className="mb-2">
              {isImage ? (
                <div className="rounded-md overflow-hidden mb-2">
                  <img 
                    src={message.file_url} 
                    alt="Shared image" 
                    className="max-w-full h-auto max-h-[300px] object-contain"
                  />
                </div>
              ) : isVideo ? (
                <div className="rounded-md overflow-hidden mb-2">
                  <video 
                    src={message.file_url} 
                    controls 
                    className="max-w-full h-auto max-h-[300px]"
                  />
                </div>
              ) : (
                <a 
                  href={message.file_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={cn(
                    "flex items-center p-3 rounded-md mb-2",
                    isOwn 
                      ? "bg-primary-700/50 hover:bg-primary-700/70" 
                      : "bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
                  )}
                >
                  <div className="mr-3">
                    {fileIcon === 'File' && <File className="h-8 w-8" />}
                    {fileIcon === 'FileText' && <FileText className="h-8 w-8" />}
                    {fileIcon === 'Image' && <Image className="h-8 w-8" />}
                    {fileIcon === 'Video' && <Video className="h-8 w-8" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{message.file_url.split('/').pop()}</div>
                    <div className="text-xs opacity-75">{fileLabel}</div>
                  </div>
                  <Download className="h-4 w-4 ml-2" />
                </a>
              )}
            </div>
          )}

          {/* Text content */}
          {message.content && (
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          )}
        </div>
        
        <div className={cn(
          'text-xs mt-1',
          isOwn ? 'text-right text-gray-500 dark:text-gray-400' : 'text-gray-500 dark:text-gray-400'
        )}>
          {formatMessageDateTime(message.created_at)}
        </div>
      </div>
    </div>
  );
};

export default Message;