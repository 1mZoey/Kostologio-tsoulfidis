import { useState, useEffect } from "react";
import { Cpu, Pencil, Check, X, Trash2, Plus } from "lucide-react";
import axios from "axios";

function CostCell({ machine }) {
  const parts = [];

  if (machine.costPerM2 != null) {
    parts.push({ label: null, value: machine.costPerM2, unit: "/m²" });
  }
  if (machine.costPerM2_stone != null) {
    parts.push({ label: "Πέτρα", value: machine.costPerM2_stone, unit: "/m²" });
  }
  if (machine.costPerM2_marble != null) {
    parts.push({
      label: "Μάρμαρο",
      value: machine.costPerM2_marble,
      unit: "/m²",
    });
  }
  if (machine.costPerM2_stone_alt != null) {
    parts.push({
      label: "Φινίρ.",
      value: machine.costPerM2_stone_alt,
      unit: "/m²",
    });
  }
  if (machine.costPerM_primary != null) {
    parts.push({ label: "Κύρια", value: machine.costPerM_primary, unit: "/m" });
  }
  if (machine.costPerM_secondary != null) {
    parts.push({
      label: "Δευτ.",
      value: machine.costPerM_secondary,
      unit: "/m",
    });
  }
  if (parts.length === 0 && machine.notes && machine.notes.includes("30.25")) {
    parts.push({ label: "Κοψιά", value: 30.25, unit: "/κοψιά" });
  }

  if (parts.length === 0)
    return <span className='text-gray-400 dark:text-gray-500'>—</span>;

  return (
    <div className='flex flex-wrap gap-1.5'>
      {parts.map((p, i) => (
        <span
          key={i}
          className='inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-100 dark:bg-[#21252b] border border-gray-200 dark:border-[#181a1f] text-xs font-medium text-gray-700 dark:text-gray-300'
        >
          {p.label && (
            <span className='text-gray-400 dark:text-gray-500'>{p.label}</span>
          )}
          <span className='text-gray-900 dark:text-gray-100 font-semibold'>
            €{p.value}
          </span>
          <span className='text-gray-400 dark:text-gray-500'>{p.unit}</span>
        </span>
      ))}
    </div>
  );
}

const emptyMachine = {
  name: "",
  nameShort: "",
  machineKey: "",
  costPerM2: "",
  costPerM2_stone: "",
  costPerM2_marble: "",
  costPerM2_stone_alt: "",
  costPerM_primary: "",
  costPerM_secondary: "",
  dailyOutputM2: "",
  workers: "",
  dailyWageEUR: "",
  overheadAllocation: {
    electricity_pct: "",
    diamond_pct: "",
    consumables_pct: "",
    maintenance_pct: "",
  },
  notes: "",
};

