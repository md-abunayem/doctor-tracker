"use client";

import { LoaderCircle } from "lucide-react";
export function Loading() {
  return (
    <div className="flex min-h-48 items-center justify-center gap-3 muted">
      <LoaderCircle className="animate-spin" size={21} />
      Loading data...
    </div>
  );
}