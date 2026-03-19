function Calculator() {
  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Υπολογιστής Κόστους</h1>
      <div className="bg-white dark:bg-[#21252b] p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-[#181a1f]">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-8">Νέα Παρτίδα Παραγωγής</h2>
        {/* Your cost calculator form goes here */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-[#abb2bf] mb-2">Προϊόν</label>
            <select className="w-full p-3 border border-gray-200 dark:border-[#181a1f] bg-gray-50 dark:bg-[#282c34] dark:text-[#abb2bf] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#61afef] cursor-pointer">
              <option>Μαρμάρινο Πλακίδιο 20x20</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-[#abb2bf] mb-2">Ποσότητα (m²)</label>
            <input type="number" className="w-full p-3 border border-gray-200 dark:border-[#181a1f] bg-gray-50 dark:bg-[#282c34] dark:text-[#abb2bf] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#61afef]" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Calculator;