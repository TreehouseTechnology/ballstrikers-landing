import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ballstrikers | Early Access",
  description: "Join the Ballstrikers waitlist."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "ui-sans-serif, system-ui, sans-serif", background: "#f5f3ef" }}>{children}</body>
    </html>
  );
}
