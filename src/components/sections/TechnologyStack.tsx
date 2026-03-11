'use client';

const TechnologyStack = () => {
  const technologies = [
    { name: 'React', category: 'Frontend' },
    { name: 'Next.js', category: 'Frontend' },
    { name: 'TypeScript', category: 'Language' },
    { name: 'Node.js', category: 'Backend' },
    { name: 'Python', category: 'Language' },
    { name: 'AWS', category: 'Cloud' },
    { name: 'Docker', category: 'DevOps' },
    { name: 'Kubernetes', category: 'DevOps' },
    { name: 'PostgreSQL', category: 'Database' },
    { name: 'MongoDB', category: 'Database' },
    { name: 'GraphQL', category: 'API' },
    { name: 'Redis', category: 'Database' },
  ];

  return (
    <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4" style={{ fontFamily: 'Gilroy-SemiBold, sans-serif' }}>
            Technology Stack
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto" style={{ fontFamily: 'Gilroy-Medium, sans-serif' }}>
            We work with cutting-edge technologies to deliver exceptional results
          </p>
        </div>

        {/* Scrolling Technology Badges */}
        <div className="relative">
          {/* First row - scrolling left */}
          <div className="flex gap-4 mb-4 overflow-hidden">
            <div className="flex gap-4 animate-scroll-left">
              {technologies.map((tech, index) => (
                <div
                  key={`first-${index}`}
                  className="flex-shrink-0 bg-[#1F1F1F] border border-gray-800 rounded-full px-6 py-3 hover:border-[#3813F3] transition-all duration-300 hover:scale-105"
                >
                  <span className="text-white text-sm font-medium whitespace-nowrap" style={{ fontFamily: 'Gilroy-Medium, sans-serif' }}>
                    {tech.name}
                  </span>
                </div>
              ))}
              {/* Duplicate for seamless loop */}
              {technologies.map((tech, index) => (
                <div
                  key={`first-dup-${index}`}
                  className="flex-shrink-0 bg-[#1F1F1F] border border-gray-800 rounded-full px-6 py-3 hover:border-[#3813F3] transition-all duration-300 hover:scale-105"
                >
                  <span className="text-white text-sm font-medium whitespace-nowrap" style={{ fontFamily: 'Gilroy-Medium, sans-serif' }}>
                    {tech.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Second row - scrolling right */}
          <div className="flex gap-4 overflow-hidden">
            <div className="flex gap-4 animate-scroll-right">
              {[...technologies].reverse().map((tech, index) => (
                <div
                  key={`second-${index}`}
                  className="flex-shrink-0 bg-[#1F1F1F] border border-gray-800 rounded-full px-6 py-3 hover:border-[#05B0B3] transition-all duration-300 hover:scale-105"
                >
                  <span className="text-white text-sm font-medium whitespace-nowrap" style={{ fontFamily: 'Gilroy-Medium, sans-serif' }}>
                    {tech.name}
                  </span>
                </div>
              ))}
              {/* Duplicate for seamless loop */}
              {[...technologies].reverse().map((tech, index) => (
                <div
                  key={`second-dup-${index}`}
                  className="flex-shrink-0 bg-[#1F1F1F] border border-gray-800 rounded-full px-6 py-3 hover:border-[#05B0B3] transition-all duration-300 hover:scale-105"
                >
                  <span className="text-white text-sm font-medium whitespace-nowrap" style={{ fontFamily: 'Gilroy-Medium, sans-serif' }}>
                    {tech.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes scroll-left {
            from {
              transform: translateX(0);
            }
            to {
              transform: translateX(-50%);
            }
          }
          @keyframes scroll-right {
            from {
              transform: translateX(-50%);
            }
            to {
              transform: translateX(0);
            }
          }
          .animate-scroll-left {
            animation: scroll-left 30s linear infinite;
          }
          .animate-scroll-right {
            animation: scroll-right 30s linear infinite;
          }
        `}</style>
      </div>
    </section>
  );
};

export default TechnologyStack;

