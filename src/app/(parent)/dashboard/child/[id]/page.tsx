"use client";

import { use } from "react";
import { ChildProfileView } from "@/components/parent/nurture/ChildProfileView";

type Props = { params: Promise<{ id: string }> };

export default function ChildProfilePage({ params }: Props) {
  const { id } = use(params);
  return <ChildProfileView childId={id} />;
}
