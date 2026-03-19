import { History as HistoryIcon } from 'lucide-react'

function History() {
  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Past Calculations</h1>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
        <HistoryIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-400 text-lg">No past calculations yet.</p>
        <p className="text-gray-400 text-sm mt-2">Start a new calculation from the Cost Calculator page.</p>
      </div>
    </div>
  )
}

export default History
