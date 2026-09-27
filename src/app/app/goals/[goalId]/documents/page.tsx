import { notFound } from "next/navigation";
import { DocumentsWorkspace } from "@/components/documents-workspace";
import { getProcedure } from "@/lib/procedures";

export default async function Page({ params }: { params: Promise<{ goalId: string }> }) {
  const { goalId } = await params;
  if (!getProcedure(goalId)) notFound();
  return <DocumentsWorkspace key={goalId} procedureId={goalId} />;
}
