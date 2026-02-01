// Hook for PWA update detection

import { useState, useEffect, useCallback } from "react";
import { registerSW } from "virtual:pwa-register";

export function usePWAUpdate() {
  const [needsUpdate, setNeedsUpdate] = useState(false);
  const [updateSW, setUpdateSW] = useState<(() => Promise<void>) | null>(null);

  useEffect(() => {
    const update = registerSW({
      onNeedRefresh() {
        setNeedsUpdate(true);
      },
      onOfflineReady() {
        console.log("App ready to work offline");
      },
    });

    setUpdateSW(() => update);
  }, []);

  const updateApp = useCallback(async () => {
    if (updateSW) {
      await updateSW();
    }
  }, [updateSW]);

  return { needsUpdate, updateApp };
}
