// src/Components/ThemeToggle.jsx
import { useState, useEffect } from 'react';
import TelegramWebApp from '@twa-dev/sdk';
import './ThemeToggle.css';

export const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(false);

  // Определяем текущую тему из Telegram
  const getTelegramTheme = () => {
    const theme = TelegramWebApp?.themeParams || {};
    return theme.backgroundColor === '#000000' || 
           theme.backgroundColor === '#1a1a1a' ||
           (theme.backgroundColor && theme.backgroundColor.includes('1a1a1a'));
  };

  // Синхронизация с Telegram
  useEffect(() => {
    setIsDark(getTelegramTheme());
  }, []);

  const toggleTheme = () => {
    // В Mini App мы НЕ можем изменить тему Telegram программно!
    // Поэтому просто меняем локальную тему приложения
    const newTheme = !isDark;
    setIsDark(newTheme);
    
    // Применяем тему к нашему приложению
    document.documentElement.setAttribute('data-theme', newTheme ? 'dark' : 'light');
    
    // Сохраняем в localStorage для сессии
    localStorage.setItem('telepulse-theme', newTheme ? 'dark' : 'light');
  };

  return (
    <button 
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={isDark ? "Переключить на светлую тему" : "Переключить на тёмную тему"}
    >
      <div className="toggle-track">
        <div className={`toggle-thumb ${isDark ? 'dark' : 'light'}`}>
          {isDark ? '🌙' : '☀️'}
        </div>
      </div>
    </button>
  );
};