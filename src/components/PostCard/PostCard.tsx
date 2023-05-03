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

dayjs.extend(relativeTime);
dayjs.extend(utc);

export function PostCard({
  post,
  full = false,
  index = 0,
}: {
  post: User & Post;
  full?: boolean;
  index?: number;
}) {
  const { user } = useUserContext();
  const ownPost = user?.id === post.authorId;
  const distanceInKm = distanceBetween(
    [post.latitude, post.longitude],
    [user?.latitude ?? 0, user?.longitude ?? 0]
  ).toFixed(2);
  return (
    <div className="grid w-full grid-cols-[min-content_auto_min-content] grid-rows-[min-content_auto_auto] gap-3 border-b border-b-sky-900 p-3 sm:gap-4">
      <div className="avatar">
        <div className="relative h-12 sm:h-16 mask mask-squircle">
          <Image
            src={post?.photo || "/images/avatar.jpg"}
            alt="avatar"
            fill
            sizes="(min-width: 640px) 64px, 48px"
          />
        </div>
      </div>
      <div className="flex h-full flex-col justify-center gap-1 self-center">
        <div className="flex items-center gap-1">
          <h2 className="text-sm font-bold leading-none text-slate-300 sm:text-base">
            {post?.name}
          </h2>
          <span className="text-sm leading-none text-slate-500 sm:text-base">@{post.username}</span>
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
              <BsPersonFillAdd /> Follow @{post?.username}
            </Dropdown.Item>
          )}
        </Dropdown.Content>
      </Dropdown.Root>
      <PostBody post={post} full={full} />
      <div className="card-actions col-span-full text-sm">
        <button className="link-hover link-primary link">Like</button>
        <button className="link-hover link-primary link">Comment</button>
        <button className="link-hover link-primary link">Share</button>
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
    <Link href={`/post/${post.id}`} className="col-span-full grid gap-2">
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
