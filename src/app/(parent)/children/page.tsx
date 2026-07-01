"use client";

import { useState } from "react";
import Link from "next/link";
import { ParentShell } from "@/components/parent/ParentShell";
import { PARENT_ROUTES } from "@/lib/parent/routes";
import { useParentSession } from "@/lib/parent/ParentProvider";

interface ChildForm {
  name: string;
  age: string;
  language: "uz" | "ru";
}

const inputClass =
  "w-full rounded-xl border-2 border-[#c7c4d8] bg-white px-4 py-3 text-sm font-semibold text-[#111c2d] focus:border-[#3525cd] focus:outline-none min-h-[44px]";

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
        <section className="nurture-card rounded-3xl border border-[#c7c4d8]/10 bg-white p-6">
          <h2 className="mb-4 text-xl font-bold text-[#111c2d]">
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
                className="flex-1 rounded-xl bg-[#3525cd] py-3 text-sm font-bold text-white min-h-[44px] shadow-lg shadow-[#3525cd]/20 hover:opacity-90 disabled:opacity-50"
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
              className="nurture-card flex items-center justify-between rounded-3xl border border-[#c7c4d8]/10 bg-white p-5"
            >
              <div>
                <p className="font-bold text-[#111c2d]">{child.name}</p>
                <p className="text-sm font-medium text-[#777587]">
                  {child.age} yosh · {child.language === "uz" ? "O'zbek" : "Русский"}
                </p>
                <div className="mt-1 flex flex-wrap gap-3">
                  <Link
                    href={PARENT_ROUTES.child(child.id)}
                    className="text-xs font-semibold text-[#3525cd] hover:underline"
                  >
                    Profilni ko&apos;rish →
                  </Link>
                  <Link
                    href={`/child?childId=${encodeURIComponent(child.id)}`}
                    className="text-xs font-semibold text-[#005523] hover:underline"
                  >
                    Bola rejimiga o&apos;tish →
                  </Link>
                </div>
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
