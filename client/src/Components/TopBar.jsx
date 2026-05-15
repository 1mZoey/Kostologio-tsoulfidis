import { useState, useEffect } from "react";
import { Plus, Moon, Sun, Minus, Square, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const THEME_KEY = "theme";

function TopBar() {
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(() => {
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme) return savedTheme === "dark";
    return document.documentElement.classList.contains("dark");
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
  }, [isDark]);

  const toggleDarkMode = () => {
    document.documentElement.classList.add("theme-transitioning");
    setIsDark((prev) => !prev);

    setTimeout(() => {
      document.documentElement.classList.remove("theme-transitioning");
    }, 300);
  };

  return (
    <div className='h-12 bg-gray-50 dark:bg-[#21252b] border-r border-gray-200 dark:border-[#181a1f] flex items-center px-4 shadow-sm transition-all duration-300'>
      <div
        className='flex items-center space-x-3 flex-1 min-w-0'
        style={{ WebkitAppRegion: "drag" }}
      >
        <h1 className='text-xl font-semibold text-gray-900 dark:text-white truncate tracking-tight'>
          Κοστολόγιο
        </h1>
      </div>

      <div
        className='flex items-center space-x-3'
        style={{ WebkitAppRegion: "no-drag" }}
      >
        <button
          onClick={() => navigate("/calculator")}
          className='flex items-center space-x-2 px-3 py-1.5 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 font-semibold rounded-lg transition-colors'
        >
          <Plus className='w-4 h-4' />
          <span>Νέος Υπολογισμός</span>
        </button>

        <button
          onClick={toggleDarkMode}
          className='p-1.5 hover:bg-gray-100 dark:hover:bg-[#2c313c] rounded-lg text-gray-500 dark:text-[#abb2bf] transition-colors'
        >
          {isDark ? <Sun className='w-4 h-4' /> : <Moon className='w-4 h-4' />}
        </button>

        <button
          onClick={() => window.electronAPI?.minimizeWindow()}
          className='no-theme-transition p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2c313c] transition-colors'
        >
          <Minus className='w-4 h-4' />
        </button>

        <button
          onClick={() => window.electronAPI?.maximizeWindow()}
          className='no-theme-transition p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2c313c] transition-colors'
        >
          <Square className='w-4 h-4' />
        </button>

        <button
          onClick={() => window.electronAPI?.closeWindow()}
          className='no-theme-transition p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2c313c] transition-colors'
        >
          <X className='w-4 h-4' />
        </button>
      </div>
    </div>
  );
}

export default TopBar;
