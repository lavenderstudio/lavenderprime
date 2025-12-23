// client/src/components/home/ui.jsx
// ----------------------------------------------------
// Shared UI helpers/constants for the Home sections
// ----------------------------------------------------

export const ACCENT = "text-blue-700";
export const ACCENT_BG = "bg-blue-700";
export const ACCENT_HOVER = "hover:bg-blue-800";

export function Container({ children, className = "" }) {
  return <div className={`mx-auto w-full max-w-7xl px-4 ${className}`}>{children}</div>;
}
