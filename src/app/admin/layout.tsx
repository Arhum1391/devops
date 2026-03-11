import type { Metadata } from 'next'
import Layout from '@/components/admin/Layout'

export const metadata: Metadata = {
  title: 'Analyst Admin Portal',
  description: 'Admin portal for managing analyst team, newsletters, and bookings',
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="bg-slate-900 text-white min-h-screen">
      <Layout>
        {children}
      </Layout>
    </div>
  )
}
