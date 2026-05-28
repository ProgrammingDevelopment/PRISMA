"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { CheckCircle2, XCircle, AlertCircle, Info, X } from "lucide-react"

/**
 * Toast Notification System
 * PRD: Success - Users recognized with discreet, positive feedback
 * PRD: Error - Friendly, instructive messages guide quick resolution
 */

export type ToastVariant = "success" | "error" | "warning" | "info"

export interface ToastProps {
    id: string
    title: string
    message?: string
    variant: ToastVariant
    duration?: number
    onDismiss?: (id: string) => void
}

const variantConfig = {
    success: {
        icon: CheckCircle2,
        containerClass: "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20",
        iconClass: "text-green-600 dark:text-green-400",
        titleClass: "text-green-800 dark:text-green-200",
    },
    error: {
        icon: XCircle,
        containerClass: "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20",
        iconClass: "text-red-600 dark:text-red-400",
        titleClass: "text-red-800 dark:text-red-200",
    },
    warning: {
        icon: AlertCircle,
        containerClass: "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20",
        iconClass: "text-amber-600 dark:text-amber-400",
        titleClass: "text-amber-800 dark:text-amber-200",
    },
    info: {
        icon: Info,
        containerClass: "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20",
        iconClass: "text-blue-600 dark:text-blue-400",
        titleClass: "text-blue-800 dark:text-blue-200",
    },
}

export function Toast({ id, title, message, variant, duration = 3000, onDismiss }: ToastProps) {
    const [isVisible, setIsVisible] = React.useState(true)
    const [isExiting, setIsExiting] = React.useState(false)
    const config = variantConfig[variant]
    const Icon = config.icon

    React.useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(() => {
                setIsExiting(true)
                setTimeout(() => {
                    setIsVisible(false)
                    onDismiss?.(id)
                }, 200)
            }, duration)
            return () => clearTimeout(timer)
        }
    }, [duration, id, onDismiss])

    if (!isVisible) return null

    return (
        <div
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
            className={cn(
                "flex items-start gap-3 p-4 rounded-lg border shadow-lg transition-all duration-300",
                config.containerClass,
                isExiting ? "opacity-0 translate-x-4" : "opacity-100 translate-x-0"
            )}
        >
            <Icon className={cn("h-5 w-5 flex-shrink-0 mt-0.5", config.iconClass)} aria-hidden="true" />
            <div className="flex-1 min-w-0">
                <p className={cn("text-sm font-semibold", config.titleClass)}>{title}</p>
                {message && (
                    <p className="text-sm text-muted-foreground mt-1">{message}</p>
                )}
            </div>
            {onDismiss && (
                <button
                    onClick={() => onDismiss(id)}
                    className="flex-shrink-0 p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                    aria-label="Tutup notifikasi"
                >
                    <X className="h-4 w-4 text-muted-foreground" />
                </button>
            )}
        </div>
    )
}

/**
 * ToastContainer - Manages toast stack
 */
interface ToastContainerProps {
    toasts: ToastProps[]
    onDismiss: (id: string) => void
    position?: "top-right" | "top-center" | "bottom-right"
}

export function ToastContainer({ toasts, onDismiss, position = "top-right" }: ToastContainerProps) {
    const positionClasses = {
        "top-right": "top-4 right-4",
        "top-center": "top-4 left-1/2 -translate-x-1/2",
        "bottom-right": "bottom-4 right-4",
    }

    if (toasts.length === 0) return null

    return (
        <div
            className={cn(
                "fixed z-50 flex flex-col gap-2 max-w-sm w-full",
                positionClasses[position]
            )}
            aria-label="Notifikasi"
        >
            {toasts.map(toast => (
                <Toast key={toast.id} {...toast} onDismiss={onDismiss} />
            ))}
        </div>
    )
}

/**
 * useToast Hook - Manage toast state
 */
export function useToast() {
    const [toasts, setToasts] = React.useState<ToastProps[]>([])

    const addToast = React.useCallback((toast: Omit<ToastProps, "id">) => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        setToasts(prev => [...prev, { ...toast, id }])
        return id
    }, [])

    const dismissToast = React.useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id))
    }, [])

    const success = React.useCallback((title: string, message?: string) => {
        return addToast({ title, message, variant: "success" })
    }, [addToast])

    const error = React.useCallback((title: string, message?: string) => {
        return addToast({ title, message, variant: "error", duration: 5000 })
    }, [addToast])

    const warning = React.useCallback((title: string, message?: string) => {
        return addToast({ title, message, variant: "warning" })
    }, [addToast])

    const info = React.useCallback((title: string, message?: string) => {
        return addToast({ title, message, variant: "info" })
    }, [addToast])

    return { toasts, addToast, dismissToast, success, error, warning, info }
}
