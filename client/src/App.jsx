import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'

import Sidebar from './Components/Sidebar'
import TopBar from './Components/TopBar'

import Dashboard from './pages/Dashboard'
import Calculator from './pages/Calculator'
import Products from './pages/Products'
import Materials from './pages/Materials'
import History from './pages/History'
import Admin from './pages/Admin';

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
              <Route path="/admin" element={<Admin />} />
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

export default App;
