import { useEffect } from 'react';
import { useRouter } from 'next/router';

import { useAuthContext } from './AppContext';
import FullPageLoader from './PageLoader';

export default function PrivateRoute({ protectedRoutes, children }) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthContext();

  const pathIsProtected = protectedRoutes.indexOf(router.pathname) !== -1;

  useEffect(() => {
    if (!isLoading && !isAuthenticated && pathIsProtected) {
      // Redirect route, you can point this to /login
      console.log(
        'isLoading, isAuthenticated, pathIsProtected',
        isLoading,
        isAuthenticated,
        pathIsProtected
      );
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, pathIsProtected]);

  if ((isLoading || !isAuthenticated) && pathIsProtected) {
    return <FullPageLoader />;
  }

  return children;
}
