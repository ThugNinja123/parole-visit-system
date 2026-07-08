import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";

import { PermissionGate } from "@/components/PermissionGate";
import { useAuth } from "@/hooks/useAuth";

function SearchIcon({ className = "h-[18px] w-[18px]" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 18 18" fill="none" aria-hidden>
      <path
        d="M7.875 13.75a5.875 5.875 0 1 0 0-11.75 5.875 5.875 0 0 0 0 11.75Zm0-1.5a4.375 4.375 0 1 1 0-8.75 4.375 4.375 0 0 1 0 8.75Z"
        fill="currentColor"
      />
      <path
        d="M12.01 12.01a.75.75 0 0 1 1.06 0l2.73 2.73a.75.75 0 1 1-1.06 1.06l-2.73-2.73a.75.75 0 0 1 0-1.06Z"
        fill="currentColor"
      />
    </svg>
  );
}

function BellIcon({ className = "h-5 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 20" fill="none" aria-hidden>
      <path
        d="M8 1.5a4.25 4.25 0 0 0-4.25 4.25v2.38c0 .59-.2 1.16-.57 1.62L1.9 12.28A1.25 1.25 0 0 0 2.9 14.25h10.2a1.25 1.25 0 0 0 .99-1.97l-1.28-2.53a2.9 2.9 0 0 1-.57-1.62V5.75A4.25 4.25 0 0 0 8 1.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.25 15.75a1.75 1.75 0 0 0 3.5 0"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SettingsIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M10 12.25a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M16.1 11.45 15 10.9a6.7 6.7 0 0 0 0-1.8l1.1-.55a.75.75 0 0 0 .34-1.01l-1-1.73a.75.75 0 0 0-1.01-.34l-1.1.55a6.8 6.8 0 0 0-1.56-.9V3.75a.75.75 0 0 0-.75-.75h-2a.75.75 0 0 0-.75.75v1.27a6.8 6.8 0 0 0-1.56.9l-1.1-.55a.75.75 0 0 0-1.01.34l-1 1.73a.75.75 0 0 0 .34 1.01l1.1.55a6.7 6.7 0 0 0 0 1.8l-1.1.55a.75.75 0 0 0-.34 1.01l1 1.73a.75.75 0 0 0 1.01.34l1.1-.55c.48.38 1 .68 1.56.9v1.27c0 .41.34.75.75.75h2c.41 0 .75-.34.75-.75v-1.27c.56-.22 1.08-.52 1.56-.9l1.1.55a.75.75 0 0 0 1.01-.34l1-1.73a.75.75 0 0 0-.34-1.01Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

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

const iconButtonClass =
  "flex items-center justify-center rounded-xl px-2 py-2 text-on-surface transition-colors hover:bg-surface-container-low";

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
          <SearchIcon className="h-[18px] w-[18px] shrink-0 text-on-surface-variant" />
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
        <button type="button" className={iconButtonClass} aria-label="Notifications">
          <BellIcon className="text-on-surface" />
        </button>
        <button type="button" className={iconButtonClass} aria-label="Settings">
          <SettingsIcon className="text-on-surface" />
        </button>
        <PermissionGate code="visit.submit">
          <button
            type="button"
            onClick={() => navigate("/my-visits")}
            className="shrink-0 bg-primary px-4 py-2 text-label-md text-on-primary transition-opacity hover:opacity-90"
          >
            Log Visit
          </button>
        </PermissionGate>
        <OfficerAvatar name={displayName} />
      </div>
    </header>
  );
}
