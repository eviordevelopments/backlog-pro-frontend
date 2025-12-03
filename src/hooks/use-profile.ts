import { useAuth } from "@/context/AuthContext";
import { UserProfile, UpdateProfileInput } from "@/api/user/profile";

export const useProfile = () => {
  const { getProfile, updateProfile, updateAvatar } = useAuth();

  return {
    getProfile,
    updateProfile,
    updateAvatar,
  };
};
