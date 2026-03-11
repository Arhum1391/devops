'use client';

import { useState, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { ChevronDown, X } from 'lucide-react';
import Navbar from '@/components/Navbar';
import MinimalBackground from '@/components/MinimalBackground';
import TechAnimations from '@/components/TechAnimations';

type AnalystOption = {
    id: number;
    name: string;
    description: string;
};

type ReviewItem = {
    _id: string;
    analystId: number;
    analystName: string;
    reviewerName: string;
    userId?: string | null;
    userProfilePicture?: string | null;
    rating: number;
    comment: string;
    reviewDate: string;
    createdAt: string;
};

const DESKTOP_REVIEWS_PER_PAGE = 9;
const MOBILE_REVIEWS_PER_PAGE = 6;
const MIN_COMMENT_LENGTH = 10;
const MAX_NAME_LENGTH = 25;

const getTodayDate = () => new Date().toISOString().split('T')[0];

const ReviewsContent: React.FC = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [currentPage, setCurrentPage] = useState(1);
    const [isMobile, setIsMobile] = useState(false);
    const [analysts, setAnalysts] = useState<AnalystOption[]>([]);
    const [selectedAnalyst, setSelectedAnalyst] = useState<number | null>(null);
    const [reviews, setReviews] = useState<ReviewItem[]>([]);
    const [isLoadingAnalysts, setIsLoadingAnalysts] = useState(true);
    const [isLoadingReviews, setIsLoadingReviews] = useState(false);
    const [reviewsError, setReviewsError] = useState('');
    const [isAddReviewOpen, setIsAddReviewOpen] = useState(false);
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);
    const [reviewSuccessMessage, setReviewSuccessMessage] = useState('');
    const [reviewErrorMessage, setReviewErrorMessage] = useState('');
    const [reviewForm, setReviewForm] = useState({
        reviewerName: '',
        rating: 5,
        reviewDate: getTodayDate(),
        comment: '',
    });
    const reviewsPerPage = isMobile ? MOBILE_REVIEWS_PER_PAGE : DESKTOP_REVIEWS_PER_PAGE;

    useEffect(() => {
        const checkIsMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        
        checkIsMobile();
        window.addEventListener('resize', checkIsMobile);
        
        return () => window.removeEventListener('resize', checkIsMobile);
    }, []);

    useEffect(() => {
        const fetchAnalysts = async () => {
            try {
                setIsLoadingAnalysts(true);
                const response = await fetch('/api/team'
                );
                if (!response.ok) {
                    throw new Error('Failed to fetch analysts');
                }
                const data = await response.json();
                setAnalysts(data.team || []);
            } catch (error) {
                console.error('Failed to load analysts:', error);
                setAnalysts([]);
            } finally {
                setIsLoadingAnalysts(false);
            }
        };

        fetchAnalysts();
    }, []);

    useEffect(() => {
        if (!analysts.length) return;

        const queryAnalyst = searchParams.get('selectedAnalyst') ?? searchParams.get('analyst');

        setSelectedAnalyst(prev => {
            if (prev !== null && analysts.some(analyst => analyst.id === prev)) {
                return prev;
            }

            if (queryAnalyst) {
                const parsed = Number(queryAnalyst);
                if (!Number.isNaN(parsed) && analysts.some(analyst => analyst.id === parsed)) {
                    return parsed;
                }
            }

            return analysts[0]?.id ?? null;
        });
    }, [analysts, searchParams]);

    useEffect(() => {
        if (selectedAnalyst === null) {
            setReviews([]);
            return;
        }

        const controller = new AbortController();

        const fetchReviews = async () => {
            try {
                setIsLoadingReviews(true);
                setReviewsError('');
                const response = await fetch(`/api/reviews?analystId=${selectedAnalyst}`, {
                    signal: controller.signal,
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch reviews');
                }

                const data = await response.json();
                setReviews(data.reviews || []);
                setCurrentPage(1);
            } catch (error) {
                if ((error as Error).name === 'AbortError') return;
                console.error('Failed to load reviews:', error);
                setReviews([]);
                setReviewsError('Unable to load reviews right now. Please try again later.');
            } finally {
                setIsLoadingReviews(false);
            }
        };

        fetchReviews();

        return () => controller.abort();
    }, [selectedAnalyst]);

    const handleBack = () => {
        const step = searchParams.get('step');
        const selectedAnalyst = searchParams.get('selectedAnalyst');
        if (step) {
            // Navigate back to the meetings page with the specific step and selected analyst
            const params = new URLSearchParams();
            params.set('step', step);
            if (selectedAnalyst) {
                params.set('selectedAnalyst', selectedAnalyst);
            }
            router.push(`/meetings?${params.toString()}`);
        } else {
            // Fallback to browser back
            router.back();
        }
    };

    const totalPages = Math.ceil(reviews.length / reviewsPerPage);
    const startIndex = (currentPage - 1) * reviewsPerPage;
    const endIndex = startIndex + reviewsPerPage;
    const currentReviews = reviews.slice(startIndex, endIndex);
    const activeAnalyst = selectedAnalyst !== null ? analysts.find(analyst => analyst.id === selectedAnalyst) : null;
    const showEmptyState = !isLoadingReviews && reviews.length === 0;

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleAnalystChange = (id: number) => {
        setSelectedAnalyst(id);
        setCurrentPage(1);

        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            params.set('selectedAnalyst', String(id));
            router.replace(`/reviews?${params.toString()}`, { scroll: false });
        }
    };

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, index) => (
            <svg
                key={index}
                className={`w-4 h-4 ${index < rating ? 'text-[#DE50EC]' : 'text-gray-600'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
            >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
        ));
    };

    const formatReviewDate = (dateString: string) => {
        if (!dateString) return '';
        const parsed = new Date(dateString);
        if (Number.isNaN(parsed.getTime())) {
            return dateString;
        }
        return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const openReviewDrawer = () => {
        setReviewForm({
            reviewerName: '',
            rating: 5,
            reviewDate: getTodayDate(),
            comment: '',
        });
        setReviewSuccessMessage('');
        setReviewErrorMessage('');
        setIsAddReviewOpen(true);
    };

    const closeReviewDrawer = () => {
        setIsAddReviewOpen(false);
    };

    const handleReviewInputChange = (field: 'reviewerName' | 'comment' | 'reviewDate', value: string) => {
        setReviewForm(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSubmitReview = async (event: React.FormEvent) => {
        event.preventDefault();

        if (selectedAnalyst === null) {
            setReviewErrorMessage('Please select an analyst before submitting a review.');
            return;
        }

        if (reviewForm.comment.trim().length < MIN_COMMENT_LENGTH) {
            setReviewErrorMessage(`Comment must be at least ${MIN_COMMENT_LENGTH} characters long.`);
            return;
        }

        if (reviewForm.reviewerName.trim().length < 2) {
            setReviewErrorMessage('Please enter your name.');
            return;
        }

        if (reviewForm.reviewerName.trim().length > MAX_NAME_LENGTH) {
            setReviewErrorMessage(`Name must not exceed ${MAX_NAME_LENGTH} characters.`);
            return;
        }

        try {
            setIsSubmittingReview(true);
            setReviewSuccessMessage('');
            setReviewErrorMessage('');

            const response = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    analystId: selectedAnalyst,
                    reviewerName: reviewForm.reviewerName.trim(),
                    rating: reviewForm.rating,
                    comment: reviewForm.comment.trim(),
                    reviewDate: getTodayDate(),
                }),
            });

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data.error || 'Failed to submit review');
            }

            setReviewSuccessMessage('Review Logged');
            setReviewForm(prev => ({
                ...prev,
                reviewerName: '',
                comment: '',
                reviewDate: getTodayDate(),
                rating: 5,
            }));

            setTimeout(() => {
                setIsAddReviewOpen(false);
                setReviewSuccessMessage('');
            }, 1500);
        } catch (error) {
            console.error('Review submission failed:', error);
            setReviewErrorMessage((error as Error).message || 'Something went wrong. Please try again.');
        } finally {
            setIsSubmittingReview(false);
        }
    };

    return (
        <div className="bg-[#0D0D0D] min-h-screen text-white font-sans relative overflow-hidden">
            {/* Minimal Background */}
            <MinimalBackground />

            {/* Tech-related Foreground Animations */}
            <TechAnimations />

            {/* Navigation Header */}
            <Navbar variant="hero" />

            {/* Mobile Image Belts - Only visible on mobile */}
            <div className="lg:hidden flex flex-col justify-center items-center h-40 sm:h-48 relative w-full overflow-hidden mt-24">
                <div className="flex flex-col w-full h-full gap-2">
                    {/* Belt 1 - Rectangle 1 Images */}
                    <div className="flex-1 fade-mask overflow-hidden">
                        <div className="animate-scrollUp flex h-16 sm:h-20 md:h-24 flex-row gap-3 sm:gap-4">
                            {/* First set of images */}
                            <div
                                className="aspect-[1.95/1] h-full rounded-full overflow-hidden bg-zinc-800 flex-shrink-0 w-28"
                                style={{
                                    backgroundImage: 'url("team-mob/1.png")',
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    backgroundRepeat: 'no-repeat'
                                }}
                            ></div>
                            <div
                                className="aspect-[1.95/1] h-full rounded-full overflow-hidden bg-zinc-800 flex-shrink-0 w-28"
                                style={{
                                    backgroundImage: 'url("team-mob/2 improved.png")',
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    backgroundRepeat: 'no-repeat'
                                }}
                            ></div>
                            <div
                                className="aspect-[1.95/1] h-full rounded-full overflow-hidden bg-zinc-800 flex-shrink-0 w-28"
                                style={{
                                    backgroundImage: 'url("team-mob/3.jpg")',
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    backgroundRepeat: 'no-repeat'
                                }}
                            ></div>
                            <div
                                className="aspect-[1.95/1] h-full rounded-full overflow-hidden bg-zinc-800 flex-shrink-0 w-28"
                                style={{
                                    backgroundImage: 'url("team-mob/4 - colored.png")',
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    backgroundRepeat: 'no-repeat'
                                }}
                            ></div>
                            <div
                                className="aspect-[1.95/1] h-full rounded-full overflow-hidden bg-zinc-800 flex-shrink-0 w-28"
                                style={{
                                    backgroundImage: 'url("team-mob/5.png")',
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    backgroundRepeat: 'no-repeat'
                                }}
                            ></div>
                            <div
                                className="aspect-[1.95/1] h-full rounded-full overflow-hidden bg-zinc-800 flex-shrink-0 w-28"
                                style={{
                                    backgroundImage: 'url("team-mob/6.jpg")',
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    backgroundRepeat: 'no-repeat'
                                }}
                            ></div>
                            <div
                                className="aspect-[1.95/1] h-full rounded-full overflow-hidden bg-zinc-800 flex-shrink-0 w-28"
                                style={{
                                    backgroundImage: 'url("team-mob/7.png")',
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    backgroundRepeat: 'no-repeat'
                                }}
                            ></div>
                            <div
                                className="aspect-[1.95/1] h-full rounded-full overflow-hidden bg-zinc-800 flex-shrink-0 w-28"
                                style={{
                                    backgroundImage: 'url("team-mob/cc997f059c3f8ef1a60e530cd062817abadc1f9a.jpg")',
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    backgroundRepeat: 'no-repeat'
                                }}
                            ></div>
                            {/* Duplicate for seamless loop */}
                            <div
                                className="aspect-[1.95/1] h-full rounded-full overflow-hidden bg-zinc-800 flex-shrink-0 w-28"
                                style={{
                                    backgroundImage: 'url("team-mob/1.png")',
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    backgroundRepeat: 'no-repeat'
                                }}
                            ></div>
                            <div
                                className="aspect-[1.95/1] h-full rounded-full overflow-hidden bg-zinc-800 flex-shrink-0 w-28"
                                style={{
                                    backgroundImage: 'url("team-mob/2 improved.png")',
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    backgroundRepeat: 'no-repeat'
                                }}
                            ></div>
                            <div
                                className="aspect-[1.95/1] h-full rounded-full overflow-hidden bg-zinc-800 flex-shrink-0 w-28"
                                style={{
                                    backgroundImage: 'url("team-mob/3.jpg")',
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    backgroundRepeat: 'no-repeat'
                                }}
                            ></div>
                            <div
                                className="aspect-[1.95/1] h-full rounded-full overflow-hidden bg-zinc-800 flex-shrink-0 w-28"
                                style={{
                                    backgroundImage: 'url("team-mob/4 - colored.png")',
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    backgroundRepeat: 'no-repeat'
                                }}
                            ></div>
                            <div
                                className="aspect-[1.95/1] h-full rounded-full overflow-hidden bg-zinc-800 flex-shrink-0 w-28"
                                style={{
                                    backgroundImage: 'url("team-mob/5.png")',
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    backgroundRepeat: 'no-repeat'
                                }}
                            ></div>
                            <div
                                className="aspect-[1.95/1] h-full rounded-full overflow-hidden bg-zinc-800 flex-shrink-0 w-28"
                                style={{
                                    backgroundImage: 'url("team-mob/6.jpg")',
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    backgroundRepeat: 'no-repeat'
                                }}
                            ></div>
                            <div
                                className="aspect-[1.95/1] h-full rounded-full overflow-hidden bg-zinc-800 flex-shrink-0 w-28"
                                style={{
                                    backgroundImage: 'url("team-mob/7.png")',
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    backgroundRepeat: 'no-repeat'
                                }}
                            ></div>
                            <div
                                className="aspect-[1.95/1] h-full rounded-full overflow-hidden bg-zinc-800 flex-shrink-0 w-28"
                                style={{
                                    backgroundImage: 'url("team-mob/cc997f059c3f8ef1a60e530cd062817abadc1f9a.jpg")',
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    backgroundRepeat: 'no-repeat'
                                }}
                            ></div>
                        </div>
                    </div>

                    {/* Belt 2 - Rectangle 2 Images */}
                    <div className="flex-1 fade-mask overflow-hidden">
                        <div className="animate-scrollDown flex h-16 sm:h-20 md:h-24 flex-row gap-3 sm:gap-4">
                            {/* First set of images */}
                            <div
                                className="aspect-[1.95/1] h-full rounded-full overflow-hidden bg-zinc-800 flex-shrink-0 w-28"
                                style={{
                                    backgroundImage: 'url("team-mob/5.png")',
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    backgroundRepeat: 'no-repeat'
                                }}
                            ></div>
                            <div
                                className="aspect-[1.95/1] h-full rounded-full overflow-hidden bg-zinc-800 flex-shrink-0 w-28"
                                style={{
                                    backgroundImage: 'url("team-mob/6.jpg")',
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    backgroundRepeat: 'no-repeat'
                                }}
                            ></div>
                            <div
                                className="aspect-[1.95/1] h-full rounded-full overflow-hidden bg-zinc-800 flex-shrink-0 w-28"
                                style={{
                                    backgroundImage: 'url("team-mob/7.png")',
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    backgroundRepeat: 'no-repeat'
                                }}
                            ></div>
                            <div
                                className="aspect-[1.95/1] h-full rounded-full overflow-hidden bg-zinc-800 flex-shrink-0 w-28"
                                style={{
                                    backgroundImage: 'url("team-mob/cc997f059c3f8ef1a60e530cd062817abadc1f9a.jpg")',
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    backgroundRepeat: 'no-repeat'
                                }}
                            ></div>
                            <div
                                className="aspect-[1.95/1] h-full rounded-full overflow-hidden bg-zinc-800 flex-shrink-0 w-28"
                                style={{
                                    backgroundImage: 'url("team-mob/1.png")',
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    backgroundRepeat: 'no-repeat'
                                }}
                            ></div>
                            <div
                                className="aspect-[1.95/1] h-full rounded-full overflow-hidden bg-zinc-800 flex-shrink-0 w-28"
                                style={{
                                    backgroundImage: 'url("team-mob/2 improved.png")',
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    backgroundRepeat: 'no-repeat'
                                }}
                            ></div>
                            <div
                                className="aspect-[1.95/1] h-full rounded-full overflow-hidden bg-zinc-800 flex-shrink-0 w-28"
                                style={{
                                    backgroundImage: 'url("team-mob/3.jpg")',
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    backgroundRepeat: 'no-repeat'
                                }}
                            ></div>
                            <div
                                className="aspect-[1.95/1] h-full rounded-full overflow-hidden bg-zinc-800 flex-shrink-0 w-28"
                                style={{
                                    backgroundImage: 'url("team-mob/4 - colored.png")',
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    backgroundRepeat: 'no-repeat'
                                }}
                            ></div>
                            {/* Duplicate for seamless loop */}
                            <div
                                className="aspect-[1.95/1] h-full rounded-full overflow-hidden bg-zinc-800 flex-shrink-0 w-28"
                                style={{
                                    backgroundImage: 'url("team-mob/5.png")',
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    backgroundRepeat: 'no-repeat'
                                }}
                            ></div>
                            <div
                                className="aspect-[1.95/1] h-full rounded-full overflow-hidden bg-zinc-800 flex-shrink-0 w-28"
                                style={{
                                    backgroundImage: 'url("team-mob/6.jpg")',
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    backgroundRepeat: 'no-repeat'
                                }}
                            ></div>
                            <div
                                className="aspect-[1.95/1] h-full rounded-full overflow-hidden bg-zinc-800 flex-shrink-0 w-28"
                                style={{
                                    backgroundImage: 'url("team-mob/7.png")',
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    backgroundRepeat: 'no-repeat'
                                }}
                            ></div>
                            <div
                                className="aspect-[1.95/1] h-full rounded-full overflow-hidden bg-zinc-800 flex-shrink-0 w-28"
                                style={{
                                    backgroundImage: 'url("team-mob/cc997f059c3f8ef1a60e530cd062817abadc1f9a.jpg")',
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    backgroundRepeat: 'no-repeat'
                                }}
                            ></div>
                            <div
                                className="aspect-[1.95/1] h-full rounded-full overflow-hidden bg-zinc-800 flex-shrink-0 w-28"
                                style={{
                                    backgroundImage: 'url("team-mob/1.png")',
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    backgroundRepeat: 'no-repeat'
                                }}
                            ></div>
                            <div
                                className="aspect-[1.95/1] h-full rounded-full overflow-hidden bg-zinc-800 flex-shrink-0 w-28"
                                style={{
                                    backgroundImage: 'url("team-mob/2 improved.png")',
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    backgroundRepeat: 'no-repeat'
                                }}
                            ></div>
                            <div
                                className="aspect-[1.95/1] h-full rounded-full overflow-hidden bg-zinc-800 flex-shrink-0 w-28"
                                style={{
                                    backgroundImage: 'url("team-mob/3.jpg")',
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    backgroundRepeat: 'no-repeat'
                                }}
                            ></div>
                            <div
                                className="aspect-[1.95/1] h-full rounded-full overflow-hidden bg-zinc-800 flex-shrink-0 w-28"
                                style={{
                                    backgroundImage: 'url("team-mob/4 - colored.png")',
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    backgroundRepeat: 'no-repeat'
                                }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Container - Same structure as booking page */}
            <div className="flex items-center justify-center p-4 sm:p-6 lg:p-8 -mt-2 lg:-mt-8">
                <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-16 items-center">
                
                {/* Left Side: Image Belts */}
                <div className="hidden lg:flex justify-center items-start h-full relative w-full max-w-sm">
                    <div className="flex w-64 xl:w-80 h-screen pt-20 fixed left-24 xl:left-32 top-0">
                        {/* Belt 1 - Rectangle 1 Images */}
                        <div className="flex-1 fade-mask overflow-hidden">
                            <div className="animate-scrollUp flex flex-col gap-6">
                                {/* First set of images */}
                                <div
                                    className="aspect-[1/2.2] w-28 rounded-full bg-zinc-800 ml-auto mr-1"
                                    style={{
                                        backgroundImage: 'url("inspired analysts team/1.png")',
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                        backgroundRepeat: 'no-repeat'
                                    }}
                                ></div>
                                <div
                                    className="aspect-[1/2.2] w-28 rounded-full bg-zinc-800 ml-auto mr-1"
                                    style={{
                                        backgroundImage: 'url("inspired analysts team/2 improved.png")',
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                        backgroundRepeat: 'no-repeat'
                                    }}
                                ></div>
                                <div
                                    className="aspect-[1/2.2] w-28 rounded-full bg-zinc-800 ml-auto mr-1"
                                    style={{
                                        backgroundImage: 'url("inspired analysts team/3.jpg")',
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                        backgroundRepeat: 'no-repeat'
                                    }}
                                ></div>
                                <div
                                    className="aspect-[1/2.2] w-28 rounded-full bg-zinc-800 ml-auto mr-1"
                                    style={{
                                        backgroundImage: 'url("inspired analysts team/4.png")',
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                        backgroundRepeat: 'no-repeat'
                                    }}
                                ></div>
                                {/* Duplicate for seamless loop */}
                                <div
                                    className="aspect-[1/2.2] w-28 rounded-full bg-zinc-800 ml-auto mr-1"
                                    style={{
                                        backgroundImage: 'url("inspired analysts team/1.png")',
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                        backgroundRepeat: 'no-repeat'
                                    }}
                                ></div>
                                <div
                                    className="aspect-[1/2.2] w-28 rounded-full bg-zinc-800 ml-auto mr-1"
                                    style={{
                                        backgroundImage: 'url("inspired analysts team/2 improved.png")',
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                        backgroundRepeat: 'no-repeat'
                                    }}
                                ></div>
                                <div
                                    className="aspect-[1/2.2] w-28 rounded-full bg-zinc-800 ml-auto mr-1"
                                    style={{
                                        backgroundImage: 'url("inspired analysts team/3.jpg")',
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                        backgroundRepeat: 'no-repeat'
                                    }}
                                ></div>
                                <div
                                    className="aspect-[1/2.2] w-28 rounded-full bg-zinc-800 ml-auto mr-1"
                                    style={{
                                        backgroundImage: 'url("inspired analysts team/4.png")',
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                        backgroundRepeat: 'no-repeat'
                                    }}
                                ></div>
                            </div>
                        </div>

                        {/* Belt 2 - Rectangle 2 Images */}
                        <div className="flex-1 fade-mask overflow-hidden">
                            <div className="animate-scrollDown flex flex-col gap-6">
                                {/* First set of images */}
                                <div
                                    className="aspect-[1/2.2] w-28 rounded-full bg-zinc-800 ml-1 mr-auto"
                                    style={{
                                        backgroundImage: 'url("inspired analysts team/5.png")',
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                        backgroundRepeat: 'no-repeat'
                                    }}
                                ></div>
                                <div
                                    className="aspect-[1/2.2] w-28 rounded-full bg-zinc-800 ml-1 mr-auto"
                                    style={{
                                        backgroundImage: 'url("inspired analysts team/6.jpg")',
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                        backgroundRepeat: 'no-repeat'
                                    }}
                                ></div>
                                <div
                                    className="aspect-[1/2.2] w-28 rounded-full bg-zinc-800 ml-1 mr-auto"
                                    style={{
                                        backgroundImage: 'url("inspired analysts team/7.png")',
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                        backgroundRepeat: 'no-repeat'
                                    }}
                                ></div>
                                <div
                                    className="aspect-[1/2.2] w-28 rounded-full bg-zinc-800 ml-1 mr-auto"
                                    style={{
                                        backgroundImage: 'url("inspired analysts team/2.jpg")',
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                        backgroundRepeat: 'no-repeat'
                                    }}
                                ></div>
                                {/* Duplicate for seamless loop */}
                                <div
                                    className="aspect-[1/2.2] w-28 rounded-full bg-zinc-800 ml-1 mr-auto"
                                    style={{
                                        backgroundImage: 'url("inspired analysts team/5.png")',
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                        backgroundRepeat: 'no-repeat'
                                    }}
                                ></div>
                                <div
                                    className="aspect-[1/2.2] w-28 rounded-full bg-zinc-800 ml-1 mr-auto"
                                    style={{
                                        backgroundImage: 'url("inspired analysts team/6.jpg")',
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                        backgroundRepeat: 'no-repeat'
                                    }}
                                ></div>
                                <div
                                    className="aspect-[1/2.2] w-28 rounded-full bg-zinc-800 ml-1 mr-auto"
                                    style={{
                                        backgroundImage: 'url("inspired analysts team/7.png")',
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                        backgroundRepeat: 'no-repeat'
                                    }}
                                ></div>
                                <div
                                    className="aspect-[1/2.2] w-28 rounded-full bg-zinc-800 ml-1 mr-auto"
                                    style={{
                                        backgroundImage: 'url("inspired analysts team/2.jpg")',
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                        backgroundRepeat: 'no-repeat'
                                    }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>

                        {/* Right Side - Content Area (Reviews) */}
                        <div className="w-full lg:col-span-2">
                            {/* Back Button */}
                            <div className="mb-1 mt-24">
                                <button 
                                    onClick={handleBack}
                                    className="flex items-center text-white hover:text-gray-300 transition-colors focus:outline-none focus:ring-0 focus:border-none active:outline-none"
                                    style={{
                                        outline: 'none',
                                        border: 'none',
                                        boxShadow: 'none'
                                    }}
                                >
                                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                    Back
                                </button>
                            </div>

                            {/* Title, Filters and Actions */}
                            <div className="mb-8 mt-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                                <div>
                                    <h1 className="text-4xl font-bold mb-2">Reviews</h1>
                                    <p className="text-gray-400 text-lg">Real stories from people just like you.</p>
                                    {activeAnalyst && (
                                        <p className="text-sm text-gray-400 mt-2">
                                            Currently viewing feedback for <span className="text-white font-semibold">{activeAnalyst.name}</span>
                                        </p>
                                    )}
                                </div>
                                <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                                    <div className="relative w-full sm:w-64">
                                        <div className="absolute inset-0 rounded-lg border border-[#2A2A2A] pointer-events-none"></div>
                                        <select
                                            value={selectedAnalyst ?? ''}
                                            onChange={(e) => handleAnalystChange(Number(e.target.value))}
                                            disabled={isLoadingAnalysts || !analysts.length}
                                            className="w-full h-12 bg-[#0A0A0A] text-white rounded-lg px-4 pr-10 appearance-none focus:outline-none disabled:text-gray-500"
                                        >
                                            <option value="" disabled>
                                                {isLoadingAnalysts ? 'Loading analysts...' : 'Select analyst'}
                                            </option>
                                            {analysts.map((analyst) => (
                                                <option key={analyst.id} value={analyst.id}>
                                                    {analyst.name}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                                    </div>
                                    <button
                                        onClick={openReviewDrawer}
                                        disabled={selectedAnalyst === null || isLoadingAnalysts}
                                        className={`h-12 px-6 rounded-full font-semibold transition-all duration-300 ${
                                            selectedAnalyst === null || isLoadingAnalysts
                                                ? 'bg-white/20 text-gray-300 cursor-not-allowed'
                                                : 'bg-white text-black hover:bg-gray-200'
                                        }`}
                                        style={{ boxShadow: '0px 4px 24px rgba(0, 0, 0, 0.35)' }}
                                    >
                                        Add a Review
                                    </button>
                                </div>
                            </div>

                            {/* Reviews Grid - 3x3 on desktop, 1 column on mobile */}
                            <div className="space-y-6">
                                {reviewsError && (
                                    <div className="bg-red-900/20 border border-red-400/30 text-red-200 px-4 py-3 rounded-lg text-sm">
                                        {reviewsError}
                                    </div>
                                )}

                                {isLoadingReviews ? (
                                    <div className="flex flex-col items-center justify-center py-16">
                                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white mb-3"></div>
                                        <p className="text-gray-400 text-sm">Loading reviews...</p>
                                    </div>
                                ) : showEmptyState ? (
                                    <div className="bg-[#1F1F1F] border border-[#2A2A2A] rounded-2xl p-6 text-center">
                                        <p className="text-white font-semibold text-lg">No reviews yet</p>
                                        <p className="text-gray-400 text-sm mt-2">
                                            Be the first to share feedback for {activeAnalyst?.name || 'this analyst'}.
                                        </p>
                                        <button
                                            onClick={openReviewDrawer}
                                            className="mt-4 inline-flex items-center justify-center px-6 py-2 rounded-full bg-white text-black font-semibold hover:bg-gray-200 transition-colors duration-300"
                                        >
                                            Add a Review
                                        </button>
                                    </div>
                                ) : isMobile ? (
                                    currentReviews.map((review, index) => {
                                        const isEvenIndex = index % 2 === 0;
                                        const gradientImage = isEvenIndex 
                                            ? 'url("/gradient/Ellipse 4.svg")'
                                            : 'url("/gradient/Ellipse 2.png")';

                                        const dateLabel = formatReviewDate(review.reviewDate || review.createdAt);
                                        
                                        return (
                                            <div
                                                key={review._id}
                                                className="relative overflow-hidden w-full"
                                                style={{
                                                    boxSizing: 'border-box',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'flex-start',
                                                    padding: '16px',
                                                    gap: '16px',
                                                    isolation: 'isolate',
                                                    minWidth: '0',
                                                    height: '162px',
                                                    background: '#1F1F1F',
                                                    borderRadius: '16px'
                                                }}
                                            >
                                                <div
                                                    className="absolute inset-0 pointer-events-none"
                                                    style={{
                                                        borderRadius: '16px',
                                                        background: 'linear-gradient(226.35deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0) 50.5%)',
                                                        padding: '1px'
                                                    }}
                                                >
                                                    <div className="w-full h-full rounded-[15px]" style={{ background: '#1F1F1F' }}></div>
                                                </div>

                                                <div 
                                                    className="absolute inset-0 rounded-2xl pointer-events-none"
                                                    style={{
                                                        backgroundImage: gradientImage,
                                                        backgroundSize: 'cover',
                                                        backgroundPosition: 'center',
                                                        backgroundRepeat: 'no-repeat',
                                                        opacity: 0.8,
                                                        mixBlendMode: 'normal'
                                                    }}
                                                />

                                                <div className="relative z-20 flex flex-col h-full w-full">
                                                    <div className="flex items-center justify-between text-xs text-gray-400">
                                                        <span>{dateLabel}</span>
                                                    </div>
                                                    <p className="text-gray-400 text-sm leading-relaxed line-clamp-3 flex-1 mb-2">
                                                        {review.comment}
                                                    </p>
                                                    <div className="grid grid-cols-[1fr_auto] gap-2 w-full items-center">
                                                        <div className="flex items-center gap-2 min-w-0">
                                                            <div className="w-6 h-6 rounded-full flex items-center justify-center overflow-hidden bg-gray-700 flex-shrink-0">
                                                                {review.userProfilePicture ? (
                                                                    <Image 
                                                                        src={review.userProfilePicture} 
                                                                        alt={`${review.reviewerName}'s profile`} 
                                                                        width={24}
                                                                        height={24}
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <Image 
                                                                        src="/logo/anon.svg" 
                                                                        alt="Anonymous user" 
                                                                        width={24}
                                                                        height={24}
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                )}
                                                            </div>
                                                            <div className="overflow-x-auto overflow-y-hidden review-name-scroll min-w-0 flex-1">
                                                                <p className="text-white font-semibold text-sm break-words leading-tight">
                                                                    {review.reviewerName}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-0.5 flex-shrink-0 w-[100px] justify-end">
                                                            {renderStars(review.rating)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    [0, 1, 2].map((rowIndex) => (
                                        <div key={rowIndex} className="flex gap-6">
                                            {[0, 1, 2].map((colIndex) => {
                                                const reviewIndex = rowIndex * 3 + colIndex;
                                                const review = currentReviews[reviewIndex];
                                                if (!review) {
                                                    return <div key={`${rowIndex}-${colIndex}`} className="flex-1" />;
                                                }

                                                const isMiddleColumn = colIndex === 1;
                                                const dateLabel = formatReviewDate(review.reviewDate || review.createdAt);
                                                
                                                return (
                                                    <div
                                                        key={review._id}
                                                        className="relative overflow-hidden flex-1"
                                                        style={{
                                                            boxSizing: 'border-box',
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            alignItems: 'flex-start',
                                                            padding: '16px',
                                                            gap: '16px',
                                                            isolation: 'isolate',
                                                            minWidth: '0',
                                                            height: '162px',
                                                            background: '#1F1F1F',
                                                            borderRadius: '16px'
                                                        }}
                                                    >
                                                        <div
                                                            className="absolute inset-0 pointer-events-none"
                                                            style={{
                                                                borderRadius: '16px',
                                                                background: 'linear-gradient(226.35deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0) 50.5%)',
                                                                padding: '1px'
                                                            }}
                                                        >
                                                            <div className="w-full h-full rounded-[15px]" style={{ background: '#1F1F1F' }}></div>
                                                        </div>

                                                        <div 
                                                            className="absolute inset-0 rounded-2xl pointer-events-none"
                                                            style={{
                                                                backgroundImage: isMiddleColumn 
                                                                    ? 'url("/gradient/Ellipse 2.png")'
                                                                    : 'url("/gradient/Ellipse 4.svg")',
                                                                backgroundSize: 'cover',
                                                                backgroundPosition: 'center',
                                                                backgroundRepeat: 'no-repeat',
                                                                opacity: 0.8,
                                                                mixBlendMode: 'normal'
                                                            }}
                                                        />

                                                        <div className="relative z-20 flex flex-col h-full w-full">
                                                            <div className="flex items-center justify-between text-xs text-gray-400">
                                                                <span>{dateLabel}</span>
                                                            </div>
                                                            <p className="text-gray-400 text-sm leading-relaxed line-clamp-3 flex-1 mb-2">
                                                                {review.comment}
                                                            </p>
                                                            <div className="grid grid-cols-[1fr_auto] gap-2 w-full items-center">
                                                                <div className="flex items-center gap-2 min-w-0">
                                                                    <div className="w-6 h-6 rounded-full flex items-center justify-center overflow-hidden bg-gray-700 flex-shrink-0">
                                                                        {review.userProfilePicture ? (
                                                                            <Image 
                                                                                src={review.userProfilePicture} 
                                                                                alt={`${review.reviewerName}'s profile`} 
                                                                                width={24}
                                                                                height={24}
                                                                                className="w-full h-full object-cover"
                                                                            />
                                                                        ) : (
                                                                            <Image 
                                                                                src="/logo/anon.svg" 
                                                                                alt="Anonymous user" 
                                                                                width={24}
                                                                                height={24}
                                                                                className="w-full h-full object-cover"
                                                                            />
                                                                        )}
                                                                    </div>
                                                                    <div className="overflow-x-auto overflow-y-hidden review-name-scroll min-w-0 flex-1">
                                                                        <p className="text-white font-semibold text-sm break-words leading-tight">
                                                                            {review.reviewerName}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-0.5 flex-shrink-0 w-[100px] justify-end">
                                                                    {renderStars(review.rating)}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Page Counter - Bottom Right on desktop, slightly left on mobile */}
                            {totalPages > 1 && (
                                <div className={`flex ${isMobile ? 'mt-12 mb-8' : 'mt-8'} ${isMobile ? 'justify-end' : 'justify-end'} relative z-50`}>
                                    <div 
                                        className="flex flex-row items-start"
                                        style={{
                                            padding: '0px',
                                            gap: isMobile ? '8px' : '8px',
                                            width: isMobile ? 'auto' : '152px',
                                            height: '32px',
                                            flex: 'none',
                                            order: 1,
                                            flexGrow: 0
                                        }}
                                    >
                                        {/* Previous Button - Always reserve space */}
                                        <div className={isMobile ? 'w-8 h-8' : 'w-8 h-8'}>
                                            {currentPage > 1 && (
                                                <button
                                                    onClick={() => handlePageChange(currentPage - 1)}
                                                    className={`${isMobile ? 'w-8 h-8 rounded-lg' : 'w-8 h-8 rounded-lg bg-black'} flex items-center justify-center transition-all duration-300 text-[rgba(144,144,144,1)] border border-[rgba(144,144,144,1)] focus:outline-none focus:ring-0`}
                                                    style={{ 
                                                        outline: 'none', 
                                                        boxShadow: 'none',
                                                        backgroundColor: isMobile ? 'rgba(0, 0, 0, 0.1)' : 'rgb(0, 0, 0)'
                                                    }}
                                                    onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
                                                    onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = isMobile ? 'rgba(0, 0, 0, 0.1)' : 'rgb(0, 0, 0)'}
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                    </svg>
                                                </button>
                                            )}
                                        </div>

                                        {/* Page Numbers */}
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                            <button
                                                key={page}
                                                onClick={() => handlePageChange(page)}
                                                className={`${isMobile ? 'w-8 h-8 rounded-lg' : 'w-8 h-8 rounded-lg'} flex items-center justify-center text-sm font-medium transition-all duration-300 border focus:outline-none focus:ring-0 ${
                                                    isMobile 
                                                        ? (currentPage === page ? 'text-black border-white' : 'text-[rgba(144,144,144,1)] border-[rgba(144,144,144,1)]')
                                                        : (currentPage === page ? 'bg-white text-black border-white' : 'bg-black text-[rgba(144,144,144,1)] border-[rgba(144,144,144,1)]')
                                                }`}
                                                style={{ 
                                                    outline: 'none', 
                                                    boxShadow: 'none',
                                                    backgroundColor: isMobile 
                                                        ? (currentPage === page ? 'rgb(255, 255, 255)' : 'rgba(0, 0, 0, 0.1)')
                                                        : (currentPage === page ? 'rgb(255, 255, 255)' : 'rgb(0, 0, 0)')
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (currentPage !== page) {
                                                        (e.target as HTMLButtonElement).style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                                                    }
                                                }}
                                                onMouseLeave={(e) => {
                                                    if (currentPage !== page) {
                                                        (e.target as HTMLButtonElement).style.backgroundColor = isMobile ? 'rgba(0, 0, 0, 0.1)' : 'rgb(0, 0, 0)';
                                                    }
                                                }}
                                            >
                                                {page}
                                            </button>
                                        ))}

                                        {/* Next Button - Always reserve space */}
                                        <div className={isMobile ? 'w-8 h-8' : 'w-8 h-8'}>
                                            {currentPage < totalPages && (
                                                <button
                                                    onClick={() => handlePageChange(currentPage + 1)}
                                                    className={`${isMobile ? 'w-8 h-8 rounded-lg' : 'w-8 h-8 rounded-lg bg-black'} flex items-center justify-center transition-all duration-300 text-[rgba(144,144,144,1)] border border-[rgba(144,144,144,1)] focus:outline-none focus:ring-0`}
                                                    style={{ 
                                                        outline: 'none', 
                                                        boxShadow: 'none',
                                                        backgroundColor: isMobile ? 'rgba(0, 0, 0, 0.1)' : 'rgb(0, 0, 0)'
                                                    }}
                                                    onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
                                                    onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = isMobile ? 'rgba(0, 0, 0, 0.1)' : 'rgb(0, 0, 0)'}
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                </div>
            </div>

            {/* Add Review Modal */}
            {isAddReviewOpen && (
                <div className="fixed inset-0 z-[9999] bg-black/70 flex items-center justify-center px-4">
                    <div className="bg-[#121212] border border-[#2A2A2A] rounded-2xl w-full max-w-xl p-6 sm:p-8 relative">
                        <button
                            onClick={closeReviewDrawer}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors duration-200"
                        >
                            <X size={20} />
                        </button>
                        <h3 className="text-2xl font-semibold mb-2">Share Your Review</h3>
                        <p className="text-gray-400 text-sm mb-4">
                            Your review will be visible once approved by our admin team.
                        </p>
                        {activeAnalyst && (
                            <div className="mb-4 text-sm text-gray-300">
                                Reviewing <span className="text-white font-semibold">{activeAnalyst.name}</span>
                            </div>
                        )}
                        {reviewSuccessMessage && (
                            <div className="mb-3 bg-green-900/20 border border-green-400/30 text-green-200 text-sm rounded-lg px-3 py-2">
                                {reviewSuccessMessage}
                            </div>
                        )}
                        {reviewErrorMessage && (
                            <div className="mb-3 bg-red-900/20 border border-red-400/30 text-red-200 text-sm rounded-lg px-3 py-2">
                                {reviewErrorMessage}
                            </div>
                        )}
                        <form className="space-y-4" onSubmit={handleSubmitReview}>
                            <div>
                                <label className="block text-sm text-gray-300 mb-2">Full Name</label>
                                <input
                                    type="text"
                                    value={reviewForm.reviewerName}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (value.length <= MAX_NAME_LENGTH) {
                                            handleReviewInputChange('reviewerName', value);
                                        }
                                    }}
                                    maxLength={MAX_NAME_LENGTH}
                                    className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-0 focus-visible:outline-none focus:border-[#2A2A2A] focus:shadow-none focus-visible:shadow-none"
                                    style={{ boxShadow: 'none', outline: 'none', WebkitAppearance: 'none' }}
                                    placeholder="Enter your name"
                                    disabled={isSubmittingReview}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    {reviewForm.reviewerName.length}/{MAX_NAME_LENGTH} characters
                                </p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-300 mb-2">Review Date</label>
                                    <input
                                        type="date"
                                        value={getTodayDate()}
                                        readOnly
                                        className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-0 focus-visible:outline-none focus:border-[#2A2A2A] focus:shadow-none focus-visible:shadow-none cursor-not-allowed opacity-70"
                                        style={{ boxShadow: 'none', outline: 'none', WebkitAppearance: 'none', appearance: 'none' }}
                                        disabled={isSubmittingReview}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-300 mb-2">Rating</label>
                                    <div className="flex items-center gap-2">
                                        {[1, 2, 3, 4, 5].map((value) => (
                                            <button
                                                key={value}
                                                type="button"
                                                onClick={() => setReviewForm(prev => ({ ...prev, rating: value }))}
                                                className="p-1 rounded-full focus:outline-none focus:ring-0 focus-visible:outline-none"
                                                disabled={isSubmittingReview}
                                            >
                                                <svg
                                                    className="w-8 h-8"
                                                    viewBox="0 0 24 24"
                                                    fill={value <= reviewForm.rating ? '#DE50EC' : '#3B3B3B'}
                                                    stroke="none"
                                                >
                                                    <path d="M12 2l2.39 6.94H22l-5.45 3.96L18.78 20 12 15.77 5.22 20l2.23-7.1L2 8.94h7.61z" />
                                                </svg>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-300 mb-2">Comments</label>
                                <textarea
                                    value={reviewForm.comment}
                                    onChange={(e) => handleReviewInputChange('comment', e.target.value)}
                                    rows={4}
                                    className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-0 focus-visible:outline-none focus:border-[#2A2A2A] resize-none"
                                    placeholder="Let others know how the session helped you..."
                                    disabled={isSubmittingReview}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Minimum {MIN_COMMENT_LENGTH} characters.
                                </p>
                            </div>
                            <div className="flex items-center justify-between text-xs text-gray-400">
                                <span>Reviews typically go live within 24 hours.</span>
                                <span>Mentorship only</span>
                            </div>
                            <div className="flex gap-3 justify-end">
                                <button
                                    type="button"
                                    onClick={closeReviewDrawer}
                                    className="px-6 py-3 rounded-full border border-white/30 text-white hover:bg-white/10 transition-all duration-300 focus:outline-none focus:ring-0 focus-visible:outline-none"
                                    disabled={isSubmittingReview}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className={`px-8 py-3 rounded-full font-semibold transition-all duration-300 focus:outline-none focus:ring-0 focus-visible:outline-none ${
                                        isSubmittingReview ? 'bg-white/40 text-gray-700 cursor-not-allowed' : 'bg-white text-black hover:bg-gray-200'
                                    }`}
                                >
                                    {isSubmittingReview ? 'Submitting...' : 'Done'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const ReviewsPage: React.FC = () => {
    return (
        <Suspense fallback={
            <div className="bg-[#0D0D0D] min-h-screen text-white font-sans flex items-center justify-center">
                <div className="text-center">
                    <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p>Loading...</p>
                </div>
            </div>
        }>
            <ReviewsContent />
        </Suspense>
    );
};

export default ReviewsPage;
