import { TbDots } from "react-icons/tb";

export function PostCardSkeleton() {
  return (
    <div className="grid pointer-events-none animate-pulse w-full grid-cols-[min-content_auto_min-content] grid-rows-[min-content_auto_auto] gap-3 border-b border-b-sky-900 p-3 sm:gap-4">
      <div className="avatar">
        <div className="relative h-12 mask mask-squircle sm:h-16 bg-base-100"></div>
      </div>
      <div className="flex h-full flex-col justify-evenly self-center">
        <div className="flex items-center gap-1">
          <h2 className="w-32 h-4 bg-base-100"></h2>
          <span className="w-20 h-4 bg-base-100"></span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-10 h-2 bg-base-100"></span>
          <span className="text-xs leading-none text-slate-500">•</span>
          <span className="w-10 h-2 bg-base-100"></span>
        </div>
      </div>
      <div className="dropdown-bottom dropdown-end dropdown">
        <label tabIndex={0} className="text-base-100">
          <TbDots />
        </label>
      </div>
      <div className="col-span-full grid gap-2">
        <div className="w-full h-3 bg-base-100"></div>
        <div className="w-full h-3 bg-base-100"></div>
        <div className="w-full h-3 bg-base-100"></div>
      </div>
      <div className="card-actions col-span-full text-sm">
        <div className="w-10 h-4 bg-base-100"></div>
        <div className="w-10 h-4 bg-base-100"></div>
        <div className="w-10 h-4 bg-base-100"></div>
      </div>
    </div>
  );
}
