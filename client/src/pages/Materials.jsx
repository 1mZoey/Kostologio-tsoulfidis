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

const emptyMaterial = {
  source: "",
  loadType: "per_load",
  pricePerLoad: "",
  pricePerM3: "",
  estimatedM3: "",
  baseCostPerM2: "",
  currency: "EUR",
  notes: "",
};

function Materials() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyMaterial);
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const navigate = useNavigate();

  const fetchMaterials = () => {
    axios
      .get("/api/materials")
      .then((res) => {
        setMaterials(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const handleAddToCalculator = (material) => {
    navigate("/calculator", {
      state: {
        selectedItem: {
          type: "material",
          source: material.source || material.name,
        },
      },
    });
  };

  const formatPrice = (m) => {
    if (m.baseCostPerM2 != null) return `€${m.baseCostPerM2}/m²`;
    if (m.pricePerM3 != null) return `€${m.pricePerM3}/m³`;
    if (m.pricePerLoad != null) return `€${m.pricePerLoad}/φορτίο`;
    if (m.price != null) return `€${m.price}`;
    if (m.costPerUnit != null) return `€${m.costPerUnit}`;
    return "—";
  };

  const formatCategory = (m) => {
    if (m.loadType === "per_load") return "Ανά Φορτίο";
    if (m.loadType === "per_m3") return "Ανά m³";
    if (m.category) return m.category;
    return "—";
  };

  const formatUnitType = (m) => {
    if (m.loadType === "per_load") return "Φορτίο";
    if (m.loadType === "per_m3") return "m³";
    if (m.unitType) return m.unitType;
    return "—";
  };

  const startEdit = (material) => {
    setShowAddForm(false);
    setEditingId(material._id);
    setForm({
      source: material.source || "",
      loadType: material.loadType || "per_load",
      pricePerLoad: material.pricePerLoad ?? "",
      pricePerM3: material.pricePerM3 ?? "",
      estimatedM3: material.estimatedM3 ?? "",
      baseCostPerM2: material.baseCostPerM2 ?? "",
      currency: material.currency || "EUR",
      notes: material.notes || "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setShowAddForm(false);
    setForm(emptyMaterial);
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const normalizePayload = () => ({
    source: form.source || undefined,
    loadType: form.loadType || undefined,
    pricePerLoad:
      form.pricePerLoad === "" ? undefined : parseFloat(form.pricePerLoad),
    pricePerM3:
      form.pricePerM3 === "" ? undefined : parseFloat(form.pricePerM3),
    estimatedM3:
      form.estimatedM3 === "" ? undefined : parseFloat(form.estimatedM3),
    baseCostPerM2:
      form.baseCostPerM2 === "" ? undefined : parseFloat(form.baseCostPerM2),
    currency: form.currency || "EUR",
    notes: form.notes || undefined,
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put(`/api/materials/${editingId}`, normalizePayload());
      fetchMaterials();
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
      await axios.post("/api/materials", normalizePayload());
      fetchMaterials();
      cancelEdit();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Διαγραφή αυτού του υλικού;")) return;
    try {
      await axios.delete(`/api/materials/${id}`);
      fetchMaterials();
    } catch (err) {
      console.error(err);
    }
  };

  const renderForm = (isAdd = false) => (
    <div className='p-6 bg-gray-50 dark:bg-[#21252b] border-t border-gray-200 dark:border-[#181a1f] space-y-4'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
        <input
          value={form.source}
          onChange={(e) => handleChange("source", e.target.value)}
          placeholder='Όνομα / Πηγή'
          className='border-2 border-gray-200 dark:border-[#181a1f] bg-white dark:bg-[#282c34] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white'
        />
        <select
          value={form.loadType}
          onChange={(e) => handleChange("loadType", e.target.value)}
          className='border-2 border-gray-200 dark:border-[#181a1f] bg-white dark:bg-[#282c34] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white'
        >
          <option value='per_load'>Ανά Φορτίο</option>
          <option value='per_m3'>Ανά m³</option>
        </select>
      </div>

      <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
        <input
          type='number'
          value={form.pricePerLoad}
          onChange={(e) => handleChange("pricePerLoad", e.target.value)}
          placeholder='Τιμή/φορτίο'
          className='border-2 border-gray-200 dark:border-[#181a1f] bg-white dark:bg-[#282c34] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white'
        />
        <input
          type='number'
          value={form.pricePerM3}
          onChange={(e) => handleChange("pricePerM3", e.target.value)}
          placeholder='Τιμή/m³'
          className='border-2 border-gray-200 dark:border-[#181a1f] bg-white dark:bg-[#282c34] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white'
        />
        <input
          type='number'
          value={form.estimatedM3}
          onChange={(e) => handleChange("estimatedM3", e.target.value)}
          placeholder='Εκτ. m³'
          className='border-2 border-gray-200 dark:border-[#181a1f] bg-white dark:bg-[#282c34] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white'
        />
        <input
          type='number'
          value={form.baseCostPerM2}
          onChange={(e) => handleChange("baseCostPerM2", e.target.value)}
          placeholder='Κόστος/m²'
          className='border-2 border-gray-200 dark:border-[#181a1f] bg-white dark:bg-[#282c34] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white'
        />
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
        <input
          value={form.currency}
          onChange={(e) => handleChange("currency", e.target.value)}
          placeholder='Νόμισμα'
          className='border-2 border-gray-200 dark:border-[#181a1f] bg-white dark:bg-[#282c34] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white'
        />
        <input
          value={form.notes}
          onChange={(e) => handleChange("notes", e.target.value)}
          placeholder='Σημειώσεις'
          className='border-2 border-gray-200 dark:border-[#181a1f] bg-white dark:bg-[#282c34] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white'
        />
      </div>

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
    <div className='p-8 space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300'>
      <div className='flex items-center justify-between pb-4 border-b border-gray-200 dark:border-[#181a1f]'>
        <h1 className='text-3xl font-bold text-gray-900 dark:text-white tracking-tight'>
          Υλικά
        </h1>
        <div className='flex items-center gap-3'>
          <span className='px-3 py-1 bg-gray-100 dark:bg-[#282c34] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-[#181a1f] rounded-full text-xs font-semibold uppercase tracking-wider'>
            {materials.length} αντικείμενα
          </span>
          <button
            onClick={() => {
              setEditingId(null);
              setForm(emptyMaterial);
              setShowAddForm(true);
            }}
            className='inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-semibold hover:opacity-80 transition-opacity'
          >
            <Plus className='w-4 h-4' />
            Προσθήκη
          </button>
        </div>
      </div>

      <div className='bg-white dark:bg-[#282c34] rounded-2xl border border-gray-200 dark:border-[#181a1f] shadow-sm overflow-hidden'>
        {loading ? (
          <div className='p-12 flex justify-center'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white'></div>
          </div>
        ) : (
          <>
            <table className='w-full'>
              <thead className='bg-gray-50 dark:bg-[#21252b] border-b border-gray-200 dark:border-[#181a1f]'>
                <tr>
                  <th className='text-left px-8 py-5 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400'>
                    Όνομα
                  </th>
                  <th className='text-left px-8 py-5 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400'>
                    Κατηγορία
                  </th>
                  <th className='text-left px-8 py-5 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400'>
                    Τύπος Μονάδας
                  </th>
                  <th className='text-left px-8 py-5 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400'>
                    Τιμή (€)
                  </th>
                  <th className='text-right px-8 py-5 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400'>
                    Ενέργειες
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-100 dark:divide-[#181a1f]'>
                {materials.length === 0 ? (
                  <tr>
                    <td
                      colSpan='5'
                      className='px-8 py-12 text-center text-gray-500 dark:text-gray-400'
                    >
                      Δεν βρέθηκαν υλικά
                    </td>
                  </tr>
                ) : (
                  materials.map((m, i) => (
                    <tr
                      key={m._id || i}
                      className='hover:bg-gray-50/50 dark:hover:bg-[#2c313c]/50 transition-colors'
                    >
                      <td className='px-8 py-5 font-medium text-gray-900 dark:text-gray-100'>
                        {m.name || m.source || "—"}
                      </td>
                      <td className='px-8 py-5'>
                        <span className='px-2.5 py-1 bg-gray-100 dark:bg-[#21252b] text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-[#181a1f] rounded-md text-xs font-medium whitespace-nowrap'>
                          {formatCategory(m)}
                        </span>
                      </td>
                      <td className='px-8 py-5 text-gray-500 dark:text-gray-400 text-sm'>
                        {formatUnitType(m)}
                      </td>
                      <td className='px-8 py-5 font-semibold text-gray-900 dark:text-gray-100'>
                        {formatPrice(m)}
                      </td>
                      <td className='px-8 py-5'>
                        <div className='flex items-center justify-end gap-2'>
                          <button
                            onClick={() => handleAddToCalculator(m)}
                            className='inline-flex items-center gap-2 px-3 py-1.5 bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 text-xs font-bold rounded-lg transition-all active:scale-95 shadow-sm cursor-pointer'
                          >
                            <CalculatorIcon className='w-3.5 h-3.5' />
                            <span>Προσθήκη</span>
                          </button>
                          <button
                            onClick={() => startEdit(m)}
                            className='p-2 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#2c313c] transition-colors'
                          >
                            <Pencil className='w-4 h-4' />
                          </button>
                          <button
                            onClick={() => handleDelete(m._id)}
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

export default Materials;
