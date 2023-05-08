import { useUserContext } from "@/lib/contexts/user-context";
import { trpc } from "@/lib/utils/trpc";
import { distanceBetween } from "geofire-common";
import Image from "next/image";
import { useRouter } from "next/router";
import { useMemo } from "react";
import { BsTextareaT } from "react-icons/bs";
import { RiMapPinUserFill, RiMarkupLine, RiUserShared2Line, RiUserStarLine } from "react-icons/ri";

export function ProfilePage() {
  const { user: currentUser } = useUserContext();
  const router = useRouter();
  const { username: uname } = router.query;
  const {
    data: user,
    isLoading,
    isError,
  } = trpc.user.get.useQuery({ username: uname as string }, { enabled: !!uname });

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

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading user</div>;
  if (!user) return <div>User not found</div>;

  const ownProfile = currentUser?.id === user.id;

  return (
    <div className="max-w-3xl mx-auto py-6 px-4">
      <div className="grid grid-cols-[min-content_auto] gap-4">
        <div className="avatar self-center">
          <div className="relative h-36 sm:h-52 mask mask-squircle">
            <Image
              src={user.photo || "/images/avatar.jpg"}
              alt="avatar"
              fill
              sizes="(min-width: 640px) 192px, 112px"
            />
          </div>
        </div>
        <div className="flex flex-col pt-2 gap-2">
          <div className="flex gap-2 items-center">
            <h2 className="text-2xl font-semibold leading-none">{user.name}</h2>
            <p className="text-slate-500 text-2xl leading-none">@{user.username}</p>
          </div>
          <h3 className="flex items-center text-lg text-slate-600">{user.tagline}</h3>
          <div className="flex gap-4">
            <div className="flex gap-2 items-center">
              <RiMapPinUserFill className="text-xl" />
              {distanceInKm} km
            </div>
            <div className="flex gap-2 items-center">
              <RiMarkupLine className="text-xl" />
              {user._count.posts} {user._count.posts === 1 ? "Post" : "Posts"}
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex gap-2 items-center">
              <RiUserStarLine className="text-xl" />
              {user._count.followers} {user._count.followers === 1 ? "Follower" : "Followers"}
            </div>
            <div className="flex gap-2 items-center">
              <RiUserShared2Line className="text-xl" />
              {user._count.following} Following
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4 space-x-4">
        <button className="btn btn-sm btn-outline btn-primary">Follow</button>
        <button className="btn btn-sm btn-primary">Message</button>
      </div>
      {user.bio && (
        <div className="mt-6">
          <p className="text-gray-500">{user.bio}</p>
        </div>
      )}
    </div>
  );
}
