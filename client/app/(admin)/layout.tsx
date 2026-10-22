import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Doctor Tracker | Admin Portal",
  description: "Manage doctors, patients, and healthcare insights.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
