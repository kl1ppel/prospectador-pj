import React, { useState } from 'react';
import { Login } from './Login';
import { Register } from './Register';
import { ForgotPassword } from './ForgotPassword';

type AuthScreenType = 'login' | 'register' | 'forgot-password';

export const AuthScreen: React.FC = () => {
  const [screenType, setScreenType] = useState<AuthScreenType>('login');

  const showLogin = () => setScreenType('login');
  const showRegister = () => setScreenType('register');
  const showForgotPassword = () => setScreenType('forgot-password');

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {screenType === 'login' && (
          <Login 
            onToggleForm={showRegister} 
            onForgotPassword={showForgotPassword} 
          />
        )}
        {screenType === 'register' && (
          <Register 
            onToggleForm={showLogin} 
          />
        )}
        {screenType === 'forgot-password' && (
          <ForgotPassword 
            onBack={showLogin} 
          />
        )}
      </div>
    </div>
  );
};
