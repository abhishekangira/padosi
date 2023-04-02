import { useAuth } from "@/lib/AuthContext";
import { auth } from "@/lib/firebase";
import { HomePage } from "@/pages/HomePage/HomePage";

export default function Home() {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (user)
    return (
      <div>
        You are logged in
        <button className="btn" onClick={() => auth.signOut()}>
          Logout
        </button>
      </div>
    );
  return <HomePage />;
}
