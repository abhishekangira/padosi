import { useUserContext } from "@/lib/contexts/user-context";
import { auth } from "@/lib/firebase/firebase";
import Link from "next/link";
import { useRouter } from "next/router";

export function SettingsPage() {
  const { setGlobalLoading } = useUserContext();
  const router = useRouter();
  return (
    <ul className="menu bg-base-100 w-3/4 max-w-3xl rounded-box mx-auto mt-8">
      <li>
        <Link href="/settings/edit-profile">Edit Profile</Link>
      </li>
      <li className="disabled">
        <Link href="/set-location" className="pointer-events-none">
          Change Location
        </Link>
      </li>
      <li>
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
      </li>
    </ul>
  );
}
