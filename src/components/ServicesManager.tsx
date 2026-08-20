"use client";

import { useState, useTransition } from "react";
import {
  createService,
  deleteService,
  updateService,
  ServiceInput,
} from "@/app/admin/(dashboard)/services/actions";

interface Service extends ServiceInput {
  id: string;
}

const emptyForm: ServiceInput = {
  name: "",
  description: "",
  price: 0,
  durationMinutes: 60,
  active: true,
  order: 0,
  isExtra: false,
  standalone: true,
};

export default function ServicesManager({
  initialServices,
}: {
  initialServices: Service[];
}) {
  const [services, setServices] = useState(initialServices);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ServiceInput>(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function startCreate() {
    setEditingId(null);
    setForm({ ...emptyForm, order: services.length });
    setShowForm(true);
    setError("");
  }

  function startEdit(s: Service) {
    setEditingId(s.id);
    setForm({
      name: s.name,
      description: s.description,
      price: s.price,
      durationMinutes: s.durationMinutes,
      active: s.active,
      order: s.order,
      isExtra: s.isExtra,
      standalone: s.standalone,
    });
    setShowForm(true);
    setError("");
  }

  function save() {
    if (!form.name.trim() || form.durationMinutes <= 0) {
      setError("Συμπλήρωσε όνομα και έγκυρη διάρκεια.");
      return;
    }
    setError("");
    startTransition(async () => {
      if (editingId) {
        await updateService(editingId, form);
        setServices((prev) =>
          prev.map((s) => (s.id === editingId ? { ...form, id: editingId } : s))
        );
      } else {
        await createService(form);
        setServices((prev) => [...prev, { ...form, id: `tmp-${Date.now()}` }]);
      }
      setShowForm(false);
    });
  }

  function remove(id: string) {
    if (!confirm("Να διαγραφεί αυτή η υπηρεσία;")) return;
    startTransition(async () => {
      const result = await deleteService(id);
      if (result.status === "ok") {
        setServices((prev) => prev.filter((s) => s.id !== id));
      } else {
        alert(result.message);
      }
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-[family-name:var(--font-heading)] text-2xl font-semibold text-foreground">
          Υπηρεσίες
        </h1>
        <button
          onClick={startCreate}
          className="rounded-full bg-rose px-5 py-2.5 text-sm font-semibold text-white hover:bg-rose-dark"
        >
          + Νέα υπηρεσία
        </button>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {services.map((s) => (
          <div
            key={s.id}
            className="rounded-xl border border-line p-4 flex items-center justify-between gap-4"
          >
            <div>
              <div className="font-medium text-foreground flex items-center gap-2">
                {s.name}
                {!s.active && (
                  <span className="text-xs rounded-full bg-foreground/10 px-2 py-0.5 text-foreground/50">
                    ανενεργή
                  </span>
                )}
                {s.isExtra && (
                  <span className="text-xs rounded-full bg-rose/15 text-rose-dark px-2 py-0.5">
                    έξτρα{s.standalone ? " · μόνο του" : ""}
                  </span>
                )}
              </div>
              <div className="text-sm text-foreground/60">
                {s.durationMinutes} λεπτά · {s.price.toFixed(2)} €
              </div>
              {s.description && (
                <p className="text-sm text-foreground/50 mt-1">{s.description}</p>
              )}
            </div>
            <div className="flex gap-3 shrink-0">
              <button
                onClick={() => startEdit(s)}
                className="text-sm text-rose-dark hover:underline"
              >
                Επεξεργασία
              </button>
              <button
                onClick={() => remove(s.id)}
                className="text-sm text-red-600 hover:underline"
              >
                Διαγραφή
              </button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="max-w-md w-full rounded-2xl bg-white p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="font-semibold text-lg text-foreground">
              {editingId ? "Επεξεργασία υπηρεσίας" : "Νέα υπηρεσία"}
            </h3>

            <div className="mt-4">
              <label className="block text-sm font-medium text-foreground/80 mb-1">
                Όνομα *
              </label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-lg border border-line px-4 py-2.5"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-foreground/80 mb-1">
                Περιγραφή
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="w-full rounded-lg border border-line px-4 py-2.5"
              />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-1">
                  Τιμή (€)
                </label>
                <input
                  type="number"
                  min={0}
                  step="0.5"
                  value={form.price}
                  onChange={(e) =>
                    setForm({ ...form, price: Number(e.target.value) })
                  }
                  className="w-full rounded-lg border border-line px-4 py-2.5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-1">
                  Διάρκεια (λεπτά)
                </label>
                <input
                  type="number"
                  min={15}
                  step="15"
                  value={form.durationMinutes}
                  onChange={(e) =>
                    setForm({ ...form, durationMinutes: Number(e.target.value) })
                  }
                  className="w-full rounded-lg border border-line px-4 py-2.5"
                />
              </div>
            </div>

            <label className="mt-4 flex items-center gap-2 text-sm text-foreground/80">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
              />
              Ενεργή (εμφανίζεται στους πελάτες)
            </label>

            <label className="mt-3 flex items-center gap-2 text-sm text-foreground/80">
              <input
                type="checkbox"
                checked={form.isExtra}
                onChange={(e) =>
                  setForm({
                    ...form,
                    isExtra: e.target.checked,
                    standalone: e.target.checked ? form.standalone : true,
                  })
                }
              />
              Είναι έξτρα (προστίθεται πάνω σε άλλη υπηρεσία, όχι κύρια επιλογή)
            </label>

            {form.isExtra && (
              <label className="mt-3 ml-6 flex items-center gap-2 text-sm text-foreground/80">
                <input
                  type="checkbox"
                  checked={form.standalone}
                  onChange={(e) => setForm({ ...form, standalone: e.target.checked })}
                />
                Μπορεί να κλειστεί και μόνη της σαν ραντεβού
              </label>
            )}

            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setShowForm(false)}
                className="text-sm text-foreground/60 hover:text-foreground"
              >
                Άκυρο
              </button>
              <button
                onClick={save}
                disabled={isPending}
                className="rounded-full bg-rose px-5 py-2.5 text-sm font-semibold text-white hover:bg-rose-dark disabled:opacity-60"
              >
                {isPending ? "Αποθήκευση…" : "Αποθήκευση"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
