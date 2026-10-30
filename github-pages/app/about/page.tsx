import type { Metadata } from 'next';
import { About } from '../../components/about';
export const metadata: Metadata = { title: 'About this edition' };
export default function Page() {
  return <About />;
}
