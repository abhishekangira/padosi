import logo from "public/images/logo.png";
import Image from "next/image";
import { auth } from "@/lib/firebase/firebase";
import Link from "next/link";

export function TopNav({ title }: Props) {
  return (
    <nav className="bg-glass navbar fixed top-0 z-10">
      <Link href="/home" className="navbar-start">
        <Image src={logo} alt="Logo of Padosi" width={30} height={30} />
      </Link>
      <div className="navbar-center">
        <h1 className={`text-2xl font-bold text-primary`}>{title}</h1>
      </div>
      <div className="navbar-end">
        <a onClick={() => auth.signOut()} className="btn-ghost btn capitalize">
          Sign Out
        </a>
      </div>
    </nav>
  );
}

type Props = {
  title?: string;
};
