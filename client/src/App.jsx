import { useState, useEffect } from 'react'
import { 
  Calculator as CalculatorIcon, Package, Box, Search, Plus, 
  Moon, Sun, History as HistoryIcon, Command, Layers, Mountain, ScrollText,
  PanelLeftClose, PanelLeftOpen
} from 'lucide-react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'
import './App.css'

import Dashboard from './pages/Dashboard'
import Calculator from './pages/Calculator'
import Products from './pages/Products'
import Materials from './pages/Materials'
import History from './pages/History'


const menuItems = [
  { name: 'Αναζήτηση', icon: Command, path: '/' },
  { name: 'Υπολογιστής Κόστους', icon: CalculatorIcon, path: '/calculator' },
  { name: 'Προϊόντα', icon: Layers, path: '/products' },
  { name: 'Υλικά', icon: Mountain, path: '/materials' },
  { name: 'Ιστορικό', icon: HistoryIcon, path: '/history' }
]


function TopBar() {
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'))
  const navigate = useNavigate()

  const toggleDarkMode = () => {
    const newDark = !isDark
    setIsDark(newDark)
    document.documentElement.classList.toggle('dark', newDark)
    
    // Attempt to notify Electron Main Process
    if (window.require) {
      try {
        const { ipcRenderer } = window.require('electron')
        ipcRenderer.send('theme-change', newDark)
      } catch (e) {
        console.warn('IPC outside Electron', e)
      }
    }
  }

  // Initial sync with Electron
  useEffect(() => {
    if (window.require) {
      try {
        const { ipcRenderer } = window.require('electron')
        ipcRenderer.send('theme-change', isDark)
      } catch (e) {
        // Ignored
      }
    }
  }, [])

  return (
    <div className="h-12 bg-gray-50 dark:bg-[#21252b] border-r border-gray-200 dark:border-[#181a1f] flex items-center px-6 shadow-sm pr-40 transition-all duration-300">
      <div className="flex items-center space-x-3 flex-1 min-w-0" style={{ WebkitAppRegion: 'drag' }}>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white truncate tracking-tight">Κοστολόγιο</h1>
      </div>

      <div className="flex items-center space-x-4">
        <button 
          onClick={() => navigate('/calculator')}
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
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  )
}

function Sidebar({ isCollapsed, setIsCollapsed }) {
  const location = useLocation()
  
  return (
    <div className={`${isCollapsed ? 'w-20' : 'w-64'} bg-gray-50 dark:bg-[#21252b] border-r border-gray-200 dark:border-[#181a1f] flex flex-col h-screen transition-all duration-300 z-30 overflow-hidden`}>
      <div className={`px-6 py-3 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} border-b border-transparent shrink-0`}>
        {!isCollapsed && <h2 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest truncate">Μενού</h2>}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 hover:bg-gray-100 dark:hover:bg-[#2c313c] rounded-lg text-gray-500 dark:text-gray-400 transition-colors shrink-0"
        >
          {isCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>
      </div>
      
      <nav className="flex-1 px-3 mt-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          
          return (
            <Link
              key={item.name}
              to={item.path}
              title={isCollapsed ? item.name : ''}
              className={`flex items-center ${isCollapsed ? 'justify-center px-0' : 'px-4'} py-2.5 rounded-lg text-sm font-medium group transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-white dark:bg-[#282c34] text-gray-900 dark:text-white shadow-sm border border-gray-200 dark:border-[#181a1f]'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-[#282c34] hover:text-gray-900 dark:hover:text-white border border-transparent'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 transition-colors ${isCollapsed ? '' : 'mr-3'} ${isActive ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-900 dark:group-hover:text-white'}`} />
              {!isCollapsed && <span className="truncate">{item.name}</span>}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}



// Placeholder pages

function AppContent() {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#21252b] overflow-hidden font-sans">
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 overflow-auto bg-gray-50 dark:bg-[#21252b] text-gray-900 dark:text-gray-100">
          <div className="h-full p-4 lg:p-6 max-w-7xl mx-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/calculator" element={<Calculator />} />
              <Route path="/products" element={<Products />} />
              <Route path="/materials" element={<Materials />} />
              <Route path="/history" element={<History />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  )
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App
