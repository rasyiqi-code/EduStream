/**
 * @file onboarding-tour.tsx
 * @description Custom lightweight onboarding tour (React 18+ compatible)
 * 
 * Features:
 * - Step-by-step feature introduction
 * - Skip or complete tour
 * - Remember completion in localStorage
 * - Role-specific tours
 * - No external dependencies (uses shadcn/ui)
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser } from '@/firebase';

const TOUR_COMPLETED_KEY = 'edustream-tour-completed';

interface TourStep {
  target: string; // CSS selector or 'body'
  title: string;
  description: string;
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

// Dashboard tour steps
const dashboardSteps: TourStep[] = [
  {
    target: 'body',
    title: 'Selamat Datang di EduStream! 🎉',
    description: 'Mari kami perkenalkan fitur-fitur utama platform pembelajaran ini.',
    placement: 'center',
  },
  {
    target: '[data-tour="search"]',
    title: '🔍 Pencarian',
    description: 'Cari video pembelajaran berdasarkan judul atau deskripsi.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="browse"]',
    title: '🧭 Jelajahi',
    description: 'Telusuri semua video dengan filter kategori, tingkat kesulitan, dan durasi.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="notifications"]',
    title: '🔔 Notifikasi',
    description: 'Terima update tentang video baru, komentar, dan pencapaian Anda.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="favorites"]',
    title: '❤️ Favorit',
    description: 'Simpan video favorit Anda untuk akses cepat nanti.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="theme"]',
    title: '🌙 Tema',
    description: 'Ganti antara mode terang dan gelap sesuai preferensi Anda.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="profile"]',
    title: '👤 Profil',
    description: 'Akses pengaturan akun dan logout dari sini.',
    placement: 'bottom',
  },
];

// Instructor-specific additional steps
const instructorSteps: TourStep[] = [
  {
    target: '[data-tour="add-video"]',
    title: '➕ Tambah Video',
    description: 'Sebagai instruktur, Anda bisa menambahkan video pembelajaran baru (YouTube atau MP4).',
    placement: 'bottom',
  },
  {
    target: '[data-tour="add-playlist"]',
    title: '📚 Buat Kursus',
    description: 'Kelompokkan video-video Anda menjadi kursus/playlist untuk pengalaman belajar yang terstruktur.',
    placement: 'bottom',
  },
];

interface OnboardingTourProps {
  variant?: 'dashboard' | 'watch' | 'browse';
}

function TourTooltip({
  step,
  currentStep,
  totalSteps,
  onNext,
  onPrev,
  onSkip,
  onClose,
}: {
  step: TourStep;
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  onClose: () => void;
}) {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [arrowPosition, setArrowPosition] = useState<'top' | 'bottom' | 'left' | 'right'>('top');

  useEffect(() => {
    const calculatePosition = () => {
      if (step.target === 'body' || step.placement === 'center') {
        // Center of screen
        setPosition({
          top: window.innerHeight / 2 - 150,
          left: window.innerWidth / 2 - 200,
        });
        setArrowPosition('top');
        return;
      }

      const element = document.querySelector(step.target);
      if (!element) {
        // Fallback to center
        setPosition({
          top: window.innerHeight / 2 - 150,
          left: window.innerWidth / 2 - 200,
        });
        return;
      }

      const rect = element.getBoundingClientRect();
      const placement = step.placement || 'bottom';
      
      let top = 0;
      let left = 0;

      switch (placement) {
        case 'bottom':
          top = rect.bottom + 10;
          left = rect.left + rect.width / 2 - 200;
          setArrowPosition('top');
          break;
        case 'top':
          top = rect.top - 200;
          left = rect.left + rect.width / 2 - 200;
          setArrowPosition('bottom');
          break;
        case 'left':
          top = rect.top + rect.height / 2 - 100;
          left = rect.left - 420;
          setArrowPosition('right');
          break;
        case 'right':
          top = rect.top + rect.height / 2 - 100;
          left = rect.right + 10;
          setArrowPosition('left');
          break;
      }

      // Keep within viewport
      top = Math.max(10, Math.min(top, window.innerHeight - 210));
      left = Math.max(10, Math.min(left, window.innerWidth - 410));

      setPosition({ top, left });
    };

    calculatePosition();
    window.addEventListener('resize', calculatePosition);
    window.addEventListener('scroll', calculatePosition);

    return () => {
      window.removeEventListener('resize', calculatePosition);
      window.removeEventListener('scroll', calculatePosition);
    };
  }, [step]);

  const isLastStep = currentStep === totalSteps - 1;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-[100]"
        onClick={onSkip}
      />

      {/* Highlight target element */}
      {step.target !== 'body' && (
        <div
          className="fixed pointer-events-none z-[101]"
          style={{
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
          }}
        />
      )}

      {/* Tooltip Card */}
      <Card
        className="fixed z-[102] w-[400px] shadow-2xl"
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
        }}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1 flex-1">
              <CardTitle className="text-lg">{step.title}</CardTitle>
              <Badge variant="secondary" className="text-xs">
                {currentStep + 1} / {totalSteps}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 -mt-1 -mr-1"
              onClick={onSkip}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pb-4">
          <CardDescription className="text-sm leading-relaxed">
            {step.description}
          </CardDescription>
        </CardContent>
        <CardFooter className="flex justify-between pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onSkip}
          >
            Lewati
          </Button>
          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={onPrev}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Kembali
              </Button>
            )}
            <Button
              size="sm"
              onClick={isLastStep ? onClose : onNext}
            >
              {isLastStep ? 'Selesai' : 'Lanjut'}
              {!isLastStep && <ChevronRight className="h-4 w-4 ml-1" />}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </>
  );
}

