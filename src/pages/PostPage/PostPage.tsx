import { PostCard } from "@/pages/HomePage/PostList/PostCard/PostCard";
import { PostCardSkeleton } from "@/pages/HomePage/PostList/PostCard/PostCardSkeleton";
import { useUserContext } from "@/lib/contexts/user-context";
import { trpc } from "@/lib/utils/trpc";
import { useRouter } from "next/router";
import { AddComment } from "./CommentList/AddComment";
import { CommentList } from "./CommentList/CommentList";

export default function PostPage() {
  const router = useRouter();
  const { user } = useUserContext();

  const { id } = router.query;

  const {
    data: post,
    isLoading: postLoading,
    isError: postError,
  } = trpc.post.get.useQuery({ cuid: id as string, userId: user!?.id }, { enabled: !!user?.id });

  const commentsData = trpc.comment.getInfinite.useInfiniteQuery(
    { postCuid: id as string, userId: user!?.id },
    { enabled: !!id && !!user?.id, getNextPageParam: (lastPage) => lastPage.nextCursor }
  );

  if (postLoading || !user?.id) return <PostCardSkeleton />;
  if (postError) return <pre>Something went wrong!!</pre>;
  if (!post) return <div>Post not found</div>;

  return (
    <div className="max-w-3xl mx-auto pb-3">
      <PostCard post={post} full />
      <div className="py-2 border-b border-b-black">
        <AddComment postId={post.id} postCuid={post.cuid} />
      </div>
      <CommentList commentsData={commentsData} />
    </div>
  );
}
