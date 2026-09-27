import { notFound } from "next/navigation";
import { getProcedure } from "@/lib/procedures";
import { ServiceDetails } from "@/components/service-details";

export default async function ServiceDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!getProcedure(slug)) notFound();
  return <ServiceDetails procedureId={slug} />;
}
