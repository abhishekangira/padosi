import { PostCard } from "@/components/PostCard/PostCard";
import { PostCardSkeleton } from "@/components/PostCard/PostCardSkeleton";
import { trpc } from "@/lib/utils/trpc";
import { useRouter } from "next/router";

export default function Post() {
  const router = useRouter();
  const { id } = router.query;
  const { data, isLoading, isError, error } = trpc.post.getPost.useQuery({ cuid: id as string });

  if (isLoading) return <PostCardSkeleton />;
  if (isError) return <pre>{JSON.stringify(error)}</pre>;
  if (!data) return <div>Post not found</div>;

  return <PostCard post={data} full />;
}
