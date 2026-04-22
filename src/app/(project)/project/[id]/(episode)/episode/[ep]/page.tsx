import { redirect } from "next/navigation";

export default async function EpisodeRootPage({
  params,
}: {
  params: Promise<{ id: string; ep: string }>;
}) {
  const { id, ep } = await params;
  redirect(`/project/${id}/episode/${ep}/storyboard`);
}
