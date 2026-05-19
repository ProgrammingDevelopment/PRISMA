"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

/**
 * ProgressStepper - Multi-step flow progress indicator
 * PRD: Progress indicators for multi-step flows
 * PRD: Visible progress indicators and contextual help
 */

export interface StepperStep {
    id: string
    label: string
    description?: string
    icon?: React.ReactNode
}

interface ProgressStepperProps {
    steps: StepperStep[]
    currentStep: number
    className?: string
    orientation?: "horizontal" | "vertical"
}

export function ProgressStepper({
    steps,
    currentStep,
    className,
    orientation = "horizontal",
}: ProgressStepperProps) {
    return (
        <nav
            aria-label="Progress"
            className={cn("w-full", className)}
            role="navigation"
        >
            <ol
                className={cn(
                    "flex",
                    orientation === "horizontal"
                        ? "items-center justify-between"
                        : "flex-col space-y-4"
                )}
                role="list"
            >
                {steps.map((step, index) => {
                    const isCompleted = index < currentStep
                    const isCurrent = index === currentStep
                    const isPending = index > currentStep

                    return (
                        <li
                            key={step.id}
                            className={cn(
                                "flex items-center",
                                orientation === "horizontal" && index < steps.length - 1 && "flex-1"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                {/* Step Circle */}
                                <div
                                    className={cn(
                                        "flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all duration-300",
                                        isCompleted && "border-primary bg-primary text-primary-foreground",
                                        isCurrent && "border-primary bg-primary/10 text-primary ring-4 ring-primary/20",
                                        isPending && "border-border bg-muted text-muted-foreground"
                                    )}
                                    aria-current={isCurrent ? "step" : undefined}
                                >
                                    {isCompleted ? (
                                        <Check className="h-5 w-5" aria-hidden="true" />
                                    ) : (
                                        step.icon || <span>{index + 1}</span>
                                    )}
                                </div>

                                {/* Step Label */}
                                <div className={cn(
                                    orientation === "horizontal" && "hidden sm:block"
                                )}>
                                    <p className={cn(
                                        "text-sm font-medium",
                                        isCurrent && "text-primary",
                                        isPending && "text-muted-foreground"
                                    )}>
                                        {step.label}
                                    </p>
                                    {step.description && (
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            {step.description}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Connector Line */}
                            {index < steps.length - 1 && orientation === "horizontal" && (
                                <div
                                    className={cn(
                                        "mx-4 h-0.5 flex-1 transition-colors duration-300",
                                        isCompleted ? "bg-primary" : "bg-border"
                                    )}
                                    aria-hidden="true"
                                />
                            )}
                        </li>
                    )
                })}
            </ol>

            {/* Accessible step description */}
            <div className="sr-only" aria-live="polite">
                Langkah {currentStep + 1} dari {steps.length}: {steps[currentStep]?.label}
            </div>
        </nav>
    )
}
