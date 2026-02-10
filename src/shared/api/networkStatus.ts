// Network status hook

import { useState, useEffect } from "react";
import { useAuth } from "@/app/auth";

export interface NetworkStatus {
  isOnline: boolean;
  isAuthenticated: boolean;
  canSync: boolean;
}

// Hook to track network and auth status
export function useNetworkStatus(): NetworkStatus {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return {
    isOnline,
    isAuthenticated,
    canSync: isOnline && isAuthenticated,
  };
}
