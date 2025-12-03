import { useAuth } from "@/context/AuthContext";

export const usePasswordReset = () => {
  const { requestPasswordReset } = useAuth();

  return {
    requestPasswordReset,
  };
};
