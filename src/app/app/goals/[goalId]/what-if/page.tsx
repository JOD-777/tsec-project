import { notFound } from "next/navigation";
import { WhatIfWorkspace } from "@/components/what-if-workspace";
import { getProcedure } from "@/lib/procedures";

export default async function Page({ params }: { params: Promise<{ goalId: string }> }) {
  const { goalId } = await params;
  if (!getProcedure(goalId)) notFound();
  return <WhatIfWorkspace key={goalId} procedureId={goalId} />;
}
