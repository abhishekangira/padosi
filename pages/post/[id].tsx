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
  return (
    <div>
      {isLoading ? (
        <div>Loading...</div>
      ) : isError ? (
        <div>{error}</div>
      ) : (
        <PostCard post={data} full />
      )}
    </div>
  );
}
