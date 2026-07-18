"use client";

import { PORT_COLORS, PORT_ICONS } from "@/lib/types";
import type { PortColor, PortIcon } from "@/lib/types";
import { PORT_ICON_COMPONENTS } from "./icons";

export function PortPicker({
  icon,
  color,
  onIconChange,
  onColorChange,
}: {
  icon: PortIcon;
  color: PortColor;
  onIconChange: (icon: PortIcon) => void;
  onColorChange: (color: PortColor) => void;
}) {
  const activeColor = PORT_COLORS.find((c) => c.value === color) ?? PORT_COLORS[0];

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-neutral-600 dark:text-slate-400">Port</p>
      <div className="flex flex-wrap gap-1.5">
        {PORT_ICONS.map((option) => {
          const Icon = PORT_ICON_COMPONENTS[option.value];
          const active = option.value === icon;
          return (
            <button
              key={option.value}
              type="button"
              title={option.label}
              onClick={() => onIconChange(option.value)}
              className={`flex h-8 w-8 items-center justify-center rounded-full border transition ${
                active
                  ? `border-transparent ${activeColor.badge}`
                  : "border-neutral-200 text-neutral-400 hover:border-neutral-300 dark:border-slate-700 dark:text-slate-500 dark:hover:border-slate-600"
              }`}
            >
              <Icon className="h-4 w-4" />
            </button>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {PORT_COLORS.map((option) => (
          <button
            key={option.value}
            type="button"
            title={option.value}
            onClick={() => onColorChange(option.value)}
            className={`h-6 w-6 rounded-full ${option.dot} transition ${
              color === option.value ? "ring-2 ring-offset-2 ring-neutral-400 dark:ring-offset-slate-900" : ""
            }`}
          />
        ))}
      </div>
    </div>
  );
}
