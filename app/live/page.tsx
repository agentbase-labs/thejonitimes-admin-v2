import Shell from '../../components/Shell';
import LiveClient from './LiveClient';

export const dynamic = 'force-dynamic';

export default function LivePage() {
  return (
    <Shell active="live">
      <LiveClient />
    </Shell>
  );
}
