import { useEffect, useState, lazy, Suspense } from "react";

const App = lazy(() => import("./App"));

export function ClientApp() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <App />
    </Suspense>
  );
}
