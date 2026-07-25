import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ToolkitDocsPage } from "@/components/toolkit-docs-page";
import {
  TOOLKIT_DOCS,
  TOOLKIT_ROUTE_ALIASES,
  getToolkitDocById,
  resolveToolkitId,
  getToolkitDescription,
} from "@/lib/toolkit-content";

export async function generateStaticParams() {
  return [
    ...TOOLKIT_DOCS.map((tool) => ({ slug: tool.id })),
    ...Object.keys(TOOLKIT_ROUTE_ALIASES).map((slug) => ({ slug })),
  ];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tool = getToolkitDocById(slug);

  if (!tool) {
    return {
      title: "Toolkit",
      description: "Frontend toolkit pages by Jwala Baheliya.",
    };
  }

  const title = `${tool.name} | Toolkit | Jwala Baheliya`;
  const description = getToolkitDescription(tool);
  const url = `/toolkit/${resolveToolkitId(slug)}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      url,
      images: ["/jwala-baheliya.jpg"],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/jwala-baheliya.jpg"],
    },
  };
}

export default async function ToolkitToolPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tool = getToolkitDocById(slug);

  if (!tool) notFound();

  return <ToolkitDocsPage tool={tool} />;
}
