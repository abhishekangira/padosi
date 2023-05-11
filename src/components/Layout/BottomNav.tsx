import Link from "next/link";
import { GoHome, GoSearch, GoGear } from "react-icons/go";
import { FiSettings, FiUser } from "react-icons/fi";
import { useUserContext } from "@/lib/contexts/user-context";
import { useRouter } from "next/router";
import { useLayout } from "@/lib/hooks/useLayout";

const activeLink = "active bg-transparent text-primary";

export function BottomNav({ active }: { active?: string }) {
  const { user } = useUserContext();
  const router = useRouter();
  const { username } = router.query;

  return (
    <div className="bg-glass btm-nav shadow-inner shadow-black">
      <Link href="/home" className={`text-2xl ${active === "Home" ? activeLink : ""}`}>
        <GoHome />
      </Link>
      <Link href="/search" className={`text-xl ${active === "Search" ? activeLink : ""}`}>
        <GoSearch />
      </Link>
      <Link
        href={"/" + user?.username}
        className={`text-2xl ${username === user?.username ? activeLink : ""}`}
      >
        <FiUser />
      </Link>
      <Link href="/settings" className={`text-xl ${active === "Settings" ? activeLink : ""}`}>
        <FiSettings />
      </Link>
    </div>
  );
}
