// client/src/components/home/ui.jsx
// ----------------------------------------------------
// Shared UI helpers/constants for the Home sections
// ----------------------------------------------------

export const ACCENT = "text-amber-800";
export const ACCENT_BG = "bg-amber-800";
export const ACCENT_HOVER = "hover:bg-amber-950";

export function Container({ children, className = "" }) {
  return <div className={`mx-auto w-full max-w-7xl px-4 ${className}`}>{children}</div>;
}
