import { TbDots, TbTrash } from "react-icons/tb";
import { BsPersonFillAdd } from "react-icons/bs";
import Image from "next/image";

export function PostCard({ post }) {
  return (
    <div className="grid w-full grid-cols-[min-content_auto_min-content] grid-rows-[min-content_auto_auto] gap-3 border-b border-b-sky-900 p-3 sm:gap-4">
      <div className="avatar">
        <div className="relative h-12 rounded-full sm:h-16">
          <Image
            src="https://picsum.photos/101"
            alt="avatar"
            fill
            sizes="(min-width: 640px) 64px, 48px"
          />
        </div>
      </div>
      <div className="flex h-full flex-col justify-evenly self-center">
        <div className="flex items-center gap-1">
          <h2 className="text-sm font-bold leading-none text-slate-300 sm:text-base">
            Arjun Reddy
          </h2>
          <span className="text-sm leading-none text-slate-500 sm:text-base">@jujubaba</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-slate-500 sm:text-sm">14h</span>
          <span className="text-xs leading-none text-slate-500">•</span>
          <span className="text-xs text-slate-500 sm:text-sm">7 km</span>
        </div>
      </div>
      <div className="dropdown-bottom dropdown-end dropdown">
        <label tabIndex={0} className="btn-ghost btn">
          <TbDots />
        </label>
        <ul className="bg-glass dropdown-content menu rounded-box w-52 p-2 text-sm shadow">
          <li>
            <button className="gap-2 text-error">
              <TbTrash /> Delete Post
            </button>
          </li>
          <li>
            <button className="gap-2 text-primary">
              <BsPersonFillAdd /> Follow @jujubaba
            </button>
          </li>
        </ul>
      </div>

      <p className="col-span-full overflow-hidden text-sm font-light leading-snug sm:text-base">
        {post.text.length > 220 ? (
          <>
            {post.text.slice(0, 220) + "... "}
            <a tabIndex={0} className="link-primary link">
              Read More
            </a>
          </>
        ) : (
          post.text
        )}
      </p>
      <div className="card-actions col-span-full text-sm">
        <button className="link-hover link-primary link">Like</button>
        <button className="link-hover link-primary link">Comment</button>
        <button className="link-hover link-primary link">Share</button>
      </div>
    </div>
  );
}

const postText = `Anyone can connect with their audience through blogging and enjoy the myriad benefits that
  blogging provides: organic traffic from search engines, promotional content for social
  media, and recognition from a new audience you haven’t tapped into yet. If you’ve heard
  about blogging but are a beginner and don’t know where to start, the time for excuses is
  over. Not only can you create an SEO-friendly blog, but we’ll cover how to write and manage
  your businesss blog as well as provide helpful templates to simplify your blogging efforts.
  Anyone can connect with their audience through blogging and enjoy the myriad benefits that
  blogging provides: organic traffic from search engines, promotional content for social
  media, and recognition from a new audience you haven’t tapped into yet. If you’ve heard
  about blogging but are a beginner and don’t know where to start, the time for excuses is
  over. Not only can you create an SEO-friendly blog, but we’ll cover how to write and manage
  your businesss blog as well as provide helpful templates to simplify your blogging efforts.`;
