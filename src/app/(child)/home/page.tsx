import { redirect } from "next/navigation";
import { CHILD_ROUTES } from "@/lib/child/routes";

export default function LegacyHomeRedirect() {
  redirect(CHILD_ROUTES.home);
}
