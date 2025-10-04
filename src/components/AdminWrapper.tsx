import React, { Suspense } from 'react';
import { AdminProvider } from '../contexts/AdminContextFixed';
import { Skeleton } from './ui/skeleton';

// Lazy load the AdminPage to prevent blocking main app
const AdminPageLazy = React.lazy(() => import('../pages/AdminPage'));

interface AdminWrapperProps {
  children?: React.ReactNode;
}

export function AdminWrapper({ children }: AdminWrapperProps) {
  return (
    <AdminProvider>
      <Suspense
        fallback={
          <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                  <Skeleton className="h-6 w-24" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              {/* Tabs */}
              <div className="hidden lg:flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-10 flex-1" />
                ))}
              </div>
              
              {/* Dashboard Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-white p-6 rounded-lg border">
                    <Skeleton className="h-4 w-20 mb-2" />
                    <Skeleton className="h-8 w-16 mb-1" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                ))}
              </div>
              
              {/* Table */}
              <div className="bg-white rounded-lg border">
                <div className="p-6 border-b">
                  <Skeleton className="h-6 w-32" />
                </div>
                <div className="p-6 space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-32 flex-1" />
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        }
      >
        {children || <AdminPageLazy />}
      </Suspense>
    </AdminProvider>
  );
}