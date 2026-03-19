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
        <h1 className="text-3xl font-bold text-gray-900">Υλικά</h1>
        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
          {materials.length} αντικείμενα
        </span>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Φόρτωση...</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Όνομα</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Κατηγορία</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Τύπος Μονάδας</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Τιμή (€)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {materials.length === 0 ? (
                <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-400">Δεν βρέθηκαν υλικά</td></tr>
              ) : (
                materials.map((m, i) => (
                  <tr key={m._id || i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-2">
                      <Box className="w-4 h-4 text-gray-400" />{m.name || m.source || '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">{m.category || '—'}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{m.unitType || '—'}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">€{m.price || m.costPerUnit || '—'}</td>
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
