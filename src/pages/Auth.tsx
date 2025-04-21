import React, { useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import Login from '../components/auth/Login';
import SignUp from '../components/auth/SignUp';
import Button from '../components/ui/Button';

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );
  
  const toggleDarkMode = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
    setIsDarkMode(!isDarkMode);
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <div className="absolute top-4 right-4">
        <Button
          variant="ghost"
          onClick={toggleDarkMode}
          className="rounded-full h-10 w-10 p-0 flex items-center justify-center"
        >
          {isDarkMode ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>
      </div>
      
      <div className="flex flex-col items-center justify-center flex-1 px-4 py-12">
        {isLogin ? (
          <Login onSwitchToSignUp={() => setIsLogin(false)} />
        ) : (
          <SignUp onSwitchToLogin={() => setIsLogin(true)} />
        )}
      </div>
      
      <footer className="py-4 text-center text-sm text-gray-500 dark:text-gray-400">
        &copy; {new Date().getFullYear()} Baatchit. All rights reserved.
      </footer>
    </div>
  );
};

export default Auth;