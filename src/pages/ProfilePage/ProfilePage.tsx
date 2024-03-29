import { useUserContext } from "@/lib/contexts/user-context";
import { trpc } from "@/lib/utils/trpc";
import { distanceBetween } from "geofire-common";
import Image from "next/image";
import avatar from "public/images/avatar.png";
import { useRouter } from "next/router";
import { useMemo } from "react";
import { BsTextareaT } from "react-icons/bs";
import { RiMapPinUserFill, RiMarkupLine, RiUserShared2Line, RiUserStarLine } from "react-icons/ri";
import { Virtuoso } from "react-virtuoso";
import { PostCard } from "../HomePage/PostList/PostCard/PostCard";
import { useLayout } from "@/lib/hooks/useLayout";
import Head from "next/head";
import { useLayoutContext } from "@/lib/contexts/layout-context";
import { ProfilePageSkeleton } from "./ProfilePageSkeleton";

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
    { username: uname as string, currentUserId: currentUser!?.id },
    {
      enabled: !!uname && !!currentUser?.id,
      onSuccess: (data) => {
        console.log(data, "data");

        setLayout({ navbarTitle: data?.username ? `${data?.username}'s Profile` : "Padosi" });
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

  const trpcUtils = trpc.useContext();

  const { mutate: toggleFollow, isLoading: toggleFollowLoading } =
    trpc.user.togglefollow.useMutation({
      onSuccess: (data) => {
        trpcUtils.user.get.invalidate();
        trpcUtils.post.getInfiniteOfUser.invalidate();
      },
    });

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

  if (isLoading || postsLoading) return <ProfilePageSkeleton />;
  if (isError || postsError) return <div>Error loading user</div>;
  if (!user) return <div>User not found</div>;

  const posts = data.pages.flatMap((page) => page.posts) || [];
  const ownProfile = currentUser?.id === user.id;
  const isFollowedByUser = user.followers.some(
    (followUser) => followUser.followerId === currentUser?.id
  );

  return (
    <>
      <Head>
        <title>
          {user.name} (@{user.username}) | Padosi
        </title>
      </Head>
      <div className="max-w-3xl mx-auto py-6">
        <div className="grid grid-cols-[min-content_auto] gap-4 sm:gap-8 px-4">
          <div className="avatar self-center">
            <div className="relative h-28 sm:h-52 mask mask-squircle">
              <Image
                src={user.photo || avatar}
                alt="avatar"
                fill
                sizes="(min-width: 640px) 192px, 112px"
              />
            </div>
          </div>
          <div className="flex flex-col justify-center gap-1 sm:gap-2">
            <div className="flex flex-col gap-1 sm:items-center sm:flex-row">
              <h2 className="sm:text-2xl text-lg font-semibold !leading-none">{user.name}</h2>
              <p className="text-primary sm:text-xl !leading-none">@{user.username}</p>
            </div>
            <h3 className="text-sm text-accent sm:text-lg">{user.tagline}</h3>
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
          </div>
        </div>
        <div className="grid grid-cols-2 place-items-center mt-6 sm:mt-8">
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
        <div className="mt-6 sm:mt-8 grid justify-items-center px-4">
          <button
            className={`btn btn-sm btn-outline w-full max-w-sm ${
              isFollowedByUser ? "btn-error" : "btn-primary"
            } ${toggleFollowLoading ? "loading" : ""}`}
            onClick={() => {
              if (ownProfile) router.push("/settings/edit-profile");
              else toggleFollow({ followerId: currentUser!.id, followingId: user.id });
            }}
          >
            {ownProfile ? "Edit Profile" : isFollowedByUser ? "Unfollow" : "Follow"}
          </button>
          {/* <button className="btn btn-sm btn-primary">Message</button> */}
        </div>
        {user.bio && (
          <div className="mt-2 sm:mt-4 p-4">
            <p className="leading-snug whitespace-pre-wrap text-accent text-sm sm:text-base">
              {user.bio}
            </p>
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
        ) : null}
      </div>
    </>
  );
}