function Machines() {
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyMachine);
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const fetchMachines = () => {
    axios
      .get("/api/machines")
      .then((res) => {
        setMachines(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchMachines();
  }, []);

  const toInputValue = (val) => (val == null ? "" : val);

  const startEdit = (machine) => {
    setEditingId(machine._id);
    setForm({
      name: machine.name || "",
      nameShort: machine.nameShort || "",
      machineKey: machine.machineKey || "",
      costPerM2: toInputValue(machine.costPerM2),
      costPerM2_stone: toInputValue(machine.costPerM2_stone),
      costPerM2_marble: toInputValue(machine.costPerM2_marble),
      costPerM2_stone_alt: toInputValue(machine.costPerM2_stone_alt),
      costPerM_primary: toInputValue(machine.costPerM_primary),
      costPerM_secondary: toInputValue(machine.costPerM_secondary),
      dailyOutputM2: toInputValue(machine.dailyOutputM2),
      workers: toInputValue(machine.workers),
      dailyWageEUR: toInputValue(machine.dailyWageEUR),
      overheadAllocation: {
        electricity_pct: toInputValue(
          machine.overheadAllocation?.electricity_pct,
        ),
        diamond_pct: toInputValue(machine.overheadAllocation?.diamond_pct),
        consumables_pct: toInputValue(
          machine.overheadAllocation?.consumables_pct,
        ),
        maintenance_pct: toInputValue(
          machine.overheadAllocation?.maintenance_pct,
        ),
      },
      notes: machine.notes || "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyMachine);
    setShowAddForm(false);
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleOverheadChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      overheadAllocation: {
        ...prev.overheadAllocation,
        [field]: value,
      },
    }));
  };

  const normalizePayload = () => ({
    name: form.name || undefined,
    nameShort: form.nameShort || undefined,
    machineKey: form.machineKey || undefined,
    costPerM2: form.costPerM2 === "" ? undefined : parseFloat(form.costPerM2),
    costPerM2_stone:
      form.costPerM2_stone === ""
        ? undefined
        : parseFloat(form.costPerM2_stone),
    costPerM2_marble:
      form.costPerM2_marble === ""
        ? undefined
        : parseFloat(form.costPerM2_marble),
    costPerM2_stone_alt:
      form.costPerM2_stone_alt === ""
        ? undefined
        : parseFloat(form.costPerM2_stone_alt),
    costPerM_primary:
      form.costPerM_primary === ""
        ? undefined
        : parseFloat(form.costPerM_primary),
    costPerM_secondary:
      form.costPerM_secondary === ""
        ? undefined
        : parseFloat(form.costPerM_secondary),
    dailyOutputM2:
      form.dailyOutputM2 === "" ? undefined : parseFloat(form.dailyOutputM2),
    workers: form.workers === "" ? undefined : parseFloat(form.workers),
    dailyWageEUR:
      form.dailyWageEUR === "" ? undefined : parseFloat(form.dailyWageEUR),
    overheadAllocation: {
      electricity_pct:
        form.overheadAllocation.electricity_pct === ""
          ? undefined
          : parseFloat(form.overheadAllocation.electricity_pct),
      diamond_pct:
        form.overheadAllocation.diamond_pct === ""
          ? undefined
          : parseFloat(form.overheadAllocation.diamond_pct),
      consumables_pct:
        form.overheadAllocation.consumables_pct === ""
          ? undefined
          : parseFloat(form.overheadAllocation.consumables_pct),
      maintenance_pct:
        form.overheadAllocation.maintenance_pct === ""
          ? undefined
          : parseFloat(form.overheadAllocation.maintenance_pct),
    },
    notes: form.notes || undefined,
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put(`/api/machines/${editingId}`, normalizePayload());
      fetchMachines();
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
      await axios.post("/api/machines", normalizePayload());
      fetchMachines();
      cancelEdit();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Διαγραφή αυτού του μηχανήματος;")) return;
    try {
      await axios.delete(`/api/machines/${id}`);
      fetchMachines();
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
          className='border-2 border-gray-200 dark:border-[#181a1f] bg-white dark:bg-[#282c34] rounded-lg px-3 py-2 text-sm'
        />
        <input
          value={form.nameShort}
          onChange={(e) => handleChange("nameShort", e.target.value)}
          placeholder='Σύντομο όνομα'
          className='border-2 border-gray-200 dark:border-[#181a1f] bg-white dark:bg-[#282c34] rounded-lg px-3 py-2 text-sm'
        />
        <input
          value={form.machineKey}
          onChange={(e) => handleChange("machineKey", e.target.value)}
          placeholder='Machine key'
          className='border-2 border-gray-200 dark:border-[#181a1f] bg-white dark:bg-[#282c34] rounded-lg px-3 py-2 text-sm'
        />
      </div>

      <div className='grid grid-cols-2 md:grid-cols-3 gap-3'>
        <input
          value={form.dailyOutputM2}
          onChange={(e) => handleChange("dailyOutputM2", e.target.value)}
          placeholder='Παραγωγή/ημέρα'
          type='number'
          className='border-2 border-gray-200 dark:border-[#181a1f] bg-white dark:bg-[#282c34] rounded-lg px-3 py-2 text-sm'
        />
        <input
          value={form.workers}
          onChange={(e) => handleChange("workers", e.target.value)}
          placeholder='Εργάτες'
          type='number'
          className='border-2 border-gray-200 dark:border-[#181a1f] bg-white dark:bg-[#282c34] rounded-lg px-3 py-2 text-sm'
        />
        <input
          value={form.dailyWageEUR}
          onChange={(e) => handleChange("dailyWageEUR", e.target.value)}
          placeholder='Ημερομίσθιο €'
          type='number'
          className='border-2 border-gray-200 dark:border-[#181a1f] bg-white dark:bg-[#282c34] rounded-lg px-3 py-2 text-sm'
        />
      </div>

      <div className='grid grid-cols-2 md:grid-cols-3 gap-3'>
        <input
          value={form.costPerM2}
          onChange={(e) => handleChange("costPerM2", e.target.value)}
          placeholder='Κόστος /m²'
          type='number'
          className='border-2 border-gray-200 dark:border-[#181a1f] bg-white dark:bg-[#282c34] rounded-lg px-3 py-2 text-sm'
        />
        <input
          value={form.costPerM2_stone}
          onChange={(e) => handleChange("costPerM2_stone", e.target.value)}
          placeholder='Κόστος πέτρα /m²'
          type='number'
          className='border-2 border-gray-200 dark:border-[#181a1f] bg-white dark:bg-[#282c34] rounded-lg px-3 py-2 text-sm'
        />
        <input
          value={form.costPerM2_marble}
          onChange={(e) => handleChange("costPerM2_marble", e.target.value)}
          placeholder='Κόστος μάρμαρο /m²'
          type='number'
          className='border-2 border-gray-200 dark:border-[#181a1f] bg-white dark:bg-[#282c34] rounded-lg px-3 py-2 text-sm'
        />
        <input
          value={form.costPerM2_stone_alt}
          onChange={(e) => handleChange("costPerM2_stone_alt", e.target.value)}
          placeholder='Κόστος φινίρ. /m²'
          type='number'
          className='border-2 border-gray-200 dark:border-[#181a1f] bg-white dark:bg-[#282c34] rounded-lg px-3 py-2 text-sm'
        />
        <input
          value={form.costPerM_primary}
          onChange={(e) => handleChange("costPerM_primary", e.target.value)}
          placeholder='Κύρια /m'
          type='number'
          className='border-2 border-gray-200 dark:border-[#181a1f] bg-white dark:bg-[#282c34] rounded-lg px-3 py-2 text-sm'
        />
        <input
          value={form.costPerM_secondary}
          onChange={(e) => handleChange("costPerM_secondary", e.target.value)}
          placeholder='Δευτ. /m'
          type='number'
          className='border-2 border-gray-200 dark:border-[#181a1f] bg-white dark:bg-[#282c34] rounded-lg px-3 py-2 text-sm'
        />
      </div>

      <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
        <input
          value={form.overheadAllocation.electricity_pct}
          onChange={(e) =>
            handleOverheadChange("electricity_pct", e.target.value)
          }
          placeholder='Ρεύμα %'
          type='number'
          className='border-2 border-gray-200 dark:border-[#181a1f] bg-white dark:bg-[#282c34] rounded-lg px-3 py-2 text-sm'
        />
        <input
          value={form.overheadAllocation.diamond_pct}
          onChange={(e) => handleOverheadChange("diamond_pct", e.target.value)}
          placeholder='Διαμάντι %'
          type='number'
          className='border-2 border-gray-200 dark:border-[#181a1f] bg-white dark:bg-[#282c34] rounded-lg px-3 py-2 text-sm'
        />
        <input
          value={form.overheadAllocation.consumables_pct}
          onChange={(e) =>
            handleOverheadChange("consumables_pct", e.target.value)
          }
          placeholder='Αναλώσιμα %'
          type='number'
          className='border-2 border-gray-200 dark:border-[#181a1f] bg-white dark:bg-[#282c34] rounded-lg px-3 py-2 text-sm'
        />
        <input
          value={form.overheadAllocation.maintenance_pct}
          onChange={(e) =>
            handleOverheadChange("maintenance_pct", e.target.value)
          }
          placeholder='Συντήρηση %'
          type='number'
          className='border-2 border-gray-200 dark:border-[#181a1f] bg-white dark:bg-[#282c34] rounded-lg px-3 py-2 text-sm'
        />
      </div>

      <textarea
        value={form.notes}
        onChange={(e) => handleChange("notes", e.target.value)}
        placeholder='Σημειώσεις'
        rows={3}
        className='w-full border-2 border-gray-200 dark:border-[#181a1f] bg-white dark:bg-[#282c34] rounded-lg px-3 py-2 text-sm'
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
    <div className='p-8 space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300'>
      <div className='flex items-center justify-between pb-4 border-b border-gray-200 dark:border-[#181a1f]'>
        <h1 className='text-3xl font-bold text-gray-900 dark:text-white tracking-tight'>
          Μηχανήματα
        </h1>
        <div className='flex items-center gap-3'>
          <span className='px-3 py-1 bg-gray-100 dark:bg-[#282c34] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-[#181a1f] rounded-full text-xs font-semibold uppercase tracking-wider'>
            {machines.length} αντικείμενα
          </span>
          <button
            onClick={() => {
              setShowAddForm(true);
              setEditingId(null);
              setForm(emptyMachine);
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
                    Μηχάνημα
                  </th>
                  <th className='text-left px-8 py-5 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400'>
                    Παραγωγή/ημέρα
                  </th>
                  <th className='text-left px-8 py-5 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400'>
                    Κόστος Επεξεργασίας
                  </th>
                  <th className='text-right px-8 py-5 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400'>
                    Ενέργειες
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-100 dark:divide-[#181a1f]'>
                {machines.length === 0 ? (
                  <tr>
                    <td
                      colSpan='4'
                      className='px-8 py-12 text-center text-gray-500 dark:text-gray-400'
                    >
                      Δεν βρέθηκαν μηχανήματα
                    </td>
                  </tr>
                ) : (
                  machines.map((m, i) => (
                    <tr
                      key={m._id || i}
                      className='hover:bg-gray-50/50 dark:hover:bg-[#2c313c]/50 transition-colors'
                    >
                      <td className='px-8 py-5'>
                        <div className='flex items-center gap-3'>
                          <div className='w-8 h-8 rounded-lg bg-gray-100 dark:bg-[#21252b] border border-gray-200 dark:border-[#181a1f] flex items-center justify-center flex-shrink-0'>
                            <Cpu className='w-4 h-4 text-gray-500 dark:text-gray-400' />
                          </div>
                          <span className='font-medium text-gray-900 dark:text-gray-100'>
                            {m.name}
                          </span>
                        </div>
                      </td>
                      <td className='px-8 py-5 text-gray-700 dark:text-gray-300 font-medium'>
                        {m.dailyOutputM2 != null ? (
                          <span>
                            {m.dailyOutputM2}{" "}
                            <span className='text-gray-400 dark:text-gray-500 text-xs font-normal'>
                              m²
                            </span>
                          </span>
                        ) : (
                          <span className='text-gray-400 dark:text-gray-500'>
                            —
                          </span>
                        )}
                      </td>
                      <td className='px-8 py-5'>
                        <CostCell machine={m} />
                      </td>
                      <td className='px-8 py-5'>
                        <div className='flex items-center justify-end gap-2'>
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

export default Machines;
