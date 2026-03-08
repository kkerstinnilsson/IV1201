/**
 * Container component for managing account claim flow state.
 */
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ClaimRequestPage from "../presentation/pages/ClaimRequestPage";
import ClaimAccountPage from "../presentation/pages/ClaimAccountPage";
import { requestAccountToken, claimAccountToken } from "../services/authService";

export default function ClaimContainer() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const mode = token ? "claim" : "request";

  async function handleRequest({ email }) {
    setLoading(true);
    try {
      await requestAccountToken(email);
    } catch {
      //
    } finally {
      setSubmitted(true);
      setLoading(false);
    }
  }

  async function handleClaim({ username, password }) {
    setLoading(true);
    try {
      await claimAccountToken(token, username, password);
      navigate("/login", { state: { claimed: true } });
    } finally {
      setLoading(false);
    }
  }

  if (mode === "request") {
    return (
      <ClaimRequestPage
        loading={loading}
        submitted={submitted}
        onSubmit={handleRequest}
      />
    );
  }

  return (
    <ClaimAccountPage
      loading={loading}
      onSubmit={handleClaim}
    />
  );
}