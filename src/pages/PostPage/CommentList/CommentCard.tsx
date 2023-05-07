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
import { Comment, Post, User } from "@prisma/client";
import { useCallback, useMemo, useState } from "react";
import { AiOutlineComment, AiOutlineDislike, AiOutlineLike } from "react-icons/ai";
import { trpc } from "@/lib/utils/trpc";
import { debounce } from "@/lib/utils/general";

dayjs.extend(relativeTime);
dayjs.extend(utc);

export function CommentCard({
  comment,
}: {
  comment: Comment & {
    author: User;
    likesCount: number;
    dislikesCount: number;
    isLikedByUser: boolean;
    isDislikedByUser: boolean;
  };
}) {
  const { user } = useUserContext();
  const trpcUtils = trpc.useContext();
  const [likes, setLikes] = useState({
    count: comment.likesCount,
    isLikedByUser: comment.isLikedByUser,
  });
  const [dislikes, setDislikes] = useState({
    count: comment.dislikesCount,
    isDislikedByUser: comment.isDislikedByUser,
  });
  const { mutate: toggleLikeDislike } = trpc.toggleLikeDislike.useMutation({
    onSettled(data, error, variables, context) {
      if (error) {
        setLikes({ count: comment.likesCount, isLikedByUser: comment.isLikedByUser });
        setDislikes({ count: comment.dislikesCount, isDislikedByUser: comment.isDislikedByUser });
      } else {
        console.log("data", data);
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
      if (user?.id) debouncedToggleLikeDislike(toggleLikeDislike, comment.id, user.id, action);
    },
    [user, comment, likes, dislikes]
  );

  const ownComment = user?.id === comment.authorId;
  const distanceInKm = useMemo(
    () =>
      distanceBetween(
        [comment.author.latitude, comment.author.longitude],
        [user?.latitude ?? 0, user?.longitude ?? 0]
      ).toFixed(2),
    [comment, user?.latitude, user?.longitude]
  );

  const avatar = useMemo(() => `https://picsum.photos/${Math.ceil(Math.random() * 100) + 200}`, []);

  return (
    <div className="grid w-full grid-cols-[min-content_1fr_min-content] grid-rows-[min-content_auto_auto] gap-3 border-b border-b-black px-3 py-4 sm:gap-4">
      <div className="avatar">
        <div className="relative h-12 sm:h-14 mask mask-squircle">
          <Image
            src={comment.author.photo || avatar || "images/avatar.jpg"}
            alt="avatar"
            fill
            sizes="(min-width: 640px) 56px, 48px"
          />
        </div>
      </div>
      <div className="flex h-full flex-col justify-center gap-1 self-center">
        <div className="flex items-center gap-1">
          <h2 className="text-sm font-bold leading-none text-slate-300 sm:text-base">
            {comment.author.name}
          </h2>
          <span className="text-sm leading-none text-slate-500 sm:text-base">
            @{comment.author.username}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-slate-500 sm:text-sm">
            {dayjs(comment.createdAt).utc(true).fromNow()}
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
          {ownComment && (
            <Dropdown.Item className="flex gap-2 cursor-pointer text-error items-center rounded p-2">
              <TbTrash /> Delete Comment
            </Dropdown.Item>
          )}
          {!ownComment && (
            <Dropdown.Item className="flex gap-2 cursor-pointer text-primary items-center rounded p-2">
              <BsPersonFillAdd /> Follow @{comment.author.username}
            </Dropdown.Item>
          )}
        </Dropdown.Content>
      </Dropdown.Root>
      <p className="col-span-full text-sm font-light leading-snug sm:text-base break-all">
        {comment.content}
      </p>
      <div className="card-actions col-span-full text-sm">
        <button
          className={`btn btn-xs gap-1 sm:gap-2 ${
            likes.isLikedByUser ? "btn-primary" : "btn-ghost"
          }`}
          onClick={() =>
            toggleLikeDislikeWithOptimisticUpdates(likes.isLikedByUser ? "UNLIKE" : "LIKE")
          }
        >
          {likes.count}
          <AiOutlineLike className="sm:text-lg" />
        </button>
        <button
          className={`btn btn-xs gap-1 sm:gap-2 ${
            dislikes.isDislikedByUser ? "btn-error" : "btn-ghost"
          }`}
          onClick={() =>
            toggleLikeDislikeWithOptimisticUpdates(
              dislikes.isDislikedByUser ? "UNDISLIKE" : "DISLIKE"
            )
          }
        >
          {dislikes.count}
          <AiOutlineDislike className="sm:text-lg" />
        </button>
      </div>
    </div>
  );
}

const debouncedToggleLikeDislike = debounce(
  (toggleLikeDislike: Function, commentId: number, userId: number, action: "LIKE" | "DISLIKE") => {
    return toggleLikeDislike({
      commentId,
      userId,
      action,
    });
  },
  500
);
