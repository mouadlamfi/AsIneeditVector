
"use client";

import { useRouter } from 'next/navigation';
import { EmbodyEternityAnimation } from '@/components/embody-eternity-animation';

export default function HomePage() {
  const router = useRouter();

  const handleTakeMeIn = () => {
    router.push('/art');
  };

  return <EmbodyEternityAnimation onTakeMeIn={handleTakeMeIn} />;
}

    