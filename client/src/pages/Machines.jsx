import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Wrench, Cpu } from 'lucide-react'
import { CalculatorIcon } from 'lucide-react'
import axios from 'axios'

function CostCell({ machine }) {
  const parts = []

  if (machine.costPerM2 != null) {
    parts.push({ label: null, value: machine.costPerM2, unit: '/m²' })
  }
  if (machine.costPerM2_stone != null) {
    parts.push({ label: 'Πέτρα', value: machine.costPerM2_stone, unit: '/m²' })
  }
  if (machine.costPerM2_marble != null) {
    parts.push({ label: 'Μάρμαρο', value: machine.costPerM2_marble, unit: '/m²' })
  }
  if (machine.costPerM2_stone_alt != null) {
    parts.push({ label: 'Φινίρ.', value: machine.costPerM2_stone_alt, unit: '/m²' })
  }
  if (machine.costPerM_primary != null) {
    parts.push({ label: 'Κύρια', value: machine.costPerM_primary, unit: '/m' })
  }
  if (machine.costPerM_secondary != null) {
    parts.push({ label: 'Δευτ.', value: machine.costPerM_secondary, unit: '/m' })
  }
  // Οριζόντιο — per cut
  if (parts.length === 0 && machine.notes && machine.notes.includes('30.25')) {
    parts.push({ label: 'Κοψιά', value: 30.25, unit: '/κοψιά' })
  }

  if (parts.length === 0) return <span className="text-gray-400 dark:text-gray-500">—</span>

  return (
    <div className="flex flex-wrap gap-1.5">
      {parts.map((p, i) => (
        <span
          key={i}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-100 dark:bg-[#21252b] border border-gray-200 dark:border-[#181a1f] text-xs font-medium text-gray-700 dark:text-gray-300"
        >
          {p.label && (
            <span className="text-gray-400 dark:text-gray-500">{p.label}</span>
          )}
          <span className="text-gray-900 dark:text-gray-100 font-semibold">€{p.value}</span>
          <span className="text-gray-400 dark:text-gray-500">{p.unit}</span>
        </span>
      ))}
    </div>
  )
}

function Machines() {
  const [machines, setMachines] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    axios.get('/api/machines')
      .then(res => { setMachines(res.data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const handleAddToCalculator = (machine) => {
    navigate('/calculator', {
      state: {
        selectedItem: {
          type: 'machine',
          name: machine.name,
        }
      }
    })
  }

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300">
      <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-[#181a1f]">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Μηχανήματα</h1>
        <span className="px-3 py-1 bg-gray-100 dark:bg-[#282c34] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-[#181a1f] rounded-full text-xs font-semibold uppercase tracking-wider">
          {machines.length} αντικείμενα
        </span>
      </div>

      <div className="bg-white dark:bg-[#282c34] rounded-2xl border border-gray-200 dark:border-[#181a1f] shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-[#21252b] border-b border-gray-200 dark:border-[#181a1f]">
              <tr>
                <th className="text-left px-8 py-5 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Μηχάνημα</th>
                <th className="text-left px-8 py-5 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Παραγωγή/ημέρα</th>
                <th className="text-left px-8 py-5 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Κόστος Επεξεργασίας</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-[#181a1f]">
              {machines.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-8 py-12 text-center text-gray-500 dark:text-gray-400">
                    Δεν βρέθηκαν μηχανήματα
                  </td>
                </tr>
              ) : (
                machines.map((m, i) => (
                  <tr key={m._id || i} className="hover:bg-gray-50/50 dark:hover:bg-[#2c313c]/50 transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-[#21252b] border border-gray-200 dark:border-[#181a1f] flex items-center justify-center flex-shrink-0">
                          <Cpu className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        </div>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{m.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-gray-700 dark:text-gray-300 font-medium">
                      {m.dailyOutputM2 != null
                        ? <span>{m.dailyOutputM2} <span className="text-gray-400 dark:text-gray-500 text-xs font-normal">m²</span></span>
                        : <span className="text-gray-400 dark:text-gray-500">—</span>
                      }
                    </td>
                    <td className="px-8 py-5">
                      <CostCell machine={m} />
                    </td>
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

export default Machines
