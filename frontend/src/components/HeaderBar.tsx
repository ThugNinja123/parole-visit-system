import { Bell, Search, Settings } from "lucide-react";
import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";

import { PermissionGate } from "@/components/PermissionGate";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";

function OfficerAvatar({ name }: { name: string }) {
  const initial = name.trim().charAt(0).toUpperCase() || "?";

  return (
    <div
      className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-outline-variant bg-primary-container text-xs font-semibold text-on-primary"
      aria-hidden
    >
      {initial}
    </div>
  );
}

export function HeaderBar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const displayName = user?.first_name || user?.username || "Officer";

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = search.trim();
    if (!query) return;
    navigate(`/offenders?search=${encodeURIComponent(query)}`);
  }

  return (
    <header className="flex shrink-0 items-center justify-between border-b border-outline-variant bg-background px-3 py-2">
      <form onSubmit={handleSearchSubmit} className="w-full max-w-md">
        <label className="sr-only" htmlFor="global-search">
          Search by name or ID
        </label>
        <div className="flex items-center gap-2 rounded-xl border border-outline-variant bg-surface-container-low px-4 py-2">
          <Search className="h-[18px] w-[18px] shrink-0 text-on-surface-variant" aria-hidden />
          <input
            id="global-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, ID..."
            className="w-full bg-transparent text-body-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none"
          />
        </div>
      </form>

      <div className="flex items-center gap-4 pl-4">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="rounded-xl text-on-surface"
          aria-label="Notifications"
        >
          <Bell className="size-5" aria-hidden />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="rounded-xl text-on-surface"
          aria-label="Settings"
        >
          <Settings className="size-5" aria-hidden />
        </Button>
        <PermissionGate code="visit.submit">
          <Button type="button" onClick={() => navigate("/my-visits")}>
            Log Visit
          </Button>
        </PermissionGate>
        <OfficerAvatar name={displayName} />
      </div>
    </header>
  );
}
