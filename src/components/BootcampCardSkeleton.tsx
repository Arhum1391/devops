'use client';

export default function BootcampCardSkeleton() {
  return (
    <div className="bg-[#1F1F1F] rounded-2xl p-6 flex flex-col gap-6 relative overflow-hidden h-full animate-pulse">
      {/* Gradient Ellipse */}
      <div
        className="absolute w-[588px] h-[588px] left-[399px] top-[-326px] z-0 rotate-90"
        style={{
          background: 'linear-gradient(107.68deg, #3813F3 9.35%, #05B0B3 34.7%, #4B25FD 60.06%, #B9B9E9 72.73%, #DE50EC 88.58%)',
          filter: 'blur(100px)',
          borderRadius: '50%'
        }}
      />

      {/* Title and Price */}
      <div className="flex items-start justify-between gap-6 relative z-10">
        <div className="h-8 bg-gray-700 rounded-lg flex-1"></div>
        <div className="h-6 w-20 bg-gray-700 rounded-full"></div>
      </div>

      {/* Description */}
      <div className="space-y-2 relative z-10">
        <div className="h-4 bg-gray-700 rounded w-full"></div>
        <div className="h-4 bg-gray-700 rounded w-4/5"></div>
        <div className="h-4 bg-gray-700 rounded w-3/4"></div>
      </div>

      {/* Mentors */}
      <div className="flex flex-col gap-2 relative z-10">
        <div className="h-6 bg-gray-700 rounded w-20"></div>
        <div className="h-4 bg-gray-700 rounded w-3/4"></div>
        <div className="h-4 bg-gray-700 rounded w-2/3"></div>
      </div>

      {/* Tags */}
      <div className="flex gap-2 relative z-10">
        <div className="h-6 w-16 bg-gray-700 rounded-full"></div>
        <div className="h-6 w-20 bg-gray-700 rounded-full"></div>
      </div>

      {/* Registration Dates */}
      <div className="h-4 bg-gray-700 rounded w-2/3 relative z-10"></div>

      {/* Buttons */}
      <div className="flex gap-4 relative z-10 mt-auto">
        <div className="flex-1 h-10 bg-gray-700 rounded-full"></div>
        <div className="flex-1 h-10 bg-gray-700 rounded-full"></div>
      </div>
    </div>
  );
}
