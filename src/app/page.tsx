
"use client";

import { useRouter } from 'next/navigation';
import { PlatonicSolidAnimation } from '@/components/platonic-solid-animation';

export default function HomePage() {
  const router = useRouter();

  const handleExploreClick = () => {
    router.push('/art');
  };

  return <PlatonicSolidAnimation onExploreClick={handleExploreClick} />;
}

    