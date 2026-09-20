'use client';

import React, { useState } from 'react';
import { TenantProvider } from '@/lib/context/TenantContext';
import { LandingView } from '@/components/landing/LandingView';
import { RegisterBusinessModal } from '@/components/modals/RegisterBusinessModal';
import { RoshLiveChat } from '@/components/livechat/RoshLiveChat';
import { useTenant } from '@/lib/context/TenantContext';
import { useRouter } from 'next/navigation';

const HomePageInner: React.FC = () => {
  const [registerOpen, setRegisterOpen] = useState(false);
  const { registerBusiness } = useTenant();
  const router = useRouter();

  return (
    <>
      <LandingView
        onOpenDashboard={() => router.push('/login')}
        onOpenRegisterModal={() => setRegisterOpen(true)}
      />
      <RegisterBusinessModal
        isOpen={registerOpen}
        onClose={() => setRegisterOpen(false)}
        onSubmit={(data) => {
          registerBusiness(data);
          setRegisterOpen(false);
          router.push('/dashboard');
        }}
      />
      <RoshLiveChat />
    </>
  );
};

export default function HomePage() {
  return (
    <TenantProvider>
      <HomePageInner />
    </TenantProvider>
  );
}
