import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

type LanguageContextType = {
  language: '日本語' | 'English';
  setLanguage: (language: '日本語' | 'English') => void;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { i18n } = useTranslation();
  const [language, setLanguageState] = useState<'日本語' | 'English'>('English');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('i18nextLng');
    if (savedLanguage === 'ja') {
      setLanguageState('日本語');
    } else {
      setLanguageState('English');
    }
  }, []);

  const setLanguage = (newLanguage: '日本語' | 'English') => {
    setLanguageState(newLanguage);
    
    if (newLanguage === '日本語') {
      i18n.changeLanguage('ja');
    } else {
      i18n.changeLanguage('en');
    }
    
    localStorage.setItem('userLanguage', newLanguage);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
