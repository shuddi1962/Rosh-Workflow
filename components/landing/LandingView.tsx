'use client';

import React from 'react';
import { LandingNavbar } from './LandingNavbar';
import { HeroSection } from './HeroSection';
import { TrustedLogos } from './TrustedLogos';
import { FeaturesGrid } from './FeaturesGrid';
import { AnalyticsSection } from './AnalyticsSection';
import { LiveAutomationTester } from './LiveAutomationTester';
import { ProcessSection } from './ProcessSection';
import { IndustriesSection } from './IndustriesSection';
import { MultiTenantIndustryPreview } from './MultiTenantIndustryPreview';
import { TestimonialsSection } from './TestimonialsSection';
import { PricingSection } from './PricingSection';
import { LandingFooter } from './LandingFooter';
import { InteractiveRoiCalculator } from './InteractiveRoiCalculator';
import { CompetitiveComparison } from './CompetitiveComparison';

interface Props {
  onOpenDashboard: () => void;
  onOpenRegisterModal: () => void;
}

export const LandingView: React.FC<Props> = ({ onOpenDashboard, onOpenRegisterModal }) => (
  <div className="min-h-screen bg-white">
    <LandingNavbar onOpenDashboard={onOpenDashboard} onOpenRegisterModal={onOpenRegisterModal} />
    <main>
      <HeroSection onOpenDashboard={onOpenDashboard} onOpenRegisterModal={onOpenRegisterModal} />
      <TrustedLogos />
      <FeaturesGrid />
      <AnalyticsSection />
      <LiveAutomationTester />
      <CompetitiveComparison />
      <ProcessSection />
      <IndustriesSection />
      <MultiTenantIndustryPreview />
      <InteractiveRoiCalculator />
      <TestimonialsSection />
      <PricingSection />
    </main>
    <LandingFooter />
  </div>
);