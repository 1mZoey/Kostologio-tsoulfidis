import { useState, useEffect } from "react";
import axios from "axios";

export default function Calculator() {
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

  useEffect(() => {
    axios.get("/api/products").then((r) => setProducts(r.data));
    axios
      .get("/api/cost-items?category=raw_load")
      .then((r) => setSources(r.data));
  }, []);

  const handleProductChange = (e) => {
    const name = e.target.value;
    setSelectedProduct(name);
    setSelectedFinish("");
    const found = products.find((p) => p.name === name);
    setAvailableFinishes(found?.finishes || []);
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
  };

  const handleCalculate = async () => {
    const needsFinish = availableFinishes.length > 0;

    if (
      !selectedProduct ||
      (needsFinish && !selectedFinish) ||
      !selectedSource ||
      !quantity
    ) {
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
      console.error("Error details:", err.response?.data); // ← add this line
      setError(err.response?.data?.error || "Σφάλμα υπολογισμού");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='p-6 max-w-2xl mx-auto'>
      <div className='flex items-center justify-between mb-6'>
        <h1 className='text-3xl font-bold text-gray-900 dark:text-white'>
          Υπολογιστής Κόστους
        </h1>
        <button
          onClick={handleReset}
          className='text-sm px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition'
        >
          Επαναφορά
        </button>
      </div>

      <div
        className='bg-white dark:bg-gray-800 rounded-xl shadow p-6 space-y-4'
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault(); // ← stop bubbling
            handleCalculate();
          }
        }}
      >
        {/* Product */}
        <div>
          <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
            Προϊόν
          </label>
          <select
            value={selectedProduct}
            onChange={handleProductChange}
            className='w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2'
          >
            <option value=''>-- Επιλέξτε προϊόν --</option>
            {products.map((p) => (
              <option key={p._id} value={p.name}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Finish — only show if product has finishes */}
        {availableFinishes.length > 0 && (
          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
              Φινίρισμα
            </label>
            <select
              value={selectedFinish}
              onChange={(e) => setSelectedFinish(e.target.value)}
              className='w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2'
            >
              <option value=''>-- Επιλέξτε φινίρισμα --</option>
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
          <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
            Πηγή Υλικού
          </label>
          <select
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
            className='w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2'
          >
            <option value=''>-- Επιλέξτε πηγή --</option>
            {sources.map((s) => (
              <option key={s._id} value={s.source}>
                {s.source}
                {s.region ? ` (${s.region})` : ""}
              </option>
            ))}
          </select>
        </div>

        {/* Packaging */}
        <div>
          <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
            Συσκευασία
          </label>
          <div className='flex gap-4'>
            {["χωρίς", "παλέτα", "κιβώτιο"].map((opt) => (
              <label
                key={opt}
                className='flex items-center gap-2 cursor-pointer text-gray-700 dark:text-gray-300'
              >
                <input
                  type='radio'
                  value={opt}
                  checked={packaging === opt}
                  onChange={() => setPackaging(opt)}
                  className='accent-[#61dafb]'
                />
                <span className='capitalize'>{opt}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Quantity */}
        <div>
          <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
            Ποσότητα (m²)
          </label>
          <input
            type='number'
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder='π.χ. 50'
            className='w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 placeholder-gray-400 dark:placeholder-gray-500'
          />
        </div>

        {error && (
          <p className='text-red-500 dark:text-red-400 text-sm'>{error}</p>
        )}

        <button
          onClick={handleCalculate}
          disabled={loading}
          style={{ backgroundColor: "#61dafbaa" }}
          className='w-full hover:opacity-90 text-gray-900 font-semibold py-2 rounded-lg transition disabled:opacity-50'
        >
          {loading ? "Υπολογισμός..." : "Υπολογισμός Κόστους"}
        </button>
      </div>

      {/* Result */}
      {result && (
        <div className='bg-white dark:bg-gray-800 rounded-xl shadow p-6 mt-6'>
          <h2 className='text-xl font-bold text-gray-800 dark:text-white mb-4'>
            Ανάλυση Κόστους
          </h2>
          <div className='space-y-2 text-sm text-gray-700 dark:text-gray-300'>
            <div className='flex justify-between'>
              <span>Κόστος Πρώτης Ύλης</span>
              <span>€{result.breakdown.baseCostPerM2.toFixed(2)}/m²</span>
            </div>
            <div className='flex justify-between'>
              <span>Κόστος Επεξεργασίας</span>
              <span>€{result.breakdown.processingCostPerM2.toFixed(2)}/m²</span>
            </div>
            {result.breakdown.packagingPerM2 > 0 && (
              <div className='flex justify-between'>
                <span>Συσκευασία</span>
                <span>€{result.breakdown.packagingPerM2.toFixed(2)}/m²</span>
              </div>
            )}
            <div className='flex justify-between font-semibold border-t border-gray-200 dark:border-gray-600 pt-2'>
              <span>Σύνολο ανά m²</span>
              <span>€{result.breakdown.totalPerM2.toFixed(2)}</span>
            </div>
            <div className='flex justify-between'>
              <span>Ποσότητα</span>
              <span>{result.breakdown.quantity} m²</span>
            </div>
            {result.breakdown.packagingFlatFee > 0 && (
              <div className='flex justify-between'>
                <span>Πάγιο Κιβωτίου</span>
                <span>€{result.breakdown.packagingFlatFee.toFixed(2)}</span>
              </div>
            )}
            <div
              className='flex justify-between text-lg font-bold border-t border-gray-200 dark:border-gray-600 pt-2'
              style={{ color: "#61dafb" }}
            >
              <span>Συνολικό Κόστος</span>
              <span>€{result.grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
