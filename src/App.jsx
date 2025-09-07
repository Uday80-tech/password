import React, { useEffect, useState } from 'react';
import { signInAnonymouslyUser } from './firebase/config';
import ThreeBackground from './components/ThreeBackground';
import PasswordGenerator from './components/PasswordGenerator';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Sign in anonymously to Firebase
        await signInAnonymouslyUser();
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Failed to initialize Firebase:', error);
        // Continue without Firebase if it fails
        setIsAuthenticated(true);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-white/70">Initializing Password Generator...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Three.js Background */}
      <ThreeBackground />
      
      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <PasswordGenerator />
      </div>
    </div>
  );
}

export default App;
