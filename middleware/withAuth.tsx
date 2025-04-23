'use client';

import { useEffect, ReactNode, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { checkAuthStatus } from '@/store/slices/authSlice';
import { UserRole } from '@/types/user';

interface WithAuthProps {
  children: ReactNode;
  requiredRoles?: UserRole[];
}

export default function WithAuth({ 
  children, 
  requiredRoles = [UserRole.ADMIN, UserRole.EDITOR, UserRole.AUTHOR] 
}: WithAuthProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      await dispatch(checkAuthStatus());
      setAuthChecked(true);
    };
    
    checkAuth();
  }, [dispatch]);

  useEffect(() => {
    if (authChecked) {
      if (!isAuthenticated || !user) {
        router.push('/admin/login');
        return;
      }

      if (user && !requiredRoles.includes(user.role)) {
        router.push('/admin/unauthorized');
        return;
      }
    }
  }, [authChecked, isAuthenticated, user, router, requiredRoles]);

  // Toujours afficher le loader pendant la vérification ou la redirection
  // if (loading || !authChecked || !isAuthenticated || (user && !requiredRoles.includes(user.role))) {
  //   return <Loader />;
  // }

  // User is authenticated and has required role
  return <>{children}</>;
}