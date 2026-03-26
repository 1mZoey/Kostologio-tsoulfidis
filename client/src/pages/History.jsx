import { History as HistoryIcon } from 'lucide-react'

function History() {
  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Παλαιότεροι Υπολογισμοί</h1>
      <div className="bg-white dark:bg-[#21252b] rounded-2xl border border-gray-200 dark:border-[#181a1f] shadow-sm p-12 text-center">
        <HistoryIcon className="w-12 h-12 text-gray-300 dark:text-[#abb2bf] opacity-50 mx-auto mb-4" />
        <p className="text-gray-500 dark:text-[#abb2bf] text-lg font-medium">Δεν υπάρχουν παλαιότεροι υπολογισμοί ακόμα.</p>
        <p className="text-gray-400 dark:text-[#abb2bf] opacity-70 text-sm mt-2">Ξεκινήστε έναν νέο υπολογισμό από τη σελίδα Υπολογιστής Κόστους.</p>
      </div>
    </div>
  )
}

export default History;
