"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { HelpCircle, X } from "lucide-react"

/**
 * ContextualHelp - Tooltips/Popovers for contextual guidance
 * PRD: Tooltips to highlight key features
 * PRD: Contextual help in seamless transitions
 */

interface ContextualHelpProps {
    content: string
    title?: string
    children?: React.ReactNode
    side?: "top" | "bottom" | "left" | "right"
    className?: string
}

export function ContextualHelp({
    content,
    title,
    children,
    side = "top",
    className,
}: ContextualHelpProps) {
    const [isOpen, setIsOpen] = React.useState(false)
    const triggerRef = React.useRef<HTMLButtonElement>(null)
    const tooltipId = React.useId()

    const positionClasses = {
        top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
        bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
        left: "right-full top-1/2 -translate-y-1/2 mr-2",
        right: "left-full top-1/2 -translate-y-1/2 ml-2",
    }

    return (
        <div className={cn("relative inline-flex", className)}>
            <button
                ref={triggerRef}
                onClick={() => setIsOpen(!isOpen)}
                onBlur={() => setIsOpen(false)}
                className="p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-expanded={isOpen}
                aria-describedby={tooltipId}
                aria-label={title || "Bantuan"}
            >
                {children || <HelpCircle className="h-4 w-4" />}
            </button>

            {isOpen && (
                <div
                    id={tooltipId}
                    role="tooltip"
                    className={cn(
                        "absolute z-50 w-64 p-3 rounded-lg border bg-card text-card-foreground shadow-lg",
                        "animate-in fade-in-0 zoom-in-95",
                        positionClasses[side]
                    )}
                >
                    {title && (
                        <p className="text-sm font-semibold mb-1">{title}</p>
                    )}
                    <p className="text-xs text-muted-foreground leading-relaxed">{content}</p>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="absolute top-2 right-2 p-0.5 rounded hover:bg-muted transition-colors"
                        aria-label="Tutup bantuan"
                    >
                        <X className="h-3 w-3 text-muted-foreground" />
                    </button>
                </div>
            )}
        </div>
    )
}

/**
 * OnboardingTooltip - For new user onboarding flow
 * PRD: Clear onboarding flows orient new users
 */
interface OnboardingTooltipProps {
    step: number
    totalSteps: number
    title: string
    content: string
    onNext?: () => void
    onSkip?: () => void
    targetRef?: React.RefObject<HTMLElement | null>
    isVisible: boolean
}

export function OnboardingTooltip({
    step,
    totalSteps,
    title,
    content,
    onNext,
    onSkip,
    isVisible,
}: OnboardingTooltipProps) {
    if (!isVisible) return null

    return (
        <div
            role="dialog"
            aria-label={`Panduan langkah ${step} dari ${totalSteps}`}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
        >
            <div className="bg-card border rounded-xl shadow-2xl max-w-sm w-full mx-4 p-6 animate-in fade-in-0 slide-in-from-bottom-4">
                {/* Step indicator */}
                <div className="flex items-center gap-1.5 mb-3">
                    {Array.from({ length: totalSteps }).map((_, i) => (
                        <div
                            key={i}
                            className={cn(
                                "h-1.5 rounded-full transition-all duration-300",
                                i === step - 1 ? "w-6 bg-primary" : "w-1.5 bg-border"
                            )}
                        />
                    ))}
                </div>

                <h3 className="text-lg font-semibold text-foreground">{title}</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{content}</p>

                <div className="flex items-center justify-between mt-5">
                    <button
                        onClick={onSkip}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        Lewati
                    </button>
                    <button
                        onClick={onNext}
                        className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
                    >
                        {step === totalSteps ? "Selesai" : "Selanjutnya"}
                    </button>
                </div>
            </div>
        </div>
    )
}
