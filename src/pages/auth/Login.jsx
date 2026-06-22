import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "../../context/AuthContext";
import Spinner from "../../components/ui/spinner";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

const roleHome = {
  admin: "/dashboard",
  teacher: "/dashboard",
  student: "/dashboard",
};

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (formData) => {
    setServerError(null);
    try {
      const user = await login(formData.email, formData.password);
      const redirectTo =
        location.state?.from?.pathname || roleHome[user.role] || "/dashboard";
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setServerError(err.message || "Login failed. Check your credentials.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h1 className="text-lg font-semibold text-blue-900 mb-1">
          MUKURU OUTREACH ACADEMY
        </h1>
        <p className="text-sm text-gray-500 mb-5">Sign in to continue</p>

        {serverError && (
          <div className="mb-4 px-3 py-2 rounded-md bg-red-50 border border-red-200 text-sm text-red-700">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Email
            </label>
            <input
              type="email"
              autoComplete="email"
              className="input-field"
              {...register("email")}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Password
            </label>
            <input
              type="password"
              autoComplete="current-password"
              className="input-field"
              {...register("password")}
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-600">
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full justify-center mt-2"
          >
            {isSubmitting ? <Spinner size="sm" /> : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
