"use client";

import { useUserTracking } from "@/lib/supabase/hooks";
import UsernameSetup from "@/components/UsernameSetup";
import DisconnectedScreen from "@/components/DisconnectedScreen";
import { createContext, useContext, ReactNode, useMemo } from "react";
import { usePathname } from "next/navigation";

interface TrackingContextValue {
  userId: string | null;
  username: string | null;
  isOnline: boolean;
}

const TrackingContext = createContext<TrackingContextValue>({
  userId: null,
  username: null,
  isOnline: false,
});

export function useTrackingContext() {
  return useContext(TrackingContext);
}

export default function UserTrackingProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  const { initialized, needsUsername, profile, kicked, blocked, setUsername } = useUserTracking();

  // Skip tracking gates for admin pages
  const contextValue = useMemo(
    () => ({
      userId: profile?.id ?? null,
      username: profile?.username ?? null,
      isOnline: !!profile,
    }),
    [profile]
  );

  if (isAdmin) {
    return (
      <TrackingContext.Provider value={contextValue}>
        {children}
      </TrackingContext.Provider>
    );
  }

  if (!initialized) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-pink-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (kicked) {
    return <DisconnectedScreen type="kicked" />;
  }

  if (blocked) {
    return <DisconnectedScreen type="blocked" />;
  }

  if (needsUsername) {
    return <UsernameSetup onSubmit={setUsername} />;
  }

  return (
    <TrackingContext.Provider value={contextValue}>
      {children}
    </TrackingContext.Provider>
  );
}
