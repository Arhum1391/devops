'use client';

import { useState, useRef, useEffect } from 'react';


interface BrandStory {
  id: number;
  title: string;
  description: string;
  thumbnail: string;
  link: string;
}

const brandStories: BrandStory[] = [
  {
    id: 1,
    title: 'Binance Write to Earn Campaign',
    description: 'Revolutionary content creation strategy that generated 1.2M+ views and transformed crypto engagement.',
    thumbnail: 'insta reels/526853861_1288609226095906_384361709264331048_n.jpg',
    link: 'https://www.instagram.com/reel/DM-q8R0JHYq/',
  },
  {
    id: 2,
    title: 'Algorand Blockchain Innovation',
    description: 'Cutting-edge blockchain storytelling that reached 600K+ viewers and showcased sustainable crypto solutions.',
    thumbnail: 'insta reels/486730182_18049736126256795_1390507338576305510_n.jpg',
    link: 'https://www.instagram.com/reel/DHqt63eMk83/?hl=en',
  },
  {
    id: 3,
    title: 'Ledger Security Excellence',
    description: 'Hardware wallet education campaign achieving 250K+ views with compelling security narratives.',
    thumbnail: 'insta reels/502990203_18055757522256795_8497396308849456425_n.jpg',
    link: 'https://www.instagram.com/reel/DKZ0w3wgkpv/',
  },
  {
    id: 4,
    title: 'Tari Universe Gaming',
    description: 'Next-gen gaming ecosystem promotion that captivated 200K+ viewers with immersive storytelling.',
    thumbnail: 'insta reels/523817363_1087807726647003_2347515624379629528_n.jpg',
    link: 'https://www.instagram.com/reel/DMh_GSiMYaF/?hl=en',
  },
  {
    id: 5,
    title: 'Clearwave Technology',
    description: 'Innovative fintech solution showcase reaching 185K+ viewers through strategic content marketing.',
    thumbnail: 'insta reels/504242017_2399699880410218_331808368986846690_n.jpg',
    link: 'https://www.instagram.com/reel/C_5y_kdJ7n5/?hl=en',
  },
  {
    id: 6,
    title: 'Fasset Digital Assets',
    description: 'Tokenization platform story that engaged 171K+ viewers with compelling financial innovation narratives.',
    thumbnail: 'insta reels/502998911_3472787822851307_6711770676072270006_n.jpg',
    link: 'https://www.instagram.com/reel/DHTb3FQo3fA/',
  },
  {
    id: 7,
    title: 'Fellou AI Innovation',
    description: 'AI-powered solution demonstration reaching 140K+ viewers with cutting-edge technology storytelling.',
    thumbnail: 'insta reels/544612103_814732628383048_2408225710129440532_n.jpg',
    link: 'https://www.facebook.com/reel/812109268007070',
  },
  {
    id: 8,
    title: 'Mymemo AI Solutions',
    description: 'Smart memory enhancement platform showcasing 117K+ views through innovative AI storytelling.',
    thumbnail:'insta reels/503051577_1407273850399847_2928174126947382849_n.jpg',
    link: 'https://www.instagram.com/reel/C6OhFZEr4ry/?hl=en',
  },
];

