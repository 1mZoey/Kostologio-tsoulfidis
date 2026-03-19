import { useState } from 'react'
import { 
  LayoutDashboard, Calculator as CalculatorIcon, Package, Box, Search, User, Plus, 
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
  const [isDark, setIsDark] = useState(false)
  
  return (
    <div className="h-12 bg-white border-b border-gray-200 flex items-center px-6 shadow-sm pr-40">
      {/* Logo + App Name (Draggable) */}
      <div className="flex items-center space-x-3 flex-1 min-w-0" style={{ WebkitAppRegion: 'drag' }}>
        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">K</span>
        </div>
        <h1 className="text-xl font-semibold text-gray-900 truncate">Κοστολόγιο</h1>
      </div>

      {/* Search + Actions */}
      <div className="flex items-center space-x-4">
        <div className="relative">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Αναζήτηση προϊόντων..." 
            className="pl-10 pr-4 py-2 w-64 bg-gray-100 rounded-lg text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
        </div>
        
        <button className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all text-sm font-medium">
          <Plus className="w-4 h-4" />
          <span>Νέος Υπολογισμός</span>
        </button>

        {/* User Menu */}
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setIsDark(!isDark)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {isDark ? <Sun className="w-5 h-5 text-gray-600" /> : <Moon className="w-5 h-5 text-gray-600" />}
          </button>
          <button className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  )
}

function Sidebar() {
  const location = useLocation()
  
  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col h-screen">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Μενού</h2>
      </div>
      
      <nav className="flex-1 py-6 space-y-1 px-3">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all group ${
                isActive
                  ? 'bg-white text-blue-600 border border-blue-200 shadow-sm'
                  : 'text-gray-700 hover:bg-white hover:text-gray-900 hover:shadow-sm'
              }`}
            >
              <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'}`} />
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
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopBar />
        <main className="flex-1 overflow-auto">
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
