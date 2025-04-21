import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useAuthStore } from './stores/authStore';
import Auth from './pages/Auth';
import Chat from './pages/Chat';
import Loader from './components/ui/Loader';

// Set dark mode based on user preference
if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
  document.documentElement.classList.add('dark');
}

function App() {
  const { user, loading } = useAuthStore();
  
  // Handle authentication state
  useEffect(() => {
    // Initialize authentication listener in authStore.ts
  }, []);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <>
      <Router>
        <Routes>
          <Route 
            path="/" 
            element={user ? <Chat /> : <Navigate to="/auth" replace />} 
          />
          <Route 
            path="/auth" 
            element={user ? <Navigate to="/" replace /> : <Auth />} 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
      
      <Toaster 
        position="top-right"
        toastOptions={{
          className: 'dark:bg-gray-800 dark:text-white',
          style: {
            backgroundColor: 'var(--background)',
            color: 'var(--foreground)',
          },
        }}
      />
    </>
  );
}

export default App;