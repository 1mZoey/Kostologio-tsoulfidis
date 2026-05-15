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
  { name: "Διαχείριση", icon: SettingsIcon, path: "/admin" },
];

function Sidebar({ isCollapsed, setIsCollapsed }) {
  const location = useLocation();

  return (
    <aside className='w-full h-screen bg-gray-50 dark:bg-[#21252b] border-r border-gray-200 dark:border-[#181a1f] flex flex-col overflow-hidden'>
      <div className='px-3 py-3 border-b border-transparent'>
        <div
          className={`grid items-center h-9 transition-all duration-300 ease-in-out ${
            isCollapsed
              ? "grid-cols-1 justify-items-center"
              : "grid-cols-[1fr_auto]"
          }`}
        >
          <div
            className={`overflow-hidden whitespace-nowrap transition-all ease-in-out ${
              isCollapsed
                ? "max-w-0 opacity-0 duration-0"
                : "max-w-[120px] opacity-100 duration-200"
            }`}
          >
            <h2 className='text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest whitespace-nowrap'>
              Μενού
            </h2>
          </div>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className='h-9 w-9 flex items-center justify-center rounded-lg p-0 m-0 hover:bg-gray-100 dark:hover:bg-[#2c313c] text-gray-500 dark:text-gray-400 transition-colors shrink-0'
          >
            {isCollapsed ? (
              <PanelLeftOpen className='w-4 h-4 shrink-0' />
            ) : (
              <PanelLeftClose className='w-4 h-4 shrink-0' />
            )}
          </button>
        </div>
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
              className={`h-11 w-full rounded-lg text-sm font-medium group overflow-hidden transition-all duration-300 ease-in-out border flex items-center px-3 ${
                isCollapsed ? "justify-center" : "justify-start"
              } ${
                isActive
                  ? "bg-white dark:bg-[#282c34] text-gray-900 dark:text-white shadow-sm border-gray-200 dark:border-[#181a1f]"
                  : "text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-[#282c34] hover:text-gray-900 dark:hover:text-white border-transparent"
              }`}
            >
              <span
                className={`w-5 h-5 flex items-center justify-center shrink-0 ${isCollapsed ? "" : "mr-3"}`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors duration-300 ${
                    isActive
                      ? "text-gray-900 dark:text-white"
                      : "text-gray-400 dark:text-gray-500 group-hover:text-gray-900 dark:group-hover:text-white"
                  }`}
                />
              </span>

              <span
                className={`whitespace-nowrap overflow-hidden transition-all ease-in-out ${
                  isCollapsed
                    ? "max-w-0 opacity-0 ml-0 duration-0"
                    : "max-w-[180px] opacity-100 ml-3 duration-200"
                }`}
              >
                {item.name}
              </span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}

export default Sidebar;
