import { useState, useEffect } from 'react'
import { 
  LayoutDashboard, Calculator as CalculatorIcon, Package, Box, Search, Plus, 
  Moon, Sun, History as HistoryIcon
} from 'lucide-react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import './App.css'

import Dashboard from './pages/Dashboard'
import Calculator from './pages/Calculator'
import Products from './pages/Products'
import Materials from './pages/Materials'
import History from './pages/History'


const menuItems = [
  { name: 'Πίνακας Ελέγχου', icon: LayoutDashboard, path: '/' },
  { name: 'Υπολογιστής Κόστους', icon: CalculatorIcon, path: '/calculator' },
  { name: 'Προϊόντα', icon: Package, path: '/products' },
  { name: 'Υλικά', icon: Box, path: '/materials' },
  { name: 'Ιστορικό Υπολογισμών', icon: HistoryIcon, path: '/history' }
]


function TopBar() {
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'))
  const { ipcRenderer } = window.require('electron');
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
    <div className="h-12 bg-white dark:bg-[#21252b] border-b border-gray-200 dark:border-[#181a1f] flex items-center px-6 shadow-sm pr-40">
      {/* Logo + App Name (Draggable) */}
      <div className="flex items-center space-x-3 flex-1 min-w-0" style={{ WebkitAppRegion: 'drag' }}>
        <div className="w-8 h-8 bg-[#61afef] rounded-lg flex items-center justify-center shadow-md">
          <span className="text-white font-bold text-sm">K</span>
        </div>
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white truncate tracking-tight">Κοστολόγιο</h1>
      </div>

      {/* Search + Actions */}
      <div className="flex items-center space-x-4">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 dark:text-[#abb2bf] absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Αναζήτηση..." 
            className="pl-9 pr-4 py-1.5 w-64 bg-gray-50 dark:bg-[#282c34] rounded-lg text-sm border border-gray-200 dark:border-[#181a1f] focus:outline-none focus:ring-1 focus:ring-[#61afef] dark:text-[#abb2bf] placeholder:text-gray-400 dark:placeholder:text-[#abb2bf]"
          />
        </div>
        
        <button className="flex items-center space-x-2 px-3 py-1.5 bg-[#61afef] text-white rounded-lg hover:brightness-110 shadow-sm transition-none text-sm font-medium">
          <Plus className="w-4 h-4" />
          <span>Νέος Υπολογισμός</span>
        </button>

        {/* User Menu */}
        <div className="flex items-center">
          <button 
            onClick={toggleDarkMode}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-[#2c313c] rounded-lg text-gray-500 dark:text-[#abb2bf]"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  )
}

function Sidebar() {
  const location = useLocation()
  
  return (
    <div className="w-64 bg-gray-50 dark:bg-[#21252b] border-r border-gray-200 dark:border-[#181a1f] flex flex-col h-screen">
      <div className="p-6">
        <h2 className="text-xs font-bold text-gray-400 dark:text-[#abb2bf] uppercase tracking-widest">Μενού</h2>
      </div>
      
      <nav className="flex-1 px-3 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center px-4 py-2.5 rounded-lg text-sm font-medium group ${
                isActive
                  ? 'bg-white dark:bg-[#282c34] text-[#61afef] dark:text-[#61afef] shadow-sm border border-gray-200 dark:border-[#181a1f]'
                  : 'text-gray-600 dark:text-[#abb2bf] hover:bg-white dark:hover:bg-[#2c313c] hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 mr-3 ${isActive ? 'text-[#61afef]' : 'text-gray-400 dark:text-[#abb2bf] group-hover:text-gray-600 dark:group-hover:text-white'}`} />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}



// Placeholder pages

function AppContent() {
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-[#282c34] overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopBar />
        <main className="flex-1 overflow-auto text-gray-900 dark:text-[#abb2bf] p-2">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/calculator" element={<Calculator />} />
            <Route path="/products" element={<Products />} />
            <Route path="/materials" element={<Materials />} />
            <Route path="/history" element={<History />} />
          </Routes>
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
