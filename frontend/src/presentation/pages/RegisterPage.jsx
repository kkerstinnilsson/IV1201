import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema} from "../../validation/authSchemas";
import { useState } from "react";

/**
 * Registration page
 *
 * @param {boolean} loading - Loading state.
 * @param {(formData: Object) => Promise<void>} onRegister - Callback to register with validated form data.
 */
export default function RegisterPage({ loading, onRegister }) {
  const [serverError, setServerError] = useState(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      surname: "",
      email: "",
      pnr: "",
      username: "",
      password: "",
    },
    mode: "onSubmit",
  });

  const disabled = loading || isSubmitting;

  async function onFormSubmit(data) {
    setServerError(null);
    try {
      await onRegister(data);
    } catch (err) {
      setServerError(err.message ?? "Registration failed");
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="container">
        <h1 className="mb-6">Register</h1>
        <form onSubmit={handleSubmit(onFormSubmit)} noValidate className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name">Name</label>
              <input id="name" {...register("name")} />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="surname">Surname</label>
              <input id="surname" {...register("surname")} />
              {errors.surname && (
                <p className="mt-1 text-sm text-red-600">{errors.surname.message}</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="email">Email</label>
              <input type="email" id="email" autoComplete="email" {...register("email")} />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="pnr">Personal Number</label>
              <input id="pnr" placeholder="YYYYMMDD-XXXX" inputMode="numeric" {...register("pnr")} />
              {errors.pnr && (
                <p className="mt-1 text-sm text-red-600">{errors.pnr.message}</p>
              )}
            </div>
          </div>
          <div>
            <label htmlFor="username">Username</label>
            <input id="username" autoComplete="username" {...register("username")} />
            {errors.username && (
              <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="password">Password</label>
            <input id="password" type="password" autoComplete="new-password" {...register("password")} />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>
          {serverError && <p className="error-box mb-2">{serverError}</p>}
          <button type="submit" disabled={disabled} className="btn-primary w-full">
            {disabled ? "Registering..." : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
}