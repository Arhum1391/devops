'use client';

import { useEffect, useState } from 'react';

interface FloatingElement {
  id: number;
  x: number;
  y: number;
  delay: number;
  duration: number;
  type: 'code' | 'bracket' | 'tag' | 'binary' | 'circuit' | 'terminal';
  size: 'small' | 'medium' | 'large';
}

const TechAnimations = () => {
  const [elements, setElements] = useState<FloatingElement[]>([]);
  const [binaryStream, setBinaryStream] = useState<string[]>([]);

  useEffect(() => {
    // Generate floating tech elements
    const techElements: FloatingElement[] = [
      { id: 1, x: 8, y: 15, delay: 0, duration: 12, type: 'code', size: 'large' },
      { id: 2, x: 88, y: 12, delay: 1, duration: 15, type: 'bracket', size: 'large' },
      { id: 3, x: 12, y: 55, delay: 2, duration: 18, type: 'tag', size: 'medium' },
      { id: 4, x: 78, y: 65, delay: 0.5, duration: 14, type: 'code', size: 'medium' },
      { id: 5, x: 45, y: 25, delay: 1.5, duration: 16, type: 'bracket', size: 'large' },
      { id: 6, x: 22, y: 75, delay: 3, duration: 17, type: 'tag', size: 'small' },
      { id: 7, x: 92, y: 45, delay: 2.5, duration: 13, type: 'circuit', size: 'medium' },
      { id: 8, x: 5, y: 35, delay: 1, duration: 19, type: 'terminal', size: 'medium' },
      { id: 9, x: 65, y: 20, delay: 2, duration: 15, type: 'code', size: 'small' },
      { id: 10, x: 35, y: 80, delay: 0.8, duration: 16, type: 'bracket', size: 'medium' },
    ];
    setElements(techElements);

    // Generate binary stream
    const binary = Array.from({ length: 20 }, () => 
      Math.random() > 0.5 ? '1' : '0'
    );
    setBinaryStream(binary);
  }, []);

  const getSizeClass = (size: string) => {
    switch (size) {
      case 'large':
        return 'text-2xl sm:text-3xl';
      case 'medium':
        return 'text-lg sm:text-xl';
      case 'small':
        return 'text-sm sm:text-base';
      default:
        return 'text-base';
    }
  };

  const renderElement = (element: FloatingElement) => {
    const sizeClass = getSizeClass(element.size);
    
    switch (element.type) {
      case 'code':
        return (
          <div className={`${sizeClass} text-[#3813F3] font-mono font-bold relative`} style={{ 
            textShadow: '0 0 20px rgba(56, 19, 243, 0.5), 0 0 40px rgba(56, 19, 243, 0.3)',
            filter: 'drop-shadow(0 0 8px rgba(56, 19, 243, 0.6))'
          }}>
            {'</>'}
          </div>
        );
      case 'bracket':
        return (
          <div className={`${sizeClass} text-[#05B0B3] font-mono font-bold relative`} style={{ 
            textShadow: '0 0 20px rgba(5, 176, 179, 0.5), 0 0 40px rgba(5, 176, 179, 0.3)',
            filter: 'drop-shadow(0 0 8px rgba(5, 176, 179, 0.6))'
          }}>
            {'{ }'}
          </div>
        );
      case 'tag':
        return (
          <div className={`${sizeClass} text-[#DE50EC] font-mono font-bold relative`} style={{ 
            textShadow: '0 0 20px rgba(222, 80, 236, 0.5), 0 0 40px rgba(222, 80, 236, 0.3)',
            filter: 'drop-shadow(0 0 8px rgba(222, 80, 236, 0.6))'
          }}>
            {'< />'}
          </div>
        );
      case 'circuit':
        return (
          <div className={`${sizeClass} text-[#4B25FD] font-mono font-bold relative`} style={{ 
            textShadow: '0 0 20px rgba(75, 37, 253, 0.5), 0 0 40px rgba(75, 37, 253, 0.3)',
            filter: 'drop-shadow(0 0 8px rgba(75, 37, 253, 0.6))'
          }}>
            {'⚡'}
          </div>
        );
      case 'terminal':
        return (
          <div className={`${sizeClass} text-[#05B0B3] font-mono font-bold relative`} style={{ 
            textShadow: '0 0 20px rgba(5, 176, 179, 0.5), 0 0 40px rgba(5, 176, 179, 0.3)',
            filter: 'drop-shadow(0 0 8px rgba(5, 176, 179, 0.6))'
          }}>
            {'$'}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {/* Floating Tech Elements */}
      {elements.map((element) => (
        <div
          key={element.id}
          className="absolute animate-float-tech-glow"
          style={{
            left: `${element.x}%`,
            top: `${element.y}%`,
            animationDuration: `${element.duration}s`,
            animationDelay: `${element.delay}s`,
            transform: 'translate(-50%, -50%)',
            opacity: 0.6,
          }}
        >
          {renderElement(element)}
        </div>
      ))}
      
      {/* Animated Code Blocks */}
      <div className="absolute top-[15%] left-[5%] opacity-40 animate-pulse-slow">
        <div className="font-mono text-xs sm:text-sm text-[#3813F3] relative" style={{
          textShadow: '0 0 10px rgba(56, 19, 243, 0.4)',
          background: 'rgba(56, 19, 243, 0.05)',
          padding: '12px',
          borderRadius: '8px',
          border: '1px solid rgba(56, 19, 243, 0.2)',
        }}>
          <div className="mb-1 text-[#05B0B3]">const</div>
          <div className="ml-4 mb-1">innovation = {'{'}</div>
          <div className="ml-8 text-[#DE50EC]">excellence: true</div>
          <div className="ml-4">{'}'}</div>
        </div>
      </div>
      
      <div className="absolute bottom-[20%] right-[8%] opacity-40 animate-pulse-slow" style={{ animationDelay: '1s' }}>
        <div className="font-mono text-xs sm:text-sm text-[#05B0B3] relative" style={{
          textShadow: '0 0 10px rgba(5, 176, 179, 0.4)',
          background: 'rgba(5, 176, 179, 0.05)',
          padding: '12px',
          borderRadius: '8px',
          border: '1px solid rgba(5, 176, 179, 0.2)',
        }}>
          <div className="mb-1 text-[#3813F3]">{'<Component'}</div>
          <div className="ml-4 mb-1 text-[#DE50EC]">innovation</div>
          <div className="text-[#3813F3]">{'/>'}</div>
        </div>
      </div>

      {/* Binary Stream Animation */}
      <div className="absolute top-[60%] left-[10%] opacity-30">
        <div className="font-mono text-xs sm:text-sm text-[#4B25FD] flex gap-1 animate-scroll-binary" style={{
          textShadow: '0 0 8px rgba(75, 37, 253, 0.4)',
        }}>
          {binaryStream.map((bit, idx) => (
            <span key={idx} className="animate-blink" style={{ animationDelay: `${idx * 0.1}s` }}>
              {bit}
            </span>
          ))}
        </div>
      </div>

      {/* Circuit Board Lines */}
      <div className="absolute top-[30%] right-[15%] opacity-20">
        <svg width="120" height="80" className="animate-pulse-slow">
          <path
            d="M 10 10 L 50 10 L 50 30 L 90 30 L 90 50 L 30 50 L 30 70"
            stroke="#05B0B3"
            strokeWidth="2"
            fill="none"
            style={{ filter: 'drop-shadow(0 0 4px rgba(5, 176, 179, 0.6))' }}
          />
          <circle cx="10" cy="10" r="3" fill="#05B0B3" style={{ filter: 'drop-shadow(0 0 6px rgba(5, 176, 179, 0.8))' }} />
          <circle cx="90" cy="50" r="3" fill="#05B0B3" style={{ filter: 'drop-shadow(0 0 6px rgba(5, 176, 179, 0.8))' }} />
        </svg>
      </div>

      {/* Terminal Cursor Animation */}
      <div className="absolute bottom-[15%] left-[20%] opacity-40">
        <div className="font-mono text-sm text-[#05B0B3] flex items-center" style={{
          textShadow: '0 0 10px rgba(5, 176, 179, 0.5)',
        }}>
          <span className="mr-2">$</span>
          <span className="animate-typing">npm run build</span>
          <span className="animate-blink-cursor ml-1">|</span>
        </div>
      </div>

      {/* Geometric Tech Shapes */}
      <div className="absolute top-[45%] right-[25%] opacity-25 animate-rotate-slow">
        <div className="w-16 h-16 border-2 border-[#3813F3]" style={{
          clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
          filter: 'drop-shadow(0 0 10px rgba(56, 19, 243, 0.5))',
        }} />
      </div>

      <div className="absolute bottom-[35%] left-[30%] opacity-25 animate-rotate-slow-reverse" style={{ animationDelay: '1s' }}>
        <div className="w-12 h-12 border-2 border-[#DE50EC]" style={{
          clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)',
          filter: 'drop-shadow(0 0 10px rgba(222, 80, 236, 0.5))',
        }} />
      </div>
    </div>
  );
};

export default TechAnimations;
