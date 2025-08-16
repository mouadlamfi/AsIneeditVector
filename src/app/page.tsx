
"use client";

import { useRouter } from 'next/navigation';
import { SingularityHomepage } from '@/components/singularity-homepage';

export default function HomePage() {
  const router = useRouter();

  const handleTakeMeIn = () => {
    router.push('/art');
  };

  return <SingularityHomepage onTakeMeIn={handleTakeMeIn} />;
}

    