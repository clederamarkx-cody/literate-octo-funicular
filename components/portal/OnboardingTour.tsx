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
        let scrollTimeoutId: NodeJS.Timeout;
        let rafId: number;

        const updatePosition = () => {
            if (activeStep.targetId) {
                const element = document.getElementById(activeStep.targetId);
                if (element) {
                    setTargetRect(element.getBoundingClientRect());
                } else {
                    setTargetRect(null); // Fallback to center if element not found
                }
            } else {
                setTargetRect(null);
            }
        };

        // Smoothly follow the element using requestAnimationFrame
        const handleScrollOrResize = () => {
            cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(updatePosition);
        };

        // Initial position update
        updatePosition();

        // -------------------------------------------------------------
        // ONE-TIME AUTO SCROLL ON ACTIVE STEP CHANGE
        // -------------------------------------------------------------
        if (activeStep.targetId) {
            const element = document.getElementById(activeStep.targetId);
            if (element) {
                scrollTimeoutId = setTimeout(() => {
                    const scrollContainer = document.getElementById('portal-scroll-container');
                    if (scrollContainer) {
                        const elRect = element.getBoundingClientRect();
                        const containerRect = scrollContainer.getBoundingClientRect();

                        let scrollTarget = 0;
                        if (elRect.height > containerRect.height * 0.8) {
                            // Elements taller than 80% of container: Scroll so their top edge is near top of screen
                            scrollTarget = scrollContainer.scrollTop + (elRect.top - containerRect.top) - 100;
                        } else {
                            // Dynamically center the element within the scroll container
                            const offset = (containerRect.height / 2) - (elRect.height / 2);
                            scrollTarget = scrollContainer.scrollTop + (elRect.top - containerRect.top) - offset;
                        }
                        scrollContainer.scrollTo({ top: Math.max(0, scrollTarget), behavior: 'smooth' });
                    } else {
                        // Fallback centering for window
                        const elRect = element.getBoundingClientRect();
                        let scrollTarget = 0;
                        if (elRect.height > window.innerHeight * 0.8) {
                            scrollTarget = elRect.top + window.scrollY - 100;
                        } else {
                            const offset = (window.innerHeight / 2) - (elRect.height / 2);
                            scrollTarget = elRect.top + window.scrollY - offset;
                        }
                        window.scrollTo({ top: Math.max(0, scrollTarget), behavior: 'smooth' });
                    }
                }, 50);
            }
        }

        // -------------------------------------------------------------
        // SETUP CONTINUOUS TRACKING (Resize, Viewport, Scroll)
        // -------------------------------------------------------------
        if (activeStep.targetId) {
            elementToObserve = document.getElementById(activeStep.targetId);
            if (elementToObserve) {
                resizeObserver = new ResizeObserver(handleScrollOrResize);
                resizeObserver.observe(elementToObserve);
            }
        }

        window.addEventListener('resize', handleScrollOrResize);

        let scrollContainer: Element | null = null;
        if (activeStep.targetId) {
            scrollContainer = document.getElementById('portal-scroll-container');
        }

        if (scrollContainer) {
            scrollContainer.addEventListener('scroll', handleScrollOrResize, { passive: true });
        } else {
            window.addEventListener('scroll', handleScrollOrResize, true);
        }

        return () => {
            window.removeEventListener('resize', handleScrollOrResize);
            if (scrollContainer) {
                scrollContainer.removeEventListener('scroll', handleScrollOrResize);
            } else {
                window.removeEventListener('scroll', handleScrollOrResize, true);
            }
            if (resizeObserver) {
                resizeObserver.disconnect();
            }
            clearTimeout(scrollTimeoutId);
            cancelAnimationFrame(rafId);
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
    let currentPlacement = activeStep.placement || 'bottom';

    if (!isCentered && targetRect) {
        const margin = 16;
        const dialogEstimatedHeight = 250; // Approximating popup height to detect clipping
        const topSpace = targetRect.top;
        const bottomSpace = window.innerHeight - targetRect.bottom;

        // Auto-flip placement if it would clip outside the viewport
        if (currentPlacement === 'top' && (topSpace - margin - dialogEstimatedHeight) < 0) {
            if (bottomSpace > topSpace) currentPlacement = 'bottom';
        } else if (currentPlacement === 'bottom' && (bottomSpace - margin - dialogEstimatedHeight) < 0) {
            if (topSpace > bottomSpace) currentPlacement = 'top';
        }

        // Apply clamping so the popup NEVER renders off-screen, even for huge elements
        let dialogTop = 0;

        if (currentPlacement === 'bottom') {
            dialogTop = targetRect.bottom + margin;

            // Clamp to bottom of viewport
            const maxBottom = window.innerHeight - dialogEstimatedHeight - margin;
            if (dialogTop > maxBottom && targetRect.top < maxBottom) {
                dialogTop = maxBottom; // Pin to bottom of viewport, floating over the element
            }

            popoverStyle = {
                top: dialogTop,
                left: targetRect.left + (targetRect.width / 2),
                transform: 'translateX(-50%)' // Center relative to target
            };
        } else if (currentPlacement === 'top') {
            dialogTop = targetRect.top - margin;

            // Clamp to top of viewport (remember transform -100% subtracts dialog height)
            const minTop = margin + dialogEstimatedHeight;
            if (dialogTop < minTop && targetRect.bottom > minTop) {
                dialogTop = minTop; // Pin to top of viewport, floating over the element
            }

            popoverStyle = {
                top: dialogTop,
                left: targetRect.left + (targetRect.width / 2),
                transform: 'translate(-50%, -100%)'
            };
        }
        // Add logic for left/right if needed in the future, bottom is usually sufficient for our current design
    }

    return (
        <div className="fixed inset-0 z-[200] pointer-events-none">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-gkk-navy/60 backdrop-blur-[2px] pointer-events-auto transition-opacity duration-300" />

            {/* Highlight Cutout Outline (Simulation) */}
            {!isCentered && targetRect && (
                <div
                    className="fixed border-4 border-gkk-gold rounded-xl pointer-events-none transition-all duration-300 ease-out shadow-[0_0_0_9999px_rgba(15,23,42,0.6)]" // using gkk-navy at 60% approx
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
                className={`fixed bg-white rounded-2xl shadow-2xl w-80 max-w-[calc(100vw-32px)] pointer-events-auto transition-all duration-500 ease-in-out z-50 animate-in zoom-in-95 ${isCentered ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' : ''}`}
                style={!isCentered ? popoverStyle : {}}
            >
                {!isCentered && currentPlacement === 'bottom' && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-b-[12px] border-b-white z-10" />
                )}
                {!isCentered && currentPlacement === 'top' && (
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