const BrandStories: React.FC = () => {
  // Duplicate stories array for seamless infinite scroll
  const duplicatedStories = [...brandStories, ...brandStories];

  // State for drag functionality
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  // Refs for carousel elements
  const carouselRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Pause/resume CSS animation based on user interaction
  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    if (isPaused || isDragging) {
      carousel.style.animationPlayState = 'paused';
    } else {
      carousel.style.animationPlayState = 'running';
    }
  }, [isPaused, isDragging]);

  // Delay auto-scroll start for Safari compatibility
  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    // Start with animation paused
    carousel.style.animationPlayState = 'paused';
    
    // Resume after Safari finishes layout
    const timer = setTimeout(() => {
      carousel.style.animationPlayState = 'running';
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Set up proper touch event listeners with passive: false for Safari
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e: TouchEvent) => {
      setIsPaused(true);
      setIsDragging(true);
      setDragStart(e.touches[0].pageX - container.offsetLeft);
      setScrollLeft(container.scrollLeft);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      e.preventDefault(); // Now this works because we set passive: false
      
      const x = e.touches[0].pageX - container.offsetLeft;
      const walk = (x - dragStart) * 2;
      const newScrollLeft = scrollLeft - walk;
      container.scrollLeft = newScrollLeft;
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
      // Resume auto-scroll after a short delay
      setTimeout(() => {
        setIsPaused(false);
      }, 100);
    };

    // Add event listeners with passive: false for Safari compatibility
    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, dragStart, scrollLeft]);

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    setIsPaused(true);
    setIsDragging(true);
    setDragStart(e.pageX - containerRef.current.offsetLeft);
    setScrollLeft(containerRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - dragStart) * 2;
    const newScrollLeft = scrollLeft - walk;
    containerRef.current.scrollLeft = newScrollLeft;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    // Resume auto-scroll after a short delay
    setTimeout(() => {
      setIsPaused(false);
    }, 100);
  };

  return (
    <section
      className="relative z-10 bg-[#0A0A0A] px-2 sm:px-3 md:px-4 lg:px-6 py-12 sm:py-16 md:py-20"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '0px',
        gap: '64px'
      }}
    >
      <div className="w-full max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16 lg:mb-20">
          <h2
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-white"
            style={{ fontFamily: 'Gilroy', fontWeight: 600 }}
          >
            Where Leading Brands Meet Engaging Stories
          </h2>
        </div>

        {/* Carousel Wrapper with edge vignette effect */}
        <div className="relative rounded-3xl overflow-hidden">
          {/* Left edge fade overlay */}
          <div className="absolute left-0 top-0 bottom-0 w-1 sm:w-2 bg-gradient-to-r from-[#0A0A0A]/60 to-transparent z-10 pointer-events-none"></div>

          {/* Right edge fade overlay */}
          <div className="absolute right-0 top-0 bottom-0 w-1 sm:w-2 bg-gradient-to-l from-[#0A0A0A]/60 to-transparent z-10 pointer-events-none"></div>

          {/* Carousel Content */}
          <div className="relative bg-[#0A0A0A] rounded-3xl p-2 md:p-8">
            <div
              ref={containerRef}
              className="overflow-x-auto scrollbar-hide pb-4 cursor-grab"
              style={{
                minWidth: '100%',
                cursor: isDragging ? 'grabbing' : 'grab',
                scrollBehavior: 'auto',
                touchAction: 'pan-x',
                overscrollBehaviorX: 'contain',
                userSelect: 'none',
                WebkitUserSelect: 'none',
                WebkitOverflowScrolling: 'touch',
                WebkitTransform: 'translateZ(0)',
                transform: 'translateZ(0)',
                willChange: 'scroll-position'
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <div
                ref={carouselRef}
                className="flex gap-6 animate-video-carousel"
                style={{
                  width: 'max-content'
                }}
              >
                {duplicatedStories.map((story, index) => (
                  <a
                    key={`${story.id}-${index}`}
                    href={story.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-start bg-[#1F1F1F] rounded-2xl group flex-shrink-0 cursor-pointer w-64 sm:w-72 md:w-80 lg:w-[340px] relative"
                    style={{
                      boxSizing: 'border-box',
                      padding: '14px 14px 18px 14px',
                      gap: '18px'
                    }}
                    onClick={(e) => {
                      if (isDragging) {
                        e.preventDefault();
                        return false;
                      }
                    }}
                  >
                    {/* Curved Gradient Border */}
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        borderRadius: '16px',
                        background: 'linear-gradient(226.35deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0) 50.5%)',
                        padding: '1px',
                        zIndex: 1
                      }}
                    >
                      <div
                        className="w-full h-full rounded-[15px]"
                        style={{
                          background: '#1F1F1F'
                        }}
                      ></div>
                    </div>

                    {/* Thumbnail Image - Square aspect ratio */}
                    <div
                      className="w-full rounded-lg overflow-hidden relative z-10"
                      style={{
                        aspectRatio: '1/1',
                        alignSelf: 'stretch',
                        flexShrink: 0
                      }}
                    >
                      <img
                        src={story.thumbnail}
                        alt={story.title}
                        className="w-full h-full object-cover"
                        style={{
                          borderRadius: '8px'
                        }}
                        onError={(e) => {
                          console.log('Thumbnail failed to load:', story.thumbnail);
                          const target = e.currentTarget;
                          target.src = 'https://via.placeholder.com/366x366/1F1F1F/FFFFFF?text=Brand+Story';
                        }}
                        onLoad={() => {
                          console.log(`Brand thumbnail loaded: ${story.thumbnail}`);
                        }}
                      />
                    </div>

                    {/* Content Section */}
                    <div
                      className="flex flex-col items-start w-full relative z-10"
                      style={{
                        gap: '16px',
                        alignSelf: 'stretch'
                      }}
                    >
                      {/* Title */}
                      <h3
                        className="w-full text-white"
                        style={{
                          fontFamily: 'Gilroy',
                          fontWeight: 600,
                          fontSize: '16px',
                          lineHeight: '130%',
                          alignSelf: 'stretch'
                        }}
                      >
                        {story.title}
                      </h3>

                      {/* Action Row */}
                      <div
                        className="flex flex-row justify-between items-center w-full"
                        style={{
                          gap: '24px',
                          alignSelf: 'stretch'
                        }}
                      >
                        {/* Watch Video Button */}
                        <div
                          className="flex flex-row items-center text-white"
                          style={{
                            gap: '8px',
                            fontFamily: 'Gilroy',
                            fontWeight: 600,
                            fontSize: '14px',
                            lineHeight: '100%'
                          }}
                        >
                          Watch Video
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            xmlns="http://www.w3.org/2000/svg"
                            style={{
                              flexShrink: 0
                            }}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="1.5"
                              d="M7 17l9.2-9.2M17 17V7h-10"
                            ></path>
                          </svg>
                        </div>

                        {/* View Count */}
                        <div
                          className="text-white"
                          style={{
                            fontFamily: 'Gilroy',
                            fontWeight: 600,
                            fontSize: '14px',
                            lineHeight: '100%',
                            textAlign: 'center'
                          }}
                        >
                          {story.id === 1 ? '1.2M+' :
                           story.id === 2 ? '600K+' :
                           story.id === 3 ? '250K+' :
                           story.id === 4 ? '200K+' :
                           story.id === 5 ? '185K+' :
                           story.id === 6 ? '171K+' :
                           story.id === 7 ? '140K+' :
                           '117K+'} views
                        </div>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BrandStories;