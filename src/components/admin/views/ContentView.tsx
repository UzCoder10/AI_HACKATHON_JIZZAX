"use client";



import { useCallback, useEffect, useMemo, useState } from "react";

import type { ContentItem } from "@/lib/admin/types";
import { USE_MOCK } from "@/lib/mockData";
import { contentItems as mockContentItems, figurePersonas as mockFigurePersonas } from "@/lib/admin/mockData";
import { fetchAdminFigures } from "@/lib/admin/adminData";
import type { FigurePersona } from "@/lib/admin/types";

import { PageHeader } from "@/components/admin/ui/PageHeader";

import { SearchFilterBar, FilterSelect } from "@/components/admin/ui/SearchFilterBar";

import { DataTable, type Column } from "@/components/admin/ui/DataTable";

import { StatusBadge, statusBadgeVariant } from "@/components/admin/ui/StatusBadge";

import { AdminIcon } from "@/components/admin/ui/AdminIcon";

import { LessonVideoModal } from "@/components/admin/content/LessonVideoModal";

import { formatDuration } from "@/lib/youtube";



type Tab = "all" | "lessons" | "figures" | "tests" | "games";



const TAB_LABELS: Record<Tab, string> = {

  all: "Barchasi",

  lessons: "Darslar",

  figures: "Buyuk Siymolar",

  tests: "Testlar",

  games: "O'yinlar",

};



