import FullPageLoader from "@/components/FullPageLoader";
import { useAuth } from "@/lib/Auth";
import { HomePage } from "@/pages/HomePage/HomePage";
import { LoginPage } from "@/pages/LoginPage/LoginPage";

export default function Index() {
  const { user, loading } = useAuth();
  if (loading) return <FullPageLoader />;
  if (user) return <HomePage />;
  return <LoginPage />;
}
