import { useState, useCallback } from "react";
import { login, logout, register, isAuthenticated, getStoredUser } from "@/lib/api";
import { useRouter } from "next/router";

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState(getStoredUser());
  const [isAuth, setIsAuth] = useState(isAuthenticated());
  const router = useRouter();

  const handleLogin = useCallback(
    async (tcNumber: string, password: string) => {
      setLoading(true);
      setError(null);
      try {
        const userData = await login(tcNumber, password);
        setUser(userData);
        setIsAuth(true);
        router.push("/dashboard");
        return userData;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Giriş başarısız";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  const handleRegister = useCallback(
    async (
      tcNumber: string,
      firstName: string,
      lastName: string,
      email: string,
      password: string,
      phoneNumber: string
    ) => {
      setLoading(true);
      setError(null);
      try {
        const userData = await register(tcNumber, firstName, lastName, email, password, phoneNumber);
        setUser(userData);
        setIsAuth(true);
        router.push("/dashboard");
        return userData;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Kayıt başarısız";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  const handleLogout = useCallback(() => {
    logout();
    setUser(null);
    setIsAuth(false);
    router.push("/login");
  }, [router]);

  return {
    user,
    isAuth,
    loading,
    error,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
  };
}