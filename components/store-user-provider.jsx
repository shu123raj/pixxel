// File Path: components/store-user-provider.jsx
"use client";

import { useStoreUser } from "@/hooks/use-store-user";

export function StoreUserProvider({ children }) {
  useStoreUser(); 
  return <>{children}</>;
}