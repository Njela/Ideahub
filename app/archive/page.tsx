import Link from "next/link";

export default function ArchivePage() {
  return (
    <div className="ideas-layout">
      <div className="main-content" style={{ maxWidth: '800px', margin: '0 auto', width: '100%', textAlign: 'center', padding: '40px' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '16px' }}>Archive Box 🗄️</h1>
        <p style={{ color: 'var(--muted)', marginBottom: '32px' }}>This is where archived and shelved ideas live. Nothing here right now!</p>
        <Link href="/" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>&larr; Back to all ideas</Link>
      </div>
    </div>
  );
}
