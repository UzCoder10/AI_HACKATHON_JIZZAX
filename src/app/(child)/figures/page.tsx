import { redirect } from "next/navigation";
import { CHILD_ROUTES } from "@/lib/child/routes";

/** Eski mentorlar ro'yxati — yangi Aqlli suhbat sahifasiga */
export default function LegacyFiguresRedirect() {
  redirect(CHILD_ROUTES.talk);
}
