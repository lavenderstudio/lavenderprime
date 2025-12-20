// client/src/components/Page.jsx
// Simple page wrapper to keep spacing consistent

export default function Page({ title, children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="text-center mb-12 mx-auto w-full max-w-7xl px-4 py-6">
        {title && <h1 className="text-2xl font-bold text-gray-900">{title}</h1>}
        <div className="mx-auto mt-2 h-0.75 w-8 rounded-full bg-blue-500" />
        <div className="mt-10">{children}</div>
      </div>
    </div>
  );
}
