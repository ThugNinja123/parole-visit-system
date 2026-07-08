interface IconProps {
  className?: string;
}

export function DashboardIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 18 18" fill="none" aria-hidden>
      <rect x="1" y="1" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <rect x="10" y="1" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <rect x="1" y="10" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <rect x="10" y="10" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

export function DirectoryIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 16" fill="none" aria-hidden>
      <circle cx="7" cy="4.5" r="3" stroke="currentColor" strokeWidth="1.4" />
      <path d="M1 15c0-3.038 2.686-5 6-5s6 1.962 6 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="15" cy="5.5" r="2.2" stroke="currentColor" strokeWidth="1.3" />
      <path d="M12.5 15c.2-2.2 1.6-3.6 3.7-3.9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

export function ScheduleIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 18 18" fill="none" aria-hidden>
      <rect x="1.5" y="3" width="15" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M1.5 7h15" stroke="currentColor" strokeWidth="1.4" />
      <path d="M5 1.5v3M13 1.5v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function FieldVisitIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 16 20" fill="none" aria-hidden>
      <path
        d="M8 19s6.5-6.2 6.5-11A6.5 6.5 0 0 0 1.5 8c0 4.8 6.5 11 6.5 11z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <circle cx="8" cy="8" r="2.2" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

export function ShieldIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 16 18" fill="none" aria-hidden>
      <path
        d="M8 1l6.5 2.4v4.9c0 4.6-2.8 7.7-6.5 8.7-3.7-1-6.5-4.1-6.5-8.7V3.4L8 1z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M5.5 9l1.8 1.8L11 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
