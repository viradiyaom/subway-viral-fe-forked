import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Store, AlertCircle } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../store";
import {
  setCredentials,
  setLoading,
  setError,
  setAuthenticated,
} from "../../store/slices/authSlice";
import { authApi } from "../../config/apiCall";
import type { LoginCredentials, LoginResponse } from "../../utils/types";
import { ROUTES } from "../../utils/routes";
import { ENV } from "../../utils/constants";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";

const LoginPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, error, isAuthenticated } = useAppSelector(
    ({ auth }) => auth,
  );
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [tempCredentials, setTempCredentials] =
    useState<LoginCredentials | null>(null);

  // ─── react-hook-form ────────────────────────────────────────────────────────
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<any>({
    defaultValues: {
      email: "admin@org.com",
      password: "Admin@1234",
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onTouched",
  });

  const newPassword = watch("newPassword");

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isChangingPassword) {
      navigate(ROUTES.DASHBOARD, { replace: true });
    }
  }, [isAuthenticated, isChangingPassword, navigate]);

  // Reset error on unmount
  useEffect(() => {
    return () => {
      dispatch(setError(null));
    };
  }, [dispatch]);

  // ─── Submit handler ──────────────────────────────────────────────────────────
  const onSubmit = (data: any) => {
    dispatch(setLoading(true));
    dispatch(setError(null));

    if (!isChangingPassword) {
      setTempCredentials({ email: data.email, password: data.password });
      authApi
        .login({ email: data.email, password: data.password })
        .then(({ data }) => {
          dispatch(setCredentials({ token: data.token, user: data.user }));
          if (data.must_change_password) {
            setIsChangingPassword(true);
            reset({ newPassword: "", confirmPassword: "" });
          } else {
            navigate(ROUTES.DASHBOARD, { replace: true });
            dispatch(setAuthenticated(true));
          }
        })
        .catch((err: { response?: { data?: { message?: string } } }) => {
          const message =
            err.response?.data?.message ?? "Login failed. Please try again.";
          dispatch(setError(message));
        })
        .finally(() => {
          dispatch(setLoading(false));
        });
    } else {
      // Step 2: Password Change
      authApi
        .changePassword({
          currentPassword: tempCredentials?.password || "",
          newPassword: data.newPassword,
        })
        .then(() => {
          dispatch(setAuthenticated(true));
          navigate(ROUTES.DASHBOARD, { replace: true });
        })
        .catch((err: { response?: { data?: { message?: string } } }) => {
          const message =
            err.response?.data?.message ?? "Failed to change password.";
          dispatch(setError(message));
        })
        .finally(() => {
          dispatch(setLoading(false));
        });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      {/* Decorative background blobs */}
      <div
        className="fixed inset-0 pointer-events-none overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-accent-100/50 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary-100/40 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md z-10 animate-fade-in-up">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-900 text-white mb-4 shadow-lg">
            <Store size={26} />
          </div>
          <h1 className="text-2xl font-bold text-primary-900">
            {ENV.APP_NAME}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {isChangingPassword
              ? "Update your password"
              : "Sign in to your account to continue"}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-8">
          <h2 className="text-xl font-bold text-primary-800 mb-6">
            {isChangingPassword ? "Security Update" : "Welcome back"}
          </h2>

          {/* API-level error */}
          {error && (
            <div className="flex items-start gap-3 p-3.5 rounded-lg bg-danger-50 border border-danger-100 text-danger-600 text-sm mb-5 animate-fade-in">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="space-y-4"
          >
            {!isChangingPassword ? (
              <>
                {/* Email */}
                <Input
                  id="email"
                  label="Email address"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  leftIcon={<Mail size={15} />}
                  error={errors.email?.message}
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Enter a valid email address",
                    },
                  })}
                />

                {/* Password */}
                <Input
                  id="password"
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  leftIcon={<Lock size={15} />}
                  error={errors.password?.message}
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  })}
                />
              </>
            ) : (
              <>
                <p className="text-xs text-slate-500 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  Your account requires a mandatory password change before you
                  can continue.
                </p>
                {/* New Password */}
                <Input
                  id="newPassword"
                  label="New Password"
                  type="password"
                  placeholder="••••••••"
                  leftIcon={<Lock size={15} />}
                  error={errors.newPassword?.message}
                  {...register("newPassword", {
                    required: "New password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  })}
                />

                {/* Confirm Password */}
                <Input
                  id="confirmPassword"
                  label="Confirm New Password"
                  type="password"
                  placeholder="••••••••"
                  leftIcon={<Lock size={15} />}
                  error={errors.confirmPassword?.message}
                  {...register("confirmPassword", {
                    required: "Please confirm your password",
                    validate: (value: string) =>
                      value === newPassword || "Passwords do not match",
                  })}
                />
              </>
            )}

            <div className="pt-2">
              <Button
                type="submit"
                fullWidth
                isLoading={isLoading}
                variant="primary"
              >
                {isChangingPassword ? "Update Password" : "Sign in"}
              </Button>
            </div>

            {isChangingPassword && (
              <button
                type="button"
                onClick={() => {
                  setIsChangingPassword(false);
                  reset();
                }}
                className="w-full text-center text-xs text-slate-400 hover:text-slate-600 transition-colors mt-2"
              >
                Go back to login
              </button>
            )}
          </form>

          <p className="text-center text-xs text-slate-400 mt-6">
            By signing in, you agree to the terms of service.
          </p>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          {ENV.APP_NAME} &copy; {new Date().getFullYear()} &mdash; v
          {ENV.APP_VERSION}
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
