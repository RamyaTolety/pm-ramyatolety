import { DEFAULT_PORT_COLOR, DEFAULT_PORT_ICON, PORT_COLORS } from "@/lib/types";
import type { Project } from "@/lib/types";
import { PORT_ICON_COMPONENTS } from "./icons";

export function PortBadge({
  project,
  size = "sm",
}: {
  project: Pick<Project, "portIcon" | "portColor">;
  size?: "sm" | "md";
}) {
  const icon = project.portIcon ?? DEFAULT_PORT_ICON;
  const color = project.portColor ?? DEFAULT_PORT_COLOR;
  const palette = PORT_COLORS.find((c) => c.value === color) ?? PORT_COLORS[0];
  const Icon = PORT_ICON_COMPONENTS[icon];
  const dims = size === "md" ? "h-10 w-10" : "h-8 w-8";
  const iconDims = size === "md" ? "h-5 w-5" : "h-4 w-4";

  return (
    <span
      className={`inline-flex ${dims} shrink-0 items-center justify-center rounded-full ${palette.badge}`}
    >
      <Icon className={iconDims} />
    </span>
  );
}
