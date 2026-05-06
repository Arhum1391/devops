import { Suspense } from 'react';
import MeetingsPage from '@/components/pages/MeetingsPage';

export default function Meetings() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MeetingsPage />
    </Suspense>
  );
}
