import type { Metadata } from 'next';
import { AdminFooter } from '@/components/admin/AdminFooter';

export const metadata: Metadata = {
  title: 'Venture Graph Admin',
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface">
      <div className="flex-1 flex flex-col">
        {children}
      </div>
      <AdminFooter />
    </div>
  );
}
