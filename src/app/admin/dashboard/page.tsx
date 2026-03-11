'use client';

import { useState, useEffect } from 'react';
import { DashboardStats } from '@/types/admin';
import Link from 'next/link';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/admin/api/dashboard/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="glass-card rounded-2xl p-8 text-center">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-white text-lg font-medium">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Consultants',
      value: stats?.teamMembers || 0,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-500/20 to-cyan-500/20',
    },
    {
      title: 'Bookings Today',
      value: stats?.bookingsToday || 0,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      gradient: 'from-purple-500 to-pink-500',
      bgGradient: 'from-purple-500/20 to-pink-500/20',
    },
  ];

  const quickActions = [
    {
      title: 'Add New Consultant',
      description: 'Add a new consultant to the team',
      href: '/admin/team',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
      color: 'text-blue-400',
    },
  ];


  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-slate-800 rounded-xl p-8 border border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Welcome Back!</h1>
            <p className="text-slate-400 text-lg">Here&apos;s what&apos;s happening with your admin portal today</p>
          </div>
          <div className="hidden md:block">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {statCards.map((card, index) => (
          <div
            key={index}
            className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-slate-600 transition-colors"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-slate-700">
                <div className="text-white">
                  {card.icon}
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-white">{card.value}</p>
                <p className="text-slate-400 text-sm">{card.title}</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 text-sm">Total count</span>
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Quick Actions</h2>
          <div className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              href={action.href}
              className="block p-4 rounded-lg hover:bg-slate-700 transition-all duration-200 group"
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg bg-slate-700 group-hover:bg-slate-600 transition-colors ${action.color}`}>
                  {action.icon}
                </div>
                <div className="flex-1">
                  <div className="text-white font-medium group-hover:text-white/90 transition-colors">
                    {action.title}
                  </div>
                  <div className="text-slate-400 text-sm">{action.description}</div>
                </div>
                <svg className="w-4 h-4 text-slate-400 group-hover:text-slate-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
