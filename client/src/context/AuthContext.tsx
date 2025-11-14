import { createContext, useContext, useEffect, useState } from "react";
import { signup as apiSignup, login as apiLogin } from "@/services/api";

const AuthContext = createContext<any>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Restore session automatically
  useEffect(() => {
    const uid = localStorage.getItem("uid");
    const username = localStorage.getItem("username") || "User";

    if (uid) {
      setCurrentUser({ uid, email: "unknown" });
      setUserData({
        username,
        xp: 250,
        level: 3
      });
    }

    setLoading(false);
  }, []);

  const signup = async (email: string, password: string) => {
    const res = await apiSignup(email, password);

    const uid = res.data.uid;

    setCurrentUser({ uid, email });
    localStorage.setItem("uid", uid);

    // TEMP MOCK DATA (replace later with backend data)
    const username = email.split("@")[0];
    localStorage.setItem("username", username);

    setUserData({
      username,
      xp: 0,
      level: 1
    });
  };

  const login = async (email: string, password: string) => {
    const res = await apiLogin(email, password);

    const uid = res.data.uid;

    setCurrentUser({ uid, email });
    localStorage.setItem("uid", uid);

    // TEMP MOCK DATA
    const username = email.split("@")[0];
    localStorage.setItem("username", username);

    setUserData({
      username,
      xp: 250,
      level: 3
    });
  };

  const logout = () => {
    setCurrentUser(null);
    setUserData(null);
    localStorage.removeItem("uid");
    localStorage.removeItem("username");
  };

  return (
    <AuthContext.Provider value={{ currentUser, userData, loading, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
