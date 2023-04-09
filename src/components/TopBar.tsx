import logo from "public/images/logo.png";
import Image from "next/image";
import { Acme } from "next/font/google";
import { auth } from "@/lib/firebase";

const acme = Acme({
  weight: "400",
  subsets: ["latin"],
});

export function TopBar({ title }: Props) {
  return (
    <nav className="navbar bg-base-100">
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
  title: string;
};
