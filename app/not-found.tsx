export const dynamic = 'force-dynamic';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center text-center p-8">
      <div>
        <div className="mast text-4xl font-semibold">404</div>
        <p className="text-muted mt-2">Page not found.</p>
      </div>
    </div>
  );
}
