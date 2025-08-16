
"use client";

import { useRouter } from 'next/navigation';
import { HomepageIntegration } from '@/components/homepage-integration';

export default function HomePage() {
  const router = useRouter();

  const handleEnterApp = () => {
    router.push('/art');
  };

  return <HomepageIntegration onEnterApp={handleEnterApp} />;
}

    