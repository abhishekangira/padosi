import FullPageLoader from "@/components/FullPageLoader";
import { useUserContext } from "@/lib/user-context";
import { HomePage } from "@/pages/HomePage/HomePage";
import { LoginPage } from "@/pages/LoginPage/LoginPage";

export default function Index() {
  const { user, loading } = useUserContext();
  if (loading) return <FullPageLoader />;
  if (user) return <HomePage />;
  return <LoginPage />;
}
