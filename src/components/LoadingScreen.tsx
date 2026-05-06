'use client';

import Navbar from './Navbar';

interface LoadingScreenProps {
  message?: string;
}

export default function LoadingScreen({ message = 'Loading...' }: LoadingScreenProps) {
  return (
    <div className="min-h-screen bg-[#0A0A0A] relative overflow-x-hidden flex items-center justify-center">
      <Navbar variant="hero" />
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        <p className="text-white" style={{ fontFamily: 'Gilroy-Regular' }}>
          {message}
        </p>
      </div>
    </div>
  );
}

