import { notFound } from "next/navigation";
import { PrintRoadmap } from "@/components/print-roadmap";
import { getProcedure } from "@/lib/procedures";

export default async function Page({ params }: { params: Promise<{ goalId: string }> }) {
  const { goalId } = await params;
  if (!getProcedure(goalId)) notFound();
  return <PrintRoadmap key={goalId} procedureId={goalId} />;
}
