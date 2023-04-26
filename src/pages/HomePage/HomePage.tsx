import { useLayout } from "@/lib/hooks/useLayout";
import { TbPencilPlus } from "react-icons/tb";
import Link from "next/link";
import { NewPost } from "@/components/NewPost";
import { PostList } from "@/components/PostList/PostList";

export function HomePage() {
  useLayout({ navbarTitle: "Home" });
  return (
    <div className="mx-auto max-w-3xl py-6">
      <NewPost />
      <PostList />
      <Link
        href="/create-post"
        title="Create New Post"
        className="bg-glass fixed bottom-20 right-4 grid h-12 w-12 place-items-center rounded-full shadow-inner shadow-primary md:hidden"
      >
        <TbPencilPlus className="h-1/2 w-1/2" />
      </Link>
    </div>
  );
}
