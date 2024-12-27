import Link from 'next/link';

import { Layout } from '../components/layout';
import { useUserSignIn } from '../hooks/use-user-sign-in.hook';

export default function Home() {
  return (
    <div>
      {/* Container replacement */}
      <div className="relative mt-5 p-0 w-full max-w-none"></div>
    </div>
  );
}
