import type { Metadata } from "next";
import { Poppins, Space_Grotesk } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

// Only the "TODO App" title uses Poppins.
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: "700",
});

export const metadata: Metadata = {
  title: "TODO App",
  description:
    "Plan tasks by category and status. Everything is saved in your browser.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${poppins.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-page font-sans tracking-[-0.02em] text-black">
        {children}
      </body>
    </html>
  );
}
