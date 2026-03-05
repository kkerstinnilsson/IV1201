/**
 * Container component responsible for handling
 * registration logic, API communication and navigation.
 * 
 */

import RegisterPage from "../presentation/pages/RegisterPage";
import { useState } from "react";
import { register } from "../services/authService";
import { useNavigate } from "react-router-dom";

export default function RegisterContainer({ onRegisterSuccess }) {

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    async function handleRegister(formData) {
      setError(null);
      setLoading(true);
  
      try {
        const data = await register(
            formData.name,
            formData.surname,
            formData.email,
            formData.pnr,
            formData.username,
            formData.password
        );

        onRegisterSuccess?.(data.user);
        navigate("/login", { state: { registered: true } });
        } catch (err) {
        setError(err?.message ?? 'Registration failed');
        } finally {
        setLoading(false);
      }
    }

    return(
        <RegisterPage
            loading={loading}
            error={error}
            onRegister={handleRegister}
        />
    );
}