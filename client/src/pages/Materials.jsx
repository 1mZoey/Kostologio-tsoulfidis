import { useState, useEffect } from 'react'
import { getCostItems } from '../services/api'
import { Box } from 'lucide-react'

function Materials() {
  const [materials, setMaterials] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCostItems()
      .then(res => { setMaterials(res.data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Υλικά</h1>
        <span className="px-3 py-1 bg-gray-100 dark:bg-[#61afef]/20 text-gray-700 dark:text-[#61afef] rounded-full text-xs font-semibold uppercase tracking-wider">
          {materials.length} αντικείμενα
        </span>
      </div>
      <div className="bg-white dark:bg-[#21252b] rounded-2xl border border-gray-200 dark:border-[#181a1f] shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400 dark:text-[#abb2bf]">Φόρτωση...</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50/50 dark:bg-[#282c34] border-b border-gray-200 dark:border-[#181a1f]">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-[#abb2bf]">Όνομα</th>
                <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-[#abb2bf]">Κατηγορία</th>
                <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-[#abb2bf]">Τύπος Μονάδας</th>
                <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-[#abb2bf]">Τιμή (€)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-[#181a1f]">
              {materials.length === 0 ? (
                <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-400 dark:text-[#abb2bf]">Δεν βρέθηκαν υλικά</td></tr>
              ) : (
                materials.map((m, i) => (
                  <tr key={m._id || i} className="hover:bg-gray-50 dark:hover:bg-[#282c34]">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white flex items-center gap-3">
                      <Box className="w-4 h-4 text-[#61afef]" />{m.name || m.source || '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-gray-100 dark:bg-[#282c34] text-gray-600 dark:text-[#abb2bf] border border-transparent dark:border-[#181a1f] rounded text-xs">{m.category || '—'}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-[#abb2bf] text-sm">{m.unitType || '—'}</td>
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">€{m.price || m.costPerUnit || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default Materials
