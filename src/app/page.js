import Link from 'next/link';

export default function Home() {
  return (
    <main style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      gap: '2rem',
      textAlign: 'center'
    }}>
      <h1 style={{ fontSize: '3rem', fontWeight: 'bold', background: 'linear-gradient(to right, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        Tasky
      </h1>
      <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)' }}>
        Employee Task Management System
      </p>
      <Link href="/login" className="btn btn-primary">
        Go to Login
      </Link>
    </main>
  );
}
