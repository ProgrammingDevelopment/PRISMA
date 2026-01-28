"use client"

import React, { ReactNode, useCallback, useEffect, useState } from 'react'
import Link, { LinkProps } from 'next/link'
import { useRouter } from 'next/navigation'
import { AlertCircle, RefreshCw, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SafeLinkProps extends Omit<LinkProps, 'href'> {
    href: string
    children: ReactNode
    className?: string
    fallback?: string
    onError?: (error: Error) => void
    showErrorToast?: boolean
}

/**
 * SafeLink - A wrapper around Next.js Link that handles navigation errors gracefully
 * Prevents crashes when navigation fails and provides fallback behavior
 */
export function SafeLink({
    href,
    children,
    className,
    fallback = '/',
    onError,
    showErrorToast = false,
    ...linkProps
}: SafeLinkProps) {
    const router = useRouter()
    const [hasError, setHasError] = useState(false)

    const handleClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
        // Validate href
        if (!href || typeof href !== 'string') {
            e.preventDefault()
            console.warn('SafeLink: Invalid href provided')

            const error = new Error('Invalid navigation path')
            setHasError(true)
            onError?.(error)

            try {
                router.push(fallback)
            } catch {
                window.location.href = fallback
            }
            return
        }

        // Check for potentially problematic paths
        if (href.includes('undefined') || href.includes('null')) {
            e.preventDefault()
            console.warn('SafeLink: Potentially invalid path detected:', href)

            const error = new Error(`Invalid path detected: ${href}`)
            onError?.(error)

            router.push(fallback)
            return
        }
    }, [href, fallback, router, onError])

    // If there's an error, show fallback UI
    if (hasError) {
        return (
            <span className={className}>
                {children}
            </span>
        )
    }

    return (
        <Link
            href={href}
            className={className}
            onClick={handleClick}
            {...linkProps}
        >
            {children}
        </Link>
    )
}

interface SafeNavigationBoundaryProps {
    children: ReactNode
    fallbackPath?: string
    onNavigationError?: (error: Error) => void
}

/**
 * SafeNavigationBoundary - Wraps navigation-heavy components to catch and handle errors
 */
export function SafeNavigationBoundary({
    children,
    fallbackPath = '/',
    onNavigationError
}: SafeNavigationBoundaryProps) {
    const router = useRouter()
    const [navigationError, setNavigationError] = useState<Error | null>(null)

    useEffect(() => {
        // Listen for navigation errors at window level
        const handleError = (event: ErrorEvent) => {
            if (event.message.includes('navigation') ||
                event.message.includes('router') ||
                event.message.includes('push') ||
                event.message.includes('route')) {
                event.preventDefault()
                const error = new Error(event.message)
                setNavigationError(error)
                onNavigationError?.(error)
            }
        }

        const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
            if (event.reason?.message?.includes('navigation') ||
                event.reason?.message?.includes('router')) {
                event.preventDefault()
                const error = event.reason instanceof Error
                    ? event.reason
                    : new Error('Navigation promise rejected')
                setNavigationError(error)
                onNavigationError?.(error)
            }
        }

        window.addEventListener('error', handleError)
        window.addEventListener('unhandledrejection', handleUnhandledRejection)

        return () => {
            window.removeEventListener('error', handleError)
            window.removeEventListener('unhandledrejection', handleUnhandledRejection)
        }
    }, [onNavigationError])

    const handleRetry = useCallback(() => {
        setNavigationError(null)
        window.location.reload()
    }, [])

    const handleGoHome = useCallback(() => {
        setNavigationError(null)
        router.push(fallbackPath)
    }, [router, fallbackPath])

    if (navigationError) {
        return (
            <div className="p-6 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                        <h4 className="font-medium text-amber-800 dark:text-amber-300">
                            Terjadi Masalah Navigasi
                        </h4>
                        <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                            Terjadi error saat navigasi. Silakan coba lagi atau kembali ke beranda.
                        </p>
                        {process.env.NODE_ENV === 'development' && (
                            <p className="text-xs text-amber-600 dark:text-amber-500 mt-2 font-mono">
                                {navigationError.message}
                            </p>
                        )}
                        <div className="flex gap-2 mt-4">
                            <Button size="sm" variant="outline" onClick={handleRetry}>
                                <RefreshCw className="h-3 w-3 mr-2" />
                                Coba Lagi
                            </Button>
                            <Button size="sm" variant="outline" onClick={handleGoHome}>
                                <Home className="h-3 w-3 mr-2" />
                                Beranda
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return <>{children}</>
}

/**
 * useNavigationCallback - Hook for handling navigation with callbacks
 */
export function useNavigationCallback() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<Error | null>(null)

    const navigate = useCallback(async (
        path: string,
        callbacks?: {
            onBefore?: () => void | Promise<void>
            onAfter?: () => void | Promise<void>
            onError?: (error: Error) => void
        }
    ) => {
        setIsLoading(true)
        setError(null)

        try {
            // Execute before callback
            if (callbacks?.onBefore) {
                await callbacks.onBefore()
            }

            // Perform navigation
            router.push(path)

            // Execute after callback (with small delay to ensure navigation started)
            setTimeout(async () => {
                if (callbacks?.onAfter) {
                    await callbacks.onAfter()
                }
                setIsLoading(false)
            }, 100)
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Navigation failed')
            setError(error)
            setIsLoading(false)

            if (callbacks?.onError) {
                callbacks.onError(error)
            }

            // Fallback: direct window navigation
            try {
                window.location.href = path
            } catch {
                window.location.href = '/'
            }
        }
    }, [router])

    const clearError = useCallback(() => {
        setError(null)
    }, [])

    return { navigate, isLoading, error, clearError }
}

export default SafeLink
