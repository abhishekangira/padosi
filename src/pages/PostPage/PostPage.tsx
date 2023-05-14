import { PostCard } from "@/pages/HomePage/PostList/PostCard/PostCard";
import { PostCardSkeleton } from "@/pages/HomePage/PostList/PostCard/PostCardSkeleton";
import { useUserContext } from "@/lib/contexts/user-context";
import { trpc } from "@/lib/utils/trpc";
import { useRouter } from "next/router";
import { AddComment } from "./CommentList/AddComment";
import { CommentList } from "./CommentList/CommentList";
import Head from "next/head";
import { useLayout } from "@/lib/hooks/useLayout";
import { useLayoutContext } from "@/lib/contexts/layout-context";

export default function PostPage() {
  const router = useRouter();
  const { user } = useUserContext();
  const { setLayout } = useLayoutContext();

  const { cuid } = router.query;

  const {
    data: post,
    isLoading: postLoading,
    isError: postError,
  } = trpc.post.get.useQuery(
    { cuid: cuid as string, currentUserId: user!?.id },
    {
      enabled: !!user?.id && !!cuid,
      onSuccess(data) {
        setLayout({ navbarTitle: data?.author.username ? `${data.author.username}'s Post` : "" });
      },
    }
  );

  const commentsData = trpc.comment.getInfinite.useInfiniteQuery(
    { postCuid: cuid as string, currentUserId: user!?.id },
    { enabled: !!cuid && !!user?.id, getNextPageParam: (lastPage) => lastPage.nextCursor }
  );

  if (postLoading || !user?.id)
    return (
      <div className="max-w-3xl mx-auto">
        <PostCardSkeleton />
      </div>
    );
  if (postError) return <pre>Something went wrong!!</pre>;
  if (!post) return <div>Post not found</div>;

  return (
    <>
      <Head>
        <title>{user.username}&#39;s Post | Padosi</title>
      </Head>
      <div className="max-w-3xl mx-auto pb-3">
        <PostCard post={post} full />
        <div className="py-2 border-b border-b-black">
          <AddComment postId={post.id} postCuid={post.cuid} />
        </div>
        <CommentList commentsData={commentsData} />
      </div>
    </>
  );
}
