import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RSVP Online",
  description: "Create events and collect RSVPs instantly",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-stone-50 font-sans text-stone-900">
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-stone-200">
          <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
            <a href="/" className="font-semibold text-stone-900 text-lg tracking-tight">
              RSVP<span className="text-stone-400 font-normal">·online</span>
            </a>
            <a
              href="/"
              className="text-sm text-stone-600 hover:text-stone-900 transition-colors"
            >
              + New Event
            </a>
          </div>
        </header>
        <main className="max-w-2xl mx-auto px-4 py-8">
          {children}
        </main>
        <footer className="text-center text-xs text-stone-400 py-8">
          RSVP Online — Simple event RSVPs
        </footer>
      </body>
    </html>
  );
}
