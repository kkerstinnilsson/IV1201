import { claimAccountSchema } from "../../validation/authSchemas";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

/**
 * Presentation page for the claim account form.
 *
 * @param {boolean} loading - Loading state.
 * @param {string|null} error - Error message returned from the backend.
 * @param {(payload: {username: string, password: string}) => void} onSubmit - Submit handler.
 */
export default function ClaimAccountPage({ loading, error, onSubmit }) {
  
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

  return (
    <div className="max-w-sm mx-auto">
      <div className="container">
        <h1 className="mb-4">Choose username & password</h1>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="username">Username</label>
            <input id="username" autoComplete="username" {...register("username")}/>
              {errors.username && (
               <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" autoComplete="new-password"{...register("password")} />
              {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          <button type="submit" disabled={disabled} className="btn-primary w-full">
            {loading ? "Saving…" : "Save"}
          </button>
        </form>

        {error && <p className="error-box mt-4">{error}</p>}
      </div>
    </div>
  );
}