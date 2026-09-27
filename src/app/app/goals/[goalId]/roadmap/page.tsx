import { notFound } from "next/navigation";
import { RoadmapWorkspace } from "@/components/roadmap-workspace";
import { getProcedure } from "@/lib/procedures";
export const metadata = { title: "Civic roadmap" };
export default async function RoadmapPage({ params }: { params: Promise<{ goalId: string }> }) {
  const { goalId } = await params;
  if (!getProcedure(goalId)) notFound();
  return <RoadmapWorkspace key={goalId} procedureId={goalId} />;
}
