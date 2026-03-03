import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema} from "../../validation/authSchemas";

/**
 * Registration page
 *
 * @param {boolean} loading - Loading state.
 * @param {string|null} error - Error message returned from the backend.
 * @param {(formData:Object) => void} onRegister - Callback to register with validated form data.
 */
export default function RegisterPage({ loading, error, onRegister }) {
  // Initialize react hook form and connect it to the Zod validation schema
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

  return (
    <div className="max-w-lg mx-auto">
      <div className="container">
        <h1 className="mb-6">Register</h1>

        {error && <p className="error-box mb-4">{error}</p>}

        <form onSubmit={handleSubmit(onRegister)} noValidate className="space-y-4">
          {/* Row 1 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label>Name</label>
              <input {...register("name")} />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label>Surname</label>
              <input {...register("surname")} />
              {errors.surname && (
                <p className="mt-1 text-sm text-red-600">{errors.surname.message}</p>
              )}
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label>Email</label>
              <input type="email" autoComplete="email" {...register("email")} />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label>Personal Number</label>
              <input
                placeholder="YYYYMMDD-XXXX"
                inputMode="numeric"
                {...register("pnr")}
              />
              {errors.pnr && (
                <p className="mt-1 text-sm text-red-600">{errors.pnr.message}</p>
              )}
            </div>
          </div>

          {/* Username */}
          <div>
            <label>Username</label>
            <input autoComplete="username" {...register("username")} />
            {errors.username && (
              <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label>Password</label>
            <input type="password" autoComplete="new-password" {...register("password")} />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          <button type="submit" disabled={disabled} className="btn-primary w-full">
            {disabled ? "Registering..." : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
}