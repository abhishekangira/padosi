import logo from "public/images/logo.png";
import Image from "next/image";
import { auth } from "@/lib/firebase/firebase";
import Link from "next/link";
import { useUserContext } from "@/lib/contexts/user-context";

export function TopNav({ title }: Props) {
  const { setRouteLoading } = useUserContext();
  return (
    <nav className="bg-glass navbar fixed top-0 z-10">
      <Link href="/home" className="navbar-start">
        <Image src={logo} alt="Logo of Padosi" width={30} height={30} />
      </Link>
      <div className="navbar-center">
        <h1 className={`text-2xl font-bold text-primary`}>{title}</h1>
      </div>
      <div className="navbar-end">
        <button
          onClick={() => {
            setRouteLoading(true);
            auth.signOut();
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
