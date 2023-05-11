import logo from "public/images/logo.png";
import Image from "next/image";
import { auth } from "@/lib/firebase/firebase";
import Link from "next/link";
import { useUserContext } from "@/lib/contexts/user-context";
import { useRouter } from "next/router";
import { GoSearch } from "react-icons/go";

export function TopNav({ title }: Props) {
  const { setGlobalLoading } = useUserContext();
  const router = useRouter();
  return (
    <nav className="bg-glass navbar fixed top-0 z-10">
      <div className="navbar-start">
        <Link href="/home">
          <Image src={logo} alt="Logo of Padosi" width={40} height={40} />
        </Link>
        {router.pathname !== "/search" && (
          <div className="input-group input-group-sm ml-8">
            <input
              type="text"
              placeholder="Search posts…"
              className="input input-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const inputVal = e.currentTarget.value.trim();
                  router.push(`/search?q=${inputVal}`);
                }
              }}
            />
            <button className={`btn btn-square btn-sm bg-base-100 border-none pointer-events-none`}>
              <GoSearch />
            </button>
          </div>
        )}
      </div>
      <div className="navbar-center">
        <h1 className={`text-2xl font-bold text-primary`}>{title}</h1>
      </div>
      <div className="navbar-end">
        <button
          onClick={() => {
            setGlobalLoading(true);
            auth.signOut().then(() => {
              router.push("/");
            });
          }}
          className="btn-ghost btn capitalize"
        >
          Sign Out
        </button>
      </div>
    </nav>
  );
}

type Props = {
  title?: string;
};
