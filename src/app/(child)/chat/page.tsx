import { redirect } from "next/navigation";
import { CHILD_ROUTES } from "@/lib/child/routes";

export default function LegacyChatRedirect() {
  redirect(CHILD_ROUTES.talk);
}
