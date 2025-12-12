// client/src/components/Page.jsx
// Simple page wrapper to keep spacing consistent

export default function Page({ title, children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto w-full max-w-6xl px-4 py-6">
        {title && <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>}
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}
