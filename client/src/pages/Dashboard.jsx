import { Calculator } from 'lucide-react';

function Dashboard() {
  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center space-x-4">
        <h1 className="text-3xl font-bold text-gray-900">Πίνακας Ελέγχου</h1>
        <span className="px-4 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">Ζωντανά</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Συνολικά Έσοδα</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">€245,340</p>
            </div>
            <Calculator className="w-12 h-12 text-blue-500 opacity-75" />
          </div>
        </div>
        {/* More stat cards... */}
      </div>
    </div>
  )
}

export default Dashboard;