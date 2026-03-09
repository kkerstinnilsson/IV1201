import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FcOk } from "react-icons/fc";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "../../validation/authSchemas";

/**
 * Login page
 *
 * @param {boolean} loading - Loading state.
 * @param {(payload: {username: string, password: string}) => Promise<void>} onLogin - Callback to login.
 */
export default function LoginPage({ loading, onLogin }) {
  const location = useLocation();
  const [serverError, setServerError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
    mode: "onSubmit",
  });

  const disabled = loading || isSubmitting;

  async function onSubmit(data) {
    setServerError(null);
    try {
      await onLogin(data);
    } catch (err) {
      setServerError(err.message ?? "Login failed");
    }
  }

  return (
    <div className="max-w-sm mx-auto">
      <div className="container">
        <h1 className="mb-4">Login</h1>
        <div>
          {location.state?.registered && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
              <FcOk className="text-xl" />
              <span>Account created successfully.</span>
            </div>
          )}
          {location.state?.claimed && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
              <FcOk className="text-xl" />
              <span>Account claimed successfully.</span>
            </div>
          )}
        </div>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              autoComplete="username"
              {...register("username")}
            />
            {errors.username && (
              <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              autoComplete="current-password"
              type="password"
              {...register("password")}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>
          {serverError && (
            <p className="error-box">{serverError}</p>
          )}
          <button
            type="submit"
            disabled={disabled}
            className="btn-primary w-full"
          >
            {disabled ? "Logging in…" : "Login"}
          </button>
        </form>
        <div className="mt-6 text-center">
          <p>No account?{" "}
            <Link to="/register" className="text-blue-600 hover:underline font-medium">
              Register here!
            </Link>
          </p>
          <p className="mt-2">
            Old account?{" "}
            <Link to="/claim/request" className="text-blue-600 hover:underline font-medium">
              Set username/password
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}