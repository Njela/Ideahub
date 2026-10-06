import Link from "next/link";
import "./globals.css";

export const metadata = { title: "Idea Tracker" };

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="app-wrapper">
          <header className="app-header">
            <div className="logo"><Link href="/" style={{color: 'white', textDecoration: 'none'}}>IdeaHub</Link></div>
            <div className="header-icons" style={{display: 'flex', gap: '16px', marginLeft: 'auto'}}>
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
