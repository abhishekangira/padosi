import { PostCard } from "./PostCard/PostCard";
import { Virtuoso } from "react-virtuoso";
import { PostCardSkeleton } from "./PostCard/PostCardSkeleton";
import { useUserContext } from "@/lib/contexts/user-context";
import { trpc } from "@/lib/utils/trpc";
import { useEffect, useState } from "react";
import { debounce } from "@/lib/utils/general";
import Image from "next/image";
import emptyImage from "public/images/empty-posts.png";
import follow from "public/images/follow.png";

const debouncedScrollHandler = debounce(
  (range: any) => sessionStorage.setItem("scrollTop", range.startIndex.toString()),
  500
);

export function PostList({ sortBy }: { sortBy: "LATEST" | "TRENDING" }) {
  const { user } = useUserContext();
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status, error } =
    trpc.post.getInfinite.useInfiniteQuery(
      {
        limit: 20,
        userLat: user!?.latitude,
        userLon: user!?.longitude,
        userId: user!?.id,
        sortBy,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        enabled: !!user?.id,
      }
    );

  console.log(
    "data",
    data?.pages.flatMap((page) => page.posts)
  );

  if (status === "loading")
    return (
      <>
        {Array.from({ length: 5 }).map((_, i) => (
          <PostCardSkeleton key={i} />
        ))}
      </>
    );
  if (status === "error") {
    console.error(error);
    return <div>There was an error</div>;
  }
  const posts = data.pages.flatMap((page) => page.posts) || [];

  return posts.length ? (
    <Virtuoso
      useWindowScroll
      rangeChanged={debouncedScrollHandler}
      initialTopMostItemIndex={+(sessionStorage.getItem("scrollTop") ?? "0")}
      data={posts}
      endReached={() => {
        if (hasNextPage) fetchNextPage();
      }}
      overscan={20}
      itemContent={(index, post) => {
        return <PostCard key={post.cuid} post={post} />;
      }}
      components={{ Footer: () => (isFetchingNextPage ? <div>Loading...</div> : null) }}
    />
  ) : (
    <div className="mt-32 grid place-items-center">
      <div className="w-2/3 grid place-items-center text-center">
        <div className="relative h-20 sm:h-28 aspect-square">
          <Image
            src={sortBy === "LATEST" ? emptyImage : follow}
            alt="avatar"
            fill
            sizes="(min-width: 640px) 112px, 80px"
          />
        </div>
        <p className="text-primary">
          {sortBy === "LATEST"
            ? "Go ahead and create the first post in your area!"
            : "Posts from people you follow will show here!"}
        </p>
        <span className="text-secondary mt-2">
          {sortBy === "LATEST"
            ? "Don't be shy to say Hi👋"
            : "Tap 👆 on the triple dots on the right side of any post and click 'follow @user'"}
        </span>
      </div>
    </div>
  );
}
