import { useState, useEffect } from "react";
import { Plus, Moon, Sun } from "lucide-react";
import { useNavigate } from "react-router-dom";

function TopBar() {
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains("dark"),
  );
  const navigate = useNavigate();

  const toggleDarkMode = () => {
    const newDark = !isDark;
    setIsDark(newDark);

    // 1. Notify Electron FIRST — before any visual changes
    if (window.require) {
      try {
        const { ipcRenderer } = window.require("electron");
        ipcRenderer.send("theme-change", newDark);
      } catch (e) {
        console.warn("IPC outside Electron", e);
      }
    }

    // 2. Then trigger CSS transition
    document.documentElement.classList.add("theme-transitioning");
    document.documentElement.classList.toggle("dark", newDark);
    setTimeout(
      () => document.documentElement.classList.remove("theme-transitioning"),
      300,
    );
  };

  // Initial sync with Electron
  useEffect(() => {
    if (window.require) {
      try {
        const { ipcRenderer } = window.require("electron");
        ipcRenderer.send("theme-change", isDark);
      } catch (e) {
        // Ignored
      }
    }
  }, []);

  return (
    <div className="h-12 bg-gray-50 dark:bg-[#21252b] border-r border-gray-200 dark:border-[#181a1f] flex items-center px-6 shadow-sm pr-40 transition-all duration-300">
      <div
        className="flex items-center space-x-3 flex-1 min-w-0"
        style={{ WebkitAppRegion: "drag" }}
      >
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white truncate tracking-tight">
          Κοστολόγιο
        </h1>
      </div>

      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate("/calculator")}
          className="flex items-center space-x-2 px-3 py-1.5 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 font-semibold rounded-lg transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 dark:focus:ring-white dark:focus:ring-offset-[#282c34] shadow-sm tracking-wide"
        >
          <Plus className="w-4 h-4" />
          <span>Νέος Υπολογισμός</span>
        </button>

        <div className="flex items-center">
          <button
            onClick={toggleDarkMode}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-[#2c313c] rounded-lg text-gray-500 dark:text-[#abb2bf] transition-colors"
          >
            {isDark ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default TopBar;
