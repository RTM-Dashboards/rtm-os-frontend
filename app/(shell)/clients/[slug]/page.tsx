import { notFound } from "next/navigation";
import { getClientBySlug, MOCK_CLIENTS } from "@/lib/mock/clients";
import ClientProfileLayout from "@/components/clients/ClientProfileLayout";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return MOCK_CLIENTS.map((c) => ({ slug: c.slug }));
}

export default async function ClientProfilePage({ params }: Props) {
  const { slug } = await params;
  const client = getClientBySlug(slug);

  if (!client) {
    notFound();
  }

  return <ClientProfileLayout client={client} />;
}
