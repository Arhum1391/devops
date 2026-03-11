export interface User {
  _id?: string;
  username: string;
  password: string;
  createdAt: Date;
}

export interface TeamMember {
  _id?: string;
  id: number;
  name: string;
  role: string;
  about: string; // General about for mentorship flow
  bootcampAbout?: string; // Specific about for bootcamp pages
  calendar: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Subscriber {
  _id?: string;
  email: string;
  name?: string;
  subscribedAt: Date;
  isActive: boolean;
}

export interface Booking {
  _id?: string;
  clientName: string;
  clientEmail: string;
  service: string;
  date: Date;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: Date;
}

export type ReviewStatus = 'pending' | 'approved' | 'rejected';

export interface Review {
  _id?: string;
  analystId: number;
  analystName: string;
  reviewerName: string;
  userId?: string | null;
  reviewerId?: string | null;
  userProfilePicture?: string | null;
  rating: number;
  comment: string;
  reviewDate: string;
  status: ReviewStatus;
  createdAt: Date | string;
  updatedAt: Date | string;
  approvedAt?: Date | string;
  rejectedAt?: Date | string;
}

export interface Newsletter {
  _id?: string;
  title: string;
  content: string;
  fileUrl?: string;
  fileName?: string;
  publishedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface MentorDetail {
  mentorId: string;
  name: string;
  role: string;
  image?: string;
  description: string;
}

export interface CurriculumSection {
  weekRange: string; // e.g., "Week 1-2"
  title: string;
  icon: string; // icon name for rendering
  items: string[];
}

export interface TargetAudience {
  title: string;
  subtitle: string;
  items: string[];
}

export type ComplianceComparison = 'less_than' | 'greater_than' | 'equal' | 'custom';

export interface ComplianceMetric {
  criteria: string;
  threshold: string;
  actual: string;
  comparisonType: ComplianceComparison;
  customStatus?: 'pass' | 'fail';
}

export interface CustomTable {
  title: string; // Table title/name
  headings: string[]; // Exactly 4 column headings
  rows: Array<{ values: string[] }>; // Each row contains exactly 4 values
}

export interface InfoCards {
  duration: {
    value: string;
    label: string;
  };
  mode: {
    value: string;
    label: string;
  };
  interactive: {
    value: string;
    label: string;
  };
  certificate: {
    value: string;
    label: string;
  };
  registrationText: string; // Full registration period text
}

export interface Bootcamp {
  _id?: string;
  id: string;
  title: string;
  description: string;
  price: string; // Display price (e.g., "$99")
  priceAmount: number; // Numeric price in dollars for Stripe (e.g., 99)
  duration: string;
  format: 'Online' | 'In-Person' | 'Hybrid';
  mentors: string[];
  registrationStartDate: Date;
  registrationEndDate: Date;
  bootcampStartDate?: Date; // When the bootcamp actually starts
  tags: string[];
  gradientPosition: {
    left: string;
    top: string;
    rotation: string;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // New detailed content fields
  heroSubheading?: string;
  heroDescription?: string[];
  infoCards?: InfoCards;
  mentorDetails?: MentorDetail[];
  curriculumSections?: CurriculumSection[];
  targetAudience?: TargetAudience;
}

export interface DashboardStats {
  teamMembers: number;
  subscribers: number;
  bookingsToday: number;
  activeBootcamps: number;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface ResearchPageContent {
  _id?: string;
  // Hero section for authenticated users
  heroTitleAuthenticated: string;
  heroDescriptionAuthenticated: string;
  // Hero section for guest users
  heroTitleGuest: string;
  heroDescriptionGuest: string;
  heroBulletPoints: string[]; // Array of bullet point texts
  // FAQ section
  faqTitle: string;
  faqDescription: string;
  faqItems: FAQItem[];
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

export interface ShariahTile {
  _id?: string;
  slug: string;
  title: string;
  category: string;
  description: string;
  compliancePoints: string[];
  footerLeft: string;
  footerRight: string;
  ctaLabel: string;
  detailPath: string;
  lockedTitle: string;
  lockedDescription: string;
  analystNotes: string;
  complianceMetrics?: ComplianceMetric[];
  customTable?: CustomTable;
  createdAt: Date;
  updatedAt: Date;
}

export interface BootcampLesson {
  _id?: string;
  lessonId: string;
  bootcampId: string;
  title: string;
  description?: string;
  youtubeVideoId: string;
  thumbnail?: string;
  order: number;
  duration?: number; // Duration in seconds
  createdAt: Date;
  updatedAt: Date;
}

export interface LessonProgress {
  lessonId: string;
  progress: number; // 0-100
  lastWatchedAt?: Date;
  completedAt?: Date;
}

export interface BootcampProgress {
  _id?: string;
  userId: string;
  bootcampId: string;
  lessons: LessonProgress[];
  updatedAt: Date;
}