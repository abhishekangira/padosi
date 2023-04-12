import logo from "public/images/logo.png";
import Image from "next/image";
import { auth } from "@/lib/firebase";

export function TopNav({ title }: Props) {
  return (
    <nav className="navbar fixed top-0 z-10 bg-base-100/20 shadow-lg backdrop-blur-sm">
      <div className="navbar-start">
        <Image src={logo} alt="Logo of Padosi" width={30} height={30} />
      </div>
      <div className="navbar-center">
        <h1 className={`text-2xl font-bold text-primary`}>{title}</h1>
      </div>
      <div className="navbar-end">
        <a onClick={() => auth.signOut()} className="link-hover link-primary link">
          Sign Out
        </a>
      </div>
    </nav>
  );
}

type Props = {
  title?: string;
};
