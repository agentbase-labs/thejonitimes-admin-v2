import Shell from '../../components/Shell';
import dynamicImport from 'next/dynamic';

export const dynamic = 'force-dynamic';

const LiveClient = dynamicImport(() => import('./LiveClient'), { ssr: false });

export default function LivePage() {
  return (
    <Shell active="live">
      <LiveClient />
    </Shell>
  );
}
