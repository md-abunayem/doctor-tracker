"use client"
export function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  return (
    <div
      className="flex items-center justify-between border-t p-4"
      style={{ borderColor: "var(--border)" }}
    >
      <span className="text-xs muted">
        Page {page} of {Math.max(totalPages, 1)}
      </span>
      <div className="flex gap-2">
        <button
          className="btn-secondary"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
        >
          Previous
        </button>
        <button
          className="btn-secondary"
          disabled={page >= totalPages}
          onClick={() => onChange(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}