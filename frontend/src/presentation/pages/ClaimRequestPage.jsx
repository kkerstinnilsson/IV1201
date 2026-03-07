
import { claimRequestSchema } from "../../validation/authSchemas";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";

/**
 * Presentation page for requesting an account-claim link.
 *
 * @param {boolean} loading - Loading state.
 * @param {(payload: {email: string}) => Promise<void>} onSubmit - Submit handler.
 * @param {boolean} submitted - Whether the request has been submitted.
 */
export default function ClaimRequestPage({ loading, onSubmit, submitted }) {
  const [serverError, setServerError] = useState(null);
  const {
      register,
      handleSubmit,
      formState: { errors, isSubmitting },
    } = useForm({
      resolver: zodResolver(claimRequestSchema),
      defaultValues: { email: "" },
      mode: "onSubmit",
    });

  const disabled = loading || isSubmitting;

  async function onFormSubmit(data) {
    setServerError(null);
    try {
      await onSubmit(data);
    } catch (err) {
      setServerError(err.message ?? "Request failed");
    }
  }

  return (
    <div className="max-w-sm mx-auto">
      <div className="container">
        <h1 className="mb-4">Set username/password</h1>
        {!submitted ? (
          <>
            <p className="mb-4 text-sm opacity-80">
              Enter your email. If an account exists, we will send a link to set your username and password.
            </p>
            <form onSubmit={handleSubmit(onFormSubmit)} noValidate className="space-y-4">
              <div className="space-y-1">
                <label htmlFor="email">Email</label>
                <input type="email" id="email" autoComplete="email" {...register("email")} />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>
              {serverError && <p className="error-box">{serverError}</p>}
              <button type="submit" disabled={disabled} className="btn-primary w-full">
                {loading ? "Sending…" : "Send link"}
              </button>
            </form>
          </>
        ) : (
          <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg">
            <p className="font-medium">Check your email</p>
            <p className="text-sm opacity-80 mt-1">
              If an account exists for this email address, you will receive a link to set your username and password.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}