import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

// Hook to handle sign out with database tracking
export function useSignOut() {
  const { user } = useUser();
  const signOutMutation = useMutation(api.users.signOut);
  const [signInTime, setSignInTime] = useState(null);

  // Track sign-in time in localStorage when user logs in
  useEffect(() => {
    if (user?.id) {
      const storedTime = localStorage.getItem(`signIn_${user.id}`);
      if (!storedTime) {
        const now = Date.now();
        localStorage.setItem(`signIn_${user.id}`, now.toString());
        setSignInTime(now);
      } else {
        setSignInTime(parseInt(storedTime));
      }
    }
  }, [user?.id]);

  // Function to handle sign out - calls the mutation then signs out
  const handleSignOut = async () => {
    try {
      // Call the Convex mutation to log sign out time and session duration
      await signOutMutation({
        signInTime: signInTime,
      });

      // Clean up localStorage
      if (user?.id) {
        localStorage.removeItem(`signIn_${user.id}`);
      }
    } catch (error) {
      console.error("Error logging sign out:", error);
      // Still allow sign out even if logging fails
      if (user?.id) {
        localStorage.removeItem(`signIn_${user.id}`);
      }
    }
  };

  return {
    handleSignOut,
    signInTime,
  };
}
