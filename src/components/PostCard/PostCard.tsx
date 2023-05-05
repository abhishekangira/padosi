import { TbDots, TbTrash } from "react-icons/tb";
import { BsPersonFillAdd } from "react-icons/bs";
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
import { AiOutlineComment, AiOutlineDislike, AiOutlineLike } from "react-icons/ai";
import { BiShare } from "react-icons/bi";
import { trpc } from "@/lib/utils/trpc";
import { debounce } from "@/lib/utils/utils";

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
  };
  full?: boolean;
}) {
  const { user } = useUserContext();
  const trpcUtils = trpc.useContext();
  const [likes, setLikes] = useState({ count: post.likesCount, isLikedByUser: post.isLikedByUser });
  const [dislikes, setDislikes] = useState({
    count: post.dislikesCount,
    isDislikedByUser: post.isDislikedByUser,
  });
  const { mutate: toggleLikeDislike } = trpc.toggleLikeDislike.useMutation({
    onSettled(data, error, variables, context) {
      if (error) {
        setLikes({ count: post.likesCount, isLikedByUser: post.isLikedByUser });
        setDislikes({ count: post.dislikesCount, isDislikedByUser: post.isDislikedByUser });
      } else {
        console.log("data", data);
      }
    },
  });

  const toggleLikeDislikeWithOptimisticUpdates = useCallback(
    (action: "LIKE" | "DISLIKE") => {
      switch (action) {
        case "LIKE":
          setLikes((prev) => ({
            count: prev.isLikedByUser ? prev.count - 1 : prev.count + 1,
            isLikedByUser: !prev.isLikedByUser,
          }));
          if (post.isDislikedByUser && dislikes.count > 0)
            setDislikes((prev) => ({ count: prev.count - 1, isDislikedByUser: false }));
          break;
        case "DISLIKE":
          setDislikes((prev) => ({
            count: prev.isDislikedByUser ? prev.count - 1 : prev.count + 1,
            isDislikedByUser: !prev.isDislikedByUser,
          }));
          if (post.isLikedByUser && likes.count > 0)
            setLikes((prev) => ({ count: prev.count - 1, isLikedByUser: false }));
          break;
      }
      if (user?.id) debouncedToggleLikeDislike(toggleLikeDislike, post.id, user.id, action);
    },
    [user, post, likes, dislikes]
  );

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
    <div className="grid w-full grid-cols-[min-content_auto_min-content] grid-rows-[min-content_auto_auto] gap-3 border-b border-b-black px-3 py-4 sm:gap-4">
      <div className="avatar">
        <div className="relative h-12 sm:h-16 mask mask-squircle">
          <Image
            src={post.author.photo || "/images/avatar.jpg"}
            alt="avatar"
            fill
            sizes="(min-width: 640px) 64px, 48px"
          />
        </div>
      </div>
      <div className="flex h-full flex-col justify-center gap-1 self-center">
        <div className="flex items-center gap-1">
          <h2 className="text-sm font-bold leading-none text-slate-300 sm:text-base">
            {post.author.name}
          </h2>
          <span className="text-sm leading-none text-slate-500 sm:text-base">
            @{post.author.username}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-slate-500 sm:text-sm">
            {dayjs(post.createdAt).utc(true).fromNow()}
          </span>
          <span className="text-xs leading-none text-slate-500">•</span>
          <span className="text-xs text-slate-500 sm:text-sm">{distanceInKm} km</span>
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
            <Dropdown.Item className="flex gap-2 cursor-pointer text-primary items-center rounded p-2">
              <BsPersonFillAdd /> Follow @{post.author.username}
            </Dropdown.Item>
          )}
        </Dropdown.Content>
      </Dropdown.Root>
      <PostBody post={post} full={full} />
      <div className="card-actions col-span-full text-sm">
        <button
          className={`btn btn-xs gap-1 sm:gap-2 ${
            likes.isLikedByUser ? "btn-primary" : "btn-ghost"
          }`}
          onClick={() => toggleLikeDislikeWithOptimisticUpdates("LIKE")}
        >
          {likes.count}
          <AiOutlineLike className="sm:text-lg" />
        </button>
        <button
          className={`btn btn-xs gap-1 sm:gap-2 ${
            dislikes.isDislikedByUser ? "btn-error" : "btn-ghost"
          }`}
          onClick={() => toggleLikeDislikeWithOptimisticUpdates("DISLIKE")}
        >
          {dislikes.count}
          <AiOutlineDislike className="sm:text-lg" />
        </button>
        <button className="btn btn-xs btn-ghost gap-1 sm:gap-2">
          {post.commentsCount}
          <AiOutlineComment className="sm:text-lg" />
        </button>
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
      <h2 className="text-base font-bold text-primary-light sm:text-lg">{post.title}</h2>
      <p className="overflow-hidden text-sm font-light leading-snug sm:text-base">{post.content}</p>
    </div>
  ) : (
    <Link href={`/post/${post.cuid}`} className="col-span-full grid gap-2">
      <h2 className="text-base font-bold text-primary-light sm:text-lg">{post.title}</h2>
      <p className="overflow-hidden text-sm font-light leading-snug sm:text-base">
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
  500
);
