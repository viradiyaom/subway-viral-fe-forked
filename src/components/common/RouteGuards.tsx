import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAppSelector } from "../../store";
import type { RootState } from "../../store";
import { ROUTES } from "../../utils/routes";
import { UserRole } from "../../utils/types";

interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * Redirects unauthenticated users to /login.
 * Authenticated users are passed through to the child component.
 */
export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const isAuthenticated = useAppSelector(
    (s: RootState) => s.auth.isAuthenticated,
  );
  return isAuthenticated ? (
    <>{children}</>
  ) : (
    <Navigate to={ROUTES.LOGIN} replace />
  );
};

/**
 * Redirects authenticated users away from public pages (e.g. Login) to Dashboard.
 */
export const PublicRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAppSelector((s: RootState) => s.auth);

  if (!isAuthenticated) return <>{children}</>;

  const role = user?.role.role_name;

  if (role === UserRole.ROOT)
    return <Navigate to={ROUTES.ROOT.DASHBOARD} replace />;
  if (role === UserRole.ADMIN)
    return <Navigate to={ROUTES.ADMIN.DASHBOARD} replace />;
  if (role === UserRole.MANAGER)
    return <Navigate to={ROUTES.MANAGER.DASHBOARD} replace />;
  if (role === UserRole.SUB_MANAGER)
    return <Navigate to={ROUTES.SUB_MANAGER.DASHBOARD} replace />;
  if (role === UserRole.STAFF)
    return <Navigate to={ROUTES.STAFF.DASHBOARD} replace />;

  return <Navigate to={ROUTES.LOGIN} replace />;
};
