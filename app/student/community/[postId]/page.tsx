import { PostDetailClient } from "@/components/community/PostDetailClient";

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const { postId } = await params;
  return <PostDetailClient postId={postId} />;
}
