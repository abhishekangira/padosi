import { useLayout } from "@/lib/hooks/useLayout";
import { trpc } from "@/lib/utils/trpc";
import Head from "next/head";
import { useEffect, useState } from "react";
import { GoSearch } from "react-icons/go";
import { PostCard } from "../HomePage/PostList/PostCard/PostCard";
import { debounce } from "@/lib/utils/general";
import { set } from "zod";
import { useRouter } from "next/router";
import { PostCardSkeleton } from "../HomePage/PostList/PostCard/PostCardSkeleton";

export function SearchPage() {
  useLayout({ navbarTitle: "Search" });
  const router = useRouter();
  const { q } = router.query;
  const [searchTerm, setSearchTerm] = useState((q as string) || "");
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState("");
  const { data, isError, isFetching, refetch } = trpc.search.posts.useQuery(
    {
      searchTerm,
    },
    {
      enabled: false,
      onSuccess(data) {
        if (!data.length) {
          setStatusText(`No results found for '${searchTerm}'`);
        }
        setLoading(false);
      },
    }
  );

  useEffect(() => {
    if (searchTerm.length > 2) refetch();
  }, []);

  useEffect(() => {
    if (searchTerm.length < 3 && searchTerm.length > 0) {
      setStatusText("Enter at least 3 characters to search");
      setLoading(false);
    } else if (searchTerm.length === 0) {
      setStatusText("");
      setLoading(false);
    } else {
      setLoading(true);
    }
  }, [searchTerm]);

  if (isError) return <div>Error</div>;

  return (
    <>
      <Head>
        <title>{searchTerm ? `'${searchTerm}' - ` : ""}Search | Padosi</title>
      </Head>
      <div className="max-w-3xl mx-auto">
        <div className="input-group p-4">
          <input
            type="text"
            autoFocus
            placeholder="Search…"
            className="input flex-1"
            value={searchTerm}
            onChange={(e) => {
              const inputVal = e.target.value;
              setSearchTerm(inputVal);
              router.replace(`/search${inputVal ? `?q=${inputVal}` : ""}`);
              debouncedSearch(inputVal.trim(), refetch);
            }}
          />
          <button
            className={`btn btn-square bg-base-100 border-none pointer-events-none ${
              isFetching ? "loading" : ""
            }`}
          >
            {isFetching ? "" : <GoSearch />}
          </button>
        </div>
        {loading ? (
          <>
            <PostCardSkeleton />
            <PostCardSkeleton />
            <PostCardSkeleton />
          </>
        ) : data?.length && searchTerm.length > 2 ? (
          data.map((post) => <PostCard post={post} key={post.id} />)
        ) : (
          <div className="text-center">{statusText}</div>
        )}
      </div>
    </>
  );
}

const debouncedSearch = debounce((inputVal: string, refetch: Function) => {
  if (inputVal.length > 2) refetch();
}, 500);
