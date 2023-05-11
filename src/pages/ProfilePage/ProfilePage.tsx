import { useUserContext } from "@/lib/contexts/user-context";
import { trpc } from "@/lib/utils/trpc";
import { distanceBetween } from "geofire-common";
import Image from "next/image";
import dp from "public/images/giftp.gif";
import { useRouter } from "next/router";
import { useMemo } from "react";
import { BsTextareaT } from "react-icons/bs";
import { RiMapPinUserFill, RiMarkupLine, RiUserShared2Line, RiUserStarLine } from "react-icons/ri";
import { Virtuoso } from "react-virtuoso";
import { PostCard } from "../HomePage/PostList/PostCard/PostCard";
import { useLayout } from "@/lib/hooks/useLayout";
import Head from "next/head";
import { useLayoutContext } from "@/lib/contexts/layout-context";

export function ProfilePage() {
  const { user: currentUser } = useUserContext();
  const { setLayout } = useLayoutContext();
  const router = useRouter();
  const { username: uname } = router.query;
  const {
    data: user,
    isLoading,
    isError,
  } = trpc.user.get.useQuery(
    { username: uname as string },
    {
      enabled: !!uname,
      onSuccess: (data) => {
        setLayout({ navbarTitle: `${data?.username}'s Profile` });
      },
    }
  );

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: postsLoading,
    isError: postsError,
  } = trpc.post.getInfiniteOfUser.useInfiniteQuery(
    {
      currentUserId: currentUser!?.id,
      username: uname as string,
    },
    { enabled: !!uname || !!currentUser?.id, getNextPageParam: (lastPage) => lastPage.nextCursor }
  );

  const distanceInKm = useMemo(
    () =>
      user
        ? distanceBetween(
            [user.latitude, user.longitude],
            [currentUser?.latitude ?? 0, currentUser?.longitude ?? 0]
          ).toFixed(2)
        : 0,
    [user, currentUser?.latitude, currentUser?.longitude]
  );

  if (isLoading || postsLoading) return <div>Loading...</div>;
  if (isError || postsError) return <div>Error loading user</div>;
  if (!user) return <div>User not found</div>;

  const posts = data.pages.flatMap((page) => page.posts) || [];
  const ownProfile = currentUser?.id === user.id;

  return (
    <>
      <Head>
        <title>
          {user.name} (@{user.username}) | Padosi
        </title>
      </Head>
      <div className="max-w-3xl mx-auto py-6">
        <div className="grid grid-cols-[min-content_auto] gap-4 sm:gap-8 px-2 sm:px-4">
          <div className="avatar self-center">
            <div className="relative h-28 sm:h-52 mask mask-squircle">
              <Image
                src={dp || user.photo || "/images/avatar.jpg"}
                alt="avatar"
                fill
                sizes="(min-width: 640px) 192px, 112px"
              />
            </div>
          </div>
          <div className="flex flex-col justify-center gap-1 sm:gap-2">
            <h2 className="sm:text-2xl text-lg font-semibold !leading-none">{user.name}</h2>
            <p className="text-primary sm:text-xl">@{user.username}</p>
            <div className="flex gap-4 sm:gap-4">
              <div className="flex gap-1 sm:gap-2 items-center">
                <RiMapPinUserFill className="text-lg sm:text-xl" />
                <span className="text-sm">{distanceInKm} km</span>
              </div>
              <div className="flex gap-1 sm:gap-2 items-center">
                <RiMarkupLine className="text-lg sm:text-xl" />
                <span className="text-sm">
                  {user._count.posts} {user._count.posts === 1 ? "Post" : "Posts"}
                </span>
              </div>
            </div>
            <h3 className="text-sm text-accent sm:text-lg">{user.tagline}</h3>
          </div>
        </div>
        <div className="grid grid-cols-2 place-items-center mt-4">
          <div className="flex gap-1 sm:gap-2 items-center">
            <RiUserStarLine className="text-2xl" />
            <span className="">
              {user._count.followers} {user._count.followers === 1 ? "Follower" : "Followers"}
            </span>
          </div>
          <div className="flex gap-1 sm:gap-2 items-center">
            <RiUserShared2Line className="text-2xl" />
            <span className="">{user._count.following} Following</span>
          </div>
        </div>
        <div className="mt-4 grid justify-items-center px-4">
          <button className="btn btn-sm btn-outline btn-primary w-full max-w-sm">Follow</button>
          {/* <button className="btn btn-sm btn-primary">Message</button> */}
        </div>
        {user.bio && (
          <div className="mt-4 px-2">
            <p className="leading-snug text-sm sm:text-base">{user.bio}</p>
          </div>
        )}
        {posts.length ? (
          <Virtuoso
            useWindowScroll
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
          <span>no posts in your area!</span>
        )}
      </div>
    </>
  );
}
