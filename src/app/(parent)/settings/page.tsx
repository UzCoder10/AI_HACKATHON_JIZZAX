"use client";

import { useEffect, useState } from "react";
import { ParentShell } from "@/components/parent/ParentShell";
import { SettingsView } from "@/components/parent/nurture/SettingsView";
import { useParentSession } from "@/lib/parent/ParentProvider";

export default function SettingsPage() {
  const { user, refresh, logout } = useParentSession();
  const [screenTime, setScreenTime] = useState(60);
  const [contentLevel, setContentLevel] = useState("standard");
  const [newPin, setNewPin] = useState("");
  const [currentPin, setCurrentPin] = useState("");
  const [weeklyReports, setWeeklyReports] = useState(true);
  const [activityAlerts, setActivityAlerts] = useState(false);
  const [newTasks, setNewTasks] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.settings) {
      setScreenTime(user.settings.screenTimeMinutes);
      setContentLevel(user.settings.contentLevel);
    }
  }, [user?.settings]);

  async function saveSettings() {
    setLoading(true);
    setMsg(null);
    const res = await fetch("/api/parent/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ screenTimeMinutes: screenTime, contentLevel }),
    });
    const json = await res.json();
    setMsg(json.success ? "Sozlamalar saqlandi" : json.error);
    setLoading(false);
    await refresh();
  }

  async function savePin() {
    setLoading(true);
    setMsg(null);
    const res = await fetch("/api/auth/pin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "set",
        pin: user?.hasPin ? currentPin : undefined,
        newPin,
      }),
    });
    const json = await res.json();
    setMsg(json.success ? "PIN saqlandi" : json.error);
    setNewPin("");
    setCurrentPin("");
    setLoading(false);
    await refresh();
  }

  return (
    <ParentShell title="Sozlamalar" subtitle="Ekran vaqti, kontent va PIN himoyasi">
      <SettingsView
        screenTime={screenTime}
        setScreenTime={setScreenTime}
        contentLevel={contentLevel}
        setContentLevel={setContentLevel}
        newPin={newPin}
        setNewPin={setNewPin}
        currentPin={currentPin}
        setCurrentPin={setCurrentPin}
        hasPin={user?.hasPin ?? false}
        weeklyReports={weeklyReports}
        setWeeklyReports={setWeeklyReports}
        activityAlerts={activityAlerts}
        setActivityAlerts={setActivityAlerts}
        newTasks={newTasks}
        setNewTasks={setNewTasks}
        msg={msg}
        loading={loading}
        onSaveSettings={saveSettings}
        onSavePin={savePin}
        onLogout={logout}
      />
    </ParentShell>
  );
}
