import Page from "./_source";

export async function generateStaticParams() {
  const { NOTES } = await import("../_source");
  return NOTES.map((note) => ({ slug: note.slug }));
}

export default async function NoteSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <Page slug={slug} />;
}
