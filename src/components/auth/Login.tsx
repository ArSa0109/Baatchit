import React, { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { validateEmail } from '../../lib/utils';

type LoginProps = {
  onSwitchToSignUp: () => void;
};

const Login: React.FC<LoginProps> = ({ onSwitchToSignUp }) => {
  const { signIn, loading, error } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formErrors, setFormErrors] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset errors
    setFormErrors({
      email: '',
      password: '',
    });
    
    let hasError = false;
    
    // Validate email
    if (!email) {
      setFormErrors(prev => ({ ...prev, email: 'Email is required' }));
      hasError = true;
    } else if (!validateEmail(email)) {
      setFormErrors(prev => ({ ...prev, email: 'Invalid email format' }));
      hasError = true;
    }
    
    // Validate password
    if (!password) {
      setFormErrors(prev => ({ ...prev, password: 'Password is required' }));
      hasError = true;
    }
    
    if (hasError) return;
    
    await signIn(email, password);
  };

  return (
    <div className="animate-fade-in max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
      <div className="flex flex-col items-center mb-6">
        <div className="h-12 w-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mb-4">
          <MessageSquare className="h-6 w-6 text-primary-600 dark:text-primary-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome back to Baatchit</h1>
        <p className="text-gray-500 dark:text-gray-400 text-center mt-2">
          Sign in to continue your conversations
        </p>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 text-error-600 dark:text-error-400 rounded-md text-sm">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="email"
          label="Email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
          disabled={loading}
          error={formErrors.email}
        />
        
        <Input
          type="password"
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          disabled={loading}
          error={formErrors.password}
        />
        
        <Button
          type="submit"
          fullWidth
          isLoading={loading}
        >
          Sign In
        </Button>
      </form>
      
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToSignUp}
            className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium focus:outline-none"
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;