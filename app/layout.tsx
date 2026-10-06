import Link from "next/link";
import "./globals.css";

export const metadata = { title: "Idea Tracker" };

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              try {
                var theme = localStorage.getItem('theme');
                if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                }
              } catch (e) {}
            })();
          `
        }} />
      </head>
      <body>
        <div className="app-wrapper">
          <header className="app-header">
            <div className="logo" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <Link href="/" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <img src="/logo.png" alt="IdeaHub Logo" style={{ width: '40px', height: '40px', objectFit: 'contain', marginBottom: '4px' }} />
                <span style={{ color: 'white', fontSize: '0.9rem', fontWeight: 'bold' }}>IdeaHub</span>
              </Link>
            </div>
            <div className="header-icons" style={{display: 'flex', gap: '16px', marginLeft: 'auto'}}>
              <Link href="/archive" style={{textDecoration: 'none'}}><span className="icon" title="Archive Box">🗄️</span></Link>
              <Link href="/profile" style={{textDecoration: 'none'}}><span className="icon" title="Profile">👤</span></Link>
              <Link href="/settings" style={{textDecoration: 'none'}}><span className="icon" title="Settings">⚙️</span></Link>
            </div>
          </header>
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
