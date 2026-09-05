import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ATS Prism",
  description: "Royal-blue ATS resume scoring dashboard with role selection and upload analysis.",
  icons: {
    icon: "/image.png",
    shortcut: "/image.png",
    apple: "/image.png",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
