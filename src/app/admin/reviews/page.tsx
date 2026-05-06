'use client';

import { useEffect, useState } from 'react';
import { Review, ReviewStatus } from '@/types/admin';

type FilterOption = 'all' | ReviewStatus;

const filterOptions: { label: string; value: FilterOption }[] = [
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'All', value: 'all' },
];

const renderStars = (rating: number) =>
  Array.from({ length: 5 }, (_, index) => (
    <svg
      key={index}
      className={`w-4 h-4 ${index < rating ? 'text-yellow-400' : 'text-slate-600'}`}
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  ));

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filter, setFilter] = useState<FilterOption>('pending');
  const [analysts, setAnalysts] = useState<{ id: number; name: string }[]>([]);
  const [selectedAnalyst, setSelectedAnalyst] = useState<number | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [actionId, setActionId] = useState<string | null>(null);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams();
      if (filter !== 'all') {
        params.set('status', filter);
      }
      if (selectedAnalyst !== 'all') {
        params.set('analystId', selectedAnalyst.toString());
      }
      const query = params.toString() ? `?${params.toString()}` : '';
      const response = await fetch(`/admin/api/reviews${query}`);
      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }
      const data = await response.json();
      setReviews(data.reviews || []);
    } catch (err) {
      console.error(err);
      setError((err as Error).message || 'Unable to load reviews');
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, selectedAnalyst]);

  useEffect(() => {
    const fetchAnalysts = async () => {
      try {
        const response = await fetch('/api/team'
        );
        if (!response.ok) {
          throw new Error('Failed to load analysts');
        }
        const data = await response.json();
        const options =
          data.team?.map((analyst: { id: number; name: string }) => ({
            id: analyst.id,
            name: analyst.name,
          })) ?? [];
        setAnalysts(options);
      } catch (err) {
        console.error(err);
      }
    };

    fetchAnalysts();
  }, []);

  const formatDate = (value?: string | Date) => {
    if (!value) return '—';
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) {
      return typeof value === 'string' ? value : '—';
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleApprove = async (id: string) => {
    setActionId(id);
    try {
      const response = await fetch(`/admin/api/reviews/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' }),
      });

      if (!response.ok) {
        throw new Error('Failed to approve review');
      }

      setReviews(prev =>
        prev.map(review =>
          review._id === id ? { ...review, status: 'approved', approvedAt: new Date() } : review
        )
      );
    } catch (err) {
      console.error(err);
      alert((err as Error).message || 'Failed to approve review');
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (id: string) => {
    setActionId(id);
    if (!window.confirm('This will permanently delete the review. Continue?')) {
      setActionId(null);
      return;
    }

    try {
      const response = await fetch(`/admin/api/reviews/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to reject review');
      }

      setReviews(prev => prev.filter(review => review._id !== id));
    } catch (err) {
      console.error(err);
      alert((err as Error).message || 'Failed to reject review');
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Review Moderation</h1>
          <p className="text-gray-400 mt-1">
            Approve or reject client feedback submitted by clients.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {filterOptions.map(option => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === option.value
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
              }`}
            >
              {option.label}
            </button>
          ))}
          <select
            value={selectedAnalyst}
            onChange={(e) =>
              setSelectedAnalyst(e.target.value === 'all' ? 'all' : Number(e.target.value))
            }
            className="px-4 py-2 rounded-lg bg-slate-800 text-gray-200 border border-slate-600 focus:outline-none"
          >
            <option value="all">All analysts</option>
            {analysts.map((analyst) => (
              <option key={analyst.id} value={analyst.id}>
                {analyst.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-400/40 text-red-200 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 text-center">
          <p className="text-white font-semibold text-lg mb-2">No reviews in this list</p>
          <p className="text-gray-400 text-sm">
            New submissions will appear here for moderation.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map(review => (
            <div
              key={review._id}
              className="bg-slate-800 border border-slate-700 rounded-xl p-6 flex flex-col gap-4"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-white text-lg font-semibold">{review.reviewerName}</p>
                  <p className="text-sm text-gray-400">Analyst: {review.analystName}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">{renderStars(review.rating)}</div>
                  <span className="text-sm text-gray-400">{review.rating}/5</span>
                </div>
              </div>
              <div className="text-gray-300 text-sm leading-relaxed">{review.comment}</div>
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between text-xs text-gray-400">
                <span>Submitted: {formatDate(review.createdAt)}</span>
                <span>Session Date: {formatDate(review.reviewDate)}</span>
                <span>
                  Status:{' '}
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      review.status === 'approved' ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'
                    }`}
                  >
                    {review.status.toUpperCase()}
                  </span>
                </span>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                {review.status === 'pending' ? (
                  <>
                    <button
                      onClick={() => handleApprove(review._id!)}
                      disabled={actionId === review._id}
                      className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-500 transition-colors disabled:opacity-50"
                    >
                      {actionId === review._id ? 'Approving...' : 'Approve'}
                    </button>
                    <button
                      onClick={() => handleReject(review._id!)}
                      disabled={actionId === review._id}
                      className="px-4 py-2 rounded-lg border border-red-500 text-red-300 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                    >
                      {actionId === review._id ? 'Rejecting...' : 'Reject'}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleReject(review._id!)}
                    disabled={actionId === review._id}
                    className="px-4 py-2 rounded-lg border border-red-500 text-red-300 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                  >
                    {actionId === review._id ? 'Deleting...' : 'Delete'}
                  </button>
                )}
                {review.status === 'approved' && (
                  <span className="text-sm text-gray-400">Approved on {formatDate(review.approvedAt)}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

