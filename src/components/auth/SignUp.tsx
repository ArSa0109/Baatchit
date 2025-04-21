import React, { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { validateEmail, validateUsername, validatePassword } from '../../lib/utils';

type SignUpProps = {
  onSwitchToLogin: () => void;
};

const SignUp: React.FC<SignUpProps> = ({ onSwitchToLogin }) => {
  const { signUp, loading, error, checkUsername } = useAuthStore();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [formErrors, setFormErrors] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  // Debounced username validation
  const handleUsernameChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUsername(value);
    
    if (!validateUsername(value)) {
      setFormErrors(prev => ({ 
        ...prev, 
        username: 'Username must be 3-20 characters and contain only letters, numbers, underscores, and hyphens' 
      }));
      return;
    }
    
    if (value.length >= 3) {
      setCheckingUsername(true);
      const taken = await checkUsername(value);
      setCheckingUsername(false);
      
      if (taken) {
        setFormErrors(prev => ({ ...prev, username: 'Username already taken' }));
      } else {
        setFormErrors(prev => ({ ...prev, username: '' }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset errors
    setFormErrors({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    });
    
    let hasError = false;
    
    // Validate username
    if (!username) {
      setFormErrors(prev => ({ ...prev, username: 'Username is required' }));
      hasError = true;
    } else if (!validateUsername(username)) {
      setFormErrors(prev => ({ 
        ...prev, 
        username: 'Username must be 3-20 characters and contain only letters, numbers, underscores, and hyphens' 
      }));
      hasError = true;
    }
    
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
    } else if (!validatePassword(password)) {
      setFormErrors(prev => ({ ...prev, password: 'Password must be at least 8 characters' }));
      hasError = true;
    }
    
    // Validate confirm password
    if (password !== confirmPassword) {
      setFormErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }));
      hasError = true;
    }
    
    if (hasError) return;
    
    await signUp(email, password, username);
  };

  return (
    <div className="animate-fade-in max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
      <div className="flex flex-col items-center mb-6">
        <div className="h-12 w-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mb-4">
          <MessageSquare className="h-6 w-6 text-primary-600 dark:text-primary-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Join Baatchit</h1>
        <p className="text-gray-500 dark:text-gray-400 text-center mt-2">
          Create an account to start chatting
        </p>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 text-error-600 dark:text-error-400 rounded-md text-sm">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="text"
          label="Username"
          placeholder="Choose a unique username"
          value={username}
          onChange={handleUsernameChange}
          fullWidth
          disabled={loading}
          error={formErrors.username}
        />
        
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
          placeholder="Create a password (min. 8 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          disabled={loading}
          error={formErrors.password}
        />
        
        <Input
          type="password"
          label="Confirm Password"
          placeholder="Confirm your password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          fullWidth
          disabled={loading}
          error={formErrors.confirmPassword}
        />
        
        <Button
          type="submit"
          fullWidth
          isLoading={loading || checkingUsername}
        >
          Create Account
        </Button>
      </form>
      
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium focus:outline-none"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignUp;