import React, { useState, useEffect } from 'react';
import { X, ChevronRight, Check } from 'lucide-react';

export interface TourStep {
    targetId: string | null; // null means centered modal
    title: string;
    content: string;
    placement?: 'top' | 'bottom' | 'left' | 'right';
}

interface OnboardingTourProps {
    steps: TourStep[];
    isOpen: boolean;
    onComplete: () => void;
    onClose: () => void;
}

const OnboardingTour: React.FC<OnboardingTourProps> = ({ steps, isOpen, onComplete, onClose }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

    const activeStep = steps[currentStep];

    useEffect(() => {
        if (!isOpen || !activeStep) return;

        let elementToObserve: HTMLElement | null = null;
        let resizeObserver: ResizeObserver | null = null;
        let timeoutId: NodeJS.Timeout;

        const updatePosition = () => {
            if (activeStep.targetId) {
                const element = document.getElementById(activeStep.targetId);
                if (element) {
                    setTargetRect(element.getBoundingClientRect());

                    // Simple debounce for scrollIntoView to avoid jumping
                    clearTimeout(timeoutId);
                    timeoutId = setTimeout(() => {
                        // Scroll with a slight offset for sticky headers (if any)
                        const y = element.getBoundingClientRect().top + window.scrollY - 100;
                        window.scrollTo({ top: y, behavior: 'smooth' });
                    }, 50);

                } else {
                    setTargetRect(null); // Fallback to center if element not found
                }
            } else {
                setTargetRect(null);
            }
        };

        // Initial update
        updatePosition();

        // Setup ResizeObserver for dynamic layout changes (e.g., accordions)
        if (activeStep.targetId) {
            elementToObserve = document.getElementById(activeStep.targetId);
            if (elementToObserve) {
                resizeObserver = new ResizeObserver(() => {
                    // Debounce the observer callback
                    clearTimeout(timeoutId);
                    timeoutId = setTimeout(updatePosition, 10);
                });
                resizeObserver.observe(elementToObserve);
            }
        }

        // Fallback for global window resizes
        window.addEventListener('resize', updatePosition);

        return () => {
            window.removeEventListener('resize', updatePosition);
            if (resizeObserver && elementToObserve) {
                resizeObserver.unobserve(elementToObserve);
                resizeObserver.disconnect();
            }
            clearTimeout(timeoutId);
        };
    }, [isOpen, activeStep]);

    if (!isOpen || !activeStep) return null;


    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(curr => curr + 1);
        } else {
            onComplete();
        }
    };

    const isCentered = !activeStep.targetId || !targetRect;

    // Calculate popover styles based on target rect and placement
    let popoverStyle: React.CSSProperties = {};

    if (!isCentered && targetRect) {
        const margin = 16;
        const placement = activeStep.placement || 'bottom';

        if (placement === 'bottom') {
            popoverStyle = {
                top: targetRect.bottom + margin,
                left: targetRect.left + (targetRect.width / 2),
                transform: 'translateX(-50%)' // Center relative to target
            };
        } else if (placement === 'top') {
            popoverStyle = {
                top: targetRect.top - margin,
                left: targetRect.left + (targetRect.width / 2),
                transform: 'translate(-50%, -100%)'
            };
        }
        // Add logic for left/right if needed in the future, bottom is usually sufficient for our current design
    }

    return (
        <div className="fixed inset-0 z-[200] pointer-events-none">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-gkk-navy/60 backdrop-blur-[2px] pointer-events-auto transition-opacity duration-300" />

            {/* Highlight Cutout Outline (Simulation) */}
            {!isCentered && targetRect && (
                <div
                    className="absolute border-4 border-gkk-gold rounded-xl pointer-events-none transition-all duration-500 ease-in-out shadow-[0_0_0_9999px_rgba(15,23,42,0.6)]" // using gkk-navy at 60% approx
                    style={{
                        top: targetRect.top - 8,
                        left: targetRect.left - 8,
                        width: targetRect.width + 16,
                        height: targetRect.height + 16,
                    }}
                />
            )}

            {/* Tour Dialog */}
            <div
                className={`absolute bg-white rounded-2xl shadow-2xl w-80 max-w-[calc(100vw-32px)] pointer-events-auto transition-all duration-500 ease-in-out z-50 animate-in zoom-in-95 ${isCentered ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' : ''}`}
                style={!isCentered ? popoverStyle : {}}
            >
                {!isCentered && activeStep.placement === 'bottom' && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-b-[12px] border-b-white z-10" />
                )}
                {!isCentered && activeStep.placement === 'top' && (
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[12px] border-t-white z-10" />
                )}

                <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="font-bold text-gkk-navy text-lg">{activeStep.title}</h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors p-1 -mt-2 -mr-2">
                            <X size={20} />
                        </button>
                    </div>

                    <p className="text-sm text-gray-600 leading-relaxed mb-8">
                        {activeStep.content}
                    </p>

                    <div className="flex items-center justify-between mt-auto">
                        <div className="flex space-x-1.5">
                            {steps.map((_, idx) => (
                                <div
                                    key={idx}
                                    className={`w-2 h-2 rounded-full transition-all ${idx === currentStep ? 'bg-gkk-gold w-4' : 'bg-gray-200'}`}
                                />
                            ))}
                        </div>

                        <button
                            onClick={handleNext}
                            className="px-5 py-2.5 bg-gkk-navy hover:bg-gkk-royalBlue text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 group shadow-xl shadow-gkk-navy/20"
                        >
                            {currentStep < steps.length - 1 ? (
                                <>Next <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" /></>
                            ) : (
                                <>Done <Check size={16} /></>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OnboardingTour;
