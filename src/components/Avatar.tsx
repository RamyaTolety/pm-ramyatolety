const PALETTE = [
  "bg-rose-400",
  "bg-orange-400",
  "bg-amber-400",
  "bg-lime-400",
  "bg-emerald-400",
  "bg-teal-400",
  "bg-cyan-400",
  "bg-sky-400",
  "bg-blue-400",
  "bg-slate-400",
];

function colorForEmail(email: string) {
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    hash = (hash * 31 + email.charCodeAt(i)) >>> 0;
  }
  return PALETTE[hash % PALETTE.length];
}

function initialsForEmail(email: string) {
  const name = email.split("@")[0];
  const parts = name.split(/[._-]/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export function Avatar({ email, size = "sm" }: { email: string; size?: "sm" | "md" }) {
  const dims = size === "md" ? "h-8 w-8 text-xs" : "h-6 w-6 text-[10px]";
  return (
    <span
      title={email}
      className={`inline-flex ${dims} shrink-0 items-center justify-center rounded-full font-semibold text-white ${colorForEmail(
        email
      )}`}
    >
      {initialsForEmail(email)}
    </span>
  );
}
