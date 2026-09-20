'use client';

import React from 'react';
import { LandingNavbar } from './LandingNavbar';
import { HeroSection } from './HeroSection';
import { TrustedLogos } from './TrustedLogos';
import { FeaturesGrid } from './FeaturesGrid';
import { LiveAutomationTester } from './LiveAutomationTester';
import { AnalyticsSection } from './AnalyticsSection';
import { InteractiveRoiCalculator } from './InteractiveRoiCalculator';
import { MultiTenantIndustryPreview } from './MultiTenantIndustryPreview';
import { ProcessSection } from './ProcessSection';
import { CompetitiveComparison } from './CompetitiveComparison';
import { IndustriesSection } from './IndustriesSection';
import { TestimonialsSection } from './TestimonialsSection';
import { PricingSection } from './PricingSection';
import { LandingFooter } from './LandingFooter';

interface Props {
  onOpenDashboard: () => void;
  onOpenRegisterModal: () => void;
}

export const LandingView: React.FC<Props> = ({ onOpenDashboard, onOpenRegisterModal }) => (
  <div className="min-h-screen bg-white">
    <LandingNavbar onOpenDashboard={onOpenDashboard} onOpenRegisterModal={onOpenRegisterModal} />
    <HeroSection onOpenDashboard={onOpenDashboard} onOpenRegisterModal={onOpenRegisterModal} />
    <TrustedLogos />
    <FeaturesGrid />
    <LiveAutomationTester />
    <AnalyticsSection />
    <InteractiveRoiCalculator />
    <MultiTenantIndustryPreview />
    <ProcessSection />
    <CompetitiveComparison />
    <IndustriesSection />
    <TestimonialsSection />
    <PricingSection />
    <LandingFooter />
  </div>
);
