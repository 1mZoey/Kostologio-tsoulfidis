import { useState, useEffect } from "react";
import axios from "axios";
import { Settings, Pencil, Check, X, Trash2, Plus } from "lucide-react";

export default function Admin() {
  const [costs, setCosts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editMode, setEditMode] = useState(null); // "amount" | "name"
  const [newValue, setNewValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newType, setNewType] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [newMonthly, setNewMonthly] = useState("");

  const fetchCosts = () =>
    axios.get("/api/admin/overhead").then((res) => setCosts(res.data));

  useEffect(() => {
    fetchCosts();
  }, []);

  const handleEditAmount = (cost) => {
    setEditingId(cost.type);
    setEditMode("amount");
    setNewValue(cost.monthlyEUR);
  };

  const handleEditName = (cost) => {
    setEditingId(cost.type);
    setEditMode("name");
    setNewValue(cost.label || cost.type);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditMode(null);
    setNewValue("");
  };

  const handleSaveAmount = async (type) => {
    setSaving(true);
    try {
      await axios.put(`/api/admin/overhead/${encodeURIComponent(type)}`, {
        monthlyEUR: parseFloat(newValue),
      });
      await fetchCosts();
      handleCancel();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveName = async (type) => {
    setSaving(true);
    try {
      await axios.patch(
        `/api/admin/overhead/${encodeURIComponent(type)}/label`,
        {
          label: newValue.trim(),
        },
      );
      await fetchCosts();
      handleCancel();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (type) => {
    if (!window.confirm("Διαγραφή αυτής της εγγραφής;")) return;
    try {
      await axios.delete(`/api/admin/overhead/${encodeURIComponent(type)}`);
      await fetchCosts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdd = async () => {
    if (!newType.trim() || !newMonthly) return;
    setSaving(true);
    try {
      await axios.post("/api/admin/overhead", {
        type: newType.trim().toLowerCase().replace(/\s+/g, "_"),
        label: newLabel.trim() || newType.trim(),
        monthlyEUR: parseFloat(newMonthly),
      });
      await fetchCosts();
      setShowAddForm(false);
      setNewType("");
      setNewLabel("");
      setNewMonthly("");
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className='p-6 max-w-2xl mx-auto animate-in fade-in duration-300'>
      <div className='flex items-center space-x-3 mb-8 pb-4 border-b border-gray-200 dark:border-[#181a1f]'>
        <Settings className='w-6 h-6 text-gray-800 dark:text-gray-200' />
        <h1 className='text-2xl font-bold text-gray-900 dark:text-white tracking-tight'>
          Διαχείριση Σταθερών Εξόδων
        </h1>
      </div>

      <div className='bg-white dark:bg-[#282c34] rounded-2xl shadow-sm border border-gray-200 dark:border-[#181a1f] overflow-hidden'>
        {costs.map((cost, i) => (
          <div
            key={cost._id?.$oid || cost._id?.toString() || cost.type || i}
            className={`px-6 py-4 ${i !== costs.length - 1 ? "border-b border-gray-100 dark:border-[#181a1f]" : ""}`}
          >
            {/* Name edit mode */}
            {editingId === cost.type && editMode === "name" ? (
              <div className='flex items-center gap-2'>
                <input
                  autoFocus
                  type='text'
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  className='flex-1 border-2 border-gray-200 dark:border-[#181a1f] bg-gray-50 dark:bg-[#21252b] text-gray-900 dark:text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-gray-800 dark:focus:border-gray-400'
                />
                <button
                  onClick={() => handleSaveName(cost.type)}
                  disabled={saving}
                  className='p-1.5 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:opacity-80 transition-opacity'
                >
                  <Check className='w-4 h-4' />
                </button>
                <button
                  onClick={handleCancel}
                  className='p-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#2c313c] transition-colors'
                >
                  <X className='w-4 h-4' />
                </button>
              </div>
            ) : (
              <div className='flex items-center justify-between'>
                {/* Left: name + daily */}
                <div>
                  <div className='flex items-center gap-2'>
                    <p className='font-semibold text-gray-900 dark:text-white'>
                      {cost.label || cost.type}
                    </p>
                    <button
                      onClick={() => handleEditName(cost)}
                      className='p-1 rounded-md text-gray-300 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2c313c] transition-colors'
                    >
                      <Pencil className='w-3 h-3' />
                    </button>
                  </div>
                  <p className='text-sm text-gray-500 dark:text-gray-400'>
                    €{cost.dailyEUR?.toFixed(2)}/μέρα
                  </p>
                </div>

                {/* Right: amount edit or display */}
                {editingId === cost.type && editMode === "amount" ? (
                  <div className='flex items-center gap-2'>
                    <input
                      autoFocus
                      type='number'
                      value={newValue}
                      onChange={(e) => setNewValue(e.target.value)}
                      className='w-28 border-2 border-gray-200 dark:border-[#181a1f] bg-gray-50 dark:bg-[#21252b] text-gray-900 dark:text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-gray-800 dark:focus:border-gray-400'
                    />
                    <span className='text-sm text-gray-500'>€/μήνα</span>
                    <button
                      onClick={() => handleSaveAmount(cost.type)}
                      disabled={saving}
                      className='p-1.5 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:opacity-80 transition-opacity'
                    >
                      <Check className='w-4 h-4' />
                    </button>
                    <button
                      onClick={handleCancel}
                      className='p-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#2c313c] transition-colors'
                    >
                      <X className='w-4 h-4' />
                    </button>
                  </div>
                ) : (
                  <div className='flex items-center gap-2'>
                    <span className='font-semibold text-gray-900 dark:text-white'>
                      €{cost.monthlyEUR?.toLocaleString()}/μήνα
                    </span>
                    <button
                      onClick={() => handleEditAmount(cost)}
                      className='p-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#2c313c] transition-colors'
                    >
                      <Pencil className='w-4 h-4' />
                    </button>
                    <button
                      onClick={() => handleDelete(cost.type)}
                      className='p-1.5 rounded-lg border border-red-200 dark:border-red-900/50 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors'
                    >
                      <Trash2 className='w-4 h-4' />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {/* Add form */}
        {showAddForm && (
          <div className='px-6 py-4 border-t border-gray-100 dark:border-[#181a1f] bg-gray-50 dark:bg-[#21252b] space-y-3 animate-in fade-in slide-in-from-top-2 duration-200'>
            <p className='text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
              Νέα Εγγραφή
            </p>
            <div className='grid grid-cols-2 gap-3'>
              <div>
                <label className='block text-xs text-gray-500 dark:text-gray-400 mb-1'>
                  Όνομα
                </label>
                <input
                  autoFocus
                  type='text'
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder='π.χ. Ρεύμα'
                  className='w-full border-2 border-gray-200 dark:border-[#181a1f] bg-white dark:bg-[#282c34] text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-800 dark:focus:border-gray-400'
                />
              </div>
              <div>
                <label className='block text-xs text-gray-500 dark:text-gray-400 mb-1'>
                  Κόστος/μήνα (€)
                </label>
                <input
                  type='number'
                  value={newMonthly}
                  onChange={(e) => setNewMonthly(e.target.value)}
                  placeholder='π.χ. 1500'
                  className='w-full border-2 border-gray-200 dark:border-[#181a1f] bg-white dark:bg-[#282c34] text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-800 dark:focus:border-gray-400'
                />
              </div>
            </div>
            <div className='flex gap-2 justify-end'>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setNewType("");
                  setNewLabel("");
                  setNewMonthly("");
                }}
                className='px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#2c313c] transition-colors'
              >
                Ακύρωση
              </button>
              <button
                onClick={handleAdd}
                disabled={saving || !newLabel.trim() || !newMonthly}
                className='px-3 py-1.5 text-sm rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:opacity-80 transition-opacity disabled:opacity-40'
              >
                Προσθήκη
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add button */}
      {!showAddForm && (
        <button
          onClick={() => setShowAddForm(true)}
          className='mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#2c313c] transition-all text-sm font-medium'
        >
          <Plus className='w-4 h-4' />
          Προσθήκη Νέας Εγγραφής
        </button>
      )}
    </div>
  );
}
