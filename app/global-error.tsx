'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32, fontFamily: 'Georgia, serif', background: '#fbfbf9' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 32, fontWeight: 600 }}>Something went wrong</div>
            <p style={{ color: '#666', marginTop: 8 }}>{error.message}</p>
            <button
              onClick={() => reset()}
              style={{ marginTop: 16, padding: '8px 16px', border: '1px solid #ccc', background: 'white', cursor: 'pointer' }}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
