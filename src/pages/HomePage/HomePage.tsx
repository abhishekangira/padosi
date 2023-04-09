import { auth } from "@/lib/firebase";

export function HomePage() {
  return (
    <main>
      [nearby user posts]
      <button onClick={logout}>Logout</button>
    </main>
  );
}

function logout() {
  auth.signOut();
}
