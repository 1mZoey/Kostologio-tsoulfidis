import { Calculator } from 'lucide-react';

function Dashboard() {
  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center space-x-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Πίνακας Ελέγχου</h1>
        <span className="px-4 py-1 bg-gray-100 dark:bg-[#61afef]/20 text-gray-700 dark:text-[#61afef] rounded-full text-xs font-semibold uppercase tracking-wider">Ζωντανά</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-[#21252b] p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-[#181a1f] hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-[#abb2bf]">Συνολικά Έσοδα</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">€245,340</p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-[#282c34] rounded-xl">
              <Calculator className="w-8 h-8 text-[#61afef]" />
            </div>
          </div>
        </div>
        {/* Περισσότερες κάρτες στατιστικών... */}
      </div>
    </div>
  )
}

export default Dashboard;