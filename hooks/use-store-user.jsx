import { useUser } from "@clerk/nextjs";
import { useConvexAuth } from "convex/react";
import { useEffect, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

export function useStoreUser() {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const { user } = useUser();
  const [userId, setUserId] = useState(null);
  const storeUser = useMutation(api.users.store);

  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;

    let isMounted = true; 

    async function createUser() {
      try {
        let clientDetails = {
          userAgent: navigator.userAgent,
          imageUrl: user.imageUrl,
        };

        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 2000); 

          const res = await fetch("https://ipapi.co/json/", { signal: controller.signal });
          clearTimeout(timeoutId);

          if (res.ok) {
            const data = await res.json();
            clientDetails.ipAddress = data.ip;
            clientDetails.location = `${data.city}, ${data.country_name}`;
          }
        } catch (error) {
          console.warn("IP fetch skipped");
        }

        if (isMounted) {
          const id = await storeUser(clientDetails);
          if (isMounted) setUserId(id);
        }
      } catch (error) {
        console.error("Error storing user:", error);
      }
    }

    createUser();

    return () => { isMounted = false; };
  }, [isAuthenticated, user?.id, user?.imageUrl, storeUser]); 

  return {
    isLoading: isLoading || (isAuthenticated && userId === null),
    isAuthenticated: isAuthenticated && userId !== null,
  };
}
