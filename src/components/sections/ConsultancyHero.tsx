'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

const ConsultancyHero = () => {
  const [stats, setStats] = useState([
    { label: 'Projects Delivered', value: 0, target: 150 },
    { label: 'Happy Clients', value: 0, target: 200 },
    { label: 'Years Experience', value: 0, target: 10 },
  ]);

  useEffect(() => {
    // Animate stats on mount
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;

    stats.forEach((stat, index) => {
      let currentStep = 0;
      const increment = stat.target / steps;

      const timer = setInterval(() => {
        currentStep++;
        const newValue = Math.min(Math.floor(increment * currentStep), stat.target);
        setStats((prev) => {
          const updated = [...prev];
          updated[index].value = newValue;
          return updated;
        });

        if (currentStep >= steps) {
          clearInterval(timer);
        }
      }, interval);
    });
  }, []);

  return (
    <section className="relative min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-20">
      <div className="max-w-7xl mx-auto text-center space-y-12">
        {/* Main Hero Content */}
        <div className="space-y-6">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight" style={{ fontFamily: 'Gilroy-SemiBold, sans-serif' }}>
            Transform Your Business with
            <span className="block mt-2 bg-gradient-to-r from-[#3813F3] via-[#05B0B3] to-[#DE50EC] bg-clip-text text-transparent">
              Expert Software Solutions
            </span>
          </h1>
          <p className="text-lg sm:text-xl lg:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed" style={{ fontFamily: 'Gilroy-SemiBold, sans-serif' }}>
            We deliver cutting-edge software solutions that drive innovation, streamline operations, and accelerate your digital transformation journey.
          </p>
        </div>

        {/* Animated Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 lg:gap-8 max-w-4xl mx-auto">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-[#1F1F1F]/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-800/50 hover:border-gray-700 transition-all duration-300 hover:scale-105"
            >
              <div className="text-4xl sm:text-5xl font-bold text-transparent bg-gradient-to-r from-[#3813F3] to-[#DE50EC] bg-clip-text mb-2" style={{ fontFamily: 'Gilroy-SemiBold, sans-serif' }}>
                {stat.value}+
              </div>
              <div className="text-sm sm:text-base text-gray-400" style={{ fontFamily: 'Gilroy-Medium, sans-serif' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
          <Link
            href="/meetings"
            className="bg-white text-[#0A0A0A] px-8 py-4 rounded-full text-base font-semibold hover:bg-gray-100 transition-all duration-300 hover:scale-105 cursor-pointer w-full sm:w-auto"
            style={{ fontFamily: 'Gilroy-SemiBold, sans-serif' }}
          >
            Schedule Consultation
          </Link>
          <Link
            href="#services"
            className="bg-[#1F1F1F] text-white border border-gray-600 px-8 py-4 rounded-full text-base font-semibold hover:border-gray-500 hover:bg-[#2A2A2A] transition-all duration-300 hover:scale-105 cursor-pointer w-full sm:w-auto"
            style={{ fontFamily: 'Gilroy-SemiBold, sans-serif' }}
          >
            Explore Services
          </Link>
        </div>

        {/* Service Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-5xl mx-auto">
          <div className="bg-[#1F1F1F]/60 backdrop-blur-sm rounded-xl p-6 border border-gray-800/30 hover:border-[#3813F3]/50 transition-all duration-300 hover:scale-105 group">
            <div className="w-12 h-12 bg-gradient-to-r from-[#3813F3] to-[#4B25FD] rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2" style={{ fontFamily: 'Gilroy-SemiBold, sans-serif' }}>
              Custom Development
            </h3>
            <p className="text-gray-400 text-sm" style={{ fontFamily: 'Gilroy-Medium, sans-serif' }}>
              Tailored software solutions built to your exact specifications
            </p>
          </div>

          <div className="bg-[#1F1F1F]/60 backdrop-blur-sm rounded-xl p-6 border border-gray-800/30 hover:border-[#05B0B3]/50 transition-all duration-300 hover:scale-105 group">
            <div className="w-12 h-12 bg-gradient-to-r from-[#05B0B3] to-[#4B25FD] rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2" style={{ fontFamily: 'Gilroy-SemiBold, sans-serif' }}>
              Cloud Solutions
            </h3>
            <p className="text-gray-400 text-sm" style={{ fontFamily: 'Gilroy-Medium, sans-serif' }}>
              Scalable cloud infrastructure and migration services
            </p>
          </div>

          <div className="bg-[#1F1F1F]/60 backdrop-blur-sm rounded-xl p-6 border border-gray-800/30 hover:border-[#DE50EC]/50 transition-all duration-300 hover:scale-105 group">
            <div className="w-12 h-12 bg-gradient-to-r from-[#DE50EC] to-[#3813F3] rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2" style={{ fontFamily: 'Gilroy-SemiBold, sans-serif' }}>
              Digital Transformation
            </h3>
            <p className="text-gray-400 text-sm" style={{ fontFamily: 'Gilroy-Medium, sans-serif' }}>
              Modernize your business processes with innovative technology
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ConsultancyHero;

