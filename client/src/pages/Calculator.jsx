import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import {
  Calculator as CalculatorIcon,
  ArrowRight,
  RotateCcw,
  ChevronDown,
  ChevronRight,
  BookmarkPlus,
  Check,
} from "lucide-react";


export default function Calculator() {
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [sources, setSources] = useState([]);

  const [selectedProduct, setSelectedProduct] = useState("");
  const [availableFinishes, setAvailableFinishes] = useState([]);
  const [selectedFinish, setSelectedFinish] = useState("");
  const [selectedSource, setSelectedSource] = useState("");
  const [quantity, setQuantity] = useState("");
  const [packaging, setPackaging] = useState("παλέτα");
  const [profitMargin, setProfitMargin] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [widthCm, setWidthCm] = useState("");
  const [showMachineBreakdown, setShowMachineBreakdown] = useState(false);

  // Save to history
  const [quoteName, setQuoteName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const quantityRef = useRef(null);
  const productSelectRef = useRef(null);
  const selectedProductData = products.find((p) => p.name === selectedProduct);
  const isTradeGood =
    selectedProductData?.tradeGood === true ||
    selectedProductData?.tradeGood === "true" ||
    selectedProductData?.tradeGood === "True";

  const fmt = (val) => (val != null ? Number(val).toFixed(2) : "--");

  const marginPct = parseFloat(profitMargin) || 0;
  const hasMargin = marginPct > 0 && result;
  const costNoTax = result ? result.grandTotalNoTax : 0;
  const profitAmount = hasMargin ? costNoTax * (marginPct / 100) : 0;
  const sellingPriceNoTax = costNoTax + profitAmount;
  const vatAmount = hasMargin ? sellingPriceNoTax * 0.24 : result?.vatAmount ?? 0;
  const grandTotalWithTax = hasMargin
    ? sellingPriceNoTax * 1.24
    : result?.grandTotalWithTax ?? 0;
  const costPerM2 = result ? result.breakdown.totalPerM2NoTax : 0;
  const profitPerM2 = hasMargin ? costPerM2 * (marginPct / 100) : 0;
  const sellingPerM2 = costPerM2 + profitPerM2;
  const hasMachineBreakdown =
    result?.machineBreakdown && result.machineBreakdown.length > 0;
  const editMode = location.state?.editMode === true;
  const editId   = location.state?.historyItem?._id;

  useEffect(() => {
    Promise.all([axios.get("/api/products"), axios.get("/api/sources")]).then(
      ([prodRes, sourceRes]) => {
        setProducts(prodRes.data);
        setSources(sourceRes.data);

        const state = location.state;
        if (state?.editMode && state?.historyItem) {
          const h = state.historyItem;
          const inp = h.inputs || {};
          setSelectedProduct(inp.productName || "");
          setSelectedFinish(inp.finish || "");
          setSelectedSource(inp.source || "");
          setQuantity(inp.quantity?.toString() || "");
          setPackaging(inp.packaging || "παλέτα");
          setWidthCm(inp.widthCm?.toString() || "");
          setProfitMargin(inp.profitMargin?.toString() || "");
          setQuoteName(h.name || "");
          if (inp.productName) fetchAvailableFinishes(inp.productName);
        } else if (state?.selectedItem) {
          const item = state.selectedItem;
          if (item.type === "product") {
            setSelectedProduct(item.name);
            fetchAvailableFinishes(item.name);
          } else if (item.type === "material") {
            setSelectedSource(item.source);
          }
        } else {
          if (productSelectRef.current) productSelectRef.current.focus();
        }
      },
    );
  }, [location.state]);


  const fetchAvailableFinishes = async (name) => {
    if (!name) return setAvailableFinishes([]);
    try {
      const { data } = await axios.get(
        `/api/calculator/available-finishes/${encodeURIComponent(name)}`,
      );
      setAvailableFinishes(data);
    } catch (err) {
      console.error("Finish fetch error:", err.response?.data || err.message);
      setAvailableFinishes([]);
    }
  };

  const handleProductChange = (e) => {
    const name = e.target.value;
    setSelectedProduct(name);
    setSelectedFinish("");
    setResult(null);
    setSaved(false);
    setShowMachineBreakdown(false);
    fetchAvailableFinishes(name);
  };

  const handleReset = () => {
    setSelectedProduct("");
    setSelectedFinish("");
    setSelectedSource("");
    setQuantity("");
    setPackaging("παλέτα");
    setProfitMargin("");
    setAvailableFinishes([]);
    setResult(null);
    setError("");
    setWidthCm("");
    setShowMachineBreakdown(false);
    setQuoteName("");
    setSaved(false);
    if (productSelectRef.current) productSelectRef.current.focus();
  };

  const handleCalculate = async () => {
    const needsFinish = availableFinishes.length > 0;
    if (
      !selectedProduct ||
      (needsFinish && !selectedFinish) ||
      (!isTradeGood && !selectedSource) ||
      !quantity
    ) {
      setError("Παρακαλώ συμπληρώστε όλα τα πεδία.");
      return;
    }
    setError("");
    setLoading(true);
    setSaved(false);
    setShowMachineBreakdown(false);
    try {
      const { data } = await axios.post("/api/calculator/calculate", {
        productName: selectedProduct,
        finish: selectedFinish,
        source: isTradeGood ? undefined : selectedSource,
        quantity: parseFloat(quantity),
        packaging,
        widthCm: widthCm ? parseFloat(widthCm) : undefined,
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

  const handleSave = async () => {
    if (!result) return;
    setSaving(true);
    try {
      await axios.post("/api/history", {
        name: quoteName.trim(),
        inputs: {
          productName: selectedProduct,
          finish: selectedFinish,
          source: selectedSource,
          quantity: parseFloat(quantity),
          packaging,
          widthCm: widthCm ? parseFloat(widthCm) : undefined,
          profitMargin: parseFloat(profitMargin) || 0,
        },
        result: {
          ...result,
          grandTotalWithTax,
          grandTotalNoTax: costNoTax,
          sellingPriceNoTax,
          vatAmount,
        },
      });
      setSaved(true);
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setSaving(false);
    }
  };


  return (
    <div className="p-6 max-w-2xl mx-auto animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200 dark:border-[#181a1f]">
        <div className="flex items-center space-x-3">
          <CalculatorIcon className="w-6 h-6 text-gray-800 dark:text-gray-200" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            Υπολογιστής Κοστολόγησης
          </h1>
        </div>
        <button
          onClick={handleReset}
          className="flex items-center space-x-2 text-sm px-3 py-1.5 rounded-lg border border-transparent hover:border-gray-300 dark:hover:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#2c313c] transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Καθαρισμός</span>
        </button>
      </div>


      <div
        className="bg-white dark:bg-[#282c34] rounded-2xl shadow-sm border border-gray-200 dark:border-[#181a1f] p-8 space-y-6"
        onKeyDown={(e) => {
          if (e.key === "Enter") { e.preventDefault(); handleCalculate(); }
        }}
      >
        <div className="space-y-5">
          {/* Product */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Προϊόν</label>
            <select
              ref={productSelectRef}
              value={selectedProduct}
              onChange={handleProductChange}
              className="w-full border-2 border-gray-200 dark:border-[#181a1f] bg-gray-50 dark:bg-[#21252b] text-gray-900 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:border-gray-800 dark:focus:border-gray-400 focus:bg-white dark:focus:bg-[#282c34] transition-colors"
            >
              <option value="" disabled hidden>Επιλέξτε προϊόν</option>
              {products.map((p) => (
                <option key={p._id} value={p.name}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Finish */}
          {availableFinishes.length > 0 && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Φινίρισμα</label>
              <select
                value={selectedFinish}
                onChange={(e) => setSelectedFinish(e.target.value)}
                className="w-full border-2 border-gray-200 dark:border-[#181a1f] bg-gray-50 dark:bg-[#21252b] text-gray-900 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:border-gray-800 dark:focus:border-gray-400 focus:bg-white dark:focus:bg-[#282c34] transition-colors"
              >
                <option value="" disabled hidden>Επιλέξτε φινίρισμα</option>
                {availableFinishes.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
          )}

          {/* Φάρδος */}
          {selectedProduct === "Καπάκι" && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Φάρδος (cm)</label>
              <input
                type="number"
                value={widthCm}
                onChange={(e) => setWidthCm(e.target.value)}
                placeholder="π.χ. 25"
                className="w-full border-2 border-gray-200 dark:border-[#181a1f] bg-gray-50 dark:bg-[#21252b] text-gray-900 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:border-gray-800 dark:focus:border-gray-400 focus:bg-white dark:focus:bg-[#282c34] placeholder-gray-400 transition-colors"
              />
            </div>
          )}

          {/* Source */}
          {!isTradeGood && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Πηγή Υλικού (Μάρμαρο/Υλικό)</label>
              <select
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value)}
                className="w-full border-2 border-gray-200 dark:border-[#181a1f] bg-gray-50 dark:bg-[#21252b] text-gray-900 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:border-gray-800 dark:focus:border-gray-400 focus:bg-white dark:focus:bg-[#282c34] transition-colors"
              >
                <option value="" disabled hidden>Επιλέξτε πηγή</option>
                {sources.map((s) => (
                  <option key={s._id} value={s.source}>
                    {s.source}{s.region ? ` (${s.region})` : ""}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Quantity */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Ποσότητα (m²)</label>
              <input
                ref={quantityRef}
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="π.χ. 50"
                className="w-full border-2 border-gray-200 dark:border-[#181a1f] bg-gray-50 dark:bg-[#21252b] text-gray-900 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:border-gray-800 dark:focus:border-gray-400 focus:bg-white dark:focus:bg-[#282c34] placeholder-gray-400 transition-colors"
              />
            </div>

            {/* Packaging */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Συσκευασία</label>
              <div className="flex gap-3 h-13 items-center px-4 border-2 border-gray-200 dark:border-[#181a1f] rounded-xl bg-gray-50 dark:bg-[#21252b]">
                {["παλέτα", "κιβώτιο"].map((opt) => (
                  <label key={opt} className="flex-1 flex items-center justify-center gap-2 cursor-pointer group">
                    <input
                      type="radio"
                      value={opt}
                      checked={packaging === opt}
                      onChange={() => setPackaging(opt)}
                      className="w-4 h-4 text-gray-900 bg-gray-100 border-gray-300 focus:ring-gray-900 dark:focus:ring-gray-100 dark:ring-offset-gray-800 cursor-pointer"
                    />
                    <span className={`text-sm capitalize transition-colors ${packaging === opt ? "font-medium text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200"}`}>
                      {opt}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Profit Margin */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Περιθώριο Κέρδους{" "}
              <span className="text-gray-400 dark:text-gray-500 font-normal">(προαιρετικό)</span>
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="100"
                value={profitMargin}
                onChange={(e) => setProfitMargin(e.target.value)}
                placeholder="π.χ. 30"
                className="w-full border-2 border-gray-200 dark:border-[#181a1f] bg-gray-50 dark:bg-[#21252b] text-gray-900 dark:text-white rounded-xl px-4 py-3 pr-10 focus:outline-none focus:border-gray-800 dark:focus:border-gray-400 focus:bg-white dark:focus:bg-[#282c34] placeholder-gray-400 transition-colors"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 font-medium pointer-events-none">%</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <p className="text-red-600 dark:text-red-400 text-sm font-medium flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
              {error}
            </p>
          </div>
        )}

        <div className="pt-4">
          <button
            onClick={handleCalculate}
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 font-semibold py-4 rounded-xl transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 dark:focus:ring-white dark:focus:ring-offset-[#282c34] shadow-sm tracking-wide"
          >
            <span>{loading ? "Υπολογισμός..." : "Υπολογισμός Κόστους"}</span>
            {!loading && <ArrowRight className="w-5 h-5" />}
          </button>
        </div>
      </div>


      {/* Result */}
      {result && result.breakdown && (
        <div className="mt-8 bg-white dark:bg-[#282c34] border border-gray-200 dark:border-[#181a1f] rounded-2xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-gray-50 dark:bg-[#21252b] border-b border-gray-200 dark:border-[#181a1f] px-8 py-5 flex justify-between items-center">
            <div className="flex items-baseline gap-2">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">Ανάλυση Κόστους</h2>
              <span className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-widest">€/m²</span>
            </div>
          </div>

          <div className="p-8 space-y-4">
            {result.isTradeGood && (
              <div className="mb-2 px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">Εμπορικό Είδος — Τιμή Πώλησης χωρίς παραγωγή</p>
              </div>
            )}

            <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Ανάλυση ανά m²</p>

            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              {!result.isTradeGood && (
                <div className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-[#2c313c]/50 transition-colors">
                  <span>Κόστος Πρώτης Ύλης</span>
                  <span className="font-medium text-gray-900 dark:text-gray-200">
                    <span className="text-gray-400">€{fmt(result.breakdown.baseCostPerM2)}/m²</span>
                  </span>
                </div>
              )}

              {result.isTradeGood ? (
                <div className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-[#2c313c]/50 transition-colors">
                  <span>Τιμή Πώλησης</span>
                  <span className="font-medium text-gray-900 dark:text-gray-200">
                    <span className="text-gray-400">€{fmt(result.breakdown.sellingPricePerM2)}/m²</span>
                  </span>
                </div>
              ) : (
                <div>
                  <div
                    className={`flex justify-between items-center p-2 rounded-lg transition-colors ${hasMachineBreakdown ? "cursor-pointer hover:bg-gray-100 dark:hover:bg-[#2c313c]" : "hover:bg-gray-50 dark:hover:bg-[#2c313c]/50"}`}
                    onClick={() => hasMachineBreakdown && setShowMachineBreakdown((v) => !v)}
                  >
                    <span className="flex items-center gap-1.5">
                      {hasMachineBreakdown && (showMachineBreakdown
                        ? <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                        : <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                      )}
                      Κόστος Επεξεργασίας
                      {hasMachineBreakdown && <span className="text-xs text-gray-400 dark:text-gray-500">(ανά μηχάνημα)</span>}
                    </span>
                    <span className="font-medium text-gray-900 dark:text-gray-200">
                      <span className="text-gray-400">€{fmt(result.breakdown.processingCostPerM2)}/m²</span>
                    </span>
                  </div>

                  {showMachineBreakdown && hasMachineBreakdown && (
                    <div className="mt-2 ml-5 animate-in fade-in slide-in-from-top-1 duration-200">
                      <div className="rounded-xl border border-gray-200 dark:border-[#2c313c] overflow-hidden">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="bg-gray-50 dark:bg-[#21252b] text-gray-500 dark:text-gray-400">
                              <th className="text-left px-3 py-2 font-semibold">Μηχάνημα</th>
                              <th className="text-right px-3 py-2 font-semibold">Εργατικά/m²</th>
                              <th className="text-right px-3 py-2 font-semibold">Overhead/m²</th>
                              <th className="text-right px-3 py-2 font-semibold">Επεξ./m²</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 dark:divide-[#2c313c]">
                            {result.machineBreakdown.map((m) => (
                              <tr key={m.machine} className="hover:bg-gray-50 dark:hover:bg-[#2c313c]/40 transition-colors">
                                <td className="px-3 py-2 font-medium text-gray-700 dark:text-gray-300">{m.machine}</td>
                                {m.perCut ? (
                                  <td colSpan={3} className="px-3 py-2 text-right text-amber-600 dark:text-amber-400 font-medium">
                                    €{fmt(m.costPerCut)}/κοψιά
                                  </td>
                                ) : (
                                  <>
                                    <td className="px-3 py-2 text-right text-gray-600 dark:text-gray-400">{m.labourPerM2 != null ? `€${fmt(m.labourPerM2)}` : "--"}</td>
                                    <td className="px-3 py-2 text-right text-gray-600 dark:text-gray-400">{m.overheadPerM2 != null ? `€${fmt(m.overheadPerM2)}` : "--"}</td>
                                    <td className="px-3 py-2 text-right font-medium text-gray-900 dark:text-gray-200">{m.processingCostPerM2 != null ? `€${fmt(m.processingCostPerM2)}` : "--"}</td>
                                  </>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {result.breakdown.packagingPerM2 > 0 && (
                <div className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-[#2c313c]/50 transition-colors">
                  <span>Συσκευασία</span>
                  <span className="font-medium text-gray-900 dark:text-gray-200">
                    <span className="text-gray-400">€{fmt(result.breakdown.packagingPerM2)}/m²</span>
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center p-2 pl-3 rounded-lg border-t border-l-2 border-gray-200 dark:border-gray-600 pt-3 mt-2">
                <span className="font-semibold text-gray-900 dark:text-white">Κόστος ανά m²</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  <span className="text-gray-400">€{fmt(costPerM2)}</span>
                </span>
              </div>

              {hasMargin && (
                <>
                  <div className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-[#2c313c]/50 transition-colors animate-in fade-in duration-300">
                    <span className="text-green-600 dark:text-green-400">Κέρδος ({marginPct}%)</span>
                    <span className="font-medium text-green-600 dark:text-green-400">+€{fmt(profitPerM2)}/m²</span>
                  </div>
                  <div className="flex justify-between items-center p-2 pl-3 rounded-lg border-t border-l-2 border-green-300 dark:border-green-700 pt-3 mt-2 animate-in fade-in duration-300">
                    <span className="font-semibold text-gray-900 dark:text-white">Τιμή Πώλησης ανά m²</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">€{fmt(sellingPerM2)}</span>
                  </div>
                </>
              )}
            </div>

            <div className="h-px w-full bg-gray-200 dark:bg-[#2c313c] my-4" />
            <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Σύνολο</p>

            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-[#2c313c]/50 transition-colors">
                <span>Ποσότητα</span>
                <span className="font-medium text-gray-900 dark:text-gray-200">{result.breakdown.quantity} m²</span>
              </div>

              {result.breakdown.packagingFlatFee > 0 && (
                <div className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-[#2c313c]/50 transition-colors">
                  <span>Πάγιο Κιβωτίου</span>
                  <span className="font-medium text-gray-900 dark:text-gray-200">
                    <span className="text-gray-400">€{fmt(result.breakdown.packagingFlatFee)}</span>
                  </span>
                </div>
              )}

              {result.breakdown.pressingFlatFee > 0 && (
                <div className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-[#2c313c]/50 transition-colors">
                  <span>Πάγιο Πρέσσας</span>
                  <span className="font-medium text-gray-900 dark:text-gray-200">
                    <span className="text-gray-400">€{fmt(result.breakdown.pressingFlatFee)}</span>
                  </span>
                </div>
              )}

              {hasMargin && (
                <div className="flex justify-between items-center p-2 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800/50 animate-in fade-in duration-300">
                  <span className="text-green-700 dark:text-green-400 font-medium">Κέρδος ({marginPct}%)</span>
                  <span className="font-semibold text-green-700 dark:text-green-400">+€{fmt(profitAmount)}</span>
                </div>
              )}

              <div className="h-px w-full bg-gray-200 dark:bg-[#2c313c] my-4" />

              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-[#2c313c]/50 transition-colors">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Σύνολο χωρίς ΦΠΑ</span>
                  <span className="font-medium text-gray-900 dark:text-gray-200">
                    <span className="text-gray-400">€{fmt(sellingPriceNoTax)}</span>
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-[#2c313c]/50 transition-colors">
                  <span className="text-sm text-amber-600 dark:text-amber-400">ΦΠΑ 24%</span>
                  <span className="font-medium text-amber-600 dark:text-amber-400">
                    <span className="text-gray-400">€{fmt(vatAmount)}</span>
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-[#2c313c]">
                  <span className="text-base font-semibold text-gray-900 dark:text-white">
                    {hasMargin ? "Τιμή Πώλησης με ΦΠΑ" : "Σύνολο με ΦΠΑ"}
                  </span>
                  <div className={`text-2xl font-bold tracking-tight ${hasMargin ? "text-green-600 dark:text-green-400" : "text-gray-900 dark:text-white"}`}>
                    €{fmt(grandTotalWithTax)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Save to History Panel ── */}
          <div className="border-t border-gray-200 dark:border-[#181a1f] px-8 py-5 bg-gray-50 dark:bg-[#21252b]">
            {saved ? (
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm font-medium animate-in fade-in duration-300">
                <Check className="w-4 h-4" />
                Αποθηκεύτηκε στο ιστορικό!
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Αποθήκευση στο Ιστορικό</p>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={quoteName}
                    onChange={(e) => setQuoteName(e.target.value)}
                    placeholder="Όνομα πελάτη (προαιρετικό)"
                    className="flex-1 border-2 border-gray-200 dark:border-[#181a1f] bg-white dark:bg-[#282c34] text-gray-900 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gray-800 dark:focus:border-gray-400 transition-colors placeholder-gray-400"
                  />
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 text-sm font-semibold rounded-xl transition-all active:scale-95 disabled:opacity-50 shadow-sm whitespace-nowrap"
                  >
                    <BookmarkPlus className="w-4 h-4" />
                    {saving ? "Αποθήκευση..." : "Αποθήκευση"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}