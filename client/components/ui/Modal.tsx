"use client"

import { X} from "lucide-react"

export function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="my-auto w-full max-w-lg rounded-2xl border p-6 shadow-2xl"
        style={{
          background: "var(--surface)",
          borderColor: "var(--border)",
        }}
      >
        <div className="mb-6 flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold">{title}</h2>
          <button onClick={onClose} aria-label="Close modal">
            <X size={19} />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}