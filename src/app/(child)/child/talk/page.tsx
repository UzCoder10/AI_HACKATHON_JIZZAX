import { Suspense } from "react";
import { ChildTalkView } from "@/components/child/aqlli/ChildTalkView";

function TalkLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8f4e4] text-[#705d00]">
      Yuklanmoqda...
    </div>
  );
}

export default function ChildTalkPage() {
  return (
    <Suspense fallback={<TalkLoading />}>
      <ChildTalkView />
    </Suspense>
  );
}
