import "./globals.css";
export const metadata = { title: "Idea Tracker" };
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="app-wrapper">
          <header className="app-header">
            {/* Icons removed */}
          </header>
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
