import { useLayout } from "@/lib/hooks/useLayout";
import { TbPencilPlus } from "react-icons/tb";
import { NewPost } from "@/pages/HomePage/NewPost";
import { PostList } from "@/pages/HomePage/PostList/PostList";
import { useState } from "react";
import Head from "next/head";

export function HomePage() {
  useLayout({ navbarTitle: "Home" });
  const [sortBy, setSortBy] = useState<"LATEST" | "TRENDING">("LATEST");
  return (
    <>
      <Head>
        <title>Home | Padosi</title>
      </Head>
      <div className="mx-auto max-w-3xl py-6">
        <div className="hidden sm:block">
          <NewPost />
        </div>
        {/* <div className="tabs justify-center">
          {["LATEST", "TRENDING"].map((tab: any) => (
            <button
              key={tab}
              className={`tab tab-bordered ${tab === sortBy ? "tab-active" : ""}`}
              onClick={() => {
                setSortBy(tab);
              }}
            >
              {tab}
            </button>
          ))}
        </div> */}
        <PostList sortBy={sortBy} />
        <label
          htmlFor="my-modal"
          className="bg-glass fixed bottom-20 right-4 grid h-12 w-12 place-items-center rounded-full shadow-inner shadow-primary md:hidden"
        >
          <TbPencilPlus className="h-1/2 w-1/2" />
        </label>
      </div>
      <input type="checkbox" id="my-modal" className="modal-toggle" />
      <label htmlFor="my-modal" className="modal cursor-pointer">
        <label className="modal-box w-11/12 h-1/2 flex flex-col justify-between relative">
          <NewPost />
        </label>
      </label>
    </>
  );
}
