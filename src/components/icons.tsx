type IconProps = { className?: string };

export function HelmIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="3" />
      <line x1="12" y1="2" x2="12" y2="9" />
      <line x1="12" y1="15" x2="12" y2="22" />
      <line x1="2" y1="12" x2="9" y2="12" />
      <line x1="15" y1="12" x2="22" y2="12" />
      <line x1="4.9" y1="4.9" x2="9.5" y2="9.5" />
      <line x1="14.5" y1="14.5" x2="19.1" y2="19.1" />
      <line x1="19.1" y1="4.9" x2="14.5" y2="9.5" />
      <line x1="9.5" y1="14.5" x2="4.9" y2="19.1" />
    </svg>
  );
}

export function AnchorIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <circle cx="12" cy="5" r="3" />
      <line x1="12" y1="8" x2="12" y2="21" />
      <path d="M5 12H2a10 10 0 0 0 20 0h-3" />
    </svg>
  );
}

export function SailboatIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M3 18h18l-2 3H5l-2-3Z" />
      <path d="M12 18V3l6 9-6 3Z" />
      <path d="M8 18l1-9 3 9" />
    </svg>
  );
}

export function WavesIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.5 0 2.5 2 5 2s2.5-2 5-2c2.3 0 2.9.5 3.5 1" />
      <path d="M2 12c.6.5 1.2 1 2.5 1C7 13 7 11 9.5 11c2.5 0 2.5 2 5 2s2.5-2 5-2c2.3 0 2.9.5 3.5 1" />
      <path d="M2 18c.6.5 1.2 1 2.5 1C7 19 7 17 9.5 17c2.5 0 2.5 2 5 2s2.5-2 5-2c2.3 0 2.9.5 3.5 1" />
    </svg>
  );
}
