import Link from "next/link";
import { GoHome, GoSearch, GoGear } from "react-icons/go";
import { FiSettings, FiUser } from "react-icons/fi";

const activeLink = "active bg-transparent text-primary";

export function BottomNav({ active }: { active?: string }) {
  return (
    <div className="bg-glass btm-nav shadow-inner shadow-black">
      <Link href="/home" className={`text-2xl ${active === "Home" ? activeLink : ""}`}>
        <GoHome />
      </Link>
      <Link href="/search" className={`text-xl ${active === "Search" ? activeLink : ""}`}>
        <GoSearch />
      </Link>
      <Link href="/profile" className={`text-xl ${active === "Profile" ? activeLink : ""}`}>
        <FiUser />
      </Link>
      <Link href="/settings" className={`text-xl ${active === "Settings" ? activeLink : ""}`}>
        <FiSettings />
      </Link>
    </div>
  );
}
