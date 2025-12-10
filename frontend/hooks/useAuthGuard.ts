// hooks/useAuthGuard.ts
"use client"

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authService } from '@/lib/api';

export function useAuthGuard() {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      // Public routes - auth check yapma
      const publicRoutes = ['/login', '/register'];
      const isPublicRoute = publicRoutes.includes(pathname);

      const token = authService.getToken();
      const user = authService.getUser();

      // Eğer public route'daysa ve kullanıcı giriş yapmışsa
      if (isPublicRoute && token && user) {
        // Role'e göre yönlendir
        const redirectPath = getRoleBasedPath(user.role);
        router.replace(redirectPath);
        setIsChecking(false);
        return;
      }

      // Eğer protected route'daysa ve token yoksa
      if (!isPublicRoute && !token) {
        router.replace('/login');
        setIsChecking(false);
        return;
      }

      // Token varsa backend'den doğrula
      if (token && !isPublicRoute) {
        const result = await authService.checkToken();
        
        if (!result.valid) {
          // Token geçersiz - logout ve login'e yönlendir
          authService.logout();
          router.replace('/login');
          setIsChecking(false);
          return;
        }

        // Role bazlı erişim kontrolü ***
        if (user) {
          const hasAccess = checkRoleAccess(pathname, user.role);
          
          if (!hasAccess) {
            // Kullanıcının yetkisi yok - kendi sayfasına yönlendir
            const redirectPath = getRoleBasedPath(user.role);
            router.replace(redirectPath);
            setIsChecking(false);
            return;
          }
        }
      }

      setIsChecking(false);
    };

    checkAuth();
  }, [pathname, router]);

  return { isChecking };
}

// Role'e göre yönlendirme path'i belirle
function getRoleBasedPath(role: string): string {
  switch (role) {
    case 'ADMIN':
      return '/admin';
    case 'OFFICER':
      return '/officer';
    case 'STUDENT':
      return '/student';
    default:
      return '/student';
  }
}

// Role bazlı erişim kontrolü
function checkRoleAccess(pathname: string, userRole: string): boolean {
  // Admin tüm sayfalara erişebilir
  if (userRole === 'ADMIN') {
    return pathname.startsWith('/admin') || 
           pathname.startsWith('/officer') || 
           pathname.startsWith('/student') ||
           pathname === '/profile';
  }

  // Officer sadece kendi sayfalarına ve profile'a erişebilir
  if (userRole === 'OFFICER') {
    return pathname.startsWith('/officer') || pathname === '/profile';
  }

  // Student sadece kendi sayfalarına ve profile'a erişebilir
  if (userRole === 'STUDENT') {
    return pathname.startsWith('/student') || pathname === '/profile';
  }

  return false;
}