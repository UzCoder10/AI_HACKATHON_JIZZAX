import { redirect } from "next/navigation";
import { PARENT_ROUTES } from "@/lib/parent/routes";

/** Eski /subscription → yangi /dashboard/subscription */
export default function LegacySubscriptionRedirect() {
  redirect(PARENT_ROUTES.subscription);
}