export function ContentView() {

  const [tab, setTab] = useState<Tab>("all");

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("all");

  const [items, setItems] = useState<ContentItem[]>(USE_MOCK ? mockContentItems : []);
  const [contentLoading, setContentLoading] = useState(!USE_MOCK);
  const [contentError, setContentError] = useState<string | null>(null);
  const [figures, setFigures] = useState<FigurePersona[]>(USE_MOCK ? mockFigurePersonas : []);
  const [figuresLoading, setFiguresLoading] = useState(!USE_MOCK);
  const [editLesson, setEditLesson] = useState<ContentItem | null>(null);

  const loadContent = useCallback(async () => {
    setContentLoading(true);
    setContentError(null);
    try {
      const res = await fetch("/api/admin/lessons");
      const json = (await res.json()) as { success: boolean; data?: ContentItem[]; error?: string };
      if (json.success && json.data) {
        setItems(json.data);
      } else {
        setContentError(json.error ?? "Kontent yuklanmadi");
      }
    } catch {
      setContentError("Kontent yuklanmadi");
    } finally {
      setContentLoading(false);
    }
  }, []);



  useEffect(() => {
    loadContent();
    if (!USE_MOCK) {
      fetchAdminFigures()
        .then(setFigures)
        .catch(() => setFigures([]))
        .finally(() => setFiguresLoading(false));
    }
  }, [loadContent]);



  const filtered = useMemo(() => {

    return items.filter((item) => {

      const matchTab =

        tab === "all" ||

        (tab === "lessons" && item.type === "lesson") ||

        (tab === "figures" && item.type === "figure") ||

        (tab === "tests" && item.type === "test") ||

        (tab === "games" && item.type === "game");

      const q = search.toLowerCase();

      const matchSearch = !q || item.title.toLowerCase().includes(q) || item.subject.toLowerCase().includes(q);

      const matchStatus = statusFilter === "all" || item.status === statusFilter;

      return matchTab && matchSearch && matchStatus;

    });

  }, [tab, search, statusFilter, items]);



  const columns: Column<ContentItem>[] = [

    {

      key: "title",

      header: "Nomi",

      render: (item) => (

        <div>

          <p className="font-semibold text-[var(--admin-primary)]">{item.title}</p>

          <p className="text-xs text-[var(--admin-text-muted)]">{item.subject}</p>

        </div>

      ),

    },

    {

      key: "type",

      header: "Turi",

      render: (item) => {

        const labels = { lesson: "Dars", figure: "Persona", test: "Test", game: "O'yin" };

        return labels[item.type];

      },

    },

    {

      key: "video",

      header: "Video",

      render: (item) =>

        item.type === "lesson" ? (

          item.youtubeId ? (

            <span className="text-xs text-[var(--admin-text-muted)]">

              {item.videoTitle ?? item.youtubeId}

              {item.videoDurationSeconds ? ` · ${formatDuration(item.videoDurationSeconds)}` : ""}

            </span>

          ) : (

            <span className="text-xs text-[var(--admin-text-subtle)]">—</span>

          )

        ) : (

          "—"

        ),

    },

    { key: "author", header: "Muallif", render: (item) => item.author },

    { key: "updated", header: "Yangilangan", render: (item) => item.updatedAt },

    {

      key: "status",

      header: "Holat",

      render: (item) => (

        <StatusBadge variant={statusBadgeVariant(item.status)}>

          {item.status === "active" ? "Faol" : "Qoralama"}

        </StatusBadge>

      ),

    },

    {

      key: "actions",

      header: "",

      className: "text-right",

      render: (item) =>

        item.type === "lesson" ? (

          <button

            type="button"

            onClick={() => setEditLesson(item)}

            className="text-xs font-semibold text-[var(--admin-accent)] hover:underline"

          >

            Video

          </button>

        ) : (

          <button type="button" className="text-xs font-semibold text-[var(--admin-accent)] hover:underline">

            Tahrirlash

          </button>

        ),

    },

  ];



  return (

    <>

      <PageHeader

        title="Kontent boshqaruvi"

        description="Darslar, Buyuk Siymolar personalari, testlar va o'yinlar."

        actions={

          <button type="button" className="px-4 py-2 bg-[var(--admin-primary)] text-white text-sm font-semibold rounded hover:bg-[var(--admin-primary-container)] transition-colors flex items-center gap-2">

            <AdminIcon name="add" className="!text-[18px]" />

            Yangi kontent

          </button>

        }

      />

      {contentLoading && (
        <p className="mb-4 text-sm text-[var(--admin-text-muted)]">Kontent yuklanmoqda...</p>
      )}
      {contentError && (
        <p className="mb-4 rounded border border-[var(--admin-error-light)] bg-[var(--admin-error-light)] p-3 text-sm text-[var(--admin-error)]">
          {contentError}
        </p>
      )}

      <div className="flex gap-2 mb-6 flex-wrap">

        {(Object.keys(TAB_LABELS) as Tab[]).map((t) => (

          <button

            key={t}

            type="button"

            onClick={() => setTab(t)}

            className={`px-4 py-2 text-sm font-semibold rounded transition-colors ${

              tab === t

                ? "bg-[var(--admin-primary)] text-white"

                : "bg-[var(--admin-surface)] border border-[var(--admin-border)] text-[var(--admin-text-muted)] hover:bg-[var(--admin-surface-low)]"

            }`}

          >

            {TAB_LABELS[t]}

          </button>

        ))}

      </div>



      <SearchFilterBar

        search={search}

        onSearchChange={setSearch}

        placeholder="Kontent qidirish..."

        filters={

          <FilterSelect

            label="Holat"

            value={statusFilter}

            onChange={setStatusFilter}

            options={[

              { value: "all", label: "Barcha holatlar" },

              { value: "active", label: "Faol" },

              { value: "draft", label: "Qoralama" },

            ]}

          />

        }

      />



      <DataTable columns={columns} data={filtered} keyField="id" />

      {!contentLoading && filtered.length === 0 && (
        <p className="mt-4 rounded admin-card p-8 text-center text-sm text-[var(--admin-text-muted)]">
          Kontent topilmadi.
        </p>
      )}



      {editLesson ? (
        <LessonVideoModal
          lesson={editLesson}
          open
          onClose={() => setEditLesson(null)}
          onSaved={(updated) => {
            setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
          }}
        />
      ) : null}

      {tab === "figures" || tab === "all" ? (
        <div className="mt-10">
          <h3 className="text-base font-semibold text-[var(--admin-primary)] mb-4 flex items-center gap-2">
            <AdminIcon name="auto_stories" />
            Buyuk Siymolar — AI personalari
          </h3>
          {figuresLoading ? (
            <p className="text-sm text-[var(--admin-text-muted)]">Figuralar yuklanmoqda...</p>
          ) : figures.length === 0 ? (
            <p className="text-sm text-[var(--admin-text-muted)]">Figuralar topilmadi.</p>
          ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {figures.map((fp) => (
              <div key={fp.id} className="admin-card p-5">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold text-[var(--admin-primary)]">{fp.name}</h4>
                    <p className="text-xs text-[var(--admin-text-muted)]">{fp.field}</p>
                  </div>
                  <StatusBadge variant={statusBadgeVariant(fp.status)}>
                    {fp.status === "active" ? "Faol" : "Qoralama"}
                  </StatusBadge>
                </div>
                <p className="text-sm text-[var(--admin-text-muted)] mb-3">{fp.description}</p>
                <div className="admin-secure-zone rounded p-3 mb-3">
                  <p className="admin-label-caps text-[var(--admin-text-subtle)] mb-1 flex items-center gap-1">
                    <AdminIcon name="lock" className="!text-[14px]" />
                    Prompt sozlamasi
                  </p>
                  <p className="text-xs text-[var(--admin-text-muted)] font-mono leading-relaxed">{fp.promptPreview}</p>
                </div>
                <div className="flex justify-between items-center text-xs text-[var(--admin-text-subtle)]">
                  <span>{fp.chatCount.toLocaleString("uz-UZ")} suhbat</span>
                  <button type="button" className="font-semibold text-[var(--admin-accent)] hover:underline">
                    Tahrirlash
                  </button>
                </div>
              </div>
            ))}
          </div>
          )}
        </div>
      ) : null}

    </>

  );

}


