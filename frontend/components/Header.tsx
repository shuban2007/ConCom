import React, { useEffect, useState } from 'react';
import { FileStack, Moon, Sun } from 'lucide-react';

const Header: React.FC = () => {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    // Check initial preference or system preference
    const isDarkMode = document.documentElement.classList.contains('dark');
    setIsDark(isDarkMode);
  }, []);

  const toggleTheme = () => {
    const newMode = !isDark;
    setIsDark(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-md dark:border-gray-800 dark:bg-gray-950/80 transition-colors duration-300">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 p-2 text-white shadow-lg shadow-brand-500/20">
            <FileStack className="h-6 w-6" />
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
            Con<span className="text-brand-500 dark:text-brand-400">Com</span>
          </span>
        </div>

        <button
          onClick={toggleTheme}
          className="rounded-full bg-gray-100 p-2 text-gray-600 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-offset-gray-950 transition-all duration-200"
          aria-label="Toggle Dark Mode"
        >
          {isDark ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </button>
      </div>
    </header>
  );
};

export default Header;