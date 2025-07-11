// components/ui/LoadingProgress.tsx
import { useEffect, useState } from 'react';

interface LoadingStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'active' | 'completed' | 'error';
}

interface LoadingProgressProps {
  steps: LoadingStep[];
  currentStep?: string;
  className?: string;
}

export default function LoadingProgress({ 
  steps, 
  currentStep, 
  className = "" 
}: LoadingProgressProps) {
  const [animatedSteps, setAnimatedSteps] = useState<LoadingStep[]>(steps);

  useEffect(() => {
    setAnimatedSteps(steps);
  }, [steps]);

  const getCurrentStepIndex = () => {
    return steps.findIndex(step => step.id === currentStep);
  };

  const currentIndex = getCurrentStepIndex();

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center justify-center mb-6">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <h3 className="text-lg font-semibold text-gray-900">
            Processing Prediction...
          </h3>
        </div>
      </div>

      <div className="space-y-4">
        {animatedSteps.map((step, index) => {
          const isActive = step.status === 'active';
          const isCompleted = step.status === 'completed';
          const isError = step.status === 'error';
          const isPending = step.status === 'pending';

          return (
            <div key={step.id} className="flex items-start space-x-4">
              {/* Step Icon */}
              <div className="flex-shrink-0">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center
                  ${isCompleted ? 'bg-green-500' : ''}
                  ${isActive ? 'bg-blue-500' : ''}
                  ${isPending ? 'bg-gray-300' : ''}
                  ${isError ? 'bg-red-500' : ''}
                  transition-all duration-300
                `}>
                  {isCompleted && (
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {isActive && (
                    <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                  )}
                  {isPending && (
                    <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                  )}
                  {isError && (
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </div>
              </div>

              {/* Step Content */}
              <div className="flex-1 min-w-0">
                <div className={`
                  text-sm font-medium
                  ${isCompleted ? 'text-green-700' : ''}
                  ${isActive ? 'text-blue-700' : ''}
                  ${isPending ? 'text-gray-500' : ''}
                  ${isError ? 'text-red-700' : ''}
                  transition-colors duration-300
                `}>
                  {step.title}
                </div>
                <div className={`
                  text-xs mt-1
                  ${isCompleted ? 'text-green-600' : ''}
                  ${isActive ? 'text-blue-600' : ''}
                  ${isPending ? 'text-gray-400' : ''}
                  ${isError ? 'text-red-600' : ''}
                  transition-colors duration-300
                `}>
                  {step.description}
                </div>

                {/* Progress Bar for Active Step */}
                {isActive && (
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                    <div className="bg-blue-600 h-1.5 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                  </div>
                )}
              </div>

              {/* Connection Line */}
              {index < animatedSteps.length - 1 && (
                <div className={`
                  absolute left-4 mt-8 w-0.5 h-6
                  ${isCompleted ? 'bg-green-300' : 'bg-gray-300'}
                  transition-colors duration-300
                `} style={{ marginLeft: '15px' }}></div>
              )}
            </div>
          );
        })}
      </div>

      {/* Overall Progress */}
      <div className="mt-6">
        <div className="flex justify-between text-xs text-gray-600 mb-2">
          <span>Progress</span>
          <span>{Math.round(((currentIndex + 1) / steps.length) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${((currentIndex + 1) / steps.length) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}

// Simple Loading Spinner Component
export function LoadingSpinner({ 
  message = "Loading...", 
  size = "md",
  className = "" 
}: { 
  message?: string; 
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6", 
    lg: "h-8 w-8"
  };

  return (
    <div className={`flex flex-col items-center justify-center p-6 ${className}`}>
      <div className={`animate-spin rounded-full border-b-2 border-blue-600 ${sizeClasses[size]}`}></div>
      <p className="mt-3 text-sm text-gray-600 animate-pulse">{message}</p>
    </div>
  );
}

// Skeleton Loading Component
export function SkeletonLoader({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="space-y-3">
          <div className="h-3 bg-gray-200 rounded w-full"></div>
          <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          <div className="h-3 bg-gray-200 rounded w-4/6"></div>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="h-8 bg-gray-200 rounded"></div>
          <div className="h-8 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );
}