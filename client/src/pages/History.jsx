import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { History as HistoryIcon, Pencil, Trash2 } from 'lucide-react'
import axios from 'axios'

function History() {
  const [entries, setEntries]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [selected, setSelected] = useState(new Set())
  const navigate = useNavigate()

  useEffect(() => {
    axios.get('/api/history')
      .then(res => { setEntries(res.data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const toggleSelect = (id) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    setSelected(selected.size === entries.length ? new Set() : new Set(entries.map(e => e._id?.toString())))
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Διαγραφή αυτής της εγγραφής;')) return
    await axios.delete(`/api/history/${id}`)
    setEntries(prev => prev.filter(e => e._id?.toString() !== id))
    setSelected(prev => { const next = new Set(prev); next.delete(id); return next })
  }

  const handleBulkDelete = async () => {
    if (!window.confirm(`Διαγραφή ${selected.size} εγγραφών;`)) return
    await axios.post('/api/history/bulk-delete', { ids: [...selected] })
    setEntries(prev => prev.filter(e => !selected.has(e._id?.toString())))
    setSelected(new Set())
  }

  const handleEdit = (entry) => {
    navigate('/calculator', { state: { editMode: true, historyItem: entry } })
  }

  const fmt = (val) => (val != null ? Number(val).toFixed(2) : '—')

  const formatDate = (d) => new Date(d).toLocaleDateString('el-GR', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  })

  return (
    <div className="px-4 py-6 md:px-8 md:py-8 space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300">
      <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-[#181a1f]">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Παλαιότεροι Υπολογισμοί</h1>
        <div className="flex items-center gap-3">
          {selected.size > 0 && (
            <button
              onClick={handleBulkDelete}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-all active:scale-95 shadow-sm"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Διαγραφή {selected.size} επιλεγμένων
            </button>
          )}
          <span className="px-3 py-1 bg-gray-100 dark:bg-[#282c34] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-[#181a1f] rounded-full text-xs font-semibold uppercase tracking-wider">
            {entries.length} αντικείμενα
          </span>
        </div>
      </div>

      <div className="bg-white dark:bg-[#282c34] rounded-2xl border border-gray-200 dark:border-[#181a1f] shadow-sm overflow-x-auto">
        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white" />
          </div>
        ) : entries.length === 0 ? (
          <div className="p-12 text-center">
            <HistoryIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">Δεν υπάρχουν παλαιότεροι υπολογισμοί ακόμα.</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">Ξεκινήστε έναν νέο υπολογισμό από τη σελίδα Υπολογιστής Κόστους.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-[#21252b] border-b border-gray-200 dark:border-[#181a1f]">
              <tr>
                <th className="px-4 py-5">
                  <input
                    type="checkbox"
                    checked={selected.size === entries.length && entries.length > 0}
                    onChange={toggleAll}
                    className="w-4 h-4 rounded cursor-pointer accent-gray-900 dark:accent-white"
                  />
                </th>
                {['Όνομα', 'Προϊόν', 'Πηγή', 'Ποσότητα', 'Σύνολο με ΦΠΑ', 'Ημερομηνία', 'Ενέργειες'].map(h => (
                  <th key={h} className="text-left px-4 py-5 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-[#181a1f]">
              {entries.map((e, i) => {
                const id = e._id?.toString()
                const isSelected = selected.has(id)
                return (
                  <tr
                    key={id || i}
                    className={`transition-colors hover:bg-gray-50/50 dark:hover:bg-[#2c313c]/50 ${isSelected ? 'bg-gray-100/60 dark:bg-[#2c313c]/40' : ''}`}
                  >
                    <td className="px-4 py-5">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(id)}
                        className="w-4 h-4 rounded cursor-pointer accent-gray-900 dark:accent-white"
                      />
                    </td>
                    <td className="px-4 py-5 font-medium text-gray-900 dark:text-gray-100 min-w-[150px]">
                      {e.name || <span className="text-gray-400 dark:text-gray-500 italic font-normal text-sm">Χωρίς όνομα</span>}
                    </td>
                    <td className="px-4 py-5 text-gray-600 dark:text-gray-300 text-sm whitespace-nowrap">{e.inputs?.productName || '—'}</td>
                    <td className="px-4 py-5 text-gray-500 dark:text-gray-400 text-sm whitespace-nowrap">{e.inputs?.source || '—'}</td>
                    <td className="px-4 py-5 text-gray-500 dark:text-gray-400 text-sm whitespace-nowrap">{e.inputs?.quantity} m²</td>
                    <td className="px-4 py-5 font-semibold text-gray-900 dark:text-gray-100 whitespace-nowrap">€{fmt(e.result?.grandTotalWithTax)}</td>
                    <td className="px-4 py-5 text-gray-500 dark:text-gray-400 text-sm whitespace-nowrap">{formatDate(e.createdAt)}</td>
                    <td className="px-4 py-5">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(e)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-[#21252b] dark:hover:bg-[#2c313c] text-gray-700 dark:text-gray-300 text-xs font-medium rounded-lg transition-all active:scale-95"
                        >
                          <Pencil className="w-3 h-3" />
                          Επεξεργασία
                        </button>
                        <button
                          onClick={() => handleDelete(id)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-medium rounded-lg transition-all active:scale-95"
                        >
                          <Trash2 className="w-3 h-3" />
                          Διαγραφή
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default History
