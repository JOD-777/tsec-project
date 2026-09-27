import { notFound } from "next/navigation";
import { RoadmapWorkspace } from "@/components/roadmap-workspace";
export const metadata = { title: "Home food business roadmap" };
export default async function RoadmapPage({ params }: { params: Promise<{ goalId: string }> }) {
  const { goalId } = await params;
  if (goalId !== "home-food-business") notFound();
  return <RoadmapWorkspace />;
}
