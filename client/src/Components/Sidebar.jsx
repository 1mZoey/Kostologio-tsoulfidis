import { NavLink, useLocation } from "react-router-dom";
import {
  Command,
  Calculator as CalculatorIcon,
  Layers,
  Mountain,
  History as HistoryIcon,
  PanelLeftClose,
  PanelLeftOpen,
  Settings as SettingsIcon,
  Wrench,
} from "lucide-react";

const menuItems = [
  { name: "Αναζήτηση", icon: Command, path: "/" },
  { name: "Υπολογιστής Κόστους", icon: CalculatorIcon, path: "/calculator" },
  { name: "Προϊόντα", icon: Layers, path: "/products" },
  { name: "Υλικά", icon: Mountain, path: "/materials" },
  { name: "Μηχανήματα", icon: Wrench, path: "/machines" },
  { name: "Ιστορικό", icon: HistoryIcon, path: "/history" },
  { name: "Διαχείριση", icon: SettingsIcon, path: "/admin"}
];

function Sidebar({ isCollapsed, setIsCollapsed }) {
  const location = useLocation();

  return (
    <div
      className={`${isCollapsed ? "w-20" : "w-64"} bg-gray-50 dark:bg-[#21252b] border-r border-gray-200 dark:border-[#181a1f] flex flex-col h-screen transition-all duration-300 z-30 overflow-hidden`}
    >
      <div
        className={`px-6 py-3 flex items-center ${isCollapsed ? "justify-center" : "justify-between"} border-b border-transparent shrink-0`}
      >
        {!isCollapsed && (
          <h2 className='text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest truncate'>
            Μενού
          </h2>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className='p-1.5 hover:bg-gray-100 dark:hover:bg-[#2c313c] rounded-lg text-gray-500 dark:text-gray-400 transition-colors shrink-0'
        >
          {isCollapsed ? (
            <PanelLeftOpen className='w-4 h-4' />
          ) : (
            <PanelLeftClose className='w-4 h-4' />
          )}
        </button>
      </div>

      <nav className='flex-1 px-3 mt-4 space-y-1'>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <NavLink
              key={item.name}
              to={item.path}
              title={isCollapsed ? item.name : ""}
              className={`flex items-center ${isCollapsed ? "justify-center px-0" : "px-4"} py-2.5 rounded-lg text-sm font-medium group transition-all whitespace-nowrap ${
                isActive
                  ? "bg-white dark:bg-[#282c34] text-gray-900 dark:text-white shadow-sm border border-gray-200 dark:border-[#181a1f]"
                  : "text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-[#282c34] hover:text-gray-900 dark:hover:text-white border border-transparent"
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 transition-colors ${isCollapsed ? "" : "mr-3"} ${isActive ? "text-gray-900 dark:text-white" : "text-gray-400 dark:text-gray-500 group-hover:text-gray-900 dark:group-hover:text-white"}`}
              />
              {!isCollapsed && <span className='truncate'>{item.name}</span>}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}

export default Sidebar;
