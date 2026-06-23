import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// twMerge resolves conflicting Tailwind utilities so a caller's `className`
// override (e.g. w-20) wins over a component's baked-in default (e.g. w-full).
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
