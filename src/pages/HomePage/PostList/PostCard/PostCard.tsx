import { TbDots, TbTrash } from "react-icons/tb";
import { BsPersonFillAdd, BsPersonFillX } from "react-icons/bs";
import Image from "next/image";
import { useUserContext } from "@/lib/contexts/user-context";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import utc from "dayjs/plugin/utc";
import { distanceBetween } from "geofire-common";
import Link from "next/link";
import * as Dropdown from "@radix-ui/react-dropdown-menu";
import { Post, User } from "@prisma/client";
import { useCallback, useMemo, useState } from "react";
import {
  AiFillDislike,
  AiFillLike,
  AiOutlineComment,
  AiOutlineDislike,
  AiOutlineLike,
} from "react-icons/ai";
import { trpc } from "@/lib/utils/trpc";
import { debounce } from "@/lib/utils/general";
import { useRouter } from "next/router";
import { produce } from "immer";
import avatar from "public/images/avatar.png";

dayjs.extend(relativeTime);
dayjs.extend(utc);

export function PostCard({
  post,
  full = false,
}: {
  post: Post & {
    author: User;
    likesCount: number;
    dislikesCount: number;
    isLikedByUser: boolean;
    isDislikedByUser: boolean;
    commentsCount: number;
    isFollowedByUser: boolean;
    isFollowingUser: boolean;
  };
  full?: boolean;
}) {
  const { user } = useUserContext();
  const router = useRouter();
  const trpcUtils = trpc.useContext();
  const [likes, setLikes] = useState({ count: post.likesCount, isLikedByUser: post.isLikedByUser });
  const [dislikes, setDislikes] = useState({
    count: post.dislikesCount,
    isDislikedByUser: post.isDislikedByUser,
  });
  const { mutate: toggleLikeDislike } = trpc.toggleLikeDislike.useMutation({
    onSettled(data, error, variables, context) {
      console.log({ variables, context });

      const updateInCache = (prev: any, payload: {}) => {
        if (prev) {
          const updated = produce(prev, (draft: any) => {
            let postIndex;
            const pageIndex = draft.pages.findIndex((page: any) => {
              postIndex = page.posts.findIndex((p: any) => p.id === post.id);
              console.log({ postIndex });
              return postIndex !== -1;
            });
            // console.log({ pageIndex });
            if (postIndex !== undefined && postIndex !== -1) {
              draft.pages[pageIndex].posts[postIndex] = {
                ...draft.pages[pageIndex].posts[postIndex],
                ...payload,
              };
            }
          });
          console.log({ updated });
          return updated;
        }
      };

      if (error) {
        setLikes({ count: post.likesCount, isLikedByUser: post.isLikedByUser });
        setDislikes({ count: post.dislikesCount, isDislikedByUser: post.isDislikedByUser });
      } else {
        trpcUtils.post.getInfinite.setInfiniteData(
          {
            currentUserId: user!?.id,
            userLat: user!?.latitude,
            userLon: user!?.longitude,
            limit: 20,
            sortBy: "LATEST",
          },
          // @ts-ignore
          (prev) =>
            updateInCache(prev, {
              likesCount: likes.count,
              dislikesCount: dislikes.count,
              isLikedByUser: likes.isLikedByUser,
              isDislikedByUser: dislikes.isDislikedByUser,
            })
        );

        trpcUtils.post.getInfinite.setInfiniteData(
          {
            currentUserId: user!?.id,
            userLat: user!?.latitude,
            userLon: user!?.longitude,
            limit: 20,
            sortBy: "FOLLOWING",
          },
          // @ts-ignore
          (prev) =>
            updateInCache(prev, {
              likesCount: likes.count,
              dislikesCount: dislikes.count,
              isLikedByUser: likes.isLikedByUser,
              isDislikedByUser: dislikes.isDislikedByUser,
            })
        );
        trpcUtils.post.get.refetch({ cuid: post.cuid, userId: user!?.id });
        trpcUtils.post.getInfiniteOfUser.refetch({
          currentUserId: user!?.id,
          username: post.author.username,
        });
      }
    },
  });

  const toggleLikeDislikeWithOptimisticUpdates = useCallback(
    (action: "LIKE" | "DISLIKE" | "UNLIKE" | "UNDISLIKE") => {
      setLikes((prev) => {
        if (action === "LIKE") {
          if (dislikes.isDislikedByUser) {
            setDislikes((prev) => {
              return { count: prev.count - 1, isDislikedByUser: false };
            });
          }
          return { count: prev.count + 1, isLikedByUser: true };
        } else if (action === "UNLIKE") {
          return { count: prev.count - 1, isLikedByUser: false };
        } else {
          return prev;
        }
      });
      setDislikes((prev) => {
        if (action === "DISLIKE") {
          if (likes.isLikedByUser) {
            setLikes((prev) => {
              return { count: prev.count - 1, isLikedByUser: false };
            });
          }
          return { count: prev.count + 1, isDislikedByUser: true };
        } else if (action === "UNDISLIKE") {
          return { count: prev.count - 1, isDislikedByUser: false };
        } else {
          return prev;
        }
      });
      if (user?.id) debouncedToggleLikeDislike(toggleLikeDislike, post.id, user.id, action);
    },
    [user, post, likes, dislikes]
  );

  const { mutate: toggleFollow, isLoading: toggleFollowLoading } =
    trpc.user.togglefollow.useMutation({
      onSuccess: (data) => {
        trpcUtils.user.get.invalidate();
        trpcUtils.post.getInfiniteOfUser.invalidate();
      },
    });

  const ownPost = user?.id === post.authorId;
  const distanceInKm = useMemo(
    () =>
      distanceBetween(
        [post.author.latitude, post.author.longitude],
        [user?.latitude ?? 0, user?.longitude ?? 0]
      ).toFixed(2),
    [post, user?.latitude, user?.longitude]
  );

  return (
    <div className="grid w-full grid-cols-[min-content_1fr_min-content] grid-rows-[min-content_auto_auto] gap-3 border-b border-b-black px-3 py-4 sm:gap-4">
      <div
        className="avatar cursor-pointer"
        onClick={() => router.push(`/${post.author.username}`)}
      >
        <div className="relative h-14 sm:h-16 mask mask-squircle">
          <Image
            src={post.author.photo || avatar}
            alt="avatar"
            fill
            sizes="(min-width: 640px) 64px, 56px"
          />
        </div>
      </div>
      <div
        className="flex h-full flex-col justify-center gap-[2px] sm:gap-0 self-center cursor-pointer"
        onClick={() => router.push(`/${post.author.username}`)}
      >
        <div className="flex items-center gap-1">
          <h2 className={`text-sm font-bold sm:text-base leading-tight`}>{post.author.name}</h2>
          <span className="text-sm text-primary sm:text-base leading-tight">
            @{post.author.username}
          </span>
        </div>
        <h3 className="text-accent text-xs sm:text-sm">{post.author.tagline}</h3>
        <div className="flex items-center gap-1">
          <span className="text-xs text-secondary sm:text-sm">
            {dayjs(post.createdAt).utc(true).fromNow()}
          </span>
          <span className="text-xs leading-none text-secondary">•</span>
          <span className="text-xs text-secondary sm:text-sm">{distanceInKm} km</span>
        </div>
      </div>
      <Dropdown.Root>
        <Dropdown.Trigger className="btn-ghost btn">
          <TbDots />
        </Dropdown.Trigger>
        <Dropdown.Content
          align="end"
          className="bg-glass dropdown-content menu rounded-box p-2 text-sm shadow"
        >
          {ownPost && (
            <Dropdown.Item className="flex gap-2 cursor-pointer text-error items-center rounded p-2">
              <TbTrash /> Delete Post
            </Dropdown.Item>
          )}
          {!ownPost && (
            <Dropdown.Item
              className={`flex gap-2 cursor-pointer ${
                post.isFollowedByUser ? "text-error" : "text-primary"
              } items-center rounded p-2`}
              onClick={() => toggleFollow({ followerId: user!.id, followingId: post.authorId })}
            >
              {post.isFollowedByUser ? (
                <>
                  <BsPersonFillX /> Unfollow
                </>
              ) : post.isFollowingUser ? (
                <>
                  <BsPersonFillAdd /> Follow Back
                </>
              ) : (
                <>
                  <BsPersonFillAdd /> Follow
                </>
              )}{" "}
              @{post.author.username}
            </Dropdown.Item>
          )}
        </Dropdown.Content>
      </Dropdown.Root>
      <PostBody post={post} full={full} />
      <div className="card-actions col-span-full">
        <button
          className={`btn btn-ghost btn-xs sm:text-sm gap-1 sm:gap-2 ${
            likes.isLikedByUser ? "text-primary" : "text-slate-400"
          }`}
          onClick={() =>
            toggleLikeDislikeWithOptimisticUpdates(likes.isLikedByUser ? "UNLIKE" : "LIKE")
          }
        >
          {likes.count}
          {likes.isLikedByUser ? (
            <AiFillLike className="text-base sm:text-lg" />
          ) : (
            <AiOutlineLike className="text-base sm:text-lg" />
          )}
        </button>
        <button
          className={`btn btn-ghost btn-xs sm:text-sm gap-1 sm:gap-2 ${
            dislikes.isDislikedByUser ? "text-error" : "text-slate-400"
          }`}
          onClick={() =>
            toggleLikeDislikeWithOptimisticUpdates(
              dislikes.isDislikedByUser ? "UNDISLIKE" : "DISLIKE"
            )
          }
        >
          {dislikes.count}
          {dislikes.isDislikedByUser ? (
            <AiFillDislike className="text-base sm:text-lg" />
          ) : (
            <AiOutlineDislike className="text-base sm:text-lg" />
          )}
        </button>
        <Link
          href={`/post/${post.cuid}?addComment=true`}
          className="btn btn-xs text-slate-400 sm:text-sm btn-ghost gap-1 sm:gap-2"
        >
          {post.commentsCount}
          <AiOutlineComment className="text-base sm:text-lg" />
        </Link>
        {/* <button className="btn btn-xs btn-ghost gap-2">
          <div className="badge badge-sm">2</div>
          <BiShare className="text-lg" />
        </button> */}
      </div>
    </div>
  );
}

const PostBody = ({ post, full }: { post: Post; full?: boolean }) =>
  full ? (
    <div className="col-span-full grid gap-2">
      <h2 className="text-base font-bold text-primary-focus sm:text-xl overflow-x-auto ml-1">
        {post.title}
      </h2>
      <p className="text-sm leading-snug whitespace-pre-wrap sm:text-base overflow-x-auto ml-1">
        {post.content}
      </p>
    </div>
  ) : (
    <Link href={`/post/${post.cuid}`} className="col-span-full grid gap-2">
      <h2 className="text-base font-bold text-primary-focus sm:text-lg overflow-x-auto ml-1">
        {post.title}
      </h2>
      <p className="text-sm leading-snug sm:text-base overflow-x-auto ml-1">
        {post.content.length > 220 ? (
          <>
            {post.content.slice(0, 220) + "... "}
            <button className="link-primary link text-sm">Read More</button>
          </>
        ) : (
          post.content
        )}
      </p>
    </Link>
  );

const debouncedToggleLikeDislike = debounce(
  (toggleLikeDislike: Function, postId: number, userId: number, action: "LIKE" | "DISLIKE") => {
    return toggleLikeDislike({
      postId,
      userId,
      action,
    });
  },
  300
);
