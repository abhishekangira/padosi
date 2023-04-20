import Link from "next/link";
import { GoHome, GoSearch, GoGear } from "react-icons/go";
import { FiUser } from "react-icons/fi";

const activeLink = "active bg-transparent text-primary";

export function BottomNav({ active }: { active?: string }) {
  return (
    <div className="bg-glass btm-nav shadow-inner shadow-black">
      <Link href="/home" className={`${active === "Home" ? activeLink : ""}`}>
        <GoHome />
      </Link>
      <Link href="/search" className={`${active === "Search" ? activeLink : ""}`}>
        <GoSearch />
      </Link>
      <Link href="/profile" className={`${active === "Profile" ? activeLink : ""}`}>
        <FiUser />
      </Link>
      <Link href="/settings" className={`${active === "Settings" ? activeLink : ""}`}>
        <GoGear />
      </Link>
    </div>
  );
}
