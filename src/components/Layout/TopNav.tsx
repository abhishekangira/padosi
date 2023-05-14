import logo from "public/images/logo.png";
import Image from "next/image";
import { auth } from "@/lib/firebase/firebase";
import Link from "next/link";
import { useUserContext } from "@/lib/contexts/user-context";
import { useRouter } from "next/router";
import { GoSearch } from "react-icons/go";
import * as Dropdown from "@radix-ui/react-dropdown-menu";
import avatar from "public/images/avatar.png";

export function TopNav({ title }: Props) {
  const { setGlobalLoading } = useUserContext();
  const router = useRouter();
  const { user } = useUserContext();
  return (
    <div className="bg-glass w-screen fixed top-0 z-10">
      <nav className="navbar">
        <div className="navbar-start gap-8">
          <Link href="/home" className="shrink-0">
            <Image src={logo} alt="Logo of Padosi" width={40} height={40} />
          </Link>
          {router.pathname !== "/search" && (
            <div className="input-group input-group-sm w-min">
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
              <button
                className={`btn btn-square btn-sm bg-base-100 border-none pointer-events-none`}
              >
                <GoSearch />
              </button>
            </div>
          )}
        </div>
        <div className="navbar-center">
          <h1 className={`text-2xl font-bold text-primary`}>{title}</h1>
        </div>
        <div className="navbar-end">
          <Dropdown.Root>
            <Dropdown.Trigger asChild>
              <button className="btn btn-ghost gap-4">
                <span className="text-primary lowercase">{user?.username}</span>
                <Image
                  src={user?.photo || auth.currentUser?.photoURL || avatar}
                  alt="Profile picture"
                  width={40}
                  height={40}
                  className="mask mask-squircle cursor-pointer"
                />
              </button>
            </Dropdown.Trigger>
            <Dropdown.Content align="end" className="bg-glass menu rounded-box p-2 text-sm shadow">
              <Dropdown.Item asChild>
                <Link
                  href={"/" + user?.username}
                  className="btn btn-ghost capitalize justify-start w-full"
                >
                  Profile
                </Link>
              </Dropdown.Item>
              <Dropdown.Item asChild>
                <Link href="/settings" className="btn btn-ghost capitalize justify-start w-full">
                  Settings
                </Link>
              </Dropdown.Item>
              <Dropdown.Separator className="divider my-0" />
              <Dropdown.Item asChild>
                <button
                  onClick={() => {
                    setGlobalLoading(true);
                    auth.signOut().then(() => {
                      router.push("/");
                    });
                  }}
                  className="btn btn-ghost capitalize justify-start w-full text-error"
                >
                  Sign Out
                </button>
              </Dropdown.Item>
            </Dropdown.Content>
          </Dropdown.Root>
        </div>
      </nav>
    </div>
  );
}

type Props = {
  title?: string;
};
