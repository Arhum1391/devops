'use client';

import { useRef } from 'react';

interface GradientOrb {
  id: number;
  size: number;
  x: number;
  y: number;
  duration: number;
  delay: number;
  colors: string[];
}

const AnimatedGradientMesh = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Generate multiple orbs with different properties
  const orbs: GradientOrb[] = [
    {
      id: 1,
      size: 600,
      x: 10,
      y: 20,
      duration: 20,
      delay: 0,
      colors: ['#3813F3', '#05B0B3', '#4B25FD'],
    },
    {
      id: 2,
      size: 500,
      x: 80,
      y: 10,
      duration: 25,
      delay: 2,
      colors: ['#4B25FD', '#B9B9E9', '#DE50EC'],
    },
    {
      id: 3,
      size: 700,
      x: 50,
      y: 60,
      duration: 30,
      delay: 4,
      colors: ['#05B0B3', '#3813F3', '#DE50EC'],
    },
    {
      id: 4,
      size: 450,
      x: 20,
      y: 80,
      duration: 22,
      delay: 1,
      colors: ['#DE50EC', '#4B25FD', '#05B0B3'],
    },
    {
      id: 5,
      size: 550,
      x: 70,
      y: 40,
      duration: 28,
      delay: 3,
      colors: ['#B9B9E9', '#DE50EC', '#3813F3'],
    },
  ];

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none overflow-hidden z-0"
      style={{ zIndex: 0 }}
    >
      {orbs.map((orb) => (
        <div
          key={orb.id}
          className="absolute rounded-full opacity-30"
          style={{
            width: `${orb.size}px`,
            height: `${orb.size}px`,
            left: `${orb.x}%`,
            top: `${orb.y}%`,
            background: `radial-gradient(circle, ${orb.colors[0]} 0%, ${orb.colors[1]} 50%, ${orb.colors[2]} 100%)`,
            filter: 'blur(80px)',
            transform: 'translate(-50%, -50%)',
            animation: `float-${orb.id} ${orb.duration}s ease-in-out infinite`,
            animationDelay: `${orb.delay}s`,
            willChange: 'transform, opacity',
          }}
        />
      ))}
    </div>
  );
};

export default AnimatedGradientMesh;

