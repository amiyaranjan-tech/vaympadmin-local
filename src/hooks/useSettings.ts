import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import settingsService from "@/services/settings.service";

import type { PlatformSettings, UpdateSettingsRequest } from "@/types/settings";

export default function useSettings() {
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const data = await settingsService.get();

        if (!cancelled) setSettings(data);
      } catch (error) {
        if (!cancelled) {
          const message =
            error instanceof Error ? error.message : "Failed to load settings";

          toast.error(message);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const updateSettings = useCallback(async (payload: UpdateSettingsRequest) => {
    try {
      const data = await settingsService.update(payload);

      setSettings(data);
      toast.success("Business settings saved");

      return data;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to save settings";

      toast.error(message);
      throw error;
    }
  }, []);

  return { settings, loading, updateSettings };
}
