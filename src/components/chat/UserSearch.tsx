import React, { useState } from 'react';
import { Search, X, ArrowLeft, UserPlus, Shield, Trash2 } from 'lucide-react';
import { useChatStore } from '../../stores/chatStore';
import { useAuthStore } from '../../stores/authStore';
import Avatar from '../ui/Avatar';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Loader from '../ui/Loader';
import type { User } from '../../types/supabase';

type UserSearchProps = {
  onClose: () => void;
  onSelectUser: (user: User) => void;
};

const UserSearch: React.FC<UserSearchProps> = ({ onClose, onSelectUser }) => {
  const { searchUsers } = useChatStore();
  const { user: currentUser, deleteUser, toggleAdminStatus } = useAuthStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  
  const handleSearch = async () => {
    if (query.length < 3) return;
    
    setLoading(true);
    const users = await searchUsers(query);
    setResults(users);
    setLoading(false);
    setSearched(true);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      await deleteUser(userId);
      // Remove user from results
      setResults(results.filter(user => user.id !== userId));
    }
  };

  const handleToggleAdmin = async (userId: string) => {
    await toggleAdminStatus(userId);
    // Update user in results
    setResults(results.map(user => 
      user.id === userId 
        ? { ...user, is_admin: !user.is_admin }
        : user
    ));
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 rounded-lg">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-4 flex items-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="mr-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        <h2 className="font-semibold text-lg">Find Users</h2>
      </div>
      
      {/* Search input */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="relative">
          <Input
            placeholder="Search by username"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            fullWidth
            className="pl-9"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          
          {query && (
            <button
              className="absolute right-3 top-2.5"
              onClick={() => setQuery('')}
            >
              <X className="h-4 w-4 text-gray-400" />
            </button>
          )}
        </div>
        
        <div className="mt-2 flex justify-end">
          <Button 
            size="sm" 
            onClick={handleSearch}
            disabled={query.length < 3 || loading}
          >
            Search
          </Button>
        </div>
      </div>
      
      {/* Results */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader />
          </div>
        ) : searched && results.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-3 mb-3">
              <Search className="h-6 w-6 text-gray-500 dark:text-gray-400" />
            </div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-1">
              No users found
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
              Try a different search term or check the username spelling
            </p>
          </div>
        ) : results.length > 0 ? (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {results.map((user) => (
              <li key={user.id} className="py-3">
                <div className="flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded-lg">
                  <button
                    onClick={() => onSelectUser(user)}
                    className="flex items-center flex-1"
                  >
                    <Avatar src={user.avatar_url} alt={user.username} />
                    <div className="ml-3 text-left">
                      <div className="flex items-center">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {user.username}
                        </p>
                        {user.is_admin && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200">
                            Admin
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {user.email}
                      </p>
                    </div>
                  </button>
                  
                  {currentUser?.is_admin && user.id !== currentUser.id && (
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleAdmin(user.id)}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        <Shield className="h-5 w-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-error-500 hover:text-error-700 dark:text-error-400 dark:hover:text-error-200"
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  )}
                  
                  {!currentUser?.is_admin && (
                    <div className="flex items-center text-primary-600 dark:text-primary-400">
                      <UserPlus className="h-5 w-5" />
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : !searched ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-3 mb-3">
              <UserPlus className="h-6 w-6 text-gray-500 dark:text-gray-400" />
            </div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-1">
              Search for users
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
              Find people by their username to start a conversation
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default UserSearch;