'use client';

export default function ErrorBoundary({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontSize: 32, marginBottom: 8 }}>Something went wrong</h2>
        <p style={{ color: '#666' }}>{error?.message || 'Unknown error'}</p>
        <button onClick={() => reset()} style={{ marginTop: 16, padding: '8px 16px', border: '1px solid #ccc', background: 'white', cursor: 'pointer' }}>Try again</button>
      </div>
    </div>
  );
}
