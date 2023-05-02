import { useLayout } from "@/lib/hooks/useLayout";
import { TbPencilPlus } from "react-icons/tb";
import { NewPost } from "@/components/NewPost";
import { PostList } from "@/components/PostList/PostList";

export function HomePage() {
  useLayout({ navbarTitle: "Home" });
  return (
    <>
      <div className="mx-auto max-w-3xl py-6">
        <div className="hidden sm:block">
          <NewPost />
        </div>
        <PostList />
        <label
          htmlFor="my-modal"
          className="bg-glass fixed bottom-20 right-4 grid h-12 w-12 place-items-center rounded-full shadow-inner shadow-primary md:hidden"
        >
          <TbPencilPlus className="h-1/2 w-1/2" />
        </label>
      </div>
      <input type="checkbox" id="my-modal" className="modal-toggle" />
      <label htmlFor="my-modal" className="modal cursor-pointer">
        <label
          className="modal-box w-11/12 h-1/2 flex flex-col justify-between relative"
          htmlFor=""
        >
          <NewPost />
        </label>
      </label>
    </>
  );
}
