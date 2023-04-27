import { PostCard } from "@/components/PostCard/PostCard";
import { fetchPost } from "@/lib/firebase/posts";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";

export default function Post() {
  const router = useRouter();
  const { id } = router.query;
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["post", id],
    queryFn: () => fetchPost(id),
  });

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <pre>{JSON.stringify(error)}</pre>;

  return <PostCard post={data} full />;
}