export function OnboardingTour({ variant = 'dashboard' }: OnboardingTourProps) {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<TourStep[]>([]);
  const { user } = useUser();

  useEffect(() => {
    // Check if tour has been completed
    const tourCompleted = localStorage.getItem(TOUR_COMPLETED_KEY);
    
    // Only run tour for authenticated users who haven't completed it
    if (user && !tourCompleted) {
      // Delay to ensure DOM is ready
      setTimeout(() => {
        // Build steps based on variant
        let tourSteps = [...dashboardSteps];
        
        if (variant === 'dashboard') {
          // Add role-specific steps (check from Firestore user data if available)
          // For now, we'll just use the base steps
          // You can extend this to check user role from Firestore
          tourSteps = [...tourSteps];
        }
        
        setSteps(tourSteps);
        setIsActive(true);
      }, 1500); // 1.5 second delay
    }
  }, [user, variant]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    setIsActive(false);
    localStorage.setItem(TOUR_COMPLETED_KEY, 'true');
  };

  const handleClose = () => {
    setIsActive(false);
    localStorage.setItem(TOUR_COMPLETED_KEY, 'true');
  };

  // Reset tour (for testing)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).resetTour = () => {
        localStorage.removeItem(TOUR_COMPLETED_KEY);
        window.location.reload();
      };
    }
  }, []);

  if (!isActive || !user || steps.length === 0) {
    return null;
  }

  return (
    <TourTooltip
      step={steps[currentStep]}
      currentStep={currentStep}
      totalSteps={steps.length}
      onNext={handleNext}
      onPrev={handlePrev}
      onSkip={handleSkip}
      onClose={handleClose}
    />
  );
}

/**
 * Hook to manually trigger the tour
 */
export function useOnboardingTour() {
  const startTour = () => {
    localStorage.removeItem(TOUR_COMPLETED_KEY);
    window.location.reload();
  };

  const resetTour = () => {
    localStorage.removeItem(TOUR_COMPLETED_KEY);
  };

  const isTourCompleted = () => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem(TOUR_COMPLETED_KEY) === 'true';
  };

  return {
    startTour,
    resetTour,
    isTourCompleted,
  };
}
