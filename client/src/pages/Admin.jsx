import { useState, useEffect } from "react";
import axios from "axios";
import { Settings, Pencil, Check, X } from "lucide-react";

export default function Admin() {
  const [costs, setCosts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [newValue, setNewValue] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    axios.get("/api/admin/overhead").then(res => setCosts(res.data));
  }, []);

  const handleEdit = (cost) => {
    setEditingId(cost.costType);
    setNewValue(cost.perMonth);
  };

  const handleSave = async (costType) => {
    setSaving(true);
    try {
      await axios.put(`/api/admin/overhead/${encodeURIComponent(costType)}`, {
        perMonth: parseFloat(newValue)
      });
      const res = await axios.get("/api/admin/overhead");
      setCosts(res.data);
      setEditingId(null);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto animate-in fade-in duration-300">
      <div className="flex items-center space-x-3 mb-8 pb-4 border-b border-gray-200 dark:border-[#181a1f]">
        <Settings className="w-6 h-6 text-gray-800 dark:text-gray-200" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
          Διαχείριση Σταθερών Εξόδων
        </h1>
      </div>

      <div className="bg-white dark:bg-[#282c34] rounded-2xl shadow-sm border border-gray-200 dark:border-[#181a1f] overflow-hidden">
        {costs.map((cost, i) => (
          <div
            key={cost.costType}
            className={`flex items-center justify-between px-6 py-4 ${i !== costs.length - 1 ? "border-b border-gray-100 dark:border-[#181a1f]" : ""}`}
          >
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">{cost.costType}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                €{cost.perDay?.toFixed(2)}/μέρα
              </p>
            </div>

            {editingId === cost.costType ? (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={newValue}
                  onChange={e => setNewValue(e.target.value)}
                  className="w-28 border-2 border-gray-200 dark:border-[#181a1f] bg-gray-50 dark:bg-[#21252b] text-gray-900 dark:text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-gray-800 dark:focus:border-gray-400"
                />
                <span className="text-sm text-gray-500">€/μήνα</span>
                <button
                  onClick={() => handleSave(cost.costType)}
                  disabled={saving}
                  className="p-1.5 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:opacity-80 transition-opacity"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#2c313c] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <span className="font-semibold text-gray-900 dark:text-white">
                  €{cost.perMonth?.toLocaleString()}/μήνα
                </span>
                <button
                  onClick={() => handleEdit(cost)}
                  className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#2c313c] transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
