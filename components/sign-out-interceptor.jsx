"use client";

import { useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function SignOutInterceptor() {
  const { user, isSignedIn, isLoaded } = useUser();
  const logSignOut = useMutation(api.users.logSignOutBackground);
  
  const prevUserId = useRef(null);
  const signInTime = useRef(null);

  useEffect(() => {
    if (isLoaded && isSignedIn && user?.id) {
       prevUserId.current = user.id; 
       
       const storedTime = localStorage.getItem(`signIn_${user.id}`);
       if (!storedTime) {
         const now = Date.now();
         localStorage.setItem(`signIn_${user.id}`, now.toString());
         signInTime.current = now;
       } else {
         signInTime.current = parseInt(storedTime);
       }
    }
  }, [isLoaded, isSignedIn, user?.id]);

  useEffect(() => {
    if (isLoaded && !isSignedIn && prevUserId.current !== null) {
       const loggedOutUserId = prevUserId.current;
       const sessionStart = signInTime.current;
       
       logSignOut({ 
         clerkUserId: loggedOutUserId, 
         signInTime: sessionStart || Date.now() 
       }).catch(console.error);

       localStorage.removeItem(`signIn_${loggedOutUserId}`);
       prevUserId.current = null;
    }
  }, [isLoaded, isSignedIn, logSignOut]);

  return null; 
}