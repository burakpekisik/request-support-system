"use client"

import { useState, useCallback, useEffect } from "react";
import { authService } from "@/lib/api";
import type { LoginRequest, RegisterRequest } from "@/lib/api/types";
import { useRouter } from "next/navigation";

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isAuth, setIsAuth] = useState(false);
  const router = useRouter();

  // Client-side only initialization
  useEffect(() => {
    setUser(authService.getUser());
    setIsAuth(authService.isAuthenticated());
  }, []);

  const handleLogin = useCallback(
    async (tcNumber: string, password: string) => {
      setLoading(true);
      setError(null);
      try {
        const loginData: LoginRequest = { tcNumber, password };
        const userData = await authService.login(loginData);
        
        setUser(userData);
        setIsAuth(true);
        
        // Redirect based on role
        if (userData.role === 'ADMIN') {
          router.push('/admin');
        } else if (userData.role === 'OFFICER') {
          router.push('/officer');
        } else {
          router.push('/student');
        }
        
        return userData;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Login failed";
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
        const registerData: RegisterRequest = {
          tcNumber,
          firstName,
          lastName,
          email,
          password,
          phoneNumber,
        };
        
        const userData = await authService.register(registerData);
        
        setUser(userData);
        setIsAuth(true);
        
        // Redirect based on role
        if (userData.role === 'ADMIN') {
          router.push('/admin');
        } else if (userData.role === 'OFFICER') {
          router.push('/officer');
        } else {
          router.push('/student');
        }
        
        return userData;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Registration failed";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  const handleLogout = useCallback(() => {
    authService.logout();
    setUser(null);
    setIsAuth(false);
    router.push("/login");
  }, [router]);

  return {
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    loading,
    error,
    user,
    isAuth,
  };
}