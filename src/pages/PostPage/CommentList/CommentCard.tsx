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
import {
  AiFillDislike,
  AiFillLike,
  AiOutlineComment,
  AiOutlineDislike,
  AiOutlineLike,
} from "react-icons/ai";
import { trpc } from "@/lib/utils/trpc";
import { debounce } from "@/lib/utils/general";
import { produce } from "immer";
import avatar from "public/images/avatar.png";

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
        console.log({ user: user?.id, comment: comment.postCuid });

        trpcUtils.comment.getInfinite.setInfiniteData(
          {
            userId: user!?.id,
            postCuid: comment.postCuid,
          },
          (prev) => {
            console.log({ prev });
            const updated = produce(prev, (draft: any) => {
              let postIndex;
              const pageIndex = draft.pages.findIndex((page) => {
                postIndex = page.comments.findIndex((c) => c.id === comment.id);
                console.log({ postIndex });
                return postIndex !== -1;
              });
              console.log({ pageIndex });
              if (postIndex !== undefined && postIndex !== -1) {
                draft.pages[pageIndex].comments[postIndex] = {
                  ...draft.pages[pageIndex].comments[postIndex],
                  likesCount: likes.count,
                  dislikesCount: dislikes.count,
                  isLikedByUser: likes.isLikedByUser,
                  isDislikedByUser: dislikes.isDislikedByUser,
                };
              }
            });
            console.log({ updated });

            return updated;
          }
        );
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

  return (
    <div className="grid w-full grid-cols-[min-content_1fr_min-content] grid-rows-[min-content_auto_auto] gap-3 border-b border-b-black px-3 py-4 sm:gap-4">
      <div className="avatar">
        <div className="relative h-12 sm:h-14 mask mask-squircle">
          <Image
            src={comment.author.photo || avatar}
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
      <p className="col-span-full text-sm ml-1 font-light leading-snug sm:text-base whitespace-pre-wrap overflow-x-auto">
        {comment.content}
      </p>
      <div className="card-actions col-span-full text-sm">
        <button
          className={`btn btn-ghost btn-xs sm:text-sm gap-1 sm:gap-2 ${
            likes.isLikedByUser ? "text-primary" : "text-slate-400"
          }`}
          onClick={() =>
            toggleLikeDislikeWithOptimisticUpdates(likes.isLikedByUser ? "UNLIKE" : "LIKE")
          }
        >
          {likes.count}
          {likes.isLikedByUser ? <AiFillLike className="" /> : <AiOutlineLike className="" />}
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
            <AiFillDislike className="" />
          ) : (
            <AiOutlineDislike className="" />
          )}
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
