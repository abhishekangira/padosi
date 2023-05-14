import Link from "next/link";

export function SettingsPage() {
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
    </ul>
  );
}
