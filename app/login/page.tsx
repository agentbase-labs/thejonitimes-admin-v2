import { Suspense } from 'react';
import LoginClient from './LoginClient';

export const dynamic = 'force-dynamic';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="mast text-4xl font-semibold">The Joni Times</div>
          <div className="text-xs uppercase tracking-[0.2em] text-muted mt-1">Admin</div>
        </div>
        <Suspense fallback={<div className="card p-6 text-center text-sm text-muted">Loading…</div>}>
          <LoginClient />
        </Suspense>
        <p className="text-xs text-faint text-center mt-6">Authorized personnel only.</p>
      </div>
    </div>
  );
}
