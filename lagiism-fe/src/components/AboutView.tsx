import React, { Suspense, lazy } from 'react';
import { ActiveView } from '../types/store';

const AboutPage = lazy(() =>
  import('../features/about/AboutPage').then((m) => ({
    default: m.AboutPage,
  }))
);

interface AboutViewProps {
  onNavigate: (view: ActiveView, anchor?: string) => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ onNavigate }) => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F4F3EF] flex items-center justify-center font-mono text-xs uppercase tracking-[0.14em] text-[#6E6D68]">
          LOADING...
        </div>
      }
    >
      <AboutPage onNavigate={onNavigate} />
    </Suspense>
  );
};
