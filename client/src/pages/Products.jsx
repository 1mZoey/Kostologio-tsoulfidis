import { useState, useEffect } from 'react'
import { getProducts } from '../services/api'
import { Calculator as CalculatorIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const handleAddToCalculator = (product) => {
    navigate('/calculator', { state: { selectedItem: { type: 'product', name: product.name } } })
  }

  useEffect(() => {
    getProducts()
      .then(res => { setProducts(res.data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300">
      <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-[#181a1f]">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Προϊόντα</h1>
        <span className="px-3 py-1 bg-gray-100 dark:bg-[#282c34] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-[#181a1f] rounded-full text-xs font-semibold uppercase tracking-wider">
          {products.length} αντικείμενα
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
                <th className="text-left px-8 py-5 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Όνομα</th>
                <th className="text-left px-8 py-5 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Κατηγορία</th>
                <th className="text-left px-8 py-5 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Μονάδα</th>
                <th className="text-left px-8 py-5 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Πάχος</th>
                <th className="text-left px-8 py-5 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Ενέργειες</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-[#181a1f]">
              {products.length === 0 ? (
                <tr><td colSpan="5" className="px-8 py-12 text-center text-gray-500 dark:text-gray-400">Δεν βρέθηκαν προϊόντα</td></tr>
              ) : (
                products.map((p, i) => (
                  <tr key={p._id || i} className="hover:bg-gray-50/50 dark:hover:bg-[#2c313c]/50 transition-colors">
                    <td className="px-8 py-5 font-medium text-gray-900 dark:text-gray-100 flex items-center gap-4">
                      {p.name}
                    </td>
                    <td className="px-8 py-5">
                      <span className="px-2.5 py-1 bg-gray-100 dark:bg-[#21252b] text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-[#181a1f] rounded-md text-xs font-medium">
                        {p.category || '—'}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-gray-500 dark:text-gray-400 text-sm">{p.baseUnit || p.unit || '—'}</td>
                    <td className="px-8 py-5 text-gray-500 dark:text-gray-400 text-sm">{p.defaultThicknessMm ? `${p.defaultThicknessMm}mm` : '—'}</td>
                    <td className="px-8 py-5">
                      <button 
                        onClick={() => handleAddToCalculator(p)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 text-xs font-bold rounded-lg transition-all active:scale-95 shadow-sm cursor-pointer"
                      >
                        <CalculatorIcon className="w-3.5 h-3.5" />
                        <span>Προσθήκη</span>
                      </button>
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

export default Products
