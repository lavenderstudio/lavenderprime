// client/src/components/PersonalisationForm.jsx
import { memo } from "react";

/**
 * PersonalisationForm
 * - Render inputs from product.personalizationConfig.fields
 * - Controlled form: values live in parent state
 *
 * NOTE: Memoized to prevent unnecessary re-renders and focus loss.
 */
function PersonalisationForm({
  enabled,
  title,
  fields,
  values,
  onChange,
}) {
  if (!enabled || !fields?.length) return null;

  // Sort fields once (safe even if already sorted)
  const sorted = [...fields].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between">
        <label className="text-sm font-extrabold text-slate-900">{title || "Personalisation"}</label>
        <span className="text-xs font-semibold text-slate-500">*</span>
      </div>

      <div className="mt-3 grid gap-3">
        {sorted.map((f) => {
          const value = values?.[f.key] ?? "";
          const common =
            "w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40";

          return (
            <div key={f.key}>
              <div className="flex items-center justify-between gap-3">
                <label className="text-sm font-bold text-slate-800">
                  {f.label} {f.required ? <span className="text-red-600">*</span> : null}
                </label>

                {(f.type === "text" || f.type === "textarea") && (
                  <span className="text-xs font-semibold text-slate-500">
                    {String(value).length}/{f.maxLength ?? 120}
                  </span>
                )}
              </div>

              {f.type === "textarea" ? (
                <textarea
                  className={`${common} min-h-23`}
                  placeholder={f.placeholder || ""}
                  value={value}
                  maxLength={f.maxLength ?? 120}
                  onChange={(e) => onChange(f.key, e.target.value)}
                />
              ) : f.type === "date" ? (
                <input
                  className={common}
                  type="date"
                  value={value}
                  onChange={(e) => onChange(f.key, e.target.value)}
                />
              ) : f.type === "select" ? (
                <select
                  className={common}
                  value={value}
                  onChange={(e) => onChange(f.key, e.target.value)}
                >
                  <option value="">Select…</option>
                  {(f.choices || []).map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              ) : f.type === "number" ? (
                <input
                  className={common}
                  type="number"
                  placeholder={f.placeholder || ""}
                  value={value}
                  onChange={(e) => onChange(f.key, e.target.value)}
                />
              ) : (
                <input
                  className={common}
                  type="text"
                  placeholder={f.placeholder || ""}
                  value={value}
                  maxLength={f.maxLength ?? 120}
                  onChange={(e) => onChange(f.key, e.target.value)}
                />
              )}

              {f.helperText ? (
                <div className="mt-1 text-xs font-semibold text-slate-500">{f.helperText}</div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default memo(PersonalisationForm);
