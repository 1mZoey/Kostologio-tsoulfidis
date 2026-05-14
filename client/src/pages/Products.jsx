import { useState, useEffect } from "react";
import axios from "axios";
import {
  Calculator as CalculatorIcon,
  Pencil,
  Trash2,
  Check,
  X,
  Plus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const emptyProduct = {
  name: "",
  category: "",
  line: "",
  baseUnit: "",
  defaultThicknessMm: "",
  defaultThicknessCm: "",
  dimensions: "",
  finishesText: "",
  packagingType: "",
  packagingKg: "",
  packagingM2PerPallet: "",
  packagingMPerPallet: "",
  packagingNote: "",
  sellingPrice: "",
  tradeGood: false,
  notes: "",
};

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyProduct);
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const navigate = useNavigate();

  const fetchProducts = () => {
    axios
      .get("/api/products")
      .then((res) => {
        setProducts(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAddToCalculator = (product) => {
    navigate("/calculator", {
      state: { selectedItem: { type: "product", name: product.name } },
    });
  };

  const startEdit = (product) => {
    setShowAddForm(false);
    setEditingId(product._id);
    setForm({
      name: product.name || "",
      category: product.category || "",
      line: product.line || "",
      baseUnit: product.baseUnit || product.unit || "",
      defaultThicknessMm: product.defaultThicknessMm ?? "",
      defaultThicknessCm: product.defaultThicknessCm ?? "",
      dimensions: product.dimensions || "",
      finishesText: Array.isArray(product.finishes)
        ? product.finishes.join(", ")
        : "",
      packagingType: product.packaging?.type || "",
      packagingKg: product.packaging?.kg ?? "",
      packagingM2PerPallet: product.packaging?.m2PerPallet ?? "",
      packagingMPerPallet: product.packaging?.mPerPallet ?? "",
      packagingNote: product.packaging?.note || "",
      sellingPrice: product.sellingPrice ?? "",
      tradeGood: !!product.tradeGood,
      notes: product.notes || "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setShowAddForm(false);
    setForm(emptyProduct);
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const normalizePayload = () => ({
    name: form.name || undefined,
    category: form.category || undefined,
    line: form.line || undefined,
    baseUnit: form.baseUnit || undefined,
    defaultThicknessMm:
      form.defaultThicknessMm === ""
        ? undefined
        : parseFloat(form.defaultThicknessMm),
    defaultThicknessCm:
      form.defaultThicknessCm === "" ? undefined : form.defaultThicknessCm,
    dimensions: form.dimensions || undefined,
    finishes: form.finishesText
      ? form.finishesText
          .split(",")
          .map((f) => f.trim())
          .filter(Boolean)
      : undefined,
    packaging: {
      type: form.packagingType || undefined,
      kg: form.packagingKg === "" ? undefined : parseFloat(form.packagingKg),
      m2PerPallet:
        form.packagingM2PerPallet === ""
          ? undefined
          : parseFloat(form.packagingM2PerPallet),
      mPerPallet:
        form.packagingMPerPallet === ""
          ? undefined
          : parseFloat(form.packagingMPerPallet),
      note: form.packagingNote || undefined,
    },
    sellingPrice:
      form.sellingPrice === "" ? undefined : parseFloat(form.sellingPrice),
    tradeGood: !!form.tradeGood,
    notes: form.notes || undefined,
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put(`/api/products/${editingId}`, normalizePayload());
      fetchProducts();
      cancelEdit();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleAdd = async () => {
    setSaving(true);
    try {
      await axios.post("/api/products", normalizePayload());
      fetchProducts();
      cancelEdit();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Διαγραφή αυτού του προϊόντος;")) return;
    try {
      await axios.delete(`/api/products/${id}`);
      fetchProducts();
    } catch (err) {
      console.error(err);
    }
  };

  const renderForm = (isAdd = false) => (
    <div className='p-6 bg-gray-50 dark:bg-[#21252b] border-t border-gray-200 dark:border-[#181a1f] space-y-4'>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
        <input
          value={form.name}
          onChange={(e) => handleChange("name", e.target.value)}
          placeholder='Όνομα'
          className='border-2 border-gray-200 dark:border-[#181a1f] bg-white dark:bg-[#282c34] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white'
        />
        <input
          value={form.category}
          onChange={(e) => handleChange("category", e.target.value)}
          placeholder='Κατηγορία'
          className='border-2 border-gray-200 dark:border-[#181a1f] bg-white dark:bg-[#282c34] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white'
        />
        <input
          value={form.line}
          onChange={(e) => handleChange("line", e.target.value)}
          placeholder='Γραμμή'
          className='border-2 border-gray-200 dark:border-[#181a1f] bg-white dark:bg-[#282c34] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white'
        />
      </div>

      <div className='grid grid-cols-1 md:grid-cols-4 gap-3'>
        <input
          value={form.baseUnit}
          onChange={(e) => handleChange("baseUnit", e.target.value)}
          placeholder='Μονάδα'
          className='border-2 border-gray-200 dark:border-[#181a1f] bg-white dark:bg-[#282c34] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white'
        />
        <input
          type='number'
          value={form.defaultThicknessMm}
          onChange={(e) => handleChange("defaultThicknessMm", e.target.value)}
          placeholder='Πάχος mm'
          className='border-2 border-gray-200 dark:border-[#181a1f] bg-white dark:bg-[#282c34] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white'
        />
        <input
          value={form.defaultThicknessCm}
          onChange={(e) => handleChange("defaultThicknessCm", e.target.value)}
          placeholder='Πάχος cm'
          className='border-2 border-gray-200 dark:border-[#181a1f] bg-white dark:bg-[#282c34] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white'
        />
        <input
          value={form.dimensions}
          onChange={(e) => handleChange("dimensions", e.target.value)}
          placeholder='Διαστάσεις'
          className='border-2 border-gray-200 dark:border-[#181a1f] bg-white dark:bg-[#282c34] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white'
        />
      </div>

      <input
        value={form.finishesText}
        onChange={(e) => handleChange("finishesText", e.target.value)}
        placeholder='Φινιρίσματα, χωρισμένα με κόμμα'
        className='w-full border-2 border-gray-200 dark:border-[#181a1f] bg-white dark:bg-[#282c34] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white'
      />

      <div className='grid grid-cols-1 md:grid-cols-4 gap-3'>
        <input
          value={form.packagingType}
          onChange={(e) => handleChange("packagingType", e.target.value)}
          placeholder='Συσκευασία τύπος'
          className='border-2 border-gray-200 dark:border-[#181a1f] bg-white dark:bg-[#282c34] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white'
        />
        <input
          type='number'
          value={form.packagingKg}
          onChange={(e) => handleChange("packagingKg", e.target.value)}
          placeholder='Kg'
          className='border-2 border-gray-200 dark:border-[#181a1f] bg-white dark:bg-[#282c34] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white'
        />
        <input
          type='number'
          value={form.packagingM2PerPallet}
          onChange={(e) => handleChange("packagingM2PerPallet", e.target.value)}
          placeholder='m²/παλέτα'
          className='border-2 border-gray-200 dark:border-[#181a1f] bg-white dark:bg-[#282c34] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white'
        />
        <input
          type='number'
          value={form.packagingMPerPallet}
          onChange={(e) => handleChange("packagingMPerPallet", e.target.value)}
          placeholder='m/παλέτα'
          className='border-2 border-gray-200 dark:border-[#181a1f] bg-white dark:bg-[#282c34] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white'
        />
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
        <input
          value={form.packagingNote}
          onChange={(e) => handleChange("packagingNote", e.target.value)}
          placeholder='Σημείωση συσκευασίας'
          className='border-2 border-gray-200 dark:border-[#181a1f] bg-white dark:bg-[#282c34] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white'
        />
        <input
          type='number'
          value={form.sellingPrice}
          onChange={(e) => handleChange("sellingPrice", e.target.value)}
          placeholder='Τιμή πώλησης'
          className='border-2 border-gray-200 dark:border-[#181a1f] bg-white dark:bg-[#282c34] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white'
        />
        <label className='flex items-center gap-2 px-3 py-2 rounded-lg border-2 border-gray-200 dark:border-[#181a1f] bg-white dark:bg-[#282c34] text-sm text-gray-900 dark:text-white'>
          <input
            type='checkbox'
            checked={form.tradeGood}
            onChange={(e) => handleChange("tradeGood", e.target.checked)}
          />
          Εμπορικό είδος
        </label>
      </div>

      <textarea
        value={form.notes}
        onChange={(e) => handleChange("notes", e.target.value)}
        placeholder='Σημειώσεις'
        rows={3}
        className='w-full border-2 border-gray-200 dark:border-[#181a1f] bg-white dark:bg-[#282c34] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white'
      />

      <div className='flex items-center justify-end gap-2'>
        <button
          onClick={cancelEdit}
          className='px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#2c313c] transition-colors'
        >
          Ακύρωση
        </button>
        <button
          onClick={isAdd ? handleAdd : handleSave}
          disabled={saving}
          className='inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:opacity-80 transition-opacity'
        >
          <Check className='w-4 h-4' />
          {isAdd ? "Προσθήκη" : "Αποθήκευση"}
        </button>
      </div>
    </div>
  );

  return (
    <div className='px-4 py-6 md:px-8 md:py-8 space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300'>
      <div className='flex items-center justify-between pb-4 border-b border-gray-200 dark:border-[#181a1f]'>
        <h1 className='text-3xl font-bold text-gray-900 dark:text-white tracking-tight'>
          Προϊόντα
        </h1>
        <div className='flex items-center gap-3'>
          <span className='px-3 py-1 bg-gray-100 dark:bg-[#282c34] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-[#181a1f] rounded-full text-xs font-semibold uppercase tracking-wider'>
            {products.length} αντικείμενα
          </span>
          <button
            onClick={() => {
              setEditingId(null);
              setForm(emptyProduct);
              setShowAddForm(true);
            }}
            className='inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-semibold hover:opacity-80 transition-opacity'
          >
            <Plus className='w-4 h-4' />
            Προσθήκη
          </button>
        </div>
      </div>

      <div className='bg-white dark:bg-[#282c34] rounded-2xl border border-gray-200 dark:border-[#181a1f] shadow-sm overflow-x-auto'>
        {loading ? (
          <div className='p-12 flex justify-center'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white'></div>
          </div>
        ) : (
          <>
            <table className='w-full'>
              <thead className='bg-gray-50 dark:bg-[#21252b] border-b border-gray-200 dark:border-[#181a1f]'>
                <tr>
                  <th className='text-left px-8 py-5 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 min-w-[220px]'>
                    Όνομα
                  </th>
                  <th className='text-left px-8 py-5 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400'>
                    Κατηγορία
                  </th>
                  <th className='text-left px-8 py-5 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400'>
                    Μονάδα
                  </th>
                  <th className='text-left px-8 py-5 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400'>
                    Πάχος
                  </th>
                  <th className='text-right px-8 py-5 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400'>
                    Ενέργειες
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-100 dark:divide-[#181a1f]'>
                {products.length === 0 ? (
                  <tr>
                    <td
                      colSpan='5'
                      className='px-8 py-12 text-center text-gray-500 dark:text-gray-400'
                    >
                      Δεν βρέθηκαν προϊόντα
                    </td>
                  </tr>
                ) : (
                  products.map((p, i) => (
                    <tr
                      key={p._id || i}
                      className='hover:bg-gray-50/50 dark:hover:bg-[#2c313c]/50 transition-colors'
                    >
                      <td className='px-8 py-5 font-medium text-gray-900 dark:text-gray-100'>
                        {p.name}
                      </td>
                      <td className='px-8 py-5'>
                        <span className='px-2.5 py-1 bg-gray-100 dark:bg-[#21252b] text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-[#181a1f] rounded-md text-xs font-medium whitespace-nowrap'>
                          {p.category || "—"}
                        </span>
                      </td>
                      <td className='px-8 py-5 text-gray-500 dark:text-gray-400 text-sm'>
                        {p.baseUnit || p.unit || "—"}
                      </td>
                      <td className='px-8 py-5 text-gray-500 dark:text-gray-400 text-sm'>
                        {p.defaultThicknessMm
                          ? `${p.defaultThicknessMm}mm`
                          : p.defaultThicknessCm
                            ? `${p.defaultThicknessCm}cm`
                            : "—"}
                      </td>
                      <td className='px-8 py-5'>
                        <div className='flex items-center justify-end gap-2'>
                          <button
                            onClick={() => handleAddToCalculator(p)}
                            className='inline-flex items-center gap-2 px-3 py-1.5 bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 text-xs font-bold rounded-lg transition-all active:scale-95 shadow-sm cursor-pointer'
                          >
                            <CalculatorIcon className='w-3.5 h-3.5' />
                            <span>Προσθήκη</span>
                          </button>
                          <button
                            onClick={() => startEdit(p)}
                            className='p-2 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#2c313c] transition-colors'
                          >
                            <Pencil className='w-4 h-4' />
                          </button>
                          <button
                            onClick={() => handleDelete(p._id)}
                            className='p-2 rounded-lg border border-red-200 dark:border-red-900/50 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors'
                          >
                            <Trash2 className='w-4 h-4' />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {editingId && renderForm(false)}
            {showAddForm && renderForm(true)}
          </>
        )}
      </div>
    </div>
  );
}

export default Products;
