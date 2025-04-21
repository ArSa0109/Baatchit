import React, { useState, useRef } from 'react';
import { Send, Paperclip, X } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { useChatStore } from '../../stores/chatStore';
import Button from '../ui/Button';
import { formatFileSize } from '../../lib/utils';

type MessageInputProps = {
  receiverId: string;
};

const MessageInput: React.FC<MessageInputProps> = ({ receiverId }) => {
  const { sendMessage, loading } = useChatStore();
  const [message, setMessage] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const onDrop = (acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    
    if (selectedFile) {
      // Check file size limits
      const sizeInMB = selectedFile.size / (1024 * 1024);
      
      if (selectedFile.type.startsWith('image/') && sizeInMB > 5) {
        setFileError('Images must be less than 5MB');
        return;
      } else if (selectedFile.type.startsWith('video/') && sizeInMB > 10) {
        setFileError('Videos must be less than 10MB');
        return;
      } else if (selectedFile.type === 'application/pdf' && sizeInMB > 5) {
        setFileError('PDF files must be less than 5MB');
        return;
      } else if (sizeInMB > 5) {
        setFileError('Files must be less than 5MB');
        return;
      }
      
      setFile(selectedFile);
      setFileError('');
    }
  };
  
  const { getRootProps, getInputProps } = useDropzone({ 
    onDrop,
    maxFiles: 1,
    multiple: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if ((!message.trim() && !file) || loading) return;
    
    await sendMessage(receiverId, message, file || undefined);
    
    setMessage('');
    setFile(null);
    
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className="border-t border-gray-200 dark:border-gray-700 px-4 py-3"
    >
      {fileError && (
        <div className="mb-2 p-2 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 text-error-600 dark:text-error-400 rounded-md text-xs">
          {fileError}
        </div>
      )}
      
      {file && (
        <div className="mb-2 p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md flex items-center justify-between">
          <div className="flex items-center truncate">
            <div className="min-w-0 truncate">
              <p className="text-sm font-medium truncate">{file.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatFileSize(file.size)}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setFile(null)}
            className="ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1 h-6 w-6"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      <div className="flex items-end gap-2">
        <div {...getRootProps()} className="flex-shrink-0">
          <input {...getInputProps()} />
          <Button
            type="button"
            variant="ghost"
            className="rounded-full h-10 w-10 p-0 flex items-center justify-center"
          >
            <Paperclip className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </Button>
        </div>
        
        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            className="w-full rounded-2xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 pr-12 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            style={{ 
              minHeight: '44px', 
              maxHeight: '120px',
            }}
          />
        </div>
        
        <Button
          type="submit"
          variant="primary"
          disabled={(!message.trim() && !file) || loading}
          className="rounded-full h-10 w-10 p-0 flex items-center justify-center"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </form>
  );
};

export default MessageInput;