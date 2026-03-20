import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { Calculator as CalculatorIcon, ArrowRight, RotateCcw } from "lucide-react";

export default function Calculator() {
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [sources, setSources] = useState([]);
  
  const [selectedProduct, setSelectedProduct] = useState("");
  const [availableFinishes, setAvailableFinishes] = useState([]);
  const [selectedFinish, setSelectedFinish] = useState("");
  const [selectedSource, setSelectedSource] = useState("");
  const [quantity, setQuantity] = useState("");
  const [packaging, setPackaging] = useState("χωρίς");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const quantityRef = useRef(null);
  const productSelectRef = useRef(null);

  useEffect(() => {
    Promise.all([
      axios.get("/api/products"),
      axios.get("/api/cost-items?category=raw_load")
    ]).then(([prodRes, sourceRes]) => {
      setProducts(prodRes.data);
      setSources(sourceRes.data);
      
      const item = location.state?.selectedItem;
      if (item) {
        if (item.type === 'product') {
          setSelectedProduct(item.name);
          fetchAvailableFinishes(item.name);
        } else if (item.type === 'material') {
          setSelectedSource(item.source);
        }
      } else {
        if (productSelectRef.current) productSelectRef.current.focus();
      }
    });
  }, [location.state]);

  const fetchAvailableFinishes = async (name) => {
    if (!name) return setAvailableFinishes([]);
    try {
      const { data } = await axios.get(`/api/calculator/available-finishes/${encodeURIComponent(name)}`);
      setAvailableFinishes(data);
    } catch {
      setAvailableFinishes([]);
    }
  };

  const handleProductChange = (e) => {
    const name = e.target.value;
    setSelectedProduct(name);
    setSelectedFinish("");
    setResult(null);
    fetchAvailableFinishes(name);
  };

  const handleReset = () => {
    setSelectedProduct("");
    setSelectedFinish("");
    setSelectedSource("");
    setQuantity("");
    setPackaging("χωρίς");
    setAvailableFinishes([]);
    setResult(null);
    setError("");
    if (productSelectRef.current) productSelectRef.current.focus();
  };

  const handleCalculate = async () => {
    const needsFinish = availableFinishes.length > 0;

    if (!selectedProduct || (needsFinish && !selectedFinish) || !selectedSource || !quantity) {
      setError("Παρακαλώ συμπληρώστε όλα τα πεδία.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const { data } = await axios.post("/api/calculator/calculate", {
        productName: selectedProduct,
        finish: selectedFinish,
        source: selectedSource,
        quantity: parseFloat(quantity),
        packaging,
      });
      setResult(data);
    } catch (err) {
      console.error("Error details:", err.response?.data);
      setResult(null);
      setError(err.response?.data?.error || "Σφάλμα υπολογισμού");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='p-6 max-w-2xl mx-auto animate-in fade-in duration-300'>
      <div className='flex items-center justify-between mb-8 pb-4 border-b border-gray-200 dark:border-[#181a1f]'>
        <div className="flex items-center space-x-3">
          <CalculatorIcon className="w-6 h-6 text-gray-800 dark:text-gray-200" />
          <h1 className='text-2xl font-bold text-gray-900 dark:text-white tracking-tight'>
            Υπολογιστής Κοστολόγησης
          </h1>
        </div>
        <button
          onClick={handleReset}
          className='flex items-center space-x-2 text-sm px-3 py-1.5 rounded-lg border border-transparent hover:border-gray-300 dark:hover:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#2c313c] transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400'
        >
          <RotateCcw className="w-4 h-4" />
          <span>Καθαρισμός</span>
        </button>
      </div>

      <div
        className='bg-white dark:bg-[#282c34] rounded-2xl shadow-sm border border-gray-200 dark:border-[#181a1f] p-8 space-y-6'
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleCalculate();
          }
        }}
      >
        <div className="space-y-5">
          {/* Product */}
          <div>
            <label className='block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2'>
              Προϊόν
            </label>
            <select
              ref={productSelectRef}
              value={selectedProduct}
              onChange={handleProductChange}
              className='w-full border-2 border-gray-200 dark:border-[#181a1f] bg-gray-50 dark:bg-[#21252b] text-gray-900 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:border-gray-800 dark:focus:border-gray-400 focus:bg-white dark:focus:bg-[#282c34] transition-colors'
            >
              <option value='' disabled hidden>Επιλέξτε προϊόν</option>
              {products.map((p) => (
                <option key={p._id} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Finish */}
          {availableFinishes.length > 0 && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <label className='block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2'>
                Φινίρισμα
              </label>
              <select
                value={selectedFinish}
                onChange={(e) => setSelectedFinish(e.target.value)}
                className='w-full border-2 border-gray-200 dark:border-[#181a1f] bg-gray-50 dark:bg-[#21252b] text-gray-900 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:border-gray-800 dark:focus:border-gray-400 focus:bg-white dark:focus:bg-[#282c34] transition-colors'
              >
                <option value='' disabled hidden>Επιλέξτε φινίρισμα</option>
                {availableFinishes.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
            </select>
            </div>
          )}

          {/* Source */}
          <div>
            <label className='block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2'>
              Πηγή Υλικού (Μάρμαρο/Υλικό)
            </label>
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className='w-full border-2 border-gray-200 dark:border-[#181a1f] bg-gray-50 dark:bg-[#21252b] text-gray-900 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:border-gray-800 dark:focus:border-gray-400 focus:bg-white dark:focus:bg-[#282c34] transition-colors'
            >
              <option value='' disabled hidden>Επιλέξτε πηγή</option>
              {sources.map((s) => (
                <option key={s._id} value={s.source}>
                  {s.source}
                  {s.region ? ` (${s.region})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Quantity */}
            <div>
              <label className='block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2'>
                Ποσότητα (m²)
              </label>
              <input
                ref={quantityRef}
                type='number'
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder='π.χ. 50'
                className='w-full border-2 border-gray-200 dark:border-[#181a1f] bg-gray-50 dark:bg-[#21252b] text-gray-900 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:border-gray-800 dark:focus:border-gray-400 focus:bg-white dark:focus:bg-[#282c34] placeholder-gray-400 transition-colors'
              />
            </div>

            {/* Packaging */}
            <div>
              <label className='block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2'>
                Συσκευασία
              </label>
              <div className='flex gap-3 h-13 items-center px-4 border-2 border-gray-200 dark:border-[#181a1f] rounded-xl bg-gray-50 dark:bg-[#21252b]'>
                {["χωρίς", "παλέτα", "κιβώτιο"].map((opt) => (
                  <label
                    key={opt}
                    className="flex-1 flex items-center justify-center gap-2 cursor-pointer group"
                  >
                    <input
                      type='radio'
                      value={opt}
                      checked={packaging === opt}
                      onChange={() => setPackaging(opt)}
                      className='w-4 h-4 text-gray-900 bg-gray-100 border-gray-300 focus:ring-gray-900 dark:focus:ring-gray-100 dark:ring-offset-gray-800 cursor-pointer'
                    />
                    <span className={`text-sm capitalize transition-colors ${packaging === opt ? 'font-medium text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200'}`}>
                      {opt}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className='p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'>
            <p className='text-red-600 dark:text-red-400 text-sm font-medium flex items-center gap-2'>
              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
              {error}
            </p>
          </div>
        )}

        <div className="pt-4">
          <button
            onClick={handleCalculate}
            disabled={loading}
            className='w-full flex items-center justify-center space-x-2 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 font-semibold py-4 rounded-xl transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 dark:focus:ring-white dark:focus:ring-offset-[#282c34] shadow-sm tracking-wide'
          >
            <span>{loading ? "Υπολογισμός..." : "Υπολογισμός Κόστους"}</span>
            {!loading && <ArrowRight className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Result */}
      {result && (
        <div className='mt-8 bg-white dark:bg-[#282c34] border border-gray-200 dark:border-[#181a1f] rounded-2xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500'>
          <div className="bg-gray-50 dark:bg-[#21252b] border-b border-gray-200 dark:border-[#181a1f] px-8 py-5 flex justify-between items-center">
            <h2 className='text-lg font-bold text-gray-900 dark:text-white tracking-tight'>
              Ανάλυση Κόστους
            </h2>
            <span className="px-3 py-1 bg-gray-200/50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full text-xs font-semibold uppercase tracking-wider">
              €/m²
            </span>
          </div>
          
          <div className='p-8 space-y-4'>
            <div className='space-y-3 text-sm text-gray-600 dark:text-gray-400'>
              <div className='flex justify-between items-center p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-[#2c313c]/50 transition-colors'>
                <span>Κόστος Πρώτης Ύλης</span>
                <span className="font-medium text-gray-900 dark:text-gray-200">€{result.breakdown.baseCostPerM2.toFixed(2)}/m²</span>
              </div>
              <div className='flex justify-between items-center p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-[#2c313c]/50 transition-colors'>
                <span>Κόστος Επεξεργασίας</span>
                <span className="font-medium text-gray-900 dark:text-gray-200">€{result.breakdown.processingCostPerM2.toFixed(2)}/m²</span>
              </div>
              {result.breakdown.packagingPerM2 > 0 && (
                <div className='flex justify-between items-center p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-[#2c313c]/50 transition-colors'>
                  <span>Συσκευασία</span>
                  <span className="font-medium text-gray-900 dark:text-gray-200">€{result.breakdown.packagingPerM2.toFixed(2)}/m²</span>
                </div>
              )}
              
              <div className='flex justify-between items-center p-3 mt-4 bg-gray-50 dark:bg-[#21252b] rounded-lg border border-gray-100 dark:border-gray-800'>
                <span className="font-semibold text-gray-900 dark:text-white">Σύνολο Υλικών ανά m²</span>
                <span className="font-semibold text-gray-900 dark:text-white">€{result.breakdown.totalPerM2.toFixed(2)}</span>
              </div>
            </div>

            <div className='h-px w-full bg-gray-200 dark:bg-[#2c313c] my-6'></div>

            <div className='space-y-3 text-sm text-gray-600 dark:text-gray-400'>
              <div className='flex justify-between items-center p-2'>
                <span>Ποσότητα</span>
                <span className="font-medium text-gray-900 dark:text-gray-200">{result.breakdown.quantity} m²</span>
              </div>
              {result.breakdown.packagingFlatFee > 0 && (
                <div className='flex justify-between items-center p-2'>
                  <span>Πάγιο Κιβωτίου</span>
                  <span className="font-medium text-gray-900 dark:text-gray-200">€{result.breakdown.packagingFlatFee.toFixed(2)}</span>
                </div>
              )}

              <div className='flex justify-between items-end pt-4 mt-2'>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Συνολικό Κόστος</span>
                </div>
                <div className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                  €{result.grandTotal.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
