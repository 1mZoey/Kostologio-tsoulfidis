import { useState, useEffect } from 'react'
import { getProducts } from '../services/api'
import { Package } from 'lucide-react'

function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getProducts()
      .then(res => { setProducts(res.data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Προϊόντα</h1>
        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
          {products.length} αντικείμενα
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
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Μονάδα</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Πάχος</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.length === 0 ? (
                <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-400">Δεν βρέθηκαν προϊόντα</td></tr>
              ) : (
                products.map((p, i) => (
                  <tr key={p._id || i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-2">
                      <Package className="w-4 h-4 text-blue-400" />{p.name}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{p.category || '—'}</td>
                    <td className="px-6 py-4 text-gray-600">{p.baseUnit || p.unit || '—'}</td>
                    <td className="px-6 py-4 text-gray-600">{p.defaultThicknessMm ? `${p.defaultThicknessMm}mm` : '—'}</td>
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
