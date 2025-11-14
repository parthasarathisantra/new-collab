import { useAuth } from "@/context/AuthContext";
import Login from "@/pages/Login";

export default function PrivateRoute({ component: Component }) {
  const { currentUser, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  return currentUser ? <Component /> : <Login />;
}
