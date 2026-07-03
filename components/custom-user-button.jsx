"use client";

import React from "react";
import { UserButton as ClerkUserButton } from "@clerk/nextjs";
import { useClerk } from "@clerk/nextjs";
import { useSignOut } from "@/hooks/use-sign-out";

// Custom UserButton that logs sign out to database before signing out
export function CustomUserButton(props) {
  const { signOut: clerkSignOut } = useClerk();
  const { handleSignOut } = useSignOut();
  const [isSigningOut, setIsSigningOut] = React.useState(false);

  const handleCustomSignOut = async () => {
    try {
      setIsSigningOut(true);
      // Log the sign out to our database
      await handleSignOut();
      // Then sign out from Clerk
      await clerkSignOut({ redirectUrl: "/" });
    } catch (error) {
      console.error("Error during sign out:", error);
      setIsSigningOut(false);
    }
  };

  return (
    <ClerkUserButton
      {...props}
      afterSignOutUrl="/"
      signInForceRedirectUrl="/dashboard"
    />
  );
}
