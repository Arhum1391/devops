import { Bootcamp } from '@/types/admin';

export const getFallbackBootcamps = (): Bootcamp[] => [
  {
    _id: 'fallback-1',
    id: 'crypto-trading',
    title: 'Crypto Trading Bootcamp',
    description: 'Gain the skills to analyze crypto markets with confidence, manage risks like a pro, and apply proven trading strategies.',
    price: '$30 USD',
    duration: '6 Weeks',
    format: 'Online',
    mentors: ['Adnan - Senior Marketing Analyst', 'Assassin - Co-Founder, TechSol'],
    registrationStartDate: new Date('2025-10-01'),
    registrationEndDate: new Date('2025-10-30'),
    tags: ['6 Weeks', 'Online'],
    gradientPosition: { left: '399px', top: '-326px', rotation: '90deg' },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    
    // New detailed content fields
    heroSubheading: 'Master cryptocurrency trading with proven strategies, technical analysis, and risk management. Transform from beginner to confident trader in just 6 weeks.',
    heroDescription: [
      'The Crypto Trading Bootcamp is designed for anyone who wants to confidently trade cryptocurrencies by combining technical analysis, market psychology, and practical strategies. Over 6 weeks, you\'ll learn how to read charts, identify trends, manage risks, and build a sustainable trading approach that suits your goals.',
      'Unlike generic trading courses, this mentorship bootcamp is interactive and guided by a Senior Crypto Analyst with years of hands-on experience. You\'ll work on real market scenarios, case studies, and live examples — ensuring that you not only learn but also apply the strategies in real time.'
    ],
    infoCards: {
      duration: {
        value: '6 Weeks',
        label: 'Duration'
      },
      mode: {
        value: 'Online',
        label: 'Mode'
      },
      interactive: {
        value: 'Live Sessions',
        label: 'Interactive'
      },
      certificate: {
        value: 'Certificate',
        label: 'Completion'
      },
      registrationText: '1st Oct, 2025 - 30th Oct, 2025'
    },
    mentorDetails: [
      {
        mentorId: 'adnan',
        name: 'Adnan',
        role: 'Senior Marketing Analyst',
        image: '/team dark/Adnan.png',
        description: 'Content creator specializing in stocks, crypto, data science, and side hustles. Known for making complex financial concepts accessible with humor and real-world examples.'
      },
      {
        mentorId: 'assassin',
        name: 'Assassin',
        role: 'Co-Founder, TechSol',
        image: '/team dark/Assassin.png',
        description: 'Co-founder with deep expertise in Fibonacci retracements, ICT concepts, volume profiling, and institutional orderflow. Trading crypto since 2019.'
      }
    ],
    curriculumSections: [
      {
        weekRange: 'Week 1-2',
        title: 'Crypto Fundamentals',
        icon: 'BookOpen',
        items: [
          'Blockchain technology basics',
          'Understanding market cycles',
          'Major cryptocurrencies overview',
          'Wallet security & setup'
        ]
      },
      {
        weekRange: 'Week 3-4',
        title: 'Technical Analysis',
        icon: 'TrendingUp',
        items: [
          'Chart patterns & indicators',
          'Support & resistance levels',
          'Volume & momentum studies',
          'Candlestick analysis'
        ]
      },
      {
        weekRange: 'Week 5-6',
        title: 'Advanced Strategies',
        icon: 'Target',
        items: [
          'Risk management techniques',
          'Portfolio diversification',
          'DeFi & yield farming',
          'Trading psychology'
        ]
      }
    ],
    targetAudience: {
      title: 'Who Should Join?',
      subtitle: 'This bootcamp is perfect for:',
      items: [
        'Beginners who want to enter the crypto trading world with confidence.',
        'Traders who want to refine their strategies and avoid common mistakes.',
        'Investors looking to manage risk and grow their crypto portfolios.'
      ]
    }
  },
  {
    _id: 'fallback-2',
    id: 'ai-data-finance',
    title: 'AI & Data for Finance',
    description: 'Explore the power of AI-driven trading, master data analysis techniques, and learn how to build automated systems that uncover market opportunities and enhance decision-making.',
    price: '$30 USD',
    duration: '4 Weeks',
    format: 'Online',
    mentors: ['Hassan Tariq - Senior Crypto Analyst', 'Hamza Ali - Risk Management Specialist', 'Meower - Breakout Trading Specialist'],
    registrationStartDate: new Date('2025-10-01'),
    registrationEndDate: new Date('2025-10-30'),
    tags: ['4 Weeks', 'Online'],
    gradientPosition: { left: '365.45px', top: '-359.87px', rotation: '-172.95deg' },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: 'fallback-3',
    id: 'forex-mastery',
    title: 'Forex Mastery Mentorship',
    description: 'Learn the fundamentals of forex trading, develop the skills to read live charts with accuracy, and apply advanced strategies to navigate global currency markets with confidence.',
    price: '$30 USD',
    duration: '8 Weeks',
    format: 'Online',
    mentors: ['Adnan - Senior Marketing Analyst', 'Hassan Khan - Gold Trading Expert & Co-Founder'],
    registrationStartDate: new Date('2025-10-01'),
    registrationEndDate: new Date('2025-10-30'),
    tags: ['8 Weeks', 'Online'],
    gradientPosition: { left: '367px', top: '-359px', rotation: '-96.58deg' },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: 'fallback-4',
    id: 'stock-investing',
    title: 'Stock Market Investing Bootcamp',
    description: 'Learn how to build and manage a strong investment portfolio, accurately value companies, and apply long-term wealth-building strategies that stand the test of time.',
    price: '$30 USD',
    duration: '6 Weeks',
    format: 'Online',
    mentors: ['Mohid - Advanced ICT Mentor', 'Assassin - Co-Founder, TechSol'],
    registrationStartDate: new Date('2025-10-01'),
    registrationEndDate: new Date('2025-10-30'),
    tags: ['6 Weeks', 'Online'],
    gradientPosition: { left: '399px', top: '-326px', rotation: '90deg' },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: 'fallback-5',
    id: 'web3-blockchain',
    title: 'Web3 & Blockchain Mentorship',
    description: 'Take a deep dive into blockchain technology, understand the mechanics of smart contracts, and explore the world of decentralized finance (DeFi) to unlcok real-world applications of Web3.',
    price: '$30 USD',
    duration: '5 Weeks',
    format: 'Online',
    mentors: ['M. Usama - Multi-Asset Trader', 'Meower - Breakout Trading Specialist'],
    registrationStartDate: new Date('2025-10-01'),
    registrationEndDate: new Date('2025-10-30'),
    tags: ['5 Weeks', 'Online'],
    gradientPosition: { left: '365.45px', top: '-326px', rotation: '-172.95deg' },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: 'fallback-6',
    id: 'career-growth',
    title: 'Career Growth in Finance & Tech',
    description: 'Receive personalized career guidance, professional resume reviews, and interview preparation directly from industry mentors to help you stand out and achieve your career goals in finance and technology.',
    price: '$30 USD',
    duration: '4 Weeks',
    format: 'Online',
    mentors: ['Hamza Ali - Risk Management Specialist', 'Mohid - Advanced ICT Mentor'],
    registrationStartDate: new Date('2025-10-01'),
    registrationEndDate: new Date('2025-10-30'),
    tags: ['4 Weeks', 'Online'],
    gradientPosition: { left: '367.25px', top: '-357.75px', rotation: '-96.58deg' },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];
