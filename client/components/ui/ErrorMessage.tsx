"use client"

export function ErrorMessage({ children }: { children: React.ReactNode }) {
  return (
    <p
      role="alert"
      className="my-3 rounded-lg p-3 text-sm"
      style={{
        color: "var(--danger)",
        background: "color-mix(in srgb, var(--danger) 8%, transparent)",
      }}
    >
      {children}
    </p>
  );
}