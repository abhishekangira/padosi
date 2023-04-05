import { auth } from "@/lib/firebase";

export function HomePage() {
  return (
    <div>
      [nearby user posts]
      <button onClick={logout}>Logout</button>
    </div>
  );
}

function logout() {
  auth.signOut();
}
