import React, { useState, useEffect } from 'react';
import { User, AuthScreen, Translations } from '../types';
import { db } from '../services/db';

interface AuthProps {
  onLogin: (user: User) => void;
  translations: Translations;
  initialScreen: AuthScreen;
}

const Auth: React.FC<AuthProps> = ({ onLogin, translations, initialScreen }) => {
  const [authScreen, setAuthScreen] = useState<AuthScreen>(initialScreen);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  useEffect(() => {
    setAuthScreen(initialScreen);
  }, [initialScreen]);

  const switchAuthMode = () => {
    setAuthScreen(
      authScreen === AuthScreen.Login ? AuthScreen.Register : AuthScreen.Login
    );
    setError(null);
    setSuccess(null);
    setName('');
    setEmail('');
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (authScreen === AuthScreen.Register) {
      if (!name || !email) {
        setError(translations.fillFields);
        return;
      }
      if (!validateEmail(email)) {
        setError(translations.invalidEmail);
        return;
      }

      const result = db.registerUser(name, email);

      if (result.success && result.user) {
        setSuccess(translations.registrationSuccess);
        // Automatically log in the user after a short delay to show the success message
        setTimeout(() => {
            onLogin(result.user);
        }, 1000);
      } else {
        setError(translations[result.error || ''] || "An unknown error occurred.");
      }

    } else {
      // Login
      if (!email) {
        setError(translations.fillFields);
        return;
      }
       if (!validateEmail(email)) {
        setError(translations.invalidEmail);
        return;
      }
      
      const foundUser = db.loginUser(email);

      if (foundUser) {
        onLogin(foundUser);
      } else {
        setError(translations.invalidCredentials);
      }
    }
  };

  const isLogin = authScreen === AuthScreen.Login;

  return (
    <div className="flex flex-col items-center justify-center animate-fade-in">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-orange-200">
        <h2 className="text-3xl font-bold text-center text-orange-800 mb-2">
          {isLogin ? translations.loginTitle : translations.registerTitle}
        </h2>
        <p className="text-center text-gray-500 mb-6">{isLogin ? translations.loginSubtitle : translations.registerSubtitle}</p>
        
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}
        {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">{success}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                {translations.name}
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
              />
            </div>
          )}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              {translations.email}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
            />
          </div>

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition duration-300"
            >
              {isLogin ? translations.loginButton : translations.registerButton}
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          {isLogin ? translations.noAccount : translations.haveAccount}{' '}
          <button onClick={switchAuthMode} className="font-medium text-orange-600 hover:text-orange-500">
            {isLogin ? translations.register : translations.login}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Auth;