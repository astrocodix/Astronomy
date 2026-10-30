import type { Metadata } from 'next';
import { ObservatoryPage } from '../../components/observatory-page';
export const metadata: Metadata = { title: 'Observatory' };
export default function Page() {
  return <ObservatoryPage />;
}
