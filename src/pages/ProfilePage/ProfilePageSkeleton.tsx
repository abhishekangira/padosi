import { PostCardSkeleton } from "@/pages/HomePage/PostList/PostCard/PostCardSkeleton";
export function ProfilePageSkeleton() {
  return (
    <>
      <div className="max-w-3xl mx-auto py-6 animate-pulse">
        <div className="grid grid-cols-[min-content_auto] gap-4 sm:gap-8 px-4">
          <div className="avatar self-center">
            <div className="h-28 w-28 sm:h-52 sm:w-52 mask mask-squircle bg-base-100"></div>
          </div>
          <div className="flex flex-col justify-center gap-2">
            <h2 className="w-40 h-6 bg-base-100"></h2>
            <p className="w-32 h-4 bg-base-100"></p>
            <div className="flex gap-4 sm:gap-4">
              <div className="flex gap-1 sm:gap-2 items-center">
                <span className="text-sm w-14 h-3 bg-base-100"></span>
              </div>
              <div className="flex gap-1 sm:gap-2 items-center">
                <span className="text-sm w-14 h-3 bg-base-100"></span>
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 place-items-center mt-4">
          <div className="flex gap-1 sm:gap-2 items-center">
            <span className="w-20 h-4 bg-base-100"></span>
          </div>
          <div className="flex gap-1 sm:gap-2 items-center">
            <span className="w-20 h-4 bg-base-100"></span>
          </div>
        </div>
        <div className="mt-4 grid justify-items-center px-4">
          <button className="w-full max-w-sm h-7 bg-base-100 rounded-lg"></button>
        </div>
        <div className="mt-4 px-2">
          <p className="leading-snug text-sm sm:text-base"></p>
        </div>
        <PostCardSkeleton />
      </div>
    </>
  );
}
