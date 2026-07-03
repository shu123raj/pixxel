import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useStoreUser } from "./use-store-user";

/**
 * Hook for managing user authentication with Convex
 * Handles sign-in, sign-up, and current user retrieval
 */
export const useAuthUser = () => {
  const { isSignedIn } = useAuth();
  const [isReady, setIsReady] = useState(false);

  // Use the standard Convex + Clerk store user hook
  const { isAuthenticated, isLoading: storeLoading } = useStoreUser();

  // Queries
  const currentUser = useQuery(api.users.getCurrentUser, isAuthenticated ? {} : "skip");

  // Mutations
  const signUpMutation = useMutation(api.users.signUp);
  const updateProfileMutation = useMutation(api.users.updateUserProfile);
  const updatePlanMutation = useMutation(api.users.updateUserPlan);

  // Set ready when user is authenticated and current user data is loaded
  useEffect(() => {
    if (isAuthenticated && currentUser !== undefined) {
      setIsReady(true);
    }
  }, [isAuthenticated, currentUser]);

  return {
    currentUser,
    isReady,
    isSignedIn,
    isAuthenticated,
    signIn: () => {
      // Sign-in is handled automatically by useStoreUser hook
      console.log("Sign-in handled by useStoreUser");
    },
    signUp: (userData) =>
      signUpMutation({
        name: userData.name,
        email: userData.email,
        imageUrl: userData.imageUrl,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        dateOfBirth: userData.dateOfBirth,
        streetAddress: userData.streetAddress,
        city: userData.city,
        state: userData.state,
        zipCode: userData.zipCode,
        country: userData.country,
        company: userData.company,
        jobTitle: userData.jobTitle,
        newsletter: userData.newsletter,
        marketingEmails: userData.marketingEmails,
      }),
    updateProfile: (profileData) =>
      updateProfileMutation({
        name: profileData.name,
        imageUrl: profileData.imageUrl,
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        phone: profileData.phone,
        dateOfBirth: profileData.dateOfBirth,
        streetAddress: profileData.streetAddress,
        city: profileData.city,
        state: profileData.state,
        zipCode: profileData.zipCode,
        country: profileData.country,
        company: profileData.company,
        jobTitle: profileData.jobTitle,
        newsletter: profileData.newsletter,
        marketingEmails: profileData.marketingEmails,
      }),
    updatePlan: (plan) => updatePlanMutation({ plan }),
  };
};

/**
 * Simple hook to get the current authenticated user
 */
export const useCurrentUser = () => {
  const { isSignedIn } = useAuth();
  const currentUser = useQuery(api.users.getCurrentUser, isSignedIn ? {} : "skip");

  return currentUser;
};

/**
 * Hook to manage user sign-in with Convex
 */
export const useSignIn = () => {
  const signInMutation = useMutation(api.users.signIn);

  const signIn = async () => {
    try {
      const user = await signInMutation({});
      return { success: true, user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  return { signIn };
};

/**
 * Hook to manage user sign-up with Convex
 */
export const useSignUp = () => {
  const signUpMutation = useMutation(api.users.signUp);

  const signUp = async (userData) => {
    try {
      const user = await signUpMutation({
        name: userData.name,
        email: userData.email,
        imageUrl: userData.imageUrl,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        dateOfBirth: userData.dateOfBirth,
        streetAddress: userData.streetAddress,
        city: userData.city,
        state: userData.state,
        zipCode: userData.zipCode,
        country: userData.country,
        company: userData.company,
        jobTitle: userData.jobTitle,
        newsletter: userData.newsletter,
        marketingEmails: userData.marketingEmails,
      });
      return { success: true, user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  return { signUp };
};
