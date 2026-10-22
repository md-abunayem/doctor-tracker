"use client";

export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <section className={`surface ${className}`}>{children}</section>;
}
