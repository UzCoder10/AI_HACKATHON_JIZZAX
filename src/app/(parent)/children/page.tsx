"use client";

import { useState } from "react";
import { ParentShell } from "@/components/parent/ParentShell";
import { useParentSession } from "@/lib/parent/ParentProvider";

interface ChildForm {
  name: string;
  age: string;
  language: "uz" | "ru";
}

const inputClass =
  "w-full px-4 py-3 border-2 border-surface-variant rounded-xl focus:border-primary focus:outline-none min-h-[44px] font-medium bg-brand-bg focus:bg-white";

export default function ChildrenPage() {
  const { user, refresh } = useParentSession();
  const [form, setForm] = useState<ChildForm>({ name: "", age: "10", language: "uz" });
  const [editId, setEditId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    setLoading(true);
    setError(null);
    try {
      const url = editId ? `/api/parent/children/${editId}` : "/api/parent/children";
      const res = await fetch(url, {
        method: editId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error);
        return;
      }
      setForm({ name: "", age: "10", language: "uz" });
      setEditId(null);
      await refresh();
    } catch {
      setError("Saqlashda xatolik");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Bola profilini o'chirishni xohlaysizmi?")) return;
    await fetch(`/api/parent/children/${id}`, { method: "DELETE" });
    await refresh();
  }

  function startEdit(child: { id: string; name: string; age: number; language: string }) {
    setEditId(child.id);
    setForm({ name: child.name, age: String(child.age), language: child.language as "uz" | "ru" });
  }

  return (
    <ParentShell title="Bola profillari" subtitle="Farzandlar uchun AI muhitini sozlang">
      <div className="grid md:grid-cols-2 gap-6">
        <section className="bg-white rounded-2xl border border-surface-container-low p-6 shadow-vibrant-primary">
          <h2 className="font-extrabold text-on-surface mb-4">
            {editId ? "Profilni tahrirlash" : "Yangi bola qo'shish"}
          </h2>
          {error && (
            <p className="text-red-700 text-sm mb-3 bg-red-50 border border-red-200 p-3 rounded-xl font-medium">
              {error}
            </p>
          )}
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Ism"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={inputClass}
            />
            <input
              type="number"
              min={7}
              max={12}
              value={form.age}
              onChange={(e) => setForm({ ...form, age: e.target.value })}
              className={inputClass}
            />
            <select
              value={form.language}
              onChange={(e) => setForm({ ...form, language: e.target.value as "uz" | "ru" })}
              className={inputClass}
            >
              <option value="uz">O&apos;zbek</option>
              <option value="ru">Русский</option>
            </select>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={loading}
                className="flex-1 py-3 bg-primary text-on-primary rounded-full font-extrabold min-h-[44px] shadow-btn-primary hover:bg-primary-hover text-sm"
              >
                {loading ? "..." : "Saqlash"}
              </button>
              {editId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditId(null);
                    setForm({ name: "", age: "10", language: "uz" });
                  }}
                  className="px-4 py-3 border-2 border-surface-variant rounded-full min-h-[44px] font-bold text-sm text-outline hover:border-primary"
                >
                  Bekor
                </button>
              )}
            </div>
          </div>
        </section>

        <section className="space-y-3">
          {user?.children.map((child) => (
            <div
              key={child.id}
              className="bg-white rounded-2xl border border-surface-container-low p-5 flex justify-between items-center shadow-vibrant-secondary bento-tile"
            >
              <div>
                <p className="font-extrabold text-on-surface">{child.name}</p>
                <p className="text-sm text-outline font-medium">
                  {child.age} yosh · {child.language === "uz" ? "O'zbek" : "Русский"}
                </p>
                <p className="text-xs text-outline/70 mt-1 font-mono">ID: {child.id.slice(0, 12)}...</p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => startEdit(child)}
                  className="px-3 py-2 text-sm text-primary hover:bg-primary/10 rounded-xl min-h-[40px] font-bold"
                >
                  Tahrirlash
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(child.id)}
                  className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl min-h-[40px] font-bold"
                >
                  O&apos;chirish
                </button>
              </div>
            </div>
          ))}
          {!user?.children.length && (
            <p className="text-outline text-sm font-medium text-center py-8 bg-surface-container rounded-2xl">
              Hali bola profili yo&apos;q
            </p>
          )}
        </section>
      </div>
    </ParentShell>
  );
}
