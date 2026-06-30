"use client";

import { ChildShell } from "@/components/child/ChildShell";
import { ChatWindow } from "@/components/child/ChatWindow";
import { useChildSession } from "@/lib/child/ChildProvider";
import { t } from "@/lib/child/i18n";

export default function ChildChatPage() {
  const { profile } = useChildSession();

  return (
    <ChildShell title={t("chat", profile.language)} subtitle={t("assistant", profile.language)} fullWidth>
      <ChatWindow mode="assistant" headerEmoji="📚" />
    </ChildShell>
  );
}
