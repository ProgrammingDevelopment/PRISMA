"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { CheckCircle2, XCircle, AlertCircle, Loader2 } from "lucide-react"

/**
 * InlineValidation - Real-time form field validation with instant guidance
 * PRD: Automatic inline validation with instant guidance
 * PRD: Error - Actionable feedback near inputs
 */

export type ValidationState = "idle" | "validating" | "valid" | "invalid"

interface InlineValidationProps {
    state: ValidationState
    message?: string
    className?: string
}

export function InlineValidation({ state, message, className }: InlineValidationProps) {
    if (state === "idle") return null

    return (
        <div
            className={cn(
                "flex items-center gap-1.5 mt-1.5 text-xs transition-all duration-200",
                state === "validating" && "text-muted-foreground",
                state === "valid" && "text-green-600 dark:text-green-400",
                state === "invalid" && "text-red-600 dark:text-red-400",
                className
            )}
            role={state === "invalid" ? "alert" : "status"}
            aria-live="polite"
        >
            {state === "validating" && (
                <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
            )}
            {state === "valid" && (
                <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
            )}
            {state === "invalid" && (
                <XCircle className="h-3 w-3" aria-hidden="true" />
            )}
            {message && <span>{message}</span>}
        </div>
    )
}

/**
 * ValidatedInput - Input with built-in inline validation
 */
interface ValidatedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string
    validationState?: ValidationState
    validationMessage?: string
    hint?: string
}

export const ValidatedInput = React.forwardRef<HTMLInputElement, ValidatedInputProps>(
    ({ label, validationState = "idle", validationMessage, hint, className, id, ...props }, ref) => {
        const inputId = id || `input-${label.toLowerCase().replace(/\s+/g, '-')}`
        const hintId = `${inputId}-hint`
        const errorId = `${inputId}-error`

        return (
            <div className="space-y-1.5">
                <label
                    htmlFor={inputId}
                    className="block text-sm font-medium text-foreground"
                >
                    {label}
                    {props.required && (
                        <span className="text-red-500 ml-1" aria-hidden="true">*</span>
                    )}
                </label>
                {hint && (
                    <p id={hintId} className="text-xs text-muted-foreground">
                        {hint}
                    </p>
                )}
                <input
                    ref={ref}
                    id={inputId}
                    className={cn(
                        "flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm",
                        "ring-offset-background transition-colors duration-200",
                        "placeholder:text-muted-foreground",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                        "disabled:cursor-not-allowed disabled:opacity-50",
                        validationState === "valid" && "border-green-500 focus-visible:ring-green-500",
                        validationState === "invalid" && "border-red-500 focus-visible:ring-red-500",
                        validationState === "idle" && "border-input",
                        className
                    )}
                    aria-invalid={validationState === "invalid" ? true : undefined}
                    aria-describedby={cn(
                        hint ? hintId : undefined,
                        validationState === "invalid" ? errorId : undefined
                    ) || undefined}
                    {...props}
                />
                <div id={errorId}>
                    <InlineValidation state={validationState} message={validationMessage} />
                </div>
            </div>
        )
    }
)
ValidatedInput.displayName = "ValidatedInput"

/**
 * useFieldValidation - Hook for real-time field validation
 */
export function useFieldValidation(
    validator: (value: string) => string | null,
    debounceMs: number = 300
) {
    const [state, setState] = React.useState<ValidationState>("idle")
    const [message, setMessage] = React.useState<string>("")
    const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

    const validate = React.useCallback((value: string) => {
        if (!value) {
            setState("idle")
            setMessage("")
            return
        }

        setState("validating")

        if (timeoutRef.current) clearTimeout(timeoutRef.current)

        timeoutRef.current = setTimeout(() => {
            const error = validator(value)
            if (error) {
                setState("invalid")
                setMessage(error)
            } else {
                setState("valid")
                setMessage("Valid")
            }
        }, debounceMs)
    }, [validator, debounceMs])

    const reset = React.useCallback(() => {
        setState("idle")
        setMessage("")
    }, [])

    React.useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current)
        }
    }, [])

    return { state, message, validate, reset }
}
