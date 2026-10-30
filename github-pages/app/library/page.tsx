import type { Metadata } from 'next';
import { Library } from '../../components/library';
export const metadata: Metadata = { title: 'Images and sources' };
export default function Page() {
  return <Library />;
}
