// Centralized route path definitions grouped by access level
export const ROUTES = {
  // Public routes
  LOGIN: "/login",
  FORCE_PASSWORD: "/change-password",

  // Role-based root paths
  ROOT: {
    DASHBOARD: "/root/dashboard",
  },
  ADMIN: {
    DASHBOARD: "/admin/dashboard",
    SHOPS: {
      LIST: "/admin/shops",
      CREATE: "/admin/shops/create",
      EDIT: (id: string) => `/admin/shops/${id}/edit`,
      DETAILS: (id: string) => `/admin/shops/${id}`,
    },
    USERS: {
      LIST: "/admin/users",
      CREATE: "/admin/users/create",
      EDIT: (id: string) => `/admin/users/${id}/edit`,
      DETAILS: (id: string) => `/admin/users/${id}`,
    },
  },
  MANAGER: {
    DASHBOARD: "/manager/dashboard",
  },
  SUB_MANAGER: {
    DASHBOARD: "/sub-manager/dashboard",
  },
  STAFF: {
    DASHBOARD: "/staff/dashboard",
    ATTENDANCE: "/staff/attendance",
  },
} as const;

export type RouteValue = (typeof ROUTES)[keyof typeof ROUTES];
