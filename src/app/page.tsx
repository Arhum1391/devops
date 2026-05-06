'use client';

import Navbar from '@/components/Navbar';
import MinimalBackground from '@/components/MinimalBackground';
import TechAnimations from '@/components/TechAnimations';
import ConsultancyHero from '@/components/sections/ConsultancyHero';
import ServicesSection from '@/components/sections/ServicesSection';
import TechnologyStack from '@/components/sections/TechnologyStack';

export default function Home() {
  return (
    <div className="bg-[#0D0D0D] min-h-screen text-white font-sans relative overflow-hidden" style={{ fontFamily: 'Gilroy-Medium, sans-serif' }}>
      {/* Minimal Background */}
      <MinimalBackground />

      {/* Tech-related Foreground Animations */}
      <TechAnimations />

      {/* Navigation Header */}
      <Navbar variant="hero" />

      {/* Main Content */}
      <div className="relative z-10">
        <ConsultancyHero />
        <ServicesSection />
        <TechnologyStack />
      </div>
    </div>
  );
}
