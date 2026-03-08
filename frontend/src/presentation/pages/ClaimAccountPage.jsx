import { claimAccountSchema } from "../../validation/authSchemas";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";

/**
 * Presentation page for the claim account form.
 *
 * @param {boolean} loading - Loading state.
 * @param {(payload: {username: string, password: string}) => Promise<void>} onSubmit - Submit handler.
 */
export default function ClaimAccountPage({ loading, onSubmit }) {
  const [serverError, setServerError] = useState(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(claimAccountSchema),
    defaultValues: { username: "", password: "" },
    mode: "onSubmit",
  });

  const disabled = loading || isSubmitting;

  async function onFormSubmit(data) {
    setServerError(null);
    try {
      await onSubmit(data);
    } catch (err) {
      setServerError(err.message ?? "Claim failed");
    }
  }
  return (
    <div className="max-w-sm mx-auto">
      <div className="container">
        <h1 className="mb-4">Choose username & password</h1>
        <form onSubmit={handleSubmit(onFormSubmit)} noValidate className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="username">Username</label>
            <input id="username" autoComplete="username" {...register("username")} />
            {errors.username && (
              <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" autoComplete="new-password" {...register("password")} />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>
          {serverError && <p className="error-box">{serverError}</p>}
          <button type="submit" disabled={disabled} className="btn-primary w-full">
            {loading ? "Saving…" : "Save"}
          </button>
        </form>
      </div>
    </div>
  );
}