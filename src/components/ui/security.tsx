"use client"

import { cn } from "@/lib/utils"
import { Shield, ShieldCheck, ShieldAlert, Eye, EyeOff, Lock } from "lucide-react"
import { Button } from "./button"
import { useState, forwardRef, type InputHTMLAttributes } from "react"

// ============================================
// PASSWORD STRENGTH INDICATOR
// ============================================

interface PasswordStrengthProps {
    score: number // 0-4
    feedback: string[]
    showFeedback?: boolean
}

export function PasswordStrengthIndicator({
    score,
    feedback,
    showFeedback = true
}: PasswordStrengthProps) {
    const getStrengthColor = (level: number) => {
        if (score >= level) {
            if (score <= 1) return 'bg-red-500'
            if (score === 2) return 'bg-orange-500'
            if (score === 3) return 'bg-yellow-500'
            return 'bg-green-500'
        }
        return 'bg-muted'
    }

    const getStrengthLabel = () => {
        if (score <= 1) return 'Lemah'
        if (score === 2) return 'Cukup'
        if (score === 3) return 'Kuat'
        return 'Sangat Kuat'
    }

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2">
                <div className="flex-1 flex gap-1">
                    {[1, 2, 3, 4].map((level) => (
                        <div
                            key={level}
                            className={cn(
                                "h-1.5 flex-1 rounded-full transition-colors duration-300",
                                getStrengthColor(level)
                            )}
                        />
                    ))}
                </div>
                <span className={cn(
                    "text-xs font-medium",
                    score <= 1 && "text-red-500",
                    score === 2 && "text-orange-500",
                    score === 3 && "text-yellow-600",
                    score >= 4 && "text-green-500"
                )}>
                    {getStrengthLabel()}
                </span>
            </div>

            {showFeedback && feedback.length > 0 && (
                <ul className="text-xs text-muted-foreground space-y-0.5">
                    {feedback.map((msg, i) => (
                        <li key={i} className="flex items-center gap-1">
                            <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                            {msg}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}

// ============================================
// SECURITY BADGE
// ============================================

interface SecurityBadgeProps {
    level: 'high' | 'medium' | 'low'
    showLabel?: boolean
    className?: string
}

export function SecurityBadge({ level, showLabel = true, className }: SecurityBadgeProps) {
    const config = {
        high: {
            icon: ShieldCheck,
            label: 'Keamanan Tinggi',
            className: 'text-green-500 bg-green-500/10'
        },
        medium: {
            icon: Shield,
            label: 'Keamanan Sedang',
            className: 'text-yellow-500 bg-yellow-500/10'
        },
        low: {
            icon: ShieldAlert,
            label: 'Keamanan Rendah',
            className: 'text-red-500 bg-red-500/10'
        }
    }

    const { icon: Icon, label, className: colorClass } = config[level]

    return (
        <div className={cn(
            "inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium",
            colorClass,
            className
        )}>
            <Icon className="h-3.5 w-3.5" />
            {showLabel && <span>{label}</span>}
        </div>
    )
}

// ============================================
// SENSITIVE DATA FIELD
// ============================================

interface SensitiveFieldProps {
    value: string
    maskedValue: string
    label?: string
    className?: string
}

export function SensitiveField({
    value,
    maskedValue,
    label,
    className
}: SensitiveFieldProps) {
    const [visible, setVisible] = useState(false)

    return (
        <div className={cn("space-y-1", className)}>
            {label && (
                <label className="text-xs text-muted-foreground">{label}</label>
            )}
            <div className="flex items-center gap-2">
                <code className="flex-1 font-mono text-sm bg-muted px-2 py-1 rounded">
                    {visible ? value : maskedValue}
                </code>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setVisible(!visible)}
                    className="h-8 w-8 p-0"
                >
                    {visible ? (
                        <EyeOff className="h-4 w-4" />
                    ) : (
                        <Eye className="h-4 w-4" />
                    )}
                </Button>
            </div>
        </div>
    )
}

// ============================================
// SECURE INPUT
// ============================================

interface SecureInputProps extends InputHTMLAttributes<HTMLInputElement> {
    showToggle?: boolean
}

export const SecureInput = forwardRef<HTMLInputElement, SecureInputProps>(
    ({ className, type = "password", showToggle = true, ...props }, ref) => {
        const [showPassword, setShowPassword] = useState(false)

        return (
            <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                </div>
                <input
                    type={showPassword ? "text" : type}
                    className={cn(
                        "flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-10 py-2 text-sm ring-offset-background",
                        "file:border-0 file:bg-transparent file:text-sm file:font-medium",
                        "placeholder:text-muted-foreground",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                        "disabled:cursor-not-allowed disabled:opacity-50",
                        className
                    )}
                    ref={ref}
                    {...props}
                />
                {showToggle && type === "password" && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                    </Button>
                )}
            </div>
        )
    }
)

SecureInput.displayName = "SecureInput"

// ============================================
// RATE LIMIT WARNING
// ============================================

interface RateLimitWarningProps {
    remainingAttempts: number
    blockedUntil?: Date
}

export function RateLimitWarning({ remainingAttempts, blockedUntil }: RateLimitWarningProps) {
    if (blockedUntil) {
        return (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
                <div className="flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4" />
                    <span>Akun dikunci sementara</span>
                </div>
                <p className="mt-1 text-xs">
                    Coba lagi pada {blockedUntil.toLocaleTimeString('id-ID')}
                </p>
            </div>
        )
    }

    if (remainingAttempts <= 2) {
        return (
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg text-sm text-amber-600 dark:text-amber-400">
                <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    <span>Tersisa {remainingAttempts} percobaan</span>
                </div>
            </div>
        )
    }

    return null
}
