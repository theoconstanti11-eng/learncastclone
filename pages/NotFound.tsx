import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { StudyCastAppShell } from "@/components/layouts/StudyCastAppShell";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <StudyCastAppShell className="items-center justify-center">
      <div className="flex flex-1 items-center justify-center px-6">
        <div className="max-w-md rounded-3xl border border-white/30 bg-white/80 p-10 text-center text-slate-700 shadow-xl backdrop-blur-xl">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-500">StudyCast</p>
          <h1 className="mt-4 text-4xl font-bold text-slate-900">Page not found</h1>
          <p className="mt-3 text-sm text-slate-600">We couldn't find the page you're looking for. Try heading back to the library.</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button asChild className="rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 px-6 py-3 text-white shadow-lg shadow-indigo-500/30 transition hover:opacity-90">
              <a href="/studycast-library">Go to StudyCast Library</a>
            </Button>
            <Button variant="outline" asChild className="rounded-full border border-white/40 bg-white/40 text-slate-800 hover:bg-white/60">
              <a href="/">Return home</a>
            </Button>
          </div>
        </div>
      </div>
    </StudyCastAppShell>
  );
};

export default NotFound;
